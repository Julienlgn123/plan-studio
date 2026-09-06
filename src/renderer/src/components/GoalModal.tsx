import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import type { Goal } from '@shared/types'

interface Props {
  goal?: Goal
  onClose: () => void
}

export default function GoalModal({ goal, onClose }: Props): JSX.Element {
  const { createGoal, updateGoal, deleteGoal, showToast } = useStore()
  const [title, setTitle] = useState(goal?.title ?? '')
  const [description, setDescription] = useState(goal?.description ?? '')
  const [targetDate, setTargetDate] = useState(goal?.targetDate ?? '')
  const [progress, setProgress] = useState(goal?.progress ?? 0)
  const [saving, setSaving] = useState(false)

  async function handleSave(): Promise<void> {
    if (!title.trim()) return
    setSaving(true)
    try {
      const data = {
        title: title.trim(),
        description: description.trim() || undefined,
        targetDate: targetDate || null,
        progress,
        done: goal?.done ?? progress >= 100
      }
      if (goal) {
        await updateGoal(goal.id, data)
        showToast('Objectif mis à jour', 'success')
      } else {
        await createGoal(data)
        showToast('Objectif créé', 'success')
      }
      onClose()
    } catch (err) {
      showToast('Erreur : ' + (err instanceof Error ? err.message : String(err)), 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(): Promise<void> {
    if (!goal) return
    await deleteGoal(goal.id)
    showToast('Objectif supprimé', 'success')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{goal ? "Modifier l'objectif" : 'Nouvel objectif'}</span>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body">
          <div className="field">
            <label className="field-label">Titre</label>
            <input
              className="field-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Apprendre le piano, courir un 10km..."
              autoFocus
            />
          </div>

          <div className="field">
            <label className="field-label">Description</label>
            <textarea
              className="field-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Détails optionnels..."
            />
          </div>

          <div className="field">
            <label className="field-label">Date cible</label>
            <input className="field-input" type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </div>

          <div className="field">
            <label className="field-label">Progression — {progress}%</label>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
            <div className="progress">
              <div className={`progress-bar ${progress >= 100 ? 'success' : ''}`} style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: goal ? 'space-between' : 'flex-end' }}>
          {goal && (
            <button className="btn btn-danger" onClick={handleDelete}>
              <Trash2 size={14} /> Supprimer
            </button>
          )}
          <div className="row">
            <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving || !title.trim()}>
              {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
