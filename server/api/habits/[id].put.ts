import { getDb, type Habit } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少事项ID'
    })
  }

  const db = getDb()
  const existing = db.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?').get(id, user.id) as Habit | undefined
  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: '事项不存在或无权修改'
    })
  }

  const {
    title = existing.title,
    description = existing.description,
    icon = existing.icon,
    color = existing.color,
    category = existing.category,
    type = existing.type,
    start_time = existing.start_time,
    end_time = existing.end_time,
    target_time = existing.target_time,
    target_metric = existing.target_metric,
    target_value = existing.target_value,
    repeat_type = existing.repeat_type,
    repeat_days = existing.repeat_days,
    is_archived = existing.is_archived,
    sort_order = existing.sort_order
  } = body || {}

  const stmt = db.prepare(`
    UPDATE habits SET
      title = ?,
      description = ?,
      icon = ?,
      color = ?,
      category = ?,
      type = ?,
      start_time = ?,
      end_time = ?,
      target_time = ?,
      target_metric = ?,
      target_value = ?,
      repeat_type = ?,
      repeat_days = ?,
      is_archived = ?,
      sort_order = ?
    WHERE id = ? AND user_id = ?
  `)

  stmt.run(
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
    target_value !== undefined && target_value !== null ? Number(target_value) : null,
    repeat_type,
    repeat_days || '1,2,3,4,5,6,7',
    is_archived ? 1 : 0,
    sort_order ?? existing.sort_order,
    id,
    user.id
  )

  const updated = db.prepare('SELECT * FROM habits WHERE id = ?').get(id)

  return {
    success: true,
    habit: updated
  }
})
