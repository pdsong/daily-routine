import { getDb, type Habit } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek.js'

dayjs.extend(isoWeek)

export default defineEventHandler((event) => {
  const user = requireAuth(event)
  const db = getDb()

  const todayStr = dayjs().format('YYYY-MM-DD')
  const startOfMonthStr = dayjs().startOf('month').format('YYYY-MM-DD')

  // Total active habits
  const habits = db.prepare('SELECT * FROM habits WHERE user_id = ? AND is_archived = 0').all(user.id) as Habit[]

  // Total completions all time
  const totalCompletedRow = db.prepare(`
    SELECT COUNT(*) as count, SUM(duration_minutes) as total_minutes, SUM(pages_read) as total_pages 
    FROM habit_logs 
    WHERE user_id = ? AND status = 'completed'
  `).get(user.id) as { count: number; total_minutes: number | null; total_pages: number | null }

  // Reading specific stats
  const readingStats = db.prepare(`
    SELECT 
      COUNT(DISTINCT book_title) as book_count,
      SUM(pages_read) as total_pages,
      SUM(duration_minutes) as total_minutes,
      COUNT(*) as session_count
    FROM habit_logs
    WHERE user_id = ? AND status = 'completed' AND (pages_read > 0 OR book_title IS NOT NULL)
  `).get(user.id) as { book_count: number; total_pages: number | null; total_minutes: number | null; session_count: number }

  // Running specific stats
  const runningStats = db.prepare(`
    SELECT 
      SUM(hl.duration_minutes) as total_minutes,
      COUNT(*) as run_count
    FROM habit_logs hl
    JOIN habits h ON hl.habit_id = h.id
    WHERE hl.user_id = ? AND hl.status = 'completed' AND (h.title LIKE '%跑%' OR h.category = 'fitness')
  `).get(user.id) as { total_minutes: number | null; run_count: number }

  // Calculate current streak
  // Look back consecutive days where at least 1 habit was completed
  const recentLogs = db.prepare(`
    SELECT DISTINCT date FROM habit_logs 
    WHERE user_id = ? AND status = 'completed' 
    ORDER BY date DESC
  `).all(user.id) as { date: string }[]

  const activeDates = new Set(recentLogs.map(r => r.date))

  let streak = 0
  let checkDate = dayjs()

  // If today is not completed yet, check from yesterday
  if (!activeDates.has(checkDate.format('YYYY-MM-DD'))) {
    checkDate = checkDate.subtract(1, 'day')
  }

  while (activeDates.has(checkDate.format('YYYY-MM-DD'))) {
    streak++
    checkDate = checkDate.subtract(1, 'day')
  }

  // Monthly stats
  const monthlyLogs = db.prepare(`
    SELECT COUNT(*) as count FROM habit_logs
    WHERE user_id = ? AND date >= ? AND date <= ? AND status = 'completed'
  `).get(user.id, startOfMonthStr, todayStr) as { count: number }

  // Habit breakdown
  const habitBreakdown = db.prepare(`
    SELECT 
      h.id, h.title, h.icon, h.color, h.category, h.type,
      COUNT(hl.id) as complete_count,
      MAX(hl.date) as last_completed_date
    FROM habits h
    LEFT JOIN habit_logs hl ON h.id = hl.habit_id AND hl.status = 'completed'
    WHERE h.user_id = ? AND h.is_archived = 0
    GROUP BY h.id
    ORDER BY complete_count DESC
  `).all(user.id)

  return {
    success: true,
    streak,
    totalCompletions: totalCompletedRow.count || 0,
    totalMinutes: totalCompletedRow.total_minutes || 0,
    totalHabits: habits.length,
    monthlyCompletions: monthlyLogs.count || 0,
    reading: {
      bookCount: readingStats.book_count || 0,
      totalPages: readingStats.total_pages || 0,
      totalMinutes: readingStats.total_minutes || 0,
      sessionCount: readingStats.session_count || 0
    },
    running: {
      totalMinutes: runningStats.total_minutes || 0,
      runCount: runningStats.run_count || 0
    },
    habitBreakdown
  }
})
