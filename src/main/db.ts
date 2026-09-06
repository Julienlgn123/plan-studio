import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import type { CalEvent, Task, Goal, Priority } from '../shared/types'

let db: Database.Database
let currentDbPath = ''

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function getDbPath(): string {
  return currentDbPath
}

// Flush the WAL into the main .db file so a file-copy backup/reset is complete
export function checkpointDb(): void {
  try { db.pragma('wal_checkpoint(TRUNCATE)') } catch { /* ok */ }
}

export function closeDb(): void {
  try { db.close() } catch { /* ok */ }
}

export function initDb(): void {
  // Must be called after app.whenReady() so app.getPath works correctly
  const dbPath = join(app.getPath('userData'), 'plan-studio.db')
  currentDbPath = dbPath
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')

  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      emoji TEXT NOT NULL DEFAULT '📅',
      notes TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      due_date TEXT,
      priority TEXT NOT NULL DEFAULT 'medium',
      notes TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      target_date TEXT,
      progress INTEGER NOT NULL DEFAULT 0,
      done INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
  `)
}

// ─── Events ────────────────────────────────────────────────────────────────

interface DbEvent {
  id: string; title: string; date: string; start_time: string | null; end_time: string | null
  emoji: string; notes: string | null; created_at: number
}

function rowToEvent(row: DbEvent): CalEvent {
  return {
    id: row.id, title: row.title, date: row.date,
    startTime: row.start_time, endTime: row.end_time,
    emoji: row.emoji, notes: row.notes ?? undefined, createdAt: row.created_at
  }
}

export function getAllEvents(): CalEvent[] {
  return (db.prepare('SELECT * FROM events ORDER BY date ASC, start_time ASC').all() as DbEvent[]).map(rowToEvent)
}

export function createEvent(data: Omit<CalEvent, 'id' | 'createdAt'>): CalEvent {
  const id = generateId()
  const now = Date.now()
  db.prepare(
    'INSERT INTO events (id, title, date, start_time, end_time, emoji, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(id, data.title, data.date, data.startTime, data.endTime, data.emoji, data.notes ?? null, now)
  return { id, ...data, createdAt: now }
}

export function updateEvent(id: string, data: Partial<Omit<CalEvent, 'id' | 'createdAt'>>): void {
  const fields: string[] = []
  const values: unknown[] = []
  if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title) }
  if (data.date !== undefined) { fields.push('date = ?'); values.push(data.date) }
  if (data.startTime !== undefined) { fields.push('start_time = ?'); values.push(data.startTime) }
  if (data.endTime !== undefined) { fields.push('end_time = ?'); values.push(data.endTime) }
  if (data.emoji !== undefined) { fields.push('emoji = ?'); values.push(data.emoji) }
  if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes) }
  if (!fields.length) return
  values.push(id)
  db.prepare(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`).run(...values)
}

export function deleteEvent(id: string): void {
  db.prepare('DELETE FROM events WHERE id = ?').run(id)
}

// ─── Tasks ─────────────────────────────────────────────────────────────────

interface DbTask {
  id: string; title: string; done: number; due_date: string | null
  priority: string; notes: string | null; created_at: number
}

function rowToTask(row: DbTask): Task {
  return {
    id: row.id, title: row.title, done: !!row.done, dueDate: row.due_date,
    priority: row.priority as Priority, notes: row.notes ?? undefined, createdAt: row.created_at
  }
}

export function getAllTasks(): Task[] {
  return (db.prepare('SELECT * FROM tasks ORDER BY done ASC, due_date ASC, created_at DESC').all() as DbTask[]).map(rowToTask)
}

export function createTask(data: Omit<Task, 'id' | 'createdAt'>): Task {
  const id = generateId()
  const now = Date.now()
  db.prepare(
    'INSERT INTO tasks (id, title, done, due_date, priority, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, data.title, data.done ? 1 : 0, data.dueDate, data.priority, data.notes ?? null, now)
  return { id, ...data, createdAt: now }
}

export function updateTask(id: string, data: Partial<Omit<Task, 'id' | 'createdAt'>>): void {
  const fields: string[] = []
  const values: unknown[] = []
  if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title) }
  if (data.done !== undefined) { fields.push('done = ?'); values.push(data.done ? 1 : 0) }
  if (data.dueDate !== undefined) { fields.push('due_date = ?'); values.push(data.dueDate) }
  if (data.priority !== undefined) { fields.push('priority = ?'); values.push(data.priority) }
  if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes) }
  if (!fields.length) return
  values.push(id)
  db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...values)
}

export function deleteTask(id: string): void {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(id)
}

// ─── Goals ─────────────────────────────────────────────────────────────────

interface DbGoal {
  id: string; title: string; description: string | null; target_date: string | null
  progress: number; done: number; created_at: number
}

function rowToGoal(row: DbGoal): Goal {
  return {
    id: row.id, title: row.title, description: row.description ?? undefined,
    targetDate: row.target_date, progress: row.progress, done: !!row.done, createdAt: row.created_at
  }
}

export function getAllGoals(): Goal[] {
  return (db.prepare('SELECT * FROM goals ORDER BY done ASC, created_at DESC').all() as DbGoal[]).map(rowToGoal)
}

export function createGoal(data: Omit<Goal, 'id' | 'createdAt'>): Goal {
  const id = generateId()
  const now = Date.now()
  db.prepare(
    'INSERT INTO goals (id, title, description, target_date, progress, done, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, data.title, data.description ?? null, data.targetDate, data.progress, data.done ? 1 : 0, now)
  return { id, ...data, createdAt: now }
}

export function updateGoal(id: string, data: Partial<Omit<Goal, 'id' | 'createdAt'>>): void {
  const fields: string[] = []
  const values: unknown[] = []
  if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title) }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description) }
  if (data.targetDate !== undefined) { fields.push('target_date = ?'); values.push(data.targetDate) }
  if (data.progress !== undefined) { fields.push('progress = ?'); values.push(data.progress) }
  if (data.done !== undefined) { fields.push('done = ?'); values.push(data.done ? 1 : 0) }
  if (!fields.length) return
  values.push(id)
  db.prepare(`UPDATE goals SET ${fields.join(', ')} WHERE id = ?`).run(...values)
}

export function deleteGoal(id: string): void {
  db.prepare('DELETE FROM goals WHERE id = ?').run(id)
}
