import { getDb, type Habit } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek.js'

dayjs.extend(isoWeek)

export default defineEventHandler((event) => {
  const user = requireAuth(event)
  const query = getQuery(event)
  const daysCount = Math.min(Math.max(Number(query.days) || 120, 30), 365) // Default 120 days (~4 months)

  const db = getDb()

  const endDate = dayjs()
  const startDate = endDate.subtract(daysCount - 1, 'day')

  const startDateStr = startDate.format('YYYY-MM-DD')
  const endDateStr = endDate.format('YYYY-MM-DD')

  // Get active habits
  const habits = db.prepare('SELECT * FROM habits WHERE user_id = ? AND is_archived = 0').all(user.id) as Habit[]

  // Get all completed logs in range
  const logs = db.prepare(`
    SELECT date, habit_id, status FROM habit_logs 
    WHERE user_id = ? AND date >= ? AND date <= ? AND status = 'completed'
  `).all(user.id, startDateStr, endDateStr) as { date: string; habit_id: number; status: string }[]

  const logCountsByDate = new Map<string, number>()
  for (const log of logs) {
    logCountsByDate.set(log.date, (logCountsByDate.get(log.date) || 0) + 1)
  }

  // Pre-calculate due habits for each day of week (1..7)
  const dueHabitsPerDayOfWeek: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 }
  for (let dow = 1; dow <= 7; dow++) {
    dueHabitsPerDayOfWeek[dow] = habits.filter(h => {
      if (h.repeat_type === 'daily') return true
      if (h.repeat_type === 'weekdays') return dow >= 1 && dow <= 5
      if (h.repeat_type === 'weekends') return dow === 6 || dow === 7
      if (h.repeat_type === 'custom_days' && h.repeat_days) {
        return h.repeat_days.split(',').map(s => s.trim()).includes(String(dow))
      }
      return true
    }).length
  }

  const resultDays: Array<{
    date: string
    dayOfWeek: number
    completed: number
    total: number
    rate: number
    level: number // 0 to 4
  }> = []

  let curr = startDate
  while (curr.isBefore(endDate) || curr.isSame(endDate, 'day')) {
    const dStr = curr.format('YYYY-MM-DD')
    const dow = curr.isoWeekday()
    const totalDue = dueHabitsPerDayOfWeek[dow] || 1
    const completed = logCountsByDate.get(dStr) || 0

    let rate = totalDue > 0 ? completed / totalDue : 0
    let level = 0

    if (completed > 0) {
      if (rate >= 1) level = 4
      else if (rate >= 0.67) level = 3
      else if (rate >= 0.34) level = 2
      else level = 1
    }

    resultDays.push({
      date: dStr,
      dayOfWeek: dow,
      completed,
      total: totalDue,
      rate: Math.round(rate * 100),
      level
    })

    curr = curr.add(1, 'day')
  }

  return {
    success: true,
    startDate: startDateStr,
    endDate: endDateStr,
    totalDays: resultDays.length,
    days: resultDays
  }
})
