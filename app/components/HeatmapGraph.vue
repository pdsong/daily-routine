<template>
  <div class="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <h3 class="text-sm font-semibold text-slate-200">打卡热力图 (GitHub 风格)</h3>
      </div>
      <div class="flex items-center space-x-1 text-[11px] text-slate-400">
        <span>少</span>
        <div class="w-2.5 h-2.5 rounded-[3px] bg-slate-800" />
        <div class="w-2.5 h-2.5 rounded-[3px] bg-emerald-900/90" />
        <div class="w-2.5 h-2.5 rounded-[3px] bg-emerald-700" />
        <div class="w-2.5 h-2.5 rounded-[3px] bg-emerald-500" />
        <div class="w-2.5 h-2.5 rounded-[3px] bg-emerald-400 shadow-sm shadow-emerald-500/50" />
        <span>满</span>
      </div>
    </div>

    <!-- Heatmap Grid Container -->
    <div class="overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
      <div class="inline-flex flex-col min-w-full">
        <!-- Week columns -->
        <div class="flex gap-1">
          <div
            v-for="(week, wIdx) in weekColumns"
            :key="wIdx"
            class="flex flex-col gap-1"
          >
            <div
              v-for="day in week"
              :key="day.date"
              class="w-3.5 h-3.5 rounded-[3px] transition-all duration-200 cursor-pointer relative group flex-shrink-0"
              :class="[
                getCellClass(day.level),
                selectedDate === day.date ? 'ring-2 ring-emerald-300 ring-offset-1 ring-offset-slate-900 scale-110 z-10' : 'hover:scale-125 hover:z-20'
              ]"
              @click="$emit('select-date', day.date)"
            >
              <!-- Tooltip on hover -->
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                <div class="bg-slate-950 text-slate-100 text-[10px] py-1 px-2 rounded-md shadow-2xl border border-slate-700 whitespace-nowrap text-center">
                  <div class="font-medium text-emerald-400">{{ day.date }}</div>
                  <div class="text-slate-300">完成 {{ day.completed }} / {{ day.total }} ({{ day.rate }}%)</div>
                </div>
                <div class="w-1.5 h-1.5 bg-slate-950 border-r border-b border-slate-700 rotate-45 -mt-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Info bar -->
    <div class="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-800/60">
      <span>近 16 周活跃打卡记录</span>
      <button
        v-if="selectedDate"
        class="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        @click="$emit('select-date', todayStr)"
      >
        回到今天 ({{ todayStr }})
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'

export interface HeatmapDay {
  date: string
  dayOfWeek: number
  completed: number
  total: number
  rate: number
  level: number
}

const props = withDefaults(
  defineProps<{
    days: HeatmapDay[]
    selectedDate?: string
  }>(),
  {
    days: () => [],
    selectedDate: ''
  }
)

defineEmits<{
  (e: 'select-date', date: string): void
}>()

const todayStr = dayjs().format('YYYY-MM-DD')

// Group days into 7-day week columns (Mon=1 ... Sun=7)
const weekColumns = computed(() => {
  if (!props.days || props.days.length === 0) return []

  const weeks: HeatmapDay[][] = []
  let currentWeek: HeatmapDay[] = []

  // Prepend dummy days if start day is not Monday (1)
  const firstDay = props.days[0]
  if (firstDay && firstDay.dayOfWeek > 1) {
    for (let i = 1; i < firstDay.dayOfWeek; i++) {
      currentWeek.push({
        date: `pad-${i}`,
        dayOfWeek: i,
        completed: 0,
        total: 0,
        rate: 0,
        level: -1 // Hidden padding
      })
    }
  }

  for (const day of props.days) {
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  return weeks
})

const getCellClass = (level: number) => {
  if (level === -1) return 'opacity-0 pointer-events-none'
  switch (level) {
    case 0:
      return 'bg-slate-800/90 border border-slate-700/40 hover:border-slate-500'
    case 1:
      return 'bg-emerald-950 border border-emerald-800/60 hover:bg-emerald-900'
    case 2:
      return 'bg-emerald-700/90 border border-emerald-600/60 hover:bg-emerald-600'
    case 3:
      return 'bg-emerald-500 border border-emerald-400/80 shadow-sm shadow-emerald-500/30 hover:bg-emerald-400'
    case 4:
      return 'bg-emerald-400 border border-emerald-300 shadow-md shadow-emerald-400/40 hover:bg-emerald-300'
    default:
      return 'bg-slate-800'
  }
}
</script>
