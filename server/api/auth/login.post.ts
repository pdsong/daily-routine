import { getDb, type User } from '~~/server/utils/db'
import { comparePassword, generateToken, setAuthCookie } from '~~/server/utils/auth'
import { checkLoginIpBlocked, recordLoginFailure, recordLoginSuccess } from '~~/server/utils/rateLimit'

export default defineEventHandler(async (event) => {
  // 1. 检查当前 IP 是否处于 404 封禁惩罚期
  checkLoginIpBlocked(event)

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
    // 2. 输错账号或密码：记录该 IP 错误次数并在超限（>=10次）时触发指数 404 封禁
    recordLoginFailure(event)

    throw createError({
      statusCode: 401,
      statusMessage: '用户名或密码错误'
    })
  }

  // 3. 登录成功：立即中断并清空该 IP 的全部错误惩罚记录
  recordLoginSuccess(event)

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
