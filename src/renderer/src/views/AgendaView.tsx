import { useState } from 'react'
import { useStore } from '../store'
import { todayIso, formatFr } from '../lib/date'
import EventModal from '../components/EventModal'
import TaskModal from '../components/TaskModal'
import type { CalEvent, Task } from '@shared/types'

type AgendaItem =
  | { kind: 'event'; date: string; time: string; event: CalEvent }
  | { kind: 'task'; date: string; time: string; task: Task }

export default function AgendaView(): JSX.Element {
  const { events, tasks } = useStore()
  const [editEvent, setEditEvent] = useState<CalEvent | null>(null)
  const [editTask, setEditTask] = useState<Task | null>(null)

  const today = todayIso()

  const items: AgendaItem[] = [
    ...events.filter((e) => e.date >= today).map((e) => ({ kind: 'event' as const, date: e.date, time: e.startTime ?? '00:00', event: e })),
    ...tasks.filter((t) => !t.done && t.dueDate && t.dueDate >= today).map((t) => ({ kind: 'task' as const, date: t.dueDate!, time: '23:59', task: t }))
  ].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))

  const groups = new Map<string, AgendaItem[]>()
  for (const item of items) {
    if (!groups.has(item.date)) groups.set(item.date, [])
    groups.get(item.date)!.push(item)
  }

  return (
    <div className="col" style={{ height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div className="page-header-left">
          <span className="page-header-title">Agenda</span>
        </div>
      </div>

      <div className="view-scroll">
        {items.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🗒️</div>
            <div className="empty-state-title">Rien à venir</div>
            <div className="empty-state-desc">Tes prochains événements et tâches avec échéance apparaîtront ici.</div>
          </div>
        )}
        {Array.from(groups.entries()).map(([date, dayItems]) => (
          <div className="agenda-group" key={date}>
            <div className="agenda-group-head" style={{ textTransform: 'capitalize' }}>
              {date === today ? "Aujourd'hui" : formatFr(date)}
            </div>
            {dayItems.map((item) =>
              item.kind === 'event' ? (
                <div className="agenda-row" key={`e-${item.event.id}`} onClick={() => setEditEvent(item.event)}>
                  <span className="agenda-row-time">{item.event.startTime ?? '—'}</span>
                  <span style={{ fontSize: 15 }}>{item.event.emoji}</span>
                  <span className="agenda-row-title">{item.event.title}</span>
                </div>
              ) : (
                <div className="agenda-row" key={`t-${item.task.id}`} onClick={() => setEditTask(item.task)}>
                  <span className="agenda-row-time">Tâche</span>
                  <span className={`priority-dot ${item.task.priority}`} />
                  <span className="agenda-row-title">{item.task.title}</span>
                </div>
              )
            )}
          </div>
        ))}
      </div>

      {editEvent && <EventModal event={editEvent} defaultDate={editEvent.date} onClose={() => setEditEvent(null)} />}
      {editTask && <TaskModal task={editTask} onClose={() => setEditTask(null)} />}
    </div>
  )
}
