<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :style="{ color: color || 'var(--ritme-accent-secondary)', flexShrink: 0 }"
    aria-hidden="true"
  >
    <!-- PU: Logic Network / Circuit Nodes -->
    <template v-if="resolvedKey === 'subtest_pu' || resolvedKey === 'pu'">
      <circle cx="12" cy="5" r="2.2" stroke="currentColor" stroke-width="1.8" />
      <circle cx="6" cy="17" r="2.2" stroke="currentColor" stroke-width="1.8" />
      <circle cx="18" cy="17" r="2.2" stroke="currentColor" stroke-width="1.8" />
      <path
        d="M10.8 6.9L7.1 15M13.2 6.9L16.9 15M8.2 17H15.8"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
    </template>

    <!-- PPU: Knowledge Citadel Pillars -->
    <template v-else-if="resolvedKey === 'subtest_ppu' || resolvedKey === 'ppu'">
      <path
        d="M4 9.5L12 4.5L20 9.5M5.5 19.5H18.5M7.5 10V17M12 10V17M16.5 10V17"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </template>

    <!-- PBM: Language Scroll & Quill -->
    <template v-else-if="resolvedKey === 'subtest_pbm' || resolvedKey === 'pbm'">
      <rect
        x="5"
        y="4"
        width="14"
        height="16"
        rx="2.5"
        stroke="currentColor"
        stroke-width="1.8"
      />
      <path
        d="M8.5 9H15.5M8.5 13H15.5M8.5 16.5H12.5"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
    </template>

    <!-- PK: Quantitative Geometry & Compass -->
    <template v-else-if="resolvedKey === 'subtest_pk' || resolvedKey === 'pk'">
      <path
        d="M12 4L4.5 18.5H19.5L12 4Z"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linejoin="round"
      />
      <path
        d="M9 14.5C9.9 13.5 11 13 12 13C13 13 14.1 13.5 15 14.5"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
    </template>

    <!-- LBI: Archive Open Codex -->
    <template v-else-if="resolvedKey === 'subtest_lbi' || resolvedKey === 'lbi'">
      <path
        d="M4 6.5C4 5.4 4.9 4.5 6 4.5H11.5V19H6C4.9 19 4 19.6 4 19.6V6.5ZM20 6.5C20 5.4 19.1 4.5 18 4.5H12.5V19H18C19.1 19 20 19.6 20 19.6V6.5Z"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linejoin="round"
      />
    </template>

    <!-- LBE: Global Discourse Meridian -->
    <template v-else-if="resolvedKey === 'subtest_lbe' || resolvedKey === 'lbe'">
      <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8" />
      <ellipse cx="12" cy="12" rx="3.4" ry="8" stroke="currentColor" stroke-width="1.6" />
      <path d="M4.5 12H19.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
    </template>

    <!-- PM: Mathematical Axes & Curve -->
    <template v-else-if="resolvedKey === 'subtest_pm' || resolvedKey === 'pm'">
      <path
        d="M5 4.5V18.5H19.5"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M7.5 15.5C9.5 15.5 10.5 7 13 7C15 7 15.5 12.5 18.5 10"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
    </template>

    <!-- Fallback: Wayfinder Compass -->
    <template v-else>
      <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.8" />
      <polygon
        points="15.2,8.8 13.1,13.1 8.8,15.2 10.9,10.9"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linejoin="round"
      />
    </template>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  subtestId?: string
  iconKey?: string
  size?: number
  color?: string
}>()

const resolvedKey = computed(() =>
  (props.iconKey || props.subtestId || '').toLowerCase()
)
</script>
