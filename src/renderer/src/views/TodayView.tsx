import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useStore } from '../store'
import { addDays, todayIso, formatFrLong } from '../lib/date'
import EventModal from '../components/EventModal'
import type { CalEvent } from '@shared/types'

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7) // 07:00 .. 22:00

interface Props {
  date?: string // when provided (Month view detail), this view is not the sidebar "Aujourd'hui"
}

export default function TodayView({ date }: Props): JSX.Element {
  const { events, selectedDate, setSelectedDate } = useStore()
  const day = date ?? selectedDate
  const [modalEvent, setModalEvent] = useState<CalEvent | 'new' | null>(null)

  const dayEvents = events.filter((e) => e.date === day)
  const allDay = dayEvents.filter((e) => e.startTime === null)
  const timed = dayEvents.filter((e) => e.startTime !== null)

  function eventsForHour(hour: number): CalEvent[] {
    return timed.filter((e) => Number(e.startTime!.split(':')[0]) === hour)
  }

  return (
    <div className="col" style={{ height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div className="page-header-left">
          <button className="icon-btn" onClick={() => setSelectedDate(addDays(day, -1))}><ChevronLeft size={16} /></button>
          <span className="page-header-title" style={{ textTransform: 'capitalize' }}>{formatFrLong(day)}</span>
          <button className="icon-btn" onClick={() => setSelectedDate(addDays(day, 1))}><ChevronRight size={16} /></button>
          {day !== todayIso() && (
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDate(todayIso())}>Aujourd'hui</button>
          )}
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary btn-sm" onClick={() => setModalEvent('new')}>
            <Plus size={14} /> Événement
          </button>
        </div>
      </div>

      <div className="view-scroll">
        {allDay.length > 0 && (
          <div style={{ padding: '12px 24px 0' }}>
            {allDay.map((e) => (
              <div key={e.id} className="event-chip" style={{ marginBottom: 6 }} onClick={() => setModalEvent(e)}>
                <span className="event-chip-emoji">{e.emoji}</span>
                <span className="event-chip-title">{e.title}</span>
                <span className="event-chip-time">Toute la journée</span>
              </div>
            ))}
          </div>
        )}

        <div className="timeline" style={{ padding: '8px 24px 24px' }}>
          {HOURS.map((h) => {
            const items = eventsForHour(h)
            return (
              <div className="hour-row" key={h}>
                <div className="hour-row-label">{String(h).padStart(2, '0')}:00</div>
                <div className="hour-row-content">
                  {items.length === 0 ? (
                    <div className="hour-row-empty" />
                  ) : (
                    items.map((e) => (
                      <div key={e.id} className="event-chip" onClick={() => setModalEvent(e)}>
                        <span className="event-chip-emoji">{e.emoji}</span>
                        <span className="event-chip-title">{e.title}</span>
                        <span className="event-chip-time">
                          {e.startTime}{e.endTime ? ` – ${e.endTime}` : ''}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {modalEvent === 'new' && <EventModal defaultDate={day} onClose={() => setModalEvent(null)} />}
      {modalEvent && modalEvent !== 'new' && (
        <EventModal event={modalEvent} defaultDate={day} onClose={() => setModalEvent(null)} />
      )}
    </div>
  )
}
