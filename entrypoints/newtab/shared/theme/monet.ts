import { createExtensionWorker } from '@/shared/worker'

import monetWorkerUrl from './monet.worker?worker&url'

let worker: Worker | null = null
let msgId = 0
type MonetPalette = { cssLight: Record<string, string>; cssDark: Record<string, string> }
const pending = new Map<
  number,
  {
    resolve: (colors: MonetPalette) => void
    reject: (error: Error) => void
    timer: ReturnType<typeof setTimeout>
  }
>()

function takeRequest(id: number) {
  const request = pending.get(id)
  if (request) clearTimeout(request.timer)
  pending.delete(id)
  return request
}

export function disposeMonetWorker(error = new Error('Monet worker disposed')) {
  if (worker) {
    worker.onmessage = null
    worker.onerror = null
    worker.onmessageerror = null
    worker.terminate()
    worker = null
  }
  for (const id of pending.keys()) takeRequest(id)?.reject(error)
}

function getWorker() {
  if (!worker) {
    worker = createExtensionWorker(monetWorkerUrl)
    worker.onmessage = (e) => {
      const { id, cssLight, cssDark, error } = e.data
      const request = takeRequest(id)
      if (error) {
        request?.reject(error instanceof Error ? error : new Error(String(error)))
      } else {
        request?.resolve({ cssLight, cssDark })
      }
    }
    worker.onerror = (e) => {
      disposeMonetWorker(new Error(e.message || 'Monet worker error'))
    }
    worker.onmessageerror = () => disposeMonetWorker(new Error('Invalid Monet worker message'))
  }
  return worker
}

/**
 * 使用了 @material/material-color-utilities 中基于图片提取主题色的逻辑
 * 将图片缩放至64x64以内，并可选择只裁剪中心区域
 * 以便给 QuantizerCelebi.quantize 传入裁剪和缩放后的像素数据，控制性能和效果
 *
 * @param image HTMLImageElement
 * @param cropCenter 是否裁剪只要中心区域
 */
async function prepareBitmap(image: HTMLImageElement, cropCenter = false): Promise<ImageBitmap> {
  if (!image.complete) {
    await image.decode()
  }

  const MAX_SIZE = 64
  const { naturalWidth, naturalHeight } = image

  if (naturalWidth === 0 || naturalHeight === 0) {
    throw new Error('Image has no dimensions')
  }

  let sx = 0
  let sy = 0
  let sw = naturalWidth
  let sh = naturalHeight

  if (cropCenter) {
    sx = Math.floor(naturalWidth * 0.25)
    sy = Math.floor(naturalHeight * 0.25)
    sw = Math.floor(naturalWidth * 0.5)
    sh = Math.floor(naturalHeight * 0.5)
  }

  let width = sw
  let height = sh

  if (sw > MAX_SIZE || sh > MAX_SIZE) {
    const ratio = Math.min(MAX_SIZE / sw, MAX_SIZE / sh)
    width = Math.round(sw * ratio)
    height = Math.round(sh * ratio)
  }

  // 使用 createImageBitmap 异步缩放
  return createImageBitmap(image, sx, sy, sw, sh, {
    resizeWidth: width,
    resizeHeight: height,
    resizeQuality: 'low',
  })
}

export function extractMonetColors(
  image: HTMLImageElement,
  cropCenter = false,
): Promise<MonetPalette> {
  const id = msgId++
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => disposeMonetWorker(new Error('Monet extraction timed out')),
      10_000,
    )
    pending.set(id, { resolve, reject, timer })
    void prepareBitmap(image, cropCenter)
      .then((bitmap) => {
        // 关闭功能或超时后，异步解码结果只能释放，不能重新创建 Worker。
        if (!pending.has(id)) {
          bitmap.close()
          return
        }
        try {
          getWorker().postMessage(
            { id, imageBitmap: bitmap, width: bitmap.width, height: bitmap.height },
            [bitmap],
          )
        } catch (error) {
          bitmap.close()
          throw error
        }
      })
      .catch((error: unknown) => {
        takeRequest(id)?.reject(error instanceof Error ? error : new Error(String(error)))
      })
  })
}
