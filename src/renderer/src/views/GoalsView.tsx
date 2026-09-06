import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { useStore } from '../store'
import { formatFr } from '../lib/date'
import GoalModal from '../components/GoalModal'
import type { Goal } from '@shared/types'

export default function GoalsView(): JSX.Element {
  const { goals, updateGoal, showToast } = useStore()
  const [modalGoal, setModalGoal] = useState<Goal | 'new' | null>(null)

  async function toggleDone(g: Goal): Promise<void> {
    await updateGoal(g.id, { done: !g.done, progress: !g.done ? 100 : g.progress })
    showToast(g.done ? 'Objectif rouvert' : 'Objectif atteint', 'success')
  }

  const active = goals.filter((g) => !g.done)
  const done = goals.filter((g) => g.done)

  return (
    <div className="col" style={{ height: '100%', overflow: 'hidden' }}>
      <div className="page-header">
        <div className="page-header-left">
          <span className="page-header-title">Objectifs</span>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary btn-sm" onClick={() => setModalGoal('new')}>
            <Plus size={14} /> Objectif
          </button>
        </div>
      </div>

      <div className="view-scroll view-pad">
        {goals.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🎯</div>
            <div className="empty-state-title">Aucun objectif</div>
            <div className="empty-state-desc">Définis un objectif et suis ta progression au fil du temps.</div>
          </div>
        )}

        <div className="col" style={{ gap: 10 }}>
          {active.map((g) => (
            <div key={g.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setModalGoal(g)}>
              <div className="spread" style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 500 }}>{g.title}</span>
                <button
                  className={`checkbox-round ${g.done ? 'checked' : ''}`}
                  onClick={(e) => { e.stopPropagation(); toggleDone(g) }}
                >
                  {g.done && <Check size={12} />}
                </button>
              </div>
              {g.description && <div className="muted" style={{ fontSize: 12.5, marginBottom: 10 }}>{g.description}</div>}
              <div className="progress" style={{ marginBottom: 6 }}>
                <div className={`progress-bar ${g.progress >= 100 ? 'success' : ''}`} style={{ width: `${g.progress}%` }} />
              </div>
              <div className="spread">
                <span className="muted" style={{ fontSize: 11.5 }}>{g.progress}%</span>
                {g.targetDate && <span className="muted" style={{ fontSize: 11.5 }}>Échéance : {formatFr(g.targetDate)}</span>}
              </div>
            </div>
          ))}

          {done.length > 0 && (
            <>
              <div className="sidebar-section-label" style={{ padding: 0, marginTop: 10 }}>Atteints</div>
              {done.map((g) => (
                <div key={g.id} className="card" style={{ opacity: 0.6, cursor: 'pointer' }} onClick={() => setModalGoal(g)}>
                  <div className="spread">
                    <span style={{ fontWeight: 500, textDecoration: 'line-through' }}>{g.title}</span>
                    <button
                      className="checkbox-round checked"
                      onClick={(e) => { e.stopPropagation(); toggleDone(g) }}
                    >
                      <Check size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {modalGoal === 'new' && <GoalModal onClose={() => setModalGoal(null)} />}
      {modalGoal && modalGoal !== 'new' && <GoalModal goal={modalGoal} onClose={() => setModalGoal(null)} />}
    </div>
  )
}
