// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  app: {
    baseURL: "/cell-simulation-js",
  },
  modules: ['@nuxtjs/tailwindcss', 'nuxt-icon'],
})
