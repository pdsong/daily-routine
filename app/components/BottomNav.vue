<template>
  <nav class="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800/80 max-w-md mx-auto transition-all pb-[env(safe-area-inset-bottom,0px)]">
    <div class="flex items-center justify-around h-16 px-4">
      <NuxtLink
        to="/"
        class="flex flex-col items-center justify-center flex-1 h-full transition-colors group relative"
        :class="isActive('/') ? 'text-emerald-400 font-medium' : 'text-slate-400 hover:text-slate-200'"
      >
        <div class="relative flex items-center justify-center">
          <IconRenderer name="CalendarCheck" :size="22" :class="isActive('/') ? 'scale-110 transition-transform duration-200' : ''" />
          <span v-if="pendingCount > 0 && !isActive('/')" class="absolute -top-1 -right-2 bg-emerald-500 text-slate-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
            {{ pendingCount > 9 ? '9+' : pendingCount }}
          </span>
        </div>
        <span class="text-[11px] mt-1 tracking-tight">今日事项</span>
        <span v-if="isActive('/')" class="absolute bottom-1 w-6 h-0.5 bg-emerald-400 rounded-full" />
      </NuxtLink>

      <NuxtLink
        to="/history"
        class="flex flex-col items-center justify-center flex-1 h-full transition-colors group relative"
        :class="isActive('/history') ? 'text-emerald-400 font-medium' : 'text-slate-400 hover:text-slate-200'"
      >
        <IconRenderer name="TrendingUp" :size="22" :class="isActive('/history') ? 'scale-110 transition-transform duration-200' : ''" />
        <span class="text-[11px] mt-1 tracking-tight">历史完成</span>
        <span v-if="isActive('/history')" class="absolute bottom-1 w-6 h-0.5 bg-emerald-400 rounded-full" />
      </NuxtLink>

      <NuxtLink
        to="/manage"
        class="flex flex-col items-center justify-center flex-1 h-full transition-colors group relative"
        :class="isActive('/manage') ? 'text-emerald-400 font-medium' : 'text-slate-400 hover:text-slate-200'"
      >
        <IconRenderer name="SlidersHorizontal" :size="22" :class="isActive('/manage') ? 'scale-110 transition-transform duration-200' : ''" />
        <span class="text-[11px] mt-1 tracking-tight">事项管理</span>
        <span v-if="isActive('/manage')" class="absolute bottom-1 w-6 h-0.5 bg-emerald-400 rounded-full" />
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import IconRenderer from './IconRenderer.vue'

defineProps<{
  pendingCount?: number
}>()

const route = useRoute()

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>
