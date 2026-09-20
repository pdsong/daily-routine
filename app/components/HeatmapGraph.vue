<template>
  <div class="haute-glass rounded-3xl p-4 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.6)] relative overflow-hidden">
    
    <!-- Subtle ambient lighting -->
    <div class="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

    <!-- Top Switcher Bar -->
    <div class="flex items-center justify-between mb-3.5 pb-2.5 border-b border-white/[0.06]">
      
      <!-- Segmented View Tabs -->
      <div class="flex items-center bg-[#090b12] p-0.5 rounded-xl border border-white/[0.06]">
        <button
          type="button"
          class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
          :class="[
            currentView === 'heatmap'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          ]"
          @click="currentView = 'heatmap'"
        >
          <IconRenderer name="LayoutGrid" :size="13" />
          <span>打卡热力图</span>
        </button>

        <button
          type="button"
          class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
          :class="[
            currentView === 'timeline'
              ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          ]"
          @click="currentView = 'timeline'"
        >
          <IconRenderer name="Clock" :size="13" />
          <span>完成时间轴</span>
        </button>
      </div>

      <!-- Right Indicator / Legend -->
      <div v-if="currentView === 'heatmap'" class="flex items-center space-x-1.5 text-[10px] text-slate-400">
        <span class="text-slate-400">少</span>
        <div class="w-2.5 h-2.5 rounded-[3px] bg-white/[0.05] border border-white/[0.08]" title="0%" />
        <div class="w-2.5 h-2.5 rounded-[3px] bg-emerald-950/80 border border-emerald-800/40" title="1-33%" />
        <div class="w-2.5 h-2.5 rounded-[3px] bg-emerald-700/80 border border-emerald-600/50" title="34-66%" />
        <div class="w-2.5 h-2.5 rounded-[3px] bg-emerald-500 border border-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]" title="67-99%" />
        <!-- Golden Full Badge in legend -->
        <div class="w-3.5 h-3.5 rounded-[3px] bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.6)] flex items-center justify-center text-[8px] font-bold" title="100% 全部达成金徽章">
          ⭐
        </div>
        <span class="text-amber-400 font-medium">全满</span>
      </div>

      <div v-else class="text-[10px] text-amber-400/90 font-medium flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
        <IconRenderer name="Calendar" :size="11" />
        <span class="tabular-num">{{ selectedDate }}</span>
      </div>

    </div>

    <!-- VIEW 1: HEATMAP GRID -->
    <div v-if="currentView === 'heatmap'" class="transition-opacity duration-300">
      <div class="overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        <div class="inline-flex flex-col min-w-full">
          <!-- Week columns -->
          <div class="flex gap-1.5">
            <div
              v-for="(week, wIdx) in weekColumns"
              :key="wIdx"
              class="flex flex-col gap-1.5"
            >
              <div
                v-for="day in week"
                :key="day.date"
                class="w-4 h-4 rounded-[4px] transition-all duration-200 cursor-pointer relative group flex-shrink-0 flex items-center justify-center text-[8px]"
                :class="[
                  getCellClass(day.level),
                  selectedDate === day.date ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#080a0f] scale-110 z-10 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'hover:scale-125 hover:z-20'
                ]"
                @click="$emit('select-date', day.date)"
              >
                <!-- Golden Badge Icon for Level 4 (100% All Done) -->
                <span v-if="day.level === 4" class="select-none leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">⭐</span>

                <!-- Tooltip on hover -->
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                  <div class="bg-[#10141e] text-slate-100 text-[10px] py-1.5 px-2.5 rounded-xl shadow-2xl border border-white/[0.12] whitespace-nowrap text-center backdrop-blur-xl">
                    <div class="font-bold flex items-center justify-center gap-1" :class="day.level === 4 ? 'text-amber-300' : 'text-emerald-400'">
                      <span v-if="day.level === 4">👑</span>
                      <span class="tabular-num">{{ day.date }}</span>
                    </div>
                    <div class="text-slate-300 mt-0.5 tabular-num">
                      完成 {{ day.completed }} / {{ day.total }} ({{ day.rate }}%)
                    </div>
                    <div v-if="day.level === 4" class="text-amber-400 text-[9px] font-semibold mt-0.5">
                      ✨ 当日全满金徽章达成！
                    </div>
                  </div>
                  <div class="w-1.5 h-1.5 bg-[#10141e] border-r border-b border-white/[0.12] rotate-45 -mt-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Heatmap Footer -->
      <div class="flex items-center justify-between text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-white/[0.05]">
        <span class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
          近 16 周打卡历程 · 满勤点亮金徽章
        </span>
        <button
          v-if="selectedDate !== todayStr"
          class="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors flex items-center gap-1"
          @click="$emit('select-date', todayStr)"
        >
          <span>回到今天</span>
        </button>
      </div>
    </div>

    <!-- VIEW 2: COMPLETION TIMELINE STREAM -->
    <div v-else class="transition-opacity duration-300">
      
      <!-- If No Tasks -->
      <div v-if="!timelineTasks || timelineTasks.length === 0" class="py-7 text-center text-slate-500 text-xs">
        <IconRenderer name="CalendarX" :size="20" class="mx-auto mb-1.5 text-slate-600" />
        <span>{{ selectedDate }} 暂无事项记录</span>
      </div>

      <!-- Timeline Items -->
      <div v-else class="space-y-0 relative pl-2 pr-1 max-h-60 overflow-y-auto no-scrollbar pt-1 pb-1">
        
        <!-- Connecting Line -->
        <div class="absolute left-6 top-3 bottom-3 w-px bg-gradient-to-b from-amber-400/40 via-white/[0.08] to-transparent" />

        <div
          v-for="(item, idx) in sortedTimelineTasks"
          :key="item.habit.id"
          class="relative flex items-start space-x-3 py-2 group"
        >
          <!-- Timeline Node Point -->
          <div
            class="relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs transition-transform group-hover:scale-110"
            :class="[
              item.status === 'completed'
                ? 'bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)] ring-2 ring-[#080a0f]'
                : 'bg-[#10141e] border border-white/[0.12] text-slate-500 ring-2 ring-[#080a0f]'
            ]"
          >
            <IconRenderer v-if="item.status === 'completed'" name="Check" :size="12" :stroke-width="3" />
            <span v-else class="text-[9px] font-semibold tabular-num">{{ idx + 1 }}</span>
          </div>

          <!-- Timeline Content Card -->
          <div
            class="flex-1 min-w-0 p-2.5 rounded-xl border transition-all duration-200"
            :class="[
              item.status === 'completed'
                ? 'bg-[#141924]/90 border-amber-400/20 text-slate-200 shadow-sm'
                : 'bg-white/[0.02] border-white/[0.05] text-slate-400'
            ]"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center space-x-2 truncate">
                <IconRenderer :name="item.habit.icon" :size="14" :class="item.status === 'completed' ? 'text-amber-400' : 'text-slate-500'" />
                <span class="font-semibold text-xs tracking-tight truncate" :class="item.status === 'completed' ? 'text-slate-100' : 'text-slate-400'">
                  {{ item.habit.title }}
                </span>
              </div>

              <!-- Time Badge: Actual Completed Time or Scheduled Time -->
              <span
                class="text-[9px] px-2 py-0.5 rounded-md font-medium flex-shrink-0 whitespace-nowrap tabular-num"
                :class="[
                  item.status === 'completed'
                    ? 'bg-amber-400/10 text-amber-300 border border-amber-400/25'
                    : 'bg-white/[0.04] text-slate-400 border border-white/[0.05]'
                ]"
              >
                {{ formatTaskTime(item) }}
              </span>
            </div>

            <!-- Reading / Notes detail in timeline -->
            <div v-if="item.log && (item.log.book_title || item.log.pages_read > 0 || item.log.duration_minutes > 0)" class="text-[10px] text-amber-300/90 mt-1 flex items-center gap-2 flex-wrap tabular-num">
              <span v-if="item.log.book_title">📖 《{{ item.log.book_title }}》</span>
              <span v-if="item.log.pages_read > 0">读了 {{ item.log.pages_read }} 页</span>
              <span v-if="item.log.duration_minutes > 0">耗时 {{ item.log.duration_minutes }} 分钟</span>
            </div>

            <div v-else-if="item.log?.notes" class="text-[10px] text-slate-400 mt-1 italic line-clamp-1">
              "{{ item.log.notes }}"
            </div>
          </div>
        </div>

      </div>

      <!-- Timeline Footer Summary -->
      <div class="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-white/[0.05]">
        <span>按实际打卡时间流式呈现</span>
        <span class="text-amber-400 font-semibold tabular-num">
          已达成 {{ completedTimelineCount }} / {{ timelineTasks.length }}
        </span>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import IconRenderer from './IconRenderer.vue'

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
    timelineTasks?: Array<{ habit: any; log: any; status: string }>
  }>(),
  {
    days: () => [],
    selectedDate: '',
    timelineTasks: () => []
  }
)

