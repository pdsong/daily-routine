<template>
  <div class="space-y-4">
    
    <!-- Top Header -->
    <header class="flex items-center justify-between pt-1 pb-1">
      <div>
        <h2 class="text-xl font-bold tracking-tight text-white">
          习惯事项管理
        </h2>
        <p class="text-xs text-slate-400 mt-0.5">
          配置重复规则、提醒时间与定量目标
        </p>
      </div>

      <div class="flex items-center space-x-2">
        <button
          type="button"
          class="bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-1.5 border border-white/[0.08] active:scale-95 transition-all"
          title="重新添加经典预设事项"
          @click="seedDefaults"
        >
          <IconRenderer name="Sparkles" :size="13" class="text-amber-400" />
          <span>恢复预设</span>
        </button>

        <button
          type="button"
          class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 transition-all"
          @click="openAddModal"
        >
          <IconRenderer name="Plus" :size="15" :stroke-width="2.5" />
          <span>新建</span>
        </button>
      </div>
    </header>

    <!-- Quick Template Bar -->
    <div class="haute-glass rounded-2xl p-3.5">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <IconRenderer name="Zap" :size="13" class="text-amber-400" />
          <span>常用习惯快捷模板</span>
        </span>
        <span class="text-[10px] text-slate-400">点击直接创建</span>
      </div>
      <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          v-for="tpl in quickPresets"
          :key="tpl.title"
          type="button"
          class="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs text-slate-200 whitespace-nowrap border border-white/[0.06] hover:border-white/[0.12] transition-all active:scale-95 flex-shrink-0"
          @click="createFromTemplate(tpl)"
        >
          <IconRenderer :name="tpl.icon" :size="13" :class="getColorText(tpl.color)" />
          <span>{{ tpl.title }}</span>
        </button>
      </div>
    </div>

    <!-- Habits Count & Helper banner -->
    <div class="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-3 flex items-center justify-between text-xs">
      <div class="flex items-center space-x-2 text-slate-300">
        <IconRenderer name="SlidersHorizontal" :size="14" class="text-emerald-400" />
        <span>当前共配置 <strong class="text-emerald-400 font-bold tabular-num">{{ habits.length }}</strong> 项自律与周期事项</span>
      </div>
    </div>

    <!-- Habits List -->
    <div v-if="loading" class="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
      <div class="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <span>加载配置列表中...</span>
    </div>

    <div v-else-if="habits.length === 0" class="py-12 text-center bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
      <div class="w-12 h-12 rounded-2xl bg-white/[0.04] text-slate-500 flex items-center justify-center mx-auto mb-3">
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

    <div v-else class="space-y-2.5">
      <div
        v-for="habit in habits"
        :key="habit.id"
        class="haute-glass rounded-2xl p-3.5 relative overflow-hidden group hover:border-white/[0.14] transition-all"
      >
        <div class="flex items-center justify-between gap-3">
          
          <!-- Icon & Details -->
          <div class="flex items-center space-x-3 flex-1 min-w-0">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" :class="getIconBg(habit.color)">
              <IconRenderer :name="habit.icon" :size="18" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2">
                <h4 class="font-semibold text-sm text-slate-100 truncate group-hover:text-white">
                  {{ habit.title }}
                </h4>
              </div>

              <!-- Badges -->
              <div class="flex flex-wrap items-center gap-1.5 mt-1">
                <!-- Type badge -->
                <span
                  v-if="habit.type === 'time_slot' && habit.start_time"
                  class="text-[9px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] text-sky-300/90 border border-white/[0.06] flex items-center gap-1 tabular-num"
                >
                  <IconRenderer name="Clock" :size="10" />
                  {{ habit.start_time }}{{ habit.end_time ? ' - ' + habit.end_time : '' }}
                </span>

                <span
                  v-else-if="habit.type === 'reminder_window'"
                  class="text-[9px] font-medium px-2 py-0.5 rounded-md bg-white/[0.04] text-rose-300/90 border border-white/[0.06] flex items-center gap-1 tabular-num"
                >
                  <IconRenderer name="Bell" :size="10" />
                  {{ habit.start_time ? habit.start_time + '起' : '' }} {{ habit.target_time ? habit.target_time + '前' : '' }}
                </span>

                <span
                  v-else-if="habit.type === 'quantified_log'"
                  class="text-[9px] font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1"
                >
                  <IconRenderer name="BookOpen" :size="10" />
                  自由阅读定量
                </span>

                <span
                  v-else-if="habit.type === 'abstinence'"
                  class="text-[9px] font-medium px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1"
                >
                  <IconRenderer name="ShieldCheck" :size="10" />
                  自律防戒
                </span>

                <!-- Repeat rule badge -->
                <span class="text-[9px] text-slate-400 bg-white/[0.03] border border-white/[0.05] px-1.5 py-0.5 rounded">
                  {{ formatRepeatRule(habit) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Edit / Delete actions -->
          <div class="flex items-center space-x-1.5 flex-shrink-0">
            <button
              type="button"
              class="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white flex items-center justify-center border border-white/[0.06] transition-colors active:scale-95"
              title="编辑"
              @click="openEditModal(habit)"
            >
              <IconRenderer name="Edit3" :size="14" />
            </button>
            <button
              type="button"
              class="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-rose-500/15 text-slate-400 hover:text-rose-300 flex items-center justify-center border border-white/[0.06] hover:border-rose-500/30 transition-colors active:scale-95"
              title="删除"
              @click="handleDelete(habit)"
            >
              <IconRenderer name="Trash2" :size="14" />
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
    case 'sky': return 'bg-sky-400/10 text-sky-300 ring-1 ring-sky-400/20'
    case 'emerald': return 'bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20'
    case 'rose': return 'bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/20'
    case 'amber': return 'bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20'
    case 'purple': return 'bg-purple-400/10 text-purple-300 ring-1 ring-purple-400/20'
    case 'indigo': return 'bg-indigo-400/10 text-indigo-300 ring-1 ring-indigo-400/20'
    default: return 'bg-white/[0.05] text-slate-300 ring-1 ring-white/[0.08]'
  }
}
</script>
