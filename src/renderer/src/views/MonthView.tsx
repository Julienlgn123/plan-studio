import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../store'
import { addMonths, monthMatrix, isSameMonth, monthLabel, todayIso, fromIso } from '../lib/date'
import TodayView from './TodayView'

const WEEKDAY_HEADS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export default function MonthView(): JSX.Element {
  const { events, tasks, selectedDate, setSelectedDate } = useStore()
  const weeks = monthMatrix(selectedDate)
  const today = todayIso()

  function countsFor(day: string): { events: number; tasks: number } {
    return {
      events: events.filter((e) => e.date === day).length,
      tasks: tasks.filter((t) => !t.done && t.dueDate === day).length
    }
  }

  return (
    <div className="row" style={{ height: '100%', overflow: 'hidden', alignItems: 'stretch' }}>
      <div className="col" style={{ flex: 1.4, overflow: 'hidden' }}>
        <div className="page-header">
          <div className="page-header-left">
            <button className="icon-btn" onClick={() => setSelectedDate(addMonths(selectedDate, -1))}><ChevronLeft size={16} /></button>
            <span className="page-header-title" style={{ textTransform: 'capitalize' }}>{monthLabel(selectedDate)}</span>
            <button className="icon-btn" onClick={() => setSelectedDate(addMonths(selectedDate, 1))}><ChevronRight size={16} /></button>
          </div>
        </div>

        <div className="month-weekday-head">
          {WEEKDAY_HEADS.map((d) => <span key={d}>{d}</span>)}
        </div>

        <div className="col" style={{ flex: 1, overflow: 'hidden' }}>
          {weeks.map((week, wi) => (
            <div className="month-grid" key={wi} style={{ flex: 1 }}>
              {week.map((day) => {
                const c = countsFor(day)
                const inMonth = isSameMonth(day, selectedDate)
                return (
                  <div
                    key={day}
                    className={`month-cell ${inMonth ? '' : 'other-month'} ${day === selectedDate ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <span className={`month-cell-num ${day === today ? 'today' : ''}`}>{fromIso(day).getDate()}</span>
                    <div className="month-cell-dots">
                      {Array.from({ length: Math.min(c.events, 4) }).map((_, i) => <span key={`e${i}`} className="month-cell-dot" />)}
                      {Array.from({ length: Math.min(c.tasks, 4) }).map((_, i) => <span key={`t${i}`} className="month-cell-dot task" />)}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="col" style={{ flex: 1, borderLeft: '1px solid var(--border)', overflow: 'hidden' }}>
        <TodayView date={selectedDate} />
      </div>
    </div>
  )
}
