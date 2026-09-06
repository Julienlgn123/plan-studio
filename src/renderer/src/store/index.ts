import { create } from 'zustand'
import type { CalEvent, Task, Goal, AppSettings } from '@shared/types'

export type ViewName = 'today' | 'week' | 'month' | 'agenda' | 'tasks' | 'goals' | 'settings'

function todayIso(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10)
}

interface AppStore {
  view: ViewName
  setView: (view: ViewName) => void

  selectedDate: string // ISO date shown by the Today/day-detail timeline
  setSelectedDate: (date: string) => void

  events: CalEvent[]
  tasks: Task[]
  goals: Goal[]

  settings: AppSettings
  toast: { message: string; type: 'success' | 'error' | 'info' } | null

  loadAll: () => Promise<void>
  loadEvents: () => Promise<void>
  loadTasks: () => Promise<void>
  loadGoals: () => Promise<void>
  loadSettings: () => Promise<void>

  createEvent: (data: Omit<CalEvent, 'id' | 'createdAt'>) => Promise<CalEvent>
  updateEvent: (id: string, data: Partial<Omit<CalEvent, 'id' | 'createdAt'>>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>

  createTask: (data: Omit<Task, 'id' | 'createdAt'>) => Promise<Task>
  updateTask: (id: string, data: Partial<Omit<Task, 'id' | 'createdAt'>>) => Promise<void>
  deleteTask: (id: string) => Promise<void>

  createGoal: (data: Omit<Goal, 'id' | 'createdAt'>) => Promise<Goal>
  updateGoal: (id: string, data: Partial<Omit<Goal, 'id' | 'createdAt'>>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>

  saveSettings: (s: AppSettings) => Promise<void>
  applyTheme: () => void

  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  hideToast: () => void
}

export const useStore = create<AppStore>((set, get) => ({
  view: 'today',
  setView: (view) => set({ view }),

  selectedDate: todayIso(),
  setSelectedDate: (date) => set({ selectedDate: date }),

  events: [],
  tasks: [],
  goals: [],
  settings: {},
  toast: null,

  loadAll: async () => {
    await Promise.all([get().loadEvents(), get().loadTasks(), get().loadGoals(), get().loadSettings()])
  },
  loadEvents: async () => set({ events: await window.api.events.get() }),
  loadTasks: async () => set({ tasks: await window.api.tasks.get() }),
  loadGoals: async () => set({ goals: await window.api.goals.get() }),
  loadSettings: async () => {
    const settings = await window.api.settings.get()
    set({ settings })
    get().applyTheme()
  },

  createEvent: async (data) => {
    const ev = await window.api.events.create(data)
    set((s) => ({ events: [...s.events, ev].sort((a, b) => (a.date + (a.startTime ?? '')).localeCompare(b.date + (b.startTime ?? ''))) }))
    return ev
  },
  updateEvent: async (id, data) => {
    await window.api.events.update(id, data)
    set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, ...data } : e)) }))
  },
  deleteEvent: async (id) => {
    await window.api.events.delete(id)
    set((s) => ({ events: s.events.filter((e) => e.id !== id) }))
  },

  createTask: async (data) => {
    const task = await window.api.tasks.create(data)
    set((s) => ({ tasks: [...s.tasks, task] }))
    return task
  },
  updateTask: async (id, data) => {
    await window.api.tasks.update(id, data)
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)) }))
  },
  deleteTask: async (id) => {
    await window.api.tasks.delete(id)
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
  },

  createGoal: async (data) => {
    const goal = await window.api.goals.create(data)
    set((s) => ({ goals: [...s.goals, goal] }))
    return goal
  },
  updateGoal: async (id, data) => {
    await window.api.goals.update(id, data)
    set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...data } : g)) }))
  },
  deleteGoal: async (id) => {
    await window.api.goals.delete(id)
    set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }))
  },

  saveSettings: async (settings) => {
    await window.api.settings.set(settings)
    set({ settings })
    get().applyTheme()
  },
  applyTheme: () => {
    const theme = get().settings.theme === 'light' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', theme)
  },

  showToast: (message, type = 'info') => {
    set({ toast: { message, type } })
    setTimeout(() => get().hideToast(), 3000)
  },
  hideToast: () => set({ toast: null })
}))
