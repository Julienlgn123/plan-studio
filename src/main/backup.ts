import { app, dialog, BrowserWindow } from 'electron'
import { join } from 'path'
import { existsSync, rmSync } from 'fs'
import { closeDb } from './db'

// Folders/files inside userData that make up the full user data set
const DATA_ENTRIES = ['plan-studio.db', 'plan-studio.db-wal', 'plan-studio.db-shm', 'settings.json']

function userData(): string {
  return app.getPath('userData')
}

// ─── Suppression totale : remet l'app à zéro (événements, tâches, objectifs) ──
export function resetAllData(window: BrowserWindow): Promise<boolean> {
  return dialog
    .showMessageBox(window, {
      type: 'warning',
      buttons: ['Annuler', 'Tout supprimer'],
      defaultId: 0,
      cancelId: 0,
      title: 'Supprimer toutes les données',
      message: 'Supprimer définitivement tous tes événements, tâches et objectifs ?',
      detail: "Action irréversible — aucune copie n'est gardée. L'application va redémarrer, vide."
    })
    .then(({ response }) => {
      if (response !== 1) return false
      closeDb()
      for (const entry of DATA_ENTRIES) {
        const abs = join(userData(), entry)
        if (existsSync(abs)) rmSync(abs, { recursive: true, force: true })
      }
      app.relaunch()
      app.exit(0)
      return true
    })
}
