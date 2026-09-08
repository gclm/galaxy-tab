import type { WallpaperItem } from '@/shared/wallpaperLibrary'

export async function readWallpaperMetadata(
  blob: Blob,
): Promise<{ metadata: Partial<WallpaperItem>; thumbnail?: Blob }> {
  const url = URL.createObjectURL(blob)
  const video = blob.type.startsWith('video/')
  const element = video ? document.createElement('video') : new Image()
  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Media metadata timed out')), 15000)
      const loaded = () => {
        clearTimeout(timer)
        resolve()
      }
      element.onerror = () => {
        clearTimeout(timer)
        reject(new Error('Media metadata unavailable'))
      }
      if (element instanceof HTMLVideoElement) {
        element.muted = true
        element.preload = 'auto'
        element.onloadeddata = loaded
      } else element.onload = loaded
      element.src = url
    })
    const width = element instanceof HTMLVideoElement ? element.videoWidth : element.naturalWidth
    const height = element instanceof HTMLVideoElement ? element.videoHeight : element.naturalHeight
    const metadata: Partial<WallpaperItem> = {
      width,
      height,
      size: blob.size,
      metadataFailed: false,
    }
    if (element instanceof HTMLVideoElement && Number.isFinite(element.duration))
      metadata.duration = element.duration
    const canvas = document.createElement('canvas')
    const ratio = Math.min(1, 320 / Math.max(width, height))
    canvas.width = Math.max(1, Math.round(width * ratio))
    canvas.height = Math.max(1, Math.round(height * ratio))
    canvas.getContext('2d')?.drawImage(element, 0, 0, canvas.width, canvas.height)
    const thumbnail = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', 0.75),
    )
    return { metadata, thumbnail: thumbnail ?? undefined }
  } finally {
    element.onerror = null
    if (element instanceof HTMLVideoElement) {
      element.onloadeddata = null
      element.removeAttribute('src')
      element.load()
    }
    URL.revokeObjectURL(url)
  }
}
