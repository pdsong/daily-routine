<template>
  <div class="space-y-4">
    
    <!-- Top Header -->
    <header class="flex items-center justify-between pt-1 pb-1">
      <div>
        <h2 class="text-xl font-bold tracking-tight text-slate-100">
          事项与习惯管理
        </h2>
        <p class="text-xs text-slate-400 mt-0.5">
          配置重复规则、提醒时间与定量目标
        </p>
      </div>

      <div class="flex items-center space-x-2">
        <button
          type="button"
          class="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 border border-slate-700/80 active:scale-95 transition-all"
          title="重新添加 4 个经典默认事项"
          @click="seedDefaults"
        >
          <IconRenderer name="Sparkles" :size="14" class="text-amber-400" />
          <span>恢复默认任务</span>
        </button>

        <button
          type="button"
          class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          @click="openAddModal"
        >
          <IconRenderer name="Plus" :size="16" />
          <span>新建事项</span>
        </button>
      </div>
    </header>

    <!-- Quick Template Bar -->
    <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <IconRenderer name="Zap" :size="14" class="text-amber-400" />
          <span>快速添加常用任务</span>
        </span>
        <span class="text-[11px] text-slate-500">点击直接创建</span>
      </div>
      <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          v-for="tpl in quickPresets"
          :key="tpl.title"
          type="button"
          class="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-200 whitespace-nowrap border border-slate-700/60 transition-all active:scale-95 flex-shrink-0"
          @click="createFromTemplate(tpl)"
        >
          <IconRenderer :name="tpl.icon" :size="14" :class="getColorText(tpl.color)" />
          <span>{{ tpl.title }}</span>
        </button>
      </div>
    </div>

    <!-- Habits Count & Helper banner -->
    <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between text-xs">
      <div class="flex items-center space-x-2 text-slate-300">
        <IconRenderer name="SlidersHorizontal" :size="16" class="text-emerald-400" />
        <span>当前共有 <strong class="text-emerald-400 font-bold">{{ habits.length }}</strong> 项自律与重复事项</span>
      </div>
    </div>

    <!-- Habits List -->
    <div v-if="loading" class="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
      <div class="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <span>加载配置列表中...</span>
    </div>

    <div v-else-if="habits.length === 0" class="py-12 text-center bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
      <div class="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto mb-3">
        <IconRenderer name="PlusCircle" :size="24" />
      </div>
      <p class="text-sm font-medium text-slate-300">还没有配置任何事项</p>
      <p class="text-xs text-slate-500 mt-1">点击下方按钮快速添加您的第一条打卡事项</p>
      <button
        class="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 font-semibold rounded-xl text-xs hover:bg-emerald-400 transition-colors"
        @click="openAddModal"
      >
        新建事项
      </button>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="habit in habits"
        :key="habit.id"
        class="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-md backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-all"
      >
        <!-- Left color bar -->
        <div class="absolute top-0 bottom-0 left-0 w-1.5" :class="getColorAccent(habit.color)" />

        <div class="flex items-start justify-between gap-3 pl-2">
          
          <!-- Icon & Details -->
          <div class="flex items-start space-x-3 flex-1 min-w-0">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" :class="getIconBg(habit.color)">
              <IconRenderer :name="habit.icon" :size="20" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2">
                <h4 class="font-semibold text-sm text-slate-100 truncate">
                  {{ habit.title }}
                </h4>
              </div>

              <!-- Badges -->
              <div class="flex flex-wrap items-center gap-1.5 mt-1">
                <!-- Type badge -->
                <span
                  v-if="habit.type === 'time_slot' && habit.start_time"
                  class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-sky-950/80 text-sky-400 border border-sky-800/50 flex items-center gap-1"
                >
                  <IconRenderer name="Clock" :size="10" />
                  {{ habit.start_time }}{{ habit.end_time ? ' - ' + habit.end_time : '' }}
                </span>

                <span
                  v-else-if="habit.type === 'reminder_window'"
                  class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800/50 flex items-center gap-1"
                >
                  <IconRenderer name="Bell" :size="10" />
                  {{ habit.start_time ? habit.start_time + '起提醒' : '' }} {{ habit.target_time ? habit.target_time + '前服药' : '' }}
                </span>

                <span
                  v-else-if="habit.type === 'quantified_log'"
                  class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/50 flex items-center gap-1"
                >
                  <IconRenderer name="BookOpen" :size="10" />
                  自由阅读定量
                </span>

                <span
                  v-else-if="habit.type === 'abstinence'"
                  class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-400 border border-purple-800/50 flex items-center gap-1"
                >
                  <IconRenderer name="ShieldCheck" :size="10" />
                  自律戒断
                </span>

                <!-- Repeat rule badge -->
                <span class="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  {{ formatRepeatRule(habit) }}
                </span>
              </div>

              <p v-if="habit.description" class="text-xs text-slate-400 mt-1.5 line-clamp-1">
                {{ habit.description }}
              </p>
            </div>
          </div>

          <!-- Edit / Delete actions -->
          <div class="flex items-center space-x-1 flex-shrink-0">
            <button
              type="button"
              class="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              title="编辑"
              @click="openEditModal(habit)"
            >
              <IconRenderer name="Edit3" :size="15" />
            </button>
            <button
              type="button"
              class="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors"
              title="删除"
              @click="handleDelete(habit)"
            >
              <IconRenderer name="Trash2" :size="15" />
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- Habit Form Modal -->
    <HabitFormModal
      :is-open="isModalOpen"
      :habit="selectedHabit"
      @close="isModalOpen = false"
      @save="handleSave"
      @delete="handleDeleteById"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import IconRenderer from '~/components/IconRenderer.vue'
