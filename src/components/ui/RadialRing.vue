<template>
  <div
    style="position: relative; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;"
    :style="{ width: `${resolvedSize}px`, height: `${resolvedSize}px` }"
  >
    <svg
      :width="resolvedSize"
      :height="resolvedSize"
      :viewBox="`0 0 ${resolvedSize} ${resolvedSize}`"
      style="position: absolute; inset: 0; transform: rotate(-90deg);"
      aria-hidden="true"
    >
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        stroke="var(--ritme-border-line)"
        :stroke-width="resolvedStroke"
      />
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="color || 'var(--ritme-accent-primary)'"
        :stroke-width="resolvedStroke"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        style="transition: stroke-dashoffset 420ms cubic-bezier(0.22, 1, 0.36, 1);"
      />
    </svg>
    <div style="position: relative; z-index: 1; display: flex; align-items: center; justify-content: center;">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  percent: number
  size?: number
  strokeWidth?: number
  color?: string
}>()

const resolvedSize = computed(() => props.size ?? 44)
const resolvedStroke = computed(() => props.strokeWidth ?? 3.5)
const center = computed(() => resolvedSize.value / 2)
const radius = computed(() => center.value - resolvedStroke.value)
const circumference = computed(() => 2 * Math.PI * radius.value)
const clampedPercent = computed(() =>
  Math.max(0, Math.min(100, Number(props.percent) || 0))
)
const dashOffset = computed(
  () => circumference.value * (1 - clampedPercent.value / 100)
)
</script>