defineEmits<{
  (e: 'select-date', date: string): void
}>()

const currentView = ref<'heatmap' | 'timeline'>('heatmap')
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
      return 'bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.18]'
    case 1:
      return 'bg-emerald-950/80 border border-emerald-800/40 hover:bg-emerald-900/80'
    case 2:
      return 'bg-emerald-700/80 border border-emerald-600/50 hover:bg-emerald-600'
    case 3:
      return 'bg-emerald-500 border border-emerald-400/80 shadow-[0_0_8px_rgba(16,185,129,0.4)] hover:bg-emerald-400'
    case 4:
      // Golden Badge for 100% completed
      return 'bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 border border-yellow-200 shadow-[0_0_10px_rgba(245,158,11,0.6)] hover:scale-125'
    default:
      return 'bg-white/[0.04]'
  }
}

// Sorted timeline tasks: completed tasks first by completed_at time, then pending by start_time
const sortedTimelineTasks = computed(() => {
  if (!props.timelineTasks) return []
  const list = [...props.timelineTasks]
  
  return list.sort((a, b) => {
    // If both completed, sort by completed_at
    if (a.status === 'completed' && b.status === 'completed') {
      const timeA = a.log?.completed_at || ''
      const timeB = b.log?.completed_at || ''
      return timeA.localeCompare(timeB)
    }
    // Completed items come first
    if (a.status === 'completed') return -1
    if (b.status === 'completed') return 1

    // Otherwise sort by routine start_time
    const startA = a.habit.start_time || '99:99'
    const startB = b.habit.start_time || '99:99'
    return startA.localeCompare(startB)
  })
})

const completedTimelineCount = computed(() => {
  return (props.timelineTasks || []).filter(t => t.status === 'completed').length
})

const formatTaskTime = (item: any) => {
  if (item.status === 'completed' && item.log?.completed_at) {
    const d = dayjs(item.log.completed_at)
    if (d.isValid()) {
      return `${d.format('HH:mm')} 打卡完成`
    }
    return '已完成'
  }

  if (item.habit.type === 'time_slot' && item.habit.start_time) {
    return `${item.habit.start_time} - ${item.habit.end_time || ''} 待办`
  }

  if (item.habit.type === 'reminder_window' && item.habit.target_time) {
    return `${item.habit.target_time} 前提醒`
  }

  return '今日待办'
}
</script>
