import { clearAuthCookie } from '~~/server/utils/auth'

export default defineEventHandler((event) => {
  clearAuthCookie(event)
  return { success: true, message: '已安全退出' }
})
