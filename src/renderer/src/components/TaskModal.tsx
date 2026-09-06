import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import type { Task, Priority } from '@shared/types'

interface Props {
  task?: Task
  defaultDate?: string
  onClose: () => void
}

export default function TaskModal({ task, defaultDate, onClose }: Props): JSX.Element {
  const { createTask, updateTask, deleteTask, showToast } = useStore()
  const [title, setTitle] = useState(task?.title ?? '')
  const [dueDate, setDueDate] = useState(task?.dueDate ?? defaultDate ?? '')
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium')
  const [notes, setNotes] = useState(task?.notes ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave(): Promise<void> {
    if (!title.trim()) return
    setSaving(true)
    try {
      const data = {
        title: title.trim(),
        dueDate: dueDate || null,
        priority,
        notes: notes.trim() || undefined,
        done: task?.done ?? false
      }
      if (task) {
        await updateTask(task.id, data)
        showToast('Tâche mise à jour', 'success')
      } else {
        await createTask(data)
        showToast('Tâche créée', 'success')
      }
      onClose()
    } catch (err) {
      showToast('Erreur : ' + (err instanceof Error ? err.message : String(err)), 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(): Promise<void> {
    if (!task) return
    await deleteTask(task.id)
    showToast('Tâche supprimée', 'success')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{task ? 'Modifier la tâche' : 'Nouvelle tâche'}</span>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body">
          <div className="field">
            <label className="field-label">Titre</label>
            <input
              className="field-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Rendre le devoir, appeler..."
              autoFocus
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field-label">Échéance</label>
              <input className="field-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label">Priorité</label>
              <select className="field-input" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label className="field-label">Notes</label>
            <textarea
              className="field-input"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Détails optionnels..."
            />
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: task ? 'space-between' : 'flex-end' }}>
          {task && (
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
