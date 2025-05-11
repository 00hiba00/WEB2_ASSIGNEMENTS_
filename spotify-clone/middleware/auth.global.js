export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  console.log(authStore.isAuthenticated);
  if (to.path !== '/login' && to.path !== '/callback' && !authStore.isAuthenticated) {
    console.log("sir 3llah");
    return navigateTo('/login'); 
  }
})
