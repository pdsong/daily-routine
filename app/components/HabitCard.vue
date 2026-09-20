<template>
  <div
    class="relative overflow-hidden rounded-2xl border transition-all duration-200 bg-slate-900/90 shadow-md backdrop-blur-sm"
    :class="[
      isCompleted
        ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 to-slate-900/90 shadow-emerald-950/20'
        : 'border-slate-800 hover:border-slate-700/80 hover:bg-slate-900'
    ]"
  >
    <!-- Left Accent Strip -->
    <div
      class="absolute top-0 bottom-0 left-0 w-1.5 transition-colors"
      :class="isCompleted ? 'bg-emerald-400' : getColorAccent(habit.color)"
    />

    <div class="p-4 pl-5">
      <div class="flex items-start justify-between gap-3">
        
        <!-- Left: Icon & Info -->
        <div class="flex items-start space-x-3 flex-1 min-w-0" @click="onCardClick">
          <!-- Icon -->
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-95"
            :class="[
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-400'
                : getIconBg(habit.color)
            ]"
          >
            <IconRenderer :name="habit.icon" :size="22" />
          </div>

          <!-- Title & Meta -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2">
              <h4
                class="font-semibold text-sm sm:text-base truncate transition-colors"
                :class="isCompleted ? 'text-slate-300 line-through decoration-slate-500/80' : 'text-slate-100'"
              >
                {{ habit.title }}
              </h4>
            </div>

            <!-- Task Type Badge & Descriptions -->
            <div class="flex flex-wrap items-center gap-1.5 mt-1">
              <!-- Time slot badge (e.g. 08:00 - 08:30) -->
              <span
                v-if="habit.type === 'time_slot' && habit.start_time"
                class="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-sky-950/80 text-sky-400 border border-sky-800/50"
              >
                <IconRenderer name="Clock" :size="11" />
                {{ habit.start_time }}{{ habit.end_time ? ' - ' + habit.end_time : '' }}
              </span>

              <!-- Reminder window badge (e.g. 10:30 前完成，08:00 起提醒) -->
              <span
                v-else-if="habit.type === 'reminder_window'"
                class="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800/50"
              >
                <IconRenderer name="Bell" :size="11" />
                <span>{{ habit.start_time ? habit.start_time + '起提醒' : '' }} {{ habit.target_time ? habit.target_time + '前服药' : '' }}</span>
              </span>

              <!-- Abstinence badge -->
              <span
                v-else-if="habit.type === 'abstinence'"
                class="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-400 border border-purple-800/50"
              >
                <IconRenderer name="ShieldCheck" :size="11" />
                <span>自律防戒</span>
              </span>

              <!-- Reading / Quantified badge -->
              <span
                v-else-if="habit.type === 'quantified_log'"
                class="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/50"
              >
                <IconRenderer name="BookOpen" :size="11" />
                <span>自由阅读打卡</span>
              </span>

              <!-- Category badge -->
              <span class="text-[10px] text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded">
                {{ getCategoryLabel(habit.category) }}
              </span>
            </div>

            <!-- Reading Log specific display -->
            <div v-if="log && (log.book_title || log.pages_read > 0 || log.duration_minutes > 0)" class="mt-2 text-xs bg-slate-950/60 border border-slate-800/80 rounded-lg p-2 text-slate-300">
              <div v-if="log.book_title" class="font-medium text-amber-300 truncate">📖 《{{ log.book_title }}》</div>
              <div class="flex items-center gap-3 text-slate-400 mt-0.5 text-[11px]">
                <span v-if="log.pages_read > 0">已读 <strong class="text-slate-200">{{ log.pages_read }}</strong> 页</span>
                <span v-if="log.duration_minutes > 0">耗时 <strong class="text-slate-200">{{ log.duration_minutes }}</strong> 分钟</span>
              </div>
              <div v-if="log.notes" class="text-slate-400 mt-1 italic text-[11px] line-clamp-1">"{{ log.notes }}"</div>
            </div>

            <!-- Fitness / Notes display -->
            <div v-else-if="log && (log.duration_minutes > 0 || log.notes)" class="mt-1.5 text-xs text-slate-400">
              <span v-if="log.duration_minutes > 0">时长: {{ log.duration_minutes }}分钟 </span>
              <span v-if="log.notes" class="italic">备注: {{ log.notes }}</span>
            </div>

            <div v-else-if="habit.description" class="text-xs text-slate-400 mt-1 line-clamp-1">
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
            class="px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1"
            :class="[
              isCompleted
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20'
            ]"
            @click="$emit('open-reading', habit, log)"
          >
            <IconRenderer :name="isCompleted ? 'Check' : 'Plus'" :size="14" />
            <span>{{ isCompleted ? '修改记录' : '记阅读' }}</span>
          </button>

          <!-- Abstinence Type button -->
          <button
            v-else-if="habit.type === 'abstinence'"
            type="button"
            class="px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1"
            :class="[
              isCompleted
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/10'
                : 'bg-slate-800 text-purple-400 border border-purple-800/60 hover:bg-purple-950/40'
            ]"
            @click="toggleCheck"
          >
            <IconRenderer :name="isCompleted ? 'ShieldCheck' : 'Shield'" :size="15" />
            <span>{{ isCompleted ? '已保持自律' : '坚持自律' }}</span>
          </button>

          <!-- Standard / Time Slot / Reminder Check Button -->
          <button
            v-else
            type="button"
            class="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
            :class="[
              isCompleted
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 scale-105'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60 hover:border-slate-500 active:scale-95'
            ]"
            @click="toggleCheck"
          >
            <IconRenderer :name="isCompleted ? 'Check' : 'Circle'" :size="20" />
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
    case 'sky': return 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
    case 'emerald': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
    case 'rose': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
    case 'amber': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
    case 'purple': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
    case 'indigo': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
    default: return 'bg-slate-800 text-slate-300'
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
