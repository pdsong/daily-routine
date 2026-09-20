export default defineNuxtRouteMiddleware(async (to) => {
  const { user, fetchUser } = useAuth()

  // On first load or SSR, fetch user if not present
  if (!user.value) {
    await fetchUser()
  }

  if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  if (user.value && to.path === '/login') {
    return navigateTo('/')
  }
})
