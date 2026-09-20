<template>
  <div
    class="relative overflow-hidden rounded-2xl border transition-all duration-300 backdrop-blur-xl group"
    :class="[
      isCompleted
        ? 'border-emerald-500/30 bg-[#0c1417]/85 shadow-[0_8px_24px_-4px_rgba(16,185,129,0.15)]'
        : 'border-white/[0.07] bg-[#10141e]/80 hover:border-white/[0.14] hover:bg-[#131926]/90 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)]'
    ]"
  >
    <!-- Background Radial Soft Glow -->
    <div
      class="absolute -right-12 -top-12 w-36 h-36 rounded-full blur-2xl pointer-events-none transition-opacity duration-500"
      :class="isCompleted ? 'bg-emerald-500/10 opacity-100' : 'bg-white/[0.02] opacity-50 group-hover:opacity-100'"
    />

    <div class="p-3.5 sm:p-4">
      <div class="flex items-center justify-between gap-3">
        
        <!-- Left: Icon & Info -->
        <div class="flex items-center space-x-3.5 flex-1 min-w-0 cursor-pointer" @click="onCardClick">
          <!-- Icon Capsule -->
          <div
            class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
            :class="[
              isCompleted
                ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : getIconBg(habit.color)
            ]"
          >
            <IconRenderer :name="habit.icon" :size="20" />
          </div>

          <!-- Title & Meta -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2">
              <h4
                class="font-semibold text-sm tracking-tight truncate transition-all duration-200"
                :class="isCompleted ? 'text-slate-400 line-through decoration-emerald-500/40' : 'text-slate-100 group-hover:text-white'"
              >
                {{ habit.title }}
              </h4>
            </div>

            <!-- Task Type Badges -->
            <div class="flex flex-wrap items-center gap-1.5 mt-1">
              <!-- Time slot badge (e.g. 08:30 - 09:30) -->
              <span
                v-if="habit.type === 'time_slot' && habit.start_time"
                class="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] text-sky-300/90 border border-white/[0.06] tabular-num"
              >
                <IconRenderer name="Clock" :size="10" />
                {{ habit.start_time }}{{ habit.end_time ? ' - ' + habit.end_time : '' }}
              </span>

              <!-- Reminder window badge -->
              <span
                v-else-if="habit.type === 'reminder_window'"
                class="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] text-rose-300/90 border border-white/[0.06] tabular-num"
              >
                <IconRenderer name="Bell" :size="10" />
                <span>{{ habit.start_time ? habit.start_time + '起提醒' : '' }} {{ habit.target_time ? habit.target_time + '前' : '' }}</span>
              </span>

              <!-- Abstinence badge -->
              <span
                v-else-if="habit.type === 'abstinence'"
                class="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20"
              >
                <IconRenderer name="ShieldCheck" :size="10" />
                <span>自律防戒</span>
              </span>

              <!-- Reading / Quantified badge -->
              <span
                v-else-if="habit.type === 'quantified_log'"
                class="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20"
              >
                <IconRenderer name="BookOpen" :size="10" />
                <span>自由阅读打卡</span>
              </span>

              <!-- Category badge -->
              <span class="text-[9px] text-slate-400 bg-white/[0.03] border border-white/[0.05] px-1.5 py-0.5 rounded">
                {{ getCategoryLabel(habit.category) }}
              </span>
            </div>

            <!-- Reading Log specific display -->
            <div v-if="log && (log.book_title || log.pages_read > 0 || log.duration_minutes > 0)" class="mt-2 text-xs bg-black/30 border border-white/[0.06] rounded-xl p-2 text-slate-300 backdrop-blur-sm">
              <div v-if="log.book_title" class="font-medium text-amber-300 truncate text-[11px]">📖 《{{ log.book_title }}》</div>
              <div class="flex items-center gap-3 text-slate-400 mt-0.5 text-[10px] tabular-num">
                <span v-if="log.pages_read > 0">已读 <strong class="text-slate-200">{{ log.pages_read }}</strong> 页</span>
                <span v-if="log.duration_minutes > 0">耗时 <strong class="text-slate-200">{{ log.duration_minutes }}</strong> 分钟</span>
              </div>
              <div v-if="log.notes" class="text-slate-400 mt-1 italic text-[10px] line-clamp-1">"{{ log.notes }}"</div>
            </div>

            <!-- Description display -->
            <div v-else-if="habit.description" class="text-[11px] text-slate-400 mt-1 line-clamp-1">
              {{ habit.description }}
            </div>
          </div>
        </div>

        <!-- Right: Action Button -->
        <div class="flex items-center space-x-2 flex-shrink-0 self-center">
          
          <!-- Reading type special button -->
          <button
            v-if="habit.type === 'quantified_log'"
            type="button"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 active:scale-95"
            :class="[
              isCompleted
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold shadow-[0_2px_12px_rgba(245,158,11,0.3)]'
            ]"
            @click="$emit('open-reading', habit, log)"
          >
            <IconRenderer :name="isCompleted ? 'Check' : 'Plus'" :size="13" />
            <span>{{ isCompleted ? '修改记录' : '记阅读' }}</span>
          </button>

          <!-- Abstinence Type button -->
          <button
            v-else-if="habit.type === 'abstinence'"
            type="button"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1 active:scale-95"
            :class="[
              isCompleted
                ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30 shadow-[0_2px_10px_rgba(168,85,247,0.2)]'
                : 'bg-white/[0.04] text-purple-300 border border-white/[0.08] hover:bg-white/[0.08]'
            ]"
            @click="toggleCheck"
          >
            <IconRenderer :name="isCompleted ? 'ShieldCheck' : 'Shield'" :size="14" />
            <span>{{ isCompleted ? '已自律' : '坚持自律' }}</span>
          </button>

          <!-- Standard Check Button -->
          <button
            v-else
            type="button"
            class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-90"
            :class="[
              isCompleted
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-[0_0_16px_rgba(16,185,129,0.4)] ring-1 ring-white/20'
                : 'bg-white/[0.04] text-slate-400 hover:text-slate-100 border border-white/[0.08] hover:border-white/[0.18]'
            ]"
            @click="toggleCheck"
          >
            <IconRenderer :name="isCompleted ? 'Check' : 'Circle'" :size="18" :stroke-width="isCompleted ? 3 : 2" />
          </button>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import IconRenderer from './IconRenderer.vue'

