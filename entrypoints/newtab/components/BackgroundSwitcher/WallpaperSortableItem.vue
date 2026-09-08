<script setup lang="ts">
import { useSortable } from '@dnd-kit/vue/sortable'

const props = defineProps<{ id: string; index: number; disabled: boolean; label: string }>()
const element = ref<HTMLElement | null>(null)
const handle = ref<HTMLElement | null>(null)
const { isDragging } = useSortable({
  id: computed(() => props.id),
  index: computed(() => props.index),
  element,
  handle,
  disabled: computed(() => props.disabled),
  type: 'wallpaper',
  accept: 'wallpaper',
  data: computed(() => ({ id: props.id })),
})
let suppressUntil = 0
watch(isDragging, (value, old) => {
  if (old && !value) suppressUntil = Date.now() + 300
})
function capture(event: MouseEvent) {
  if (isDragging.value || Date.now() < suppressUntil) {
    event.preventDefault()
    event.stopImmediatePropagation()
  }
}
</script>

<template>
  <div v-if="disabled" class="bg-switcher-item"><slot /></div>
  <div v-else ref="element" class="bg-switcher-item" @click.capture="capture">
    <button ref="handle" class="bg-switcher-drag" :aria-label="label">⠿</button><slot />
  </div>
</template>
