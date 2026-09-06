import { useEffect } from 'react'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import TodayView from './views/TodayView'
import WeekView from './views/WeekView'
import MonthView from './views/MonthView'
import AgendaView from './views/AgendaView'
import TasksView from './views/TasksView'
import GoalsView from './views/GoalsView'
import SettingsView from './views/SettingsView'
import { useStore } from './store'

export default function App(): JSX.Element {
  const { view, loadAll } = useStore()

  useEffect(() => {
    loadAll()
    window.api.app.notifyReady()
  }, [])

  return (
    <div className="app">
      <TitleBar />
      <div className="app-body">
        <Sidebar />
        <main className="main">
          {view === 'today' && <TodayView />}
          {view === 'week' && <WeekView />}
          {view === 'month' && <MonthView />}
          {view === 'agenda' && <AgendaView />}
          {view === 'tasks' && <TasksView />}
          {view === 'goals' && <GoalsView />}
          {view === 'settings' && <SettingsView />}
        </main>
      </div>
      <Toast />
    </div>
  )
}