const props = defineProps<{
  habit: any
  log?: any
  date: string
}>()

const emit = defineEmits<{
  (e: 'toggle', habitId: number, status: string): void
  (e: 'open-reading', habit: any, log: any): void
}>()

const isCompleted = computed(() => props.log?.status === 'completed')

const onCardClick = () => {
  if (props.habit.type === 'quantified_log') {
    emit('open-reading', props.habit, props.log)
  }
}

const toggleCheck = () => {
  const nextStatus = isCompleted.value ? 'pending' : 'completed'
  emit('toggle', props.habit.id, nextStatus)
}

const getColorAccent = (color: string) => {
  switch (color) {
    case 'sky': return 'bg-sky-500'
    case 'emerald': return 'bg-emerald-500'
    case 'rose': return 'bg-rose-500'
    case 'amber': return 'bg-amber-500'
    case 'purple': return 'bg-purple-500'
    case 'indigo': return 'bg-indigo-500'
    default: return 'bg-emerald-500'
  }
}

const getIconBg = (color: string) => {
  switch (color) {
    case 'sky': return 'bg-sky-400/10 text-sky-300 ring-1 ring-sky-400/20'
    case 'emerald': return 'bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20'
    case 'rose': return 'bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/20'
    case 'amber': return 'bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20'
    case 'purple': return 'bg-purple-400/10 text-purple-300 ring-1 ring-purple-400/20'
    case 'indigo': return 'bg-indigo-400/10 text-indigo-300 ring-1 ring-indigo-400/20'
    default: return 'bg-white/[0.05] text-slate-300 ring-1 ring-white/[0.08]'
  }
}

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'study': return '学习跟读'
    case 'fitness': return '运动锻炼'
    case 'health': return '健康用药'
    case 'self_discipline': return '自律戒断'
    case 'work': return '工作事务'
    case 'life': return '日常生活'
    default: return '常规习惯'
  }
}
</script>
