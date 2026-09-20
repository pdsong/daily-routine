import { getDb } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)

  const {
    title,
    description,
    icon = 'Calendar',
    color = 'emerald',
    category = 'other',
    type = 'check_only',
    start_time = null,
    end_time = null,
    target_time = null,
    target_metric = null,
    target_value = null,
    repeat_type = 'daily',
    repeat_days = '1,2,3,4,5,6,7'
  } = body || {}

  if (!title || typeof title !== 'string' || !title.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: '事项名称不能为空'
    })
  }

  const db = getDb()

  // Get max sort_order
  const maxOrderRow = db.prepare('SELECT MAX(sort_order) as max_order FROM habits WHERE user_id = ?').get(user.id) as { max_order: number | null }
  const nextOrder = (maxOrderRow?.max_order ?? 0) + 1

  const stmt = db.prepare(`
    INSERT INTO habits (
      user_id, title, description, icon, color, category, type,
      start_time, end_time, target_time, target_metric, target_value,
      repeat_type, repeat_days, sort_order
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?
    )
  `)

  const result = stmt.run(
    user.id,
    title.trim(),
    description ? description.trim() : null,
    icon,
    color,
    category,
    type,
    start_time || null,
    end_time || null,
    target_time || null,
    target_metric || null,
    target_value ? Number(target_value) : null,
    repeat_type,
    repeat_days || '1,2,3,4,5,6,7',
    nextOrder
  )

  const newHabit = db.prepare('SELECT * FROM habits WHERE id = ?').get(result.lastInsertRowid)

  return {
    success: true,
    habit: newHabit
  }
})
