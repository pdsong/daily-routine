<template>
  <div class="fixed bottom-4 left-0 right-0 z-40 max-w-md mx-auto px-4 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
    <nav class="pointer-events-auto bg-[#10141e]/85 backdrop-blur-2xl border border-white/[0.08] shadow-[0_12px_36px_-6px_rgba(0,0,0,0.7)] rounded-2xl p-1.5 transition-all">
      <div class="flex items-center justify-around h-14">
        
        <!-- Tab 1: Today -->
        <NuxtLink
          to="/"
          class="flex flex-col items-center justify-center flex-1 h-full rounded-xl transition-all duration-300 relative group active:scale-95"
          :class="isActive('/') ? 'text-emerald-400 bg-white/[0.04]' : 'text-slate-400 hover:text-slate-200'"
        >
          <div class="relative flex items-center justify-center">
            <IconRenderer
              name="CalendarCheck"
              :size="19"
              :class="isActive('/') ? 'scale-110 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition-transform' : 'transition-transform group-hover:scale-105'"
            />
            <span
              v-if="pendingCount > 0 && !isActive('/')"
              class="absolute -top-1 -right-2 bg-emerald-500 text-slate-950 font-bold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center tabular-num shadow-sm"
            >
              {{ pendingCount > 9 ? '9+' : pendingCount }}
            </span>
          </div>
          <span class="text-[10px] mt-1 font-medium tracking-tight">今日打卡</span>
          <span v-if="isActive('/')" class="absolute bottom-1 w-4 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
        </NuxtLink>

        <!-- Tab 2: History -->
        <NuxtLink
          to="/history"
          class="flex flex-col items-center justify-center flex-1 h-full rounded-xl transition-all duration-300 relative group active:scale-95"
          :class="isActive('/history') ? 'text-emerald-400 bg-white/[0.04]' : 'text-slate-400 hover:text-slate-200'"
        >
          <IconRenderer
            name="TrendingUp"
            :size="19"
            :class="isActive('/history') ? 'scale-110 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition-transform' : 'transition-transform group-hover:scale-105'"
          />
          <span class="text-[10px] mt-1 font-medium tracking-tight">历史轨迹</span>
          <span v-if="isActive('/history')" class="absolute bottom-1 w-4 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
        </NuxtLink>

        <!-- Tab 3: Manage -->
        <NuxtLink
          to="/manage"
          class="flex flex-col items-center justify-center flex-1 h-full rounded-xl transition-all duration-300 relative group active:scale-95"
          :class="isActive('/manage') ? 'text-emerald-400 bg-white/[0.04]' : 'text-slate-400 hover:text-slate-200'"
        >
          <IconRenderer
            name="SlidersHorizontal"
            :size="19"
            :class="isActive('/manage') ? 'scale-110 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)] transition-transform' : 'transition-transform group-hover:scale-105'"
          />
          <span class="text-[10px] mt-1 font-medium tracking-tight">习惯管理</span>
          <span v-if="isActive('/manage')" class="absolute bottom-1 w-4 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
        </NuxtLink>

      </div>
    </nav>
  </div>
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