import HabitFormModal from '~/components/HabitFormModal.vue'

const habits = ref<any[]>([])
const loading = ref(false)
const isModalOpen = ref(false)
const selectedHabit = ref<any>(null)

const loadHabits = async () => {
  loading.value = true
  try {
    const res: any = await $fetch('/api/habits')
    habits.value = res.habits || []
  } catch (err) {
    console.error('Failed to load habits', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadHabits()
})

const quickPresets = [
  {
    title: '晨跑运动',
    category: 'fitness',
    type: 'time_slot',
    start_time: '08:30',
    end_time: '09:30',
    icon: 'Flame',
    color: 'emerald',
    description: '每日户外/跑步机晨跑 1 小时',
    repeat_type: 'daily'
  },
  {
    title: '深度阅读',
    category: 'study',
    type: 'quantified_log',
    target_metric: 'pages',
    target_value: 20,
    icon: 'BookOpen',
    color: 'amber',
    description: '自由时间记录书名、页数与阅读时长',
    repeat_type: 'daily'
  },
  {
    title: '自律断舍离 (不吃零食/不喝汽水)',
    category: 'self_discipline',
    type: 'abstinence',
    icon: 'ShieldCheck',
    color: 'purple',
    description: '保持自律，抵制垃圾食品与含糖饮料',
    repeat_type: 'daily'
  },
  {
    title: '今日不吃晚饭 (轻断食)',
    category: 'self_discipline',
    type: 'abstinence',
    icon: 'ShieldCheck',
    color: 'purple',
    description: '轻断食自律，今日不吃晚饭',
    repeat_type: 'daily'
  }
]

const createFromTemplate = async (tpl: any) => {
  await handleSave(tpl)
}

const seedDefaults = async () => {
  if (confirm('是否添加/补齐 3 项经典预设事项（晨跑、深度阅读、自律断舍离）？')) {
    try {
      loading.value = true
      await $fetch('/api/habits/seed-defaults', { method: 'POST' })
      await loadHabits()
    } catch (err) {
      console.error('Failed to seed defaults', err)
    } finally {
      loading.value = false
    }
  }
}

const openAddModal = () => {
  selectedHabit.value = null
  isModalOpen.value = true
}

const openEditModal = (habit: any) => {
  selectedHabit.value = habit
  isModalOpen.value = true
}

const getColorText = (color: string) => {
  switch (color) {
    case 'sky': return 'text-sky-400'
    case 'emerald': return 'text-emerald-400'
    case 'rose': return 'text-rose-400'
    case 'amber': return 'text-amber-400'
    case 'purple': return 'text-purple-400'
    case 'indigo': return 'text-indigo-400'
    default: return 'text-emerald-400'
  }
}

const handleSave = async (habitData: any) => {
  try {
    if (habitData.id) {
      await $fetch(`/api/habits/${habitData.id}`, {
        method: 'PUT',
        body: habitData
      })
    } else {
      await $fetch('/api/habits', {
        method: 'POST',
        body: habitData
      })
    }
    await loadHabits()
  } catch (err) {
    console.error('Failed to save habit', err)
  }
}

const handleDelete = async (habit: any) => {
  if (confirm(`确定要删除 "${habit.title}" 吗？该操作不可逆。`)) {
    await handleDeleteById(habit.id)
  }
}

const handleDeleteById = async (id: number) => {
  try {
    await $fetch(`/api/habits/${id}`, { method: 'DELETE' })
    await loadHabits()
  } catch (err) {
    console.error('Failed to delete habit', err)
  }
}

const formatRepeatRule = (habit: any) => {
  if (habit.repeat_type === 'daily') return '每天'
  if (habit.repeat_type === 'weekdays') return '工作日'
  if (habit.repeat_type === 'weekends') return '周末'
  if (habit.repeat_type === 'custom_days' && habit.repeat_days) {
    const map: Record<string, string> = { '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '7': '日' }
    return '周' + habit.repeat_days.split(',').map((d: string) => map[d.trim()] || d).join(',')
  }
  return '每天'
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
</script>
