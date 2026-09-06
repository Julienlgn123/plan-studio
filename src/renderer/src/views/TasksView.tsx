import { useMemo, useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { useStore } from '../store'
import { formatFr } from '../lib/date'
import TaskModal from '../components/TaskModal'
import type { Task, Priority } from '@shared/types'

type Filter = 'all' | 'open' | 'done'
type Sort = 'dueDate' | 'priority'

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 }
const PRIORITY_LABEL: Record<Priority, string> = { high: 'Haute', medium: 'Moyenne', low: 'Basse' }

export default function TasksView(): JSX.Element {
  const { tasks, updateTask, showToast } = useStore()
  const [filter, setFilter] = useState<Filter>('open')
  const [sort, setSort] = useState<Sort>('dueDate')
  const [modalTask, setModalTask] = useState<Task | 'new' | null>(null)

  const filtered = useMemo(() => {
    let list = tasks
    if (filter === 'open') list = list.filter((t) => !t.done)
    if (filter === 'done') list = list.filter((t) => t.done)
    list = [...list].sort((a, b) => {
      if (sort === 'priority') return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      return (a.dueDate ?? '9999-99-99').localeCompare(b.dueDate ?? '9999-99-99')
    })
    return list
  }, [tasks, filter, sort])

  async function toggleDone(t: Task): Promise<void> {
    await updateTask(t.id, { done: !t.done })
    showToast(t.done ? 'Tâche rouverte' : 'Tâche terminée', 'success')
  }

  return (
    <div className="col" style={{ height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div className="page-header-left">
          <span className="page-header-title">Tâches</span>
        </div>
        <div className="page-header-right">
          <select className="field-input" style={{ width: 150 }} value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="dueDate">Trier par échéance</option>
            <option value="priority">Trier par priorité</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={() => setModalTask('new')}>
            <Plus size={14} /> Tâche
          </button>
        </div>
      </div>

      <div className="filter-row">
        {(['open', 'done', 'all'] as Filter[]).map((f) => (
          <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'open' ? 'À faire' : f === 'done' ? 'Terminées' : 'Toutes'}
          </button>
        ))}
      </div>

      <div className="view-scroll view-pad">
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-title">Aucune tâche</div>
            <div className="empty-state-desc">Ajoute une tâche pour commencer à organiser ton temps.</div>
          </div>
        )}
        <div className="col">
          {filtered.map((t) => (
            <div key={t.id} className={`list-row ${t.done ? 'done' : ''}`}>
              <button className={`checkbox-round ${t.done ? 'checked' : ''}`} onClick={() => toggleDone(t)}>
                {t.done && <Check size={12} />}
              </button>
              <span className={`priority-dot ${t.priority}`} title={PRIORITY_LABEL[t.priority]} />
              <span className="list-row-title" onClick={() => setModalTask(t)} style={{ cursor: 'pointer' }}>{t.title}</span>
              {t.dueDate && <span className="list-row-meta">{formatFr(t.dueDate)}</span>}
            </div>
          ))}
        </div>
      </div>

      {modalTask === 'new' && <TaskModal onClose={() => setModalTask(null)} />}
      {modalTask && modalTask !== 'new' && <TaskModal task={modalTask} onClose={() => setModalTask(null)} />}
    </div>
  )
}
