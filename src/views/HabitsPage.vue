<template>
  <ion-page>
    <ion-header class="ritme-floating-header">
      <ion-toolbar class="ritme-toolbar-has-back">
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/home" text="" />
        </ion-buttons>
        <ion-title>{{ t('nav.habits') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="ritme-page-container">
        <!-- Streak & 7-Day Weekly Consistency Card -->
        <WeeklyConsistencyCard />

        <!-- 30-Day Habit Challenge & Learning Calendar Card -->
        <ThirtyDayCalendarCard />

        <!-- Add / Edit Habit Form Card -->
        <div
          v-if="showHabitForm"
          class="ritme-card"
          style="border-color: var(--ritme-accent-primary);"
        >
          <h2 class="ritme-section-title" style="margin-bottom: 12px;">
            {{
              editingHabitId
                ? t('habits.editHabitTitle')
                : t('habits.newHabitTitle')
            }}
          </h2>

          <div style="margin-bottom: 10px;">
            <label
              class="ritme-subtitle"
              for="habit-name-input"
              style="display: block; margin-bottom: 4px; font-size: 0.8rem;"
            >
              {{ t('habits.nameLabel') }}
            </label>
            <input
              id="habit-name-input"
              v-model="formName"
              type="text"
              :placeholder="t('habits.namePlaceholder')"
              class="ritme-input"
            />
          </div>

          <div style="margin-bottom: 10px;">
            <label
              class="ritme-subtitle"
              for="habit-desc-input"
              style="display: block; margin-bottom: 4px; font-size: 0.8rem;"
            >
              {{ t('habits.descLabel') }}
            </label>
            <input
              id="habit-desc-input"
              v-model="formDescription"
              type="text"
              :placeholder="t('habits.descPlaceholder')"
              class="ritme-input"
            />
          </div>

          <div
            style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px;"
          >
            <ion-checkbox v-model="formActive" class="ritme-checkbox" />
            <span style="font-size: 0.86rem; font-weight: 600;">
              {{ t('habits.activeLabel') }}
            </span>
          </div>

          <!-- Delete Confirmation Box -->
          <div
            v-if="confirmingDeleteId === editingHabitId && editingHabitId"
            class="ritme-list-item"
            style="margin-bottom: 12px; border-color: var(--ritme-danger-border);"
          >
            <span
              style="font-size: 0.82rem; color: var(--ritme-danger); font-weight: 600;"
            >
              {{ t('habits.confirmDeleteMsg') }}
            </span>
            <div style="display: flex; gap: 6px; flex-shrink: 0;">
              <button
                type="button"
                class="ritme-btn-danger"
                style="min-height: 36px; padding: 0 12px;"
                @click="handleDeleteConfirmed(editingHabitId)"
              >
                {{ t('habits.confirmDeleteYes') }}
              </button>
              <button
                type="button"
                class="ritme-glass-pill"
                @click="confirmingDeleteId = null"
              >
                {{ t('habits.cancelBtn') }}
              </button>
            </div>
          </div>

          <div
            style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;"
          >
            <div style="display: flex; gap: 8px;">
              <button
                type="button"
                class="ritme-btn-primary"
                style="min-height: 38px; padding: 0 16px; font-size: 0.8rem;"
                @click="handleSaveHabitForm"
              >
                {{ t('habits.saveBtn') }}
              </button>
              <button
                type="button"
                class="ritme-glass-pill"
                style="min-height: 38px; padding: 0 14px;"
                @click="closeHabitForm"
              >
                {{ t('habits.cancelBtn') }}
              </button>
            </div>

            <button
              v-if="editingHabitId && confirmingDeleteId !== editingHabitId"
              type="button"
              class="ritme-btn-danger"
              @click="confirmingDeleteId = editingHabitId"
            >
              <ion-icon :icon="trashOutline" style="font-size: 0.92rem;" />
              <span>{{ t('habits.deleteBtn') }}</span>
            </button>
          </div>
        </div>

        <!-- Habit Stacking & Daily Checklist Card (Compact Mobile Layout) -->
        <div class="ritme-card">
          <div style="margin-bottom: 10px;">
            <h2 class="ritme-section-title">{{ t('habits.stackingTitle') }}</h2>
            <div class="ritme-subtitle" style="font-size: 0.78rem; margin-top: 2px;">
              {{ t('habits.stackingSubtitle') }}
            </div>
          </div>

          <!-- Compact Status & Action Toolbar -->
          <div
            style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 12px;"
          >
            <span class="ritme-badge">
              {{
                t('home.habitsCompleted', {
                  done: habitStore.todayCompletedCount,
                  total: habitStore.activeHabits.length,
                })
              }}
            </span>

            <button
              type="button"
              class="ritme-btn-primary"
              style="min-height: 36px; padding: 0 14px; font-size: 0.76rem;"
              @click="openNewHabitForm"
            >
              {{ t('habits.addHabitBtn') }}
            </button>
          </div>

          <div v-if="habitStore.activeHabits.length === 0" class="ritme-subtitle">
            {{ t('home.emptyHabits') }}
          </div>

          <div v-else class="ritme-timeline-wrapper">
            <div
              v-for="(habit, index) in habitStore.activeHabits"
              :key="habit.id"
              class="ritme-timeline-step"
              :class="{
                'is-done': habitStore.isHabitCompletedToday(habit.id),
              }"
            >
              <div
                class="ritme-list-item"
                :class="{
                  'is-completed': habitStore.isHabitCompletedToday(habit.id),
                }"
                style="align-items: flex-start; gap: 10px;"
              >
                <ion-checkbox
                  class="ritme-checkbox"
                  :checked="habitStore.isHabitCompletedToday(habit.id)"
                  aria-label="Toggle habit"
                  style="margin-top: 3px; flex-shrink: 0;"
                  @click.stop="habitStore.toggleHabitToday(habit.id)"
                />

                <div style="flex: 1; min-width: 0;">
                  <!-- Top Meta Row: Step Label + Compact Icon Actions -->
                  <div
                    style="display: flex; justify-content: space-between; align-items: center; gap: 6px; margin-bottom: 3px;"
                  >
                    <span
                      style="font-size: 0.72rem; font-weight: 700; color: var(--ritme-accent-primary);"
                    >
                      {{ t('habits.stepLabel', { step: index + 1 }) }}
                    </span>

                    <div style="display: flex; align-items: center; gap: 4px;">
                      <button
                        type="button"
                        class="ritme-icon-btn"
                        :disabled="index === 0"
                        aria-label="Move Up"
                        @click.stop="habitStore.moveHabitOrder(habit.id, 'up')"
                      >
                        <ion-icon :icon="arrowUpOutline" />
                      </button>
                      <button
                        type="button"
                        class="ritme-icon-btn"
                        :disabled="index === habitStore.activeHabits.length - 1"
                        aria-label="Move Down"
                        @click.stop="habitStore.moveHabitOrder(habit.id, 'down')"
                      >
                        <ion-icon :icon="arrowDownOutline" />
                      </button>
                      <button
                        type="button"
                        class="ritme-icon-btn"
                        aria-label="Edit Habit"
                        @click.stop="openEditHabitForm(habit)"
                      >
                        <ion-icon :icon="createOutline" />
                      </button>
                    </div>
                  </div>

                  <!-- Full-Width Title & Description -->
                  <div
                    role="button"
                    tabindex="0"
                    style="cursor: pointer; user-select: none;"
                    @click="habitStore.toggleHabitToday(habit.id)"
                    @keydown.enter.prevent="habitStore.toggleHabitToday(habit.id)"
                    @keydown.space.prevent="habitStore.toggleHabitToday(habit.id)"
                  >
                    <div
                      :style="{
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        lineHeight: '1.35',
                        color: habitStore.isHabitCompletedToday(habit.id)
                          ? 'var(--ritme-text-secondary)'
                          : 'var(--ritme-text-primary)',
                        textDecoration: habitStore.isHabitCompletedToday(habit.id)
                          ? 'line-through'
                          : 'none',
                      }"
                    >
                      {{ resolveHabitText(habit.name) }}
                    </div>
                    <div
                      v-if="habit.description"
                      class="ritme-subtitle"
                      style="font-size: 0.78rem; margin-top: 2px;"
                    >
                      {{ resolveHabitText(habit.description) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Inactive Habits Card (If Any) -->
        <div v-if="habitStore.inactiveHabits.length > 0" class="ritme-card">
          <h2 class="ritme-section-title" style="margin-bottom: 10px;">
            {{
              t('habits.inactiveSectionTitle', {
                count: habitStore.inactiveHabits.length,
              })
            }}
          </h2>

          <div
            v-for="habit in habitStore.inactiveHabits"
            :key="habit.id"
            class="ritme-list-item"
          >
            <div style="min-width: 0; flex: 1;">
              <div
                style="font-weight: 600; font-size: 0.88rem; color: var(--ritme-text-secondary);"
              >
                {{ resolveHabitText(habit.name) }}
              </div>
              <div
                v-if="habit.description"
                class="ritme-subtitle"
                style="font-size: 0.76rem; margin-top: 2px;"
              >
                {{ resolveHabitText(habit.description) }}
              </div>
            </div>

            <div style="display: flex; gap: 6px; align-items: center; flex-shrink: 0;">
              <button
                type="button"
                class="ritme-glass-pill"
                @click="habitStore.updateHabit(habit.id, { active: true })"
              >
                {{ t('habits.activateBtn') }}
              </button>
              <button
                type="button"
                class="ritme-icon-btn"
                aria-label="Edit Habit"
                @click="openEditHabitForm(habit)"
              >
                <ion-icon :icon="createOutline" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonCheckbox,
  IonIcon,
} from '@ionic/vue'
import {
  arrowUpOutline,
  arrowDownOutline,
  createOutline,
  trashOutline,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useHabitStore } from '@/stores/habitStore'
import WeeklyConsistencyCard from '@/components/habits/WeeklyConsistencyCard.vue'
import ThirtyDayCalendarCard from '@/components/habits/ThirtyDayCalendarCard.vue'
import type { Habit } from '@/types'

const { t, te } = useI18n()
const habitStore = useHabitStore()

const showHabitForm = ref(false)
const editingHabitId = ref<string | null>(null)
const confirmingDeleteId = ref<string | null>(null)
const formName = ref('')
const formDescription = ref('')
const formActive = ref(true)

function resolveHabitText(keyOrText: string): string {
  return te(keyOrText) ? t(keyOrText) : keyOrText
}

function openNewHabitForm(): void {
  editingHabitId.value = null
  confirmingDeleteId.value = null
  formName.value = ''
  formDescription.value = ''
  formActive.value = true
  showHabitForm.value = true
}

function openEditHabitForm(habit: Habit): void {
  editingHabitId.value = habit.id
  confirmingDeleteId.value = null
  formName.value = resolveHabitText(habit.name)
  formDescription.value = resolveHabitText(habit.description)
  formActive.value = habit.active
  showHabitForm.value = true
}

function closeHabitForm(): void {
  showHabitForm.value = false
  editingHabitId.value = null
  confirmingDeleteId.value = null
}

async function handleSaveHabitForm(): Promise<void> {
  if (!formName.value.trim()) return

  if (editingHabitId.value) {
    await habitStore.updateHabit(editingHabitId.value, {
      name: formName.value,
      description: formDescription.value,
      active: formActive.value,
    })
  } else {
    await habitStore.addHabit({
      name: formName.value,
      description: formDescription.value,
      active: formActive.value,
    })
  }

  closeHabitForm()
}

async function handleDeleteConfirmed(habitId: string): Promise<void> {
  await habitStore.deleteHabit(habitId)
  closeHabitForm()
}
</script>
