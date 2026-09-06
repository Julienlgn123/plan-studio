import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useStore } from '../store'
import { addDays, weekDays, todayIso, weekdayShort, fromIso } from '../lib/date'
import EventModal from '../components/EventModal'
import type { CalEvent } from '@shared/types'

export default function WeekView(): JSX.Element {
  const { events, selectedDate, setSelectedDate } = useStore()
  const [modalEvent, setModalEvent] = useState<CalEvent | 'new' | null>(null)
  const [newDate, setNewDate] = useState(selectedDate)

  const days = weekDays(selectedDate)
  const today = todayIso()

  function eventsFor(day: string): CalEvent[] {
    return events
      .filter((e) => e.date === day)
      .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''))
  }

  return (
    <div className="col" style={{ height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div className="page-header-left">
          <button className="icon-btn" onClick={() => setSelectedDate(addDays(selectedDate, -7))}><ChevronLeft size={16} /></button>
          <span className="page-header-title">
            Semaine du {fromIso(days[0]).getDate()} au {fromIso(days[6]).getDate()} {fromIso(days[6]).toLocaleDateString('fr-FR', { month: 'long' })}
          </span>
          <button className="icon-btn" onClick={() => setSelectedDate(addDays(selectedDate, 7))}><ChevronRight size={16} /></button>
          {!days.includes(today) && (
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDate(today)}>Cette semaine</button>
          )}
        </div>
      </div>

      <div className="view-scroll">
        <div className="week-grid">
          {days.map((day) => (
            <div className="week-day-col" key={day}>
              <div className="week-day-head">
                <span className="week-day-name">{weekdayShort(day)}</span>
                <span className={`week-day-num ${day === today ? 'today' : ''}`}>{fromIso(day).getDate()}</span>
              </div>
              <div className="week-day-items">
                {eventsFor(day).map((e) => (
                  <div key={e.id} className="event-chip" onClick={() => setModalEvent(e)}>
                    <span className="event-chip-emoji">{e.emoji}</span>
                    <span className="event-chip-title">{e.title}</span>
                  </div>
                ))}
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ justifyContent: 'center' }}
                  onClick={() => { setNewDate(day); setModalEvent('new') }}
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalEvent === 'new' && <EventModal defaultDate={newDate} onClose={() => setModalEvent(null)} />}
      {modalEvent && modalEvent !== 'new' && (
        <EventModal event={modalEvent} defaultDate={selectedDate} onClose={() => setModalEvent(null)} />
      )}
    </div>
  )
}
