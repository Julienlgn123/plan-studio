// Local date helpers. All "ISO date" strings here are plain YYYY-MM-DD, no time/timezone.

export function toIso(d: Date): string {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10)
}

export function todayIso(): string {
  return toIso(new Date())
}

export function fromIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function addDays(iso: string, n: number): string {
  const d = fromIso(iso)
  d.setDate(d.getDate() + n)
  return toIso(d)
}

// Monday-first start of the week containing `iso`
export function startOfWeek(iso: string): string {
  const d = fromIso(iso)
  const dow = (d.getDay() + 6) % 7 // 0 = Monday
  d.setDate(d.getDate() - dow)
  return toIso(d)
}

export function startOfMonth(iso: string): string {
  const d = fromIso(iso)
  return toIso(new Date(d.getFullYear(), d.getMonth(), 1))
}

export function addMonths(iso: string, n: number): string {
  const d = fromIso(iso)
  return toIso(new Date(d.getFullYear(), d.getMonth() + n, 1))
}

const WEEKDAYS_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

export function weekdayShort(iso: string): string {
  const d = fromIso(iso)
  return WEEKDAYS_SHORT[(d.getDay() + 6) % 7]
}

export function monthLabel(iso: string): string {
  const d = fromIso(iso)
  return `${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
}

export function formatFr(iso: string): string {
  const d = fromIso(iso)
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()].toLowerCase()} ${d.getFullYear()}`
}

export function formatFrLong(iso: string): string {
  const d = fromIso(iso)
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  return `${days[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()].toLowerCase()}`
}

// Returns 6 rows x 7 days covering the full month grid (Monday-first)
export function monthMatrix(monthIso: string): string[][] {
  const first = startOfMonth(monthIso)
  const gridStart = startOfWeek(first)
  const weeks: string[][] = []
  let cursor = gridStart
  for (let w = 0; w < 6; w++) {
    const row: string[] = []
    for (let d = 0; d < 7; d++) {
      row.push(cursor)
      cursor = addDays(cursor, 1)
    }
    weeks.push(row)
  }
  return weeks
}

export function isSameMonth(iso: string, monthIso: string): boolean {
  const a = fromIso(iso)
  const b = fromIso(monthIso)
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function weekDays(iso: string): string[] {
  const start = startOfWeek(iso)
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}
