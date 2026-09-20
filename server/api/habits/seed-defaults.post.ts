import { seedDefaultHabits, getDb, type Habit } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler((event) => {
  const user = requireAuth(event)
  const db = getDb()

  // Seed default habits
  seedDefaultHabits(user.id)

  const habits = db.prepare('SELECT * FROM habits WHERE user_id = ? AND is_archived = 0 ORDER BY sort_order ASC, id ASC').all(user.id) as Habit[]

  return {
    success: true,
    message: '默认事项已成功添加',
    habits
  }
})
