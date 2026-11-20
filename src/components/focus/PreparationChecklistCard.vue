<template>
  <div class="ritme-card">
    <div class="ritme-section-header" style="align-items: center;">
      <h2 class="ritme-section-title">{{ t('focus.prepTitle') }}</h2>
      <span class="ritme-badge">
        {{
          t('focus.prepReadyBadge', {
            done: completedCount,
            total: prepKeys.length,
          })
        }}
      </span>
    </div>

    <div
      style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px;"
    >
      <div
        v-for="key in prepKeys"
        :key="key"
        class="ritme-list-item"
        :class="{ 'is-completed': checkedMap[key] }"
        role="button"
        tabindex="0"
        style="margin-bottom: 0; padding: 8px 10px; cursor: pointer; user-select: none; justify-content: flex-start; gap: 8px;"
        @click="togglePrepItem(key)"
        @keydown.enter.prevent="togglePrepItem(key)"
        @keydown.space.prevent="togglePrepItem(key)"
      >
        <ion-checkbox
          :checked="checkedMap[key]"
          style="pointer-events: none; flex-shrink: 0;"
        />
        <span
          style="font-size: 0.76rem; font-weight: 600; line-height: 1.25;"
          :style="{
            color: checkedMap[key]
              ? 'var(--ritme-text-secondary)'
              : 'var(--ritme-text-primary)',
            textDecoration: checkedMap[key] ? 'line-through' : 'none',
          }"
        >
          {{ t(`focus.prepItems.${key}`) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { IonCheckbox } from '@ionic/vue'
import { Preferences } from '@capacitor/preferences'
import { useI18n } from 'vue-i18n'
import { getLocalDateString } from '@/utils/date'

const { t } = useI18n()

const prepKeys = ['desk', 'water', 'phone', 'goal'] as const
type PrepKey = (typeof prepKeys)[number]

const checkedMap = ref<Record<PrepKey, boolean>>({
  desk: false,
  water: false,
  phone: false,
  goal: false,
})

const completedCount = computed(
  () => prepKeys.filter((k) => checkedMap.value[k]).length
)

function getTodayPrefKey(): string {
  return `ritme_prep_checklist_${getLocalDateString()}`
}

onMounted(async () => {
  try {
    const res = await Preferences.get({ key: getTodayPrefKey() })
    if (res.value) {
      const parsed = JSON.parse(res.value) as Partial<Record<PrepKey, boolean>>
      checkedMap.value = {
        ...checkedMap.value,
        ...parsed,
      }
    }
  } catch {
    // Ignore parse error
  }
})

async function togglePrepItem(key: PrepKey): Promise<void> {
  checkedMap.value = {
    ...checkedMap.value,
    [key]: !checkedMap.value[key],
  }
  try {
    await Preferences.set({
      key: getTodayPrefKey(),
      value: JSON.stringify(checkedMap.value),
    })
  } catch {
    // Ignore storage error
  }
}
</script>
