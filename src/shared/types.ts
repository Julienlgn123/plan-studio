export type Priority = 'low' | 'medium' | 'high'

export interface CalEvent {
  id: string
  title: string
  date: string // ISO date, YYYY-MM-DD
  startTime: string | null // HH:mm, null = all-day
  endTime: string | null // HH:mm
  emoji: string
  notes?: string
  createdAt: number
}

export interface Task {
  id: string
  title: string
  done: boolean
  dueDate: string | null // ISO date, YYYY-MM-DD
  priority: Priority
  notes?: string
  createdAt: number
}

export interface Goal {
  id: string
  title: string
  description?: string
  targetDate: string | null // ISO date, YYYY-MM-DD
  progress: number // 0-100
  done: boolean
  createdAt: number
}

export interface AppSettings {
  theme?: 'dark' | 'light'
}
