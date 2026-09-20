<template>
  <div class="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-slate-950 text-slate-100 relative overflow-hidden">
    <!-- Ambient glowing backgrounds -->
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

    <div class="w-full max-w-sm relative z-10">
      
      <!-- Logo & App Header -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/20 mx-auto mb-4 flex items-center justify-center">
          <div class="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
            <IconRenderer name="CalendarCheck" :size="32" class="text-emerald-400" />
          </div>
        </div>
        <h1 class="text-2xl font-extrabold tracking-tight text-slate-100">
          Daily Routine
        </h1>
        <p class="text-xs text-slate-400 mt-1">
          日历习惯与重复事项管理 · 专注自律生活
        </p>
      </div>

      <!-- Card Container -->
      <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        <!-- Tab Switcher -->
        <div class="flex rounded-xl bg-slate-950 p-1 mb-6 border border-slate-800/80">
          <button
            type="button"
            class="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
            :class="isLoginMode ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'"
            @click="isLoginMode = true; errorMessage = ''"
          >
            账号登录
          </button>
          <button
            type="button"
            class="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
            :class="!isLoginMode ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'"
            @click="isLoginMode = false; errorMessage = ''"
          >
            新用户注册
          </button>
        </div>

        <!-- Form -->
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">用户名</label>
            <div class="relative">
              <input
                v-model="username"
                type="text"
                required
                autocomplete="username"
                placeholder="请输入用户名"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all pl-10"
              />
              <div class="absolute left-3.5 top-3 text-slate-500">
                <IconRenderer name="User" :size="16" />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">密码</label>
            <div class="relative">
              <input
                v-model="password"
                type="password"
                required
                autocomplete="current-password"
                placeholder="请输入密码 (至少4位)"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all pl-10"
              />
              <div class="absolute left-3.5 top-3 text-slate-500">
                <IconRenderer name="Lock" :size="16" />
              </div>
            </div>
          </div>

          <!-- Error Alert -->
          <div v-if="errorMessage" class="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center space-x-2">
            <IconRenderer name="AlertCircle" :size="15" class="flex-shrink-0" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/25 transition-all duration-200 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <span v-if="loading" class="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            <span>{{ isLoginMode ? '登 录' : '立即注册并预置默认任务' }}</span>
          </button>
        </form>

        <!-- Feature hints for new users -->
        <div class="mt-6 pt-4 border-t border-slate-800/80 text-center text-slate-400 text-xs">
          <p v-if="!isLoginMode" class="text-[11px] text-emerald-400/90">
            ✨ 注册后将自动预置：英语跟读、晨跑、服药提醒、阅读等专属任务
          </p>
          <p v-else class="text-[11px]">
            轻量 SQLite 本地存储 · 安全私密
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import IconRenderer from '~/components/IconRenderer.vue'

definePageMeta({
  layout: false
})

const { login, register } = useAuth()

const isLoginMode = ref(true)
const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const handleSubmit = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    if (isLoginMode.value) {
      await login(username.value, password.value)
    } else {
      await register(username.value, password.value)
    }
    navigateTo('/')
  } catch (err: any) {
    errorMessage.value = err.data?.statusMessage || err.message || '操作失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>
