export interface AuthUser {
  id: number
  username: string
  created_at?: string
}

export const useAuth = () => {
  const user = useState<AuthUser | null>('auth_user', () => null)
  const loading = useState<boolean>('auth_loading', () => true)

  const fetchUser = async () => {
    try {
      loading.value = true
      const data = await $fetch<{ user: AuthUser | null }>('/api/auth/me')
      user.value = data.user
      return data.user
    } catch {
      user.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  const login = async (username: string, password: string) => {
    const res = await $fetch<{ success: boolean; user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: { username, password }
    })
    user.value = res.user
    return res
  }

  const register = async (username: string, password: string) => {
    const res = await $fetch<{ success: boolean; user: AuthUser }>('/api/auth/register', {
      method: 'POST',
      body: { username, password }
    })
    user.value = res.user
    return res
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    navigateTo('/login')
  }

  return {
    user,
    loading,
    fetchUser,
    login,
    register,
    logout
  }
}
