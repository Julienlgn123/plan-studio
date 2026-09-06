import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import type { CalEvent } from '@shared/types'

const EMOJI_PALETTE = ['📅', '📚', '💻', '🏃', '🍔', '🎉', '✈️', '💼', '🎵', '⚕️', '🛒', '🎮']

interface Props {
  event?: CalEvent
  defaultDate: string
  onClose: () => void
}

export default function EventModal({ event, defaultDate, onClose }: Props): JSX.Element {
  const { createEvent, updateEvent, deleteEvent, showToast } = useStore()
  const [title, setTitle] = useState(event?.title ?? '')
  const [emoji, setEmoji] = useState(event?.emoji ?? EMOJI_PALETTE[0])
  const [date, setDate] = useState(event?.date ?? defaultDate)
  const [allDay, setAllDay] = useState(event ? event.startTime === null : false)
  const [startTime, setStartTime] = useState(event?.startTime ?? '09:00')
  const [endTime, setEndTime] = useState(event?.endTime ?? '10:00')
  const [notes, setNotes] = useState(event?.notes ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave(): Promise<void> {
    if (!title.trim()) return
    setSaving(true)
    try {
      const data = {
        title: title.trim(),
        date,
        startTime: allDay ? null : startTime,
        endTime: allDay ? null : endTime,
        emoji,
        notes: notes.trim() || undefined
      }
      if (event) {
        await updateEvent(event.id, data)
        showToast('Événement mis à jour', 'success')
      } else {
        await createEvent(data)
        showToast('Événement créé', 'success')
      }
      onClose()
    } catch (err) {
      showToast('Erreur : ' + (err instanceof Error ? err.message : String(err)), 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(): Promise<void> {
    if (!event) return
    await deleteEvent(event.id)
    showToast('Événement supprimé', 'success')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{event ? "Modifier l'événement" : 'Nouvel événement'}</span>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body">
          <div className="field">
            <label className="field-label">Titre</label>
            <input
              className="field-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Cours de maths, rendez-vous..."
              autoFocus
            />
          </div>

          <div className="field">
            <label className="field-label">Icône</label>
            <div className="emoji-grid">
              {EMOJI_PALETTE.map((e) => (
                <button
                  key={e}
                  type="button"
                  className={`emoji-opt ${emoji === e ? 'selected' : ''}`}
                  onClick={() => setEmoji(e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="field-label">Date</label>
            <input className="field-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="row">
            <input
              type="checkbox"
              className="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              id="allday"
            />
            <label htmlFor="allday" style={{ fontSize: 13 }}>Toute la journée</label>
          </div>

          {!allDay && (
            <div className="field-row">
              <div className="field">
                <label className="field-label">Début</label>
                <input className="field-input" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">Fin</label>
                <input className="field-input" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
          )}

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

        <div className="modal-footer" style={{ justifyContent: event ? 'space-between' : 'flex-end' }}>
          {event && (
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
