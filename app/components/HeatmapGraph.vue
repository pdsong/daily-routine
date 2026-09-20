<template>
  <div class="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4 shadow-xl backdrop-blur-md transition-all">
    
    <!-- Top Switcher Bar -->
    <div class="flex items-center justify-between mb-3.5 pb-2 border-b border-slate-800/70">
      
      <!-- Segmented View Tabs -->
      <div class="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800/80">
        <button
          type="button"
          class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          :class="[
            currentView === 'heatmap'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          ]"
          @click="currentView = 'heatmap'"
        >
          <IconRenderer name="LayoutGrid" :size="13" />
          <span>打卡热力图</span>
        </button>

        <button
          type="button"
          class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          :class="[
            currentView === 'timeline'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          ]"
          @click="currentView = 'timeline'"
        >
          <IconRenderer name="Clock" :size="13" />
          <span>完成时间轴</span>
        </button>
      </div>

      <!-- Right Indicator / Legend -->
      <div v-if="currentView === 'heatmap'" class="flex items-center space-x-1 text-[11px] text-slate-400">
        <span>少</span>
        <div class="w-2.5 h-2.5 rounded-[3px] bg-slate-800" title="0%" />
        <div class="w-2.5 h-2.5 rounded-[3px] bg-emerald-900/90" title="1-33%" />
        <div class="w-2.5 h-2.5 rounded-[3px] bg-emerald-700" title="34-66%" />
        <div class="w-2.5 h-2.5 rounded-[3px] bg-emerald-500" title="67-99%" />
        <!-- Golden Full Badge in legend -->
        <div class="w-3 h-3 rounded-[3px] bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 border border-yellow-200 shadow-sm shadow-amber-400/60 flex items-center justify-center text-[7px]" title="100% 全部达成金徽章">
          👑
        </div>
        <span>全满</span>
      </div>

      <div v-else class="text-[11px] text-amber-400 font-medium flex items-center gap-1">
        <IconRenderer name="Calendar" :size="12" />
        <span>{{ selectedDate }} 打卡轨迹</span>
      </div>

    </div>

    <!-- VIEW 1: HEATMAP GRID -->
    <div v-if="currentView === 'heatmap'" class="animate-in fade-in duration-200">
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
                  selectedDate === day.date ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900 scale-110 z-10' : 'hover:scale-125 hover:z-20'
                ]"
                @click="$emit('select-date', day.date)"
              >
                <!-- Golden Badge Icon for Level 4 (100% All Done) -->
                <span v-if="day.level === 4" class="select-none leading-none drop-shadow-sm">⭐</span>

                <!-- Tooltip on hover -->
                <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                  <div class="bg-slate-950 text-slate-100 text-[10px] py-1.5 px-2.5 rounded-xl shadow-2xl border border-slate-700 whitespace-nowrap text-center">
                    <div class="font-bold flex items-center justify-center gap-1" :class="day.level === 4 ? 'text-amber-300' : 'text-emerald-400'">
                      <span v-if="day.level === 4">👑</span>
                      <span>{{ day.date }}</span>
                    </div>
                    <div class="text-slate-300 mt-0.5">
                      完成 {{ day.completed }} / {{ day.total }} ({{ day.rate }}%)
                    </div>
                    <div v-if="day.level === 4" class="text-amber-400 text-[9px] font-semibold mt-0.5">
                      ✨ 当日全满金徽章达成！
                    </div>
                  </div>
                  <div class="w-1.5 h-1.5 bg-slate-950 border-r border-b border-slate-700 rotate-45 -mt-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Heatmap Footer -->
      <div class="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-800/60">
        <span class="flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          近 16 周打卡记录 (全满点亮金色徽章)
        </span>
        <button
          v-if="selectedDate !== todayStr"
          class="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          @click="$emit('select-date', todayStr)"
        >
          返回今天
        </button>
      </div>
    </div>

    <!-- VIEW 2: COMPLETION TIMELINE STREAM -->
    <div v-else class="animate-in fade-in duration-200">
      
      <!-- If No Tasks -->
      <div v-if="!timelineTasks || timelineTasks.length === 0" class="py-6 text-center text-slate-500 text-xs">
        <IconRenderer name="CalendarX" :size="20" class="mx-auto mb-1 text-slate-600" />
        <span>{{ selectedDate }} 暂无事项记录</span>
      </div>

      <!-- Timeline Items -->
      <div v-else class="space-y-0 relative pl-2 pr-1 max-h-56 overflow-y-auto no-scrollbar pt-1 pb-1">
        
        <!-- Connecting Line -->
        <div class="absolute left-6 top-3 bottom-3 w-0.5 bg-slate-800" />

        <div
          v-for="(item, idx) in sortedTimelineTasks"
          :key="item.habit.id"
          class="relative flex items-start space-x-3 py-2 group"
        >
          <!-- Timeline Node Point -->
          <div
            class="relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs transition-transform group-hover:scale-110"
            :class="[
              item.status === 'completed'
                ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md shadow-amber-500/30'
                : 'bg-slate-900 border-2 border-slate-700 text-slate-500'
            ]"
          >
            <IconRenderer v-if="item.status === 'completed'" name="Check" :size="14" />
            <span v-else class="text-[10px] font-bold">{{ idx + 1 }}</span>
          </div>

          <!-- Timeline Content Card -->
          <div
            class="flex-1 min-w-0 p-2.5 rounded-xl border transition-all"
            :class="[
              item.status === 'completed'
                ? 'bg-slate-950/80 border-amber-500/30 text-slate-200'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
            ]"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center space-x-2 truncate">
                <IconRenderer :name="item.habit.icon" :size="14" :class="item.status === 'completed' ? 'text-amber-400' : 'text-slate-500'" />
                <span class="font-semibold text-xs truncate" :class="item.status === 'completed' ? 'text-slate-100' : 'text-slate-400'">
                  {{ item.habit.title }}
                </span>
              </div>

              <!-- Time Badge: Actual Completed Time or Scheduled Time -->
              <span
                class="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 whitespace-nowrap"
                :class="[
                  item.status === 'completed'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-400'
                ]"
              >
                {{ formatTaskTime(item) }}
              </span>
            </div>

            <!-- Reading / Notes detail in timeline -->
            <div v-if="item.log && (item.log.book_title || item.log.pages_read > 0 || item.log.duration_minutes > 0)" class="text-[11px] text-amber-300/90 mt-1 flex items-center gap-2 flex-wrap">
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
      <div class="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/60">
        <span>按实际打卡时间记录排序</span>
        <span class="text-amber-400 font-semibold">
          已完成 {{ completedTimelineCount }} / {{ timelineTasks.length }}
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
      return 'bg-slate-800/90 border border-slate-700/40 hover:border-slate-500'
    case 1:
      return 'bg-emerald-950 border border-emerald-800/60 hover:bg-emerald-900'
    case 2:
      return 'bg-emerald-700/90 border border-emerald-600/60 hover:bg-emerald-600'
    case 3:
      return 'bg-emerald-500 border border-emerald-400/80 shadow-sm shadow-emerald-500/30 hover:bg-emerald-400'
    case 4:
      // Golden Badge for 100% completed
      return 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 border border-yellow-200 shadow-md shadow-amber-400/50 hover:scale-125'
    default:
      return 'bg-slate-800'
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
