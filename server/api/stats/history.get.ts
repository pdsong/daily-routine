import { getDb } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler((event) => {
  const user = requireAuth(event)
  const query = getQuery(event)
  const habitId = query.habit_id ? Number(query.habit_id) : null
  const category = query.category ? String(query.category) : null
  const limit = Math.min(Number(query.limit) || 50, 100)
  const offset = Math.max(Number(query.offset) || 0, 0)

  const db = getDb()

  let sql = `
    SELECT 
      hl.id as log_id,
      hl.date,
      hl.status,
      hl.duration_minutes,
      hl.pages_read,
      hl.book_title,
      hl.notes,
      hl.completed_at,
      h.id as habit_id,
      h.title as habit_title,
      h.icon as habit_icon,
      h.color as habit_color,
      h.category as habit_category,
      h.type as habit_type,
      h.start_time,
      h.end_time,
      h.target_time
    FROM habit_logs hl
    JOIN habits h ON hl.habit_id = h.id
    WHERE hl.user_id = ?
  `
  const params: any[] = [user.id]

  if (habitId) {
    sql += ' AND h.id = ?'
    params.push(habitId)
  }

  if (category) {
    sql += ' AND h.category = ?'
    params.push(category)
  }

  sql += ' ORDER BY hl.date DESC, hl.completed_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)

  const list = db.prepare(sql).all(...params)

  // Also get list of active habits for filter options
  const habits = db.prepare('SELECT id, title, icon, color, category, type FROM habits WHERE user_id = ? ORDER BY sort_order ASC').all(user.id)

  return {
    success: true,
    list,
    habits
  }
})
