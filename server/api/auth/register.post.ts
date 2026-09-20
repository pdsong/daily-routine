import { getDb, seedDefaultHabits } from '~~/server/utils/db'
import { hashPassword, generateToken, setAuthCookie } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body || {}

  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: '请输入有效的用户名和密码'
    })
  }

  const trimmedUser = username.trim()
  if (trimmedUser.length < 2 || trimmedUser.length > 20) {
    throw createError({
      statusCode: 400,
      statusMessage: '用户名长度需在 2 到 20 个字符之间'
    })
  }

  if (password.length < 4) {
    throw createError({
      statusCode: 400,
      statusMessage: '密码长度至少为 4 个字符'
    })
  }

  const db = getDb()
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(trimmedUser)
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: '该用户名已被注册，请直接登录'
    })
  }

  const passwordHash = hashPassword(password)
  const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(trimmedUser, passwordHash)
  const userId = Number(result.lastInsertRowid)

  // Seed default habits for user
  seedDefaultHabits(userId)

  const token = generateToken({ id: userId, username: trimmedUser })
  setAuthCookie(event, token)

  return {
    success: true,
    user: {
      id: userId,
      username: trimmedUser
    },
    token
  }
})
