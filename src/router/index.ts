import { createRouter, createWebHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'
import TabsLayout from '@/views/TabsLayout.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/home',
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: () => import('@/views/onboarding/OnboardingPage.vue'),
  },
  {
    path: '/habits',
    name: 'Habits',
    component: () => import('@/views/HabitsPage.vue'),
  },
  {
    path: '/rewards',
    redirect: '/tabs/progress',
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsPage.vue'),
  },
  {
    path: '/tabs/',
    component: TabsLayout,
    children: [
      {
        path: '',
        redirect: '/tabs/home',
      },
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/HomePage.vue'),
      },
      {
        path: 'habits',
        redirect: '/habits',
      },
      {
        path: 'focus',
        name: 'Focus',
        component: () => import('@/views/FocusPage.vue'),
      },
      {
        path: 'learning',
        name: 'Learning',
        component: () => import('@/views/LearningPage.vue'),
      },
      {
        path: 'progress',
        name: 'Progress',
        component: () => import('@/views/ProgressPage.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
