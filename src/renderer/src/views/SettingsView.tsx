import { useEffect, useState } from 'react'
import { Moon, Sun, RefreshCw, Download, CheckCircle, Trash2 } from 'lucide-react'
import { useStore } from '../store'

type UpdateState = 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'

export default function SettingsView(): JSX.Element {
  const { settings, saveSettings, showToast } = useStore()
  const [appVersion, setAppVersion] = useState('')
  const [resetting, setResetting] = useState(false)
  const [updateState, setUpdateState] = useState<UpdateState>('idle')
  const [updateVersion, setUpdateVersion] = useState('')
  const [updateProgress, setUpdateProgress] = useState(0)
  const [updateError, setUpdateError] = useState('')

  useEffect(() => {
    window.api.app.version().then(setAppVersion).catch(() => setAppVersion('dev'))
    const cleanups = [
      window.api.app.onUpdateAvailable(({ version }) => { setUpdateVersion(version); setUpdateState('available') }),
      window.api.app.onUpdateNotAvailable(() => setUpdateState('not-available')),
      window.api.app.onUpdateProgress((pct) => { setUpdateProgress(pct); setUpdateState('downloading') }),
      window.api.app.onUpdateDownloaded(() => setUpdateState('downloaded')),
      window.api.app.onUpdateError((err) => { setUpdateError(err); setUpdateState('error') })
    ]
    return () => cleanups.forEach((c) => c())
  }, [])

  function checkUpdate(): void {
    setUpdateState('checking')
    setUpdateError('')
    window.api.app.checkUpdate()
  }

  async function handleResetAll(): Promise<void> {
    setResetting(true)
    try {
      await window.api.backup.resetAll()
      // On success the app relaunches; if we get here the user cancelled the dialog.
    } catch (err) {
      showToast('Erreur : ' + (err instanceof Error ? err.message : String(err)), 'error')
    } finally {
      setResetting(false)
    }
  }

  const theme = settings.theme === 'light' ? 'light' : 'dark'

  return (
    <div className="col" style={{ height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div className="page-header-left">
          <span className="page-header-title">Réglages</span>
        </div>
      </div>

      <div className="view-scroll view-pad">
        <div className="col" style={{ maxWidth: 480, gap: 20 }}>
          <div className="field">
            <label className="field-label">Apparence</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-sm"
                onClick={() => saveSettings({ ...settings, theme: 'dark' })}
                style={{
                  flex: 1, justifyContent: 'center',
                  background: theme === 'dark' ? 'var(--accent-dim)' : 'var(--bg-overlay)',
                  color: theme === 'dark' ? 'var(--accent-light)' : 'var(--text-secondary)'
                }}
              >
                <Moon size={13} /> Sombre
              </button>
              <button
                className="btn btn-sm"
                onClick={() => saveSettings({ ...settings, theme: 'light' })}
                style={{
                  flex: 1, justifyContent: 'center',
                  background: theme === 'light' ? 'var(--accent-dim)' : 'var(--bg-overlay)',
                  color: theme === 'light' ? 'var(--accent-light)' : 'var(--text-secondary)'
                }}
              >
                <Sun size={13} /> Clair
              </button>
            </div>
          </div>

          {/* Update section */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div className="spread" style={{ marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Mise à jour</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  Version actuelle : <strong>{appVersion || '—'}</strong>
                </div>
              </div>
              {(updateState === 'idle' || updateState === 'not-available' || updateState === 'error') && (
                <button className="btn btn-secondary btn-sm" onClick={checkUpdate}>
                  <RefreshCw size={13} /> Vérifier
                </button>
              )}
            </div>

            {updateState === 'checking' && (
              <div className="row" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                <span className="spinner" style={{ width: 12, height: 12 }} /> Vérification en cours...
              </div>
            )}
            {updateState === 'not-available' && (
              <div className="row" style={{ fontSize: 12, color: 'var(--success)' }}>
                <CheckCircle size={13} /> L'application est à jour.
              </div>
            )}
            {updateState === 'available' && (
              <div className="spread" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-light)' }}>Mise à jour disponible</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Version {updateVersion}</div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    if (window.api.platform === 'darwin') { window.api.app.openReleases(); return }
                    window.api.app.downloadUpdate()
                    setUpdateState('downloading')
                  }}
                >
                  <Download size={13} /> Télécharger
                </button>
              </div>
            )}
            {updateState === 'downloading' && (
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Téléchargement... {updateProgress}%</div>
                <div className="progress"><div className="progress-bar" style={{ width: `${updateProgress}%` }} /></div>
              </div>
            )}
            {updateState === 'downloaded' && (
              <div className="spread" style={{ background: 'var(--success-dim)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', padding: '10px 14px' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)' }}>Prêt à installer</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>L'app va redémarrer pour installer la mise à jour</div>
                </div>
                <button className="btn btn-sm" onClick={() => window.api.app.installUpdate()} style={{ background: 'var(--success)', color: '#fff' }}>
                  Installer et relancer
                </button>
              </div>
            )}
            {updateState === 'error' && (
              <div style={{ fontSize: 12, color: 'var(--danger)' }}>
                Erreur : {updateError || 'Impossible de vérifier les mises à jour.'}
              </div>
            )}
          </div>

          {/* Zone dangereuse */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2, color: 'var(--danger)' }}>
              Zone dangereuse
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 10 }}>
              Supprime définitivement tous tes événements, tâches et objectifs sur cet ordinateur.
              Cette action est irréversible.
            </div>
            <button className="btn btn-sm" onClick={handleResetAll} disabled={resetting} style={{ background: 'var(--danger-dim)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.2)' }}>
              {resetting ? <span className="spinner" style={{ width: 13, height: 13 }} /> : <Trash2 size={13} />}
              Supprimer toutes mes données
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
