import { getAuthUser } from '~~/server/utils/auth'

export default defineEventHandler((event) => {
  const user = getAuthUser(event)
  if (!user) {
    return { user: null }
  }

  return {
    user: {
      id: user.id,
      username: user.username,
      created_at: user.created_at
    }
  }
})
