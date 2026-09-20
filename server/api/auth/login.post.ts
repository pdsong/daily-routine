import { getDb, type User } from '~~/server/utils/db'
import { comparePassword, generateToken, setAuthCookie } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body || {}

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: '请输入用户名和密码'
    })
  }

  const db = getDb()
  const user = db.prepare('SELECT id, username, password_hash FROM users WHERE username = ?').get(username.trim()) as User | undefined

  if (!user || !comparePassword(password, user.password_hash)) {
    throw createError({
      statusCode: 401,
      statusMessage: '用户名或密码错误'
    })
  }

  const token = generateToken({ id: user.id, username: user.username })
  setAuthCookie(event, token)

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username
    },
    token
  }
})
