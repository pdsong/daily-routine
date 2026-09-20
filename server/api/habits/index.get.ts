import { getDb, type Habit } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler((event) => {
  const user = requireAuth(event)
  const db = getDb()

  const query = getQuery(event)
  const includeArchived = query.archived === 'true'

  let sql = 'SELECT * FROM habits WHERE user_id = ?'
  if (!includeArchived) {
    sql += ' AND is_archived = 0'
  }
  sql += ' ORDER BY sort_order ASC, id ASC'

  const habits = db.prepare(sql).all(user.id) as Habit[]

  return {
    success: true,
    habits
  }
})
