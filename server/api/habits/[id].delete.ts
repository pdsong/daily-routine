import { getDb } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler((event) => {
  const user = requireAuth(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少事项ID'
    })
  }

  const db = getDb()
  const result = db.prepare('DELETE FROM habits WHERE id = ? AND user_id = ?').run(id, user.id)

  if (result.changes === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: '事项不存在或已删除'
    })
  }

  return {
    success: true,
    message: '事项已删除'
  }
})
