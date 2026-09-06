import { Sun, CalendarDays, CalendarRange, Calendar, ListTodo, Target, Settings } from 'lucide-react'
import { useStore, type ViewName } from '../store'

const NAV: { view: ViewName; label: string; icon: JSX.Element }[] = [
  { view: 'today', label: "Aujourd'hui", icon: <Sun size={15} /> },
  { view: 'week', label: 'Semaine', icon: <CalendarRange size={15} /> },
  { view: 'month', label: 'Mois', icon: <CalendarDays size={15} /> },
  { view: 'agenda', label: 'Agenda', icon: <Calendar size={15} /> },
  { view: 'tasks', label: 'Tâches', icon: <ListTodo size={15} /> },
  { view: 'goals', label: 'Objectifs', icon: <Target size={15} /> }
]

export default function Sidebar(): JSX.Element {
  const { view, setView, tasks } = useStore()
  const openTasks = tasks.filter((t) => !t.done).length

  return (
    <nav className="sidebar">
      <div className="sidebar-scroll">
        <div className="sidebar-section-label">Navigation</div>
        {NAV.map((n) => (
          <button
            key={n.view}
            className={`sidebar-item ${view === n.view ? 'active' : ''}`}
            onClick={() => setView(n.view)}
          >
            {n.icon}
            <span className="sidebar-item-name">{n.label}</span>
            {n.view === 'tasks' && openTasks > 0 && <span className="sidebar-item-count">{openTasks}</span>}
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <button
          className={`sidebar-item ${view === 'settings' ? 'active' : ''}`}
          onClick={() => setView('settings')}
        >
          <Settings size={15} />
          <span className="sidebar-item-name">Réglages</span>
        </button>
      </div>
    </nav>
  )
}
