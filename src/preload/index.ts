import { contextBridge, ipcRenderer } from 'electron'
import type { CalEvent, Task, Goal, AppSettings } from '../shared/types'

const api = {
  platform: process.platform,
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close')
  },
  events: {
    get: (): Promise<CalEvent[]> => ipcRenderer.invoke('events:get'),
    create: (data: Omit<CalEvent, 'id' | 'createdAt'>): Promise<CalEvent> =>
      ipcRenderer.invoke('events:create', data),
    update: (id: string, data: Partial<Omit<CalEvent, 'id' | 'createdAt'>>): Promise<boolean> =>
      ipcRenderer.invoke('events:update', id, data),
    delete: (id: string): Promise<boolean> => ipcRenderer.invoke('events:delete', id)
  },
  tasks: {
    get: (): Promise<Task[]> => ipcRenderer.invoke('tasks:get'),
    create: (data: Omit<Task, 'id' | 'createdAt'>): Promise<Task> =>
      ipcRenderer.invoke('tasks:create', data),
    update: (id: string, data: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<boolean> =>
      ipcRenderer.invoke('tasks:update', id, data),
    delete: (id: string): Promise<boolean> => ipcRenderer.invoke('tasks:delete', id)
  },
  goals: {
    get: (): Promise<Goal[]> => ipcRenderer.invoke('goals:get'),
    create: (data: Omit<Goal, 'id' | 'createdAt'>): Promise<Goal> =>
      ipcRenderer.invoke('goals:create', data),
    update: (id: string, data: Partial<Omit<Goal, 'id' | 'createdAt'>>): Promise<boolean> =>
      ipcRenderer.invoke('goals:update', id, data),
    delete: (id: string): Promise<boolean> => ipcRenderer.invoke('goals:delete', id)
  },
  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
    set: (data: AppSettings): Promise<boolean> => ipcRenderer.invoke('settings:set', data)
  },
  backup: {
    resetAll: (): Promise<boolean> => ipcRenderer.invoke('backup:resetAll')
  },
  app: {
    version: (): Promise<string> => ipcRenderer.invoke('app:version'),
    notifyReady: () => ipcRenderer.send('renderer:ready'),
    checkUpdate: () => ipcRenderer.invoke('update:check'),
    downloadUpdate: () => ipcRenderer.invoke('update:download'),
    installUpdate: () => ipcRenderer.invoke('update:install'),
    openReleases: () => ipcRenderer.invoke('update:openReleases'),
    onUpdateAvailable: (cb: (info: { version: string }) => void) => {
      const handler = (_: unknown, info: { version: string }) => cb(info)
      ipcRenderer.on('update:available', handler)
      return () => ipcRenderer.removeListener('update:available', handler)
    },
    onUpdateNotAvailable: (cb: () => void) => {
      ipcRenderer.on('update:not-available', cb)
      return () => ipcRenderer.removeListener('update:not-available', cb)
    },
    onUpdateProgress: (cb: (pct: number) => void) => {
      const handler = (_: unknown, pct: number) => cb(pct)
      ipcRenderer.on('update:progress', handler)
      return () => ipcRenderer.removeListener('update:progress', handler)
    },
    onUpdateDownloaded: (cb: () => void) => {
      ipcRenderer.on('update:downloaded', cb)
      return () => ipcRenderer.removeListener('update:downloaded', cb)
    },
    onUpdateError: (cb: (err: string) => void) => {
      const handler = (_: unknown, err: string) => cb(err)
      ipcRenderer.on('update:error', handler)
      return () => ipcRenderer.removeListener('update:error', handler)
    }
  }
}

contextBridge.exposeInMainWorld('api', api)
export type Api = typeof api
