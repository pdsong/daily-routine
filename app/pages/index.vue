<template>
  <div class="space-y-4">
    
    <!-- Top Header & Profile Status -->
    <header class="flex items-center justify-between pt-1 pb-1">
      <div>
        <div class="flex items-center space-x-2">
          <h2 class="text-xl font-bold tracking-tight text-white">
            {{ isToday ? '今日打卡' : formatDateTitle(selectedDate) }}
          </h2>
          <span v-if="isToday" class="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-semibold border border-emerald-500/25">
            Today
          </span>
        </div>
        <p class="text-xs text-slate-400 mt-0.5 font-normal">
          {{ user?.username ? `你好，${user.username}` : '坚持自律每一天' }} · {{ getDayOfWeekChinese(selectedDate) }}
        </p>
      </div>

      <!-- Quick Action Menu -->
      <div class="flex items-center space-x-2">
        <button
          type="button"
          title="新建事项"
          class="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-emerald-400/40 text-emerald-400 hover:bg-emerald-500/10 flex items-center justify-center transition-all duration-200 active:scale-90"
          @click="isFormModalOpen = true; currentEditHabit = null"
        >
          <IconRenderer name="Plus" :size="18" />
        </button>

        <button
          type="button"
          title="退出登录"
          class="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-rose-400 hover:border-rose-400/30 hover:bg-rose-500/10 flex items-center justify-center transition-all duration-200 active:scale-90"
          @click="handleLogout"
        >
          <IconRenderer name="LogOut" :size="15" />
        </button>
      </div>
    </header>

    <!-- Sleek Date Navigator Bar -->
    <div class="flex items-center justify-between bg-[#10141e]/70 border border-white/[0.06] rounded-2xl p-1.5 px-3 backdrop-blur-lg">
      <button
        class="p-1.5 rounded-xl hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors active:scale-95"
        @click="shiftDate(-1)"
      >
        <IconRenderer name="ChevronLeft" :size="17" />
      </button>

      <div class="flex items-center space-x-2">
        <input
          v-model="selectedDate"
          type="date"
          class="bg-transparent text-xs font-semibold text-slate-200 text-center focus:outline-none cursor-pointer tabular-num"
          @change="loadData"
        />
        <button
          v-if="!isToday"
          class="text-[10px] bg-emerald-500/15 text-emerald-300 font-medium px-2 py-0.5 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
          @click="goToToday"
        >
          返回今天
        </button>
      </div>

      <button
        class="p-1.5 rounded-xl hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors active:scale-95"
        @click="shiftDate(1)"
      >
        <IconRenderer name="ChevronRight" :size="17" />
      </button>
    </div>

    <!-- Heatmap & Completion Timeline Card -->
    <HeatmapGraph
      :days="heatmapDays"
      :selected-date="selectedDate"
      :timeline-tasks="dailyData.items"
      @select-date="onSelectHeatmapDate"
    />

    <!-- Today's Progress Card -->
    <div class="haute-glass rounded-2xl p-4 relative overflow-hidden">
      <div class="flex items-center justify-between mb-2.5">
        <div class="flex items-center space-x-2">
          <div class="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <IconRenderer name="Sparkles" :size="14" />
          </div>
          <span class="text-xs font-semibold text-slate-200">
            {{ isToday ? '今日自律进度' : `${selectedDate} 达成度` }}
          </span>
        </div>
        <div class="text-xs font-bold text-emerald-400 tabular-num">
          {{ dailyData.completedCount }} / {{ dailyData.totalCount }} ({{ dailyData.progressPercent }}%)
        </div>
      </div>

      <!-- Progress bar -->
      <div class="w-full bg-[#080a0f] h-2 rounded-full overflow-hidden border border-white/[0.06] p-0.5">
        <div
          class="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(52,211,153,0.5)]"
          :style="{ width: `${dailyData.progressPercent}%` }"
        />
      </div>

      <p v-if="dailyData.totalCount > 0 && dailyData.completedCount === dailyData.totalCount" class="text-[11px] text-emerald-300 font-medium mt-2.5 flex items-center gap-1.5">
        <span>✨ 太棒了！今日计划已全部圆满达成！</span>
      </p>
    </div>

    <!-- Filter Category Chips -->
    <div class="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
      <button
        v-for="cat in filterCategories"
        :key="cat.value"
        class="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center space-x-1 active:scale-95"
        :class="[
          selectedFilter === cat.value
            ? 'bg-white/[0.12] text-white border border-white/[0.2] shadow-sm font-semibold'
            : 'bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:text-slate-200 hover:border-white/[0.1]'
        ]"
        @click="selectedFilter = cat.value"
      >
        <span>{{ cat.label }}</span>
        <span v-if="cat.count > 0" class="text-[10px] opacity-70 tabular-num">({{ cat.count }})</span>
      </button>
    </div>

    <!-- Habits List -->
    <div v-if="loading" class="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
      <div class="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <span>加载事项中...</span>
    </div>

    <div v-else-if="filteredItems.length === 0" class="py-12 text-center bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6">
      <div class="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto mb-3">
        <IconRenderer name="Calendar" :size="24" />
      </div>
      <p class="text-sm font-medium text-slate-300">今天暂无待执行事项</p>
      <p class="text-xs text-slate-500 mt-1">您可以点击右上角 "+" 添加新任务，或切换到其他日期查看</p>
      <button
        class="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 font-semibold rounded-xl text-xs hover:bg-emerald-400 transition-colors"
        @click="isFormModalOpen = true"
      >
        新建事项
      </button>
    </div>

    <div v-else class="space-y-3">
      <HabitCard
        v-for="item in filteredItems"
        :key="item.habit.id"
        :habit="item.habit"
        :log="item.log"
        :date="selectedDate"
        @toggle="handleToggleHabit"
        @open-reading="openReadingModal"
      />
    </div>

    <!-- Reading Modal -->
    <ReadingModal
      :is-open="isReadingModalOpen"
      :habit="currentReadingHabit"
      :initial-log="currentReadingLog"
      :date="selectedDate"
      @close="isReadingModalOpen = false"
      @save="handleSaveReading"
      @cancel-log="handleCancelLog"
    />

    <!-- Habit Form Modal -->
    <HabitFormModal
      :is-open="isFormModalOpen"
      :habit="currentEditHabit"
      @close="isFormModalOpen = false"
      @save="handleSaveHabit"
      @delete="handleDeleteHabit"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import confetti from 'canvas-confetti'
import IconRenderer from '~/components/IconRenderer.vue'
import HeatmapGraph, { type HeatmapDay } from '~/components/HeatmapGraph.vue'
import HabitCard from '~/components/HabitCard.vue'
import ReadingModal from '~/components/ReadingModal.vue'
import HabitFormModal from '~/components/HabitFormModal.vue'

const { user, logout } = useAuth()

const todayStr = dayjs().format('YYYY-MM-DD')
const selectedDate = ref(todayStr)
const loading = ref(false)

const isToday = computed(() => selectedDate.value === todayStr)

const dailyData = ref<{
  totalCount: number
  completedCount: number
  progressPercent: number
  items: Array<{ habit: any; log: any; status: string }>
}>({
  totalCount: 0,
  completedCount: 0,
  progressPercent: 0,
  items: []
})

const heatmapDays = ref<HeatmapDay[]>([])
const selectedFilter = ref('all')

// Modals state
const isReadingModalOpen = ref(false)
const currentReadingHabit = ref<any>(null)
const currentReadingLog = ref<any>(null)

const isFormModalOpen = ref(false)
const currentEditHabit = ref<any>(null)

// Load daily tasks & logs
const loadDailyData = async () => {
  try {
    const res: any = await $fetch('/api/logs/daily', {
      query: { date: selectedDate.value }
    })
    dailyData.value = {
      totalCount: res.totalCount || 0,
      completedCount: res.completedCount || 0,
      progressPercent: res.progressPercent || 0,
      items: res.items || []
    }
  } catch (err) {
    console.error('Failed to load daily logs', err)
  }
}

// Load heatmap data
const loadHeatmapData = async () => {
  try {
    const res: any = await $fetch('/api/stats/heatmap', {
      query: { days: 112 } // 16 weeks
    })
    heatmapDays.value = res.days || []
  } catch (err) {
    console.error('Failed to load heatmap', err)
  }
}

const loadData = async () => {
  loading.value = true
  await Promise.all([loadDailyData(), loadHeatmapData()])
  loading.value = false
}

onMounted(() => {
  loadData()
})

const shiftDate = (days: number) => {
  selectedDate.value = dayjs(selectedDate.value).add(days, 'day').format('YYYY-MM-DD')
  loadDailyData()
}

const goToToday = () => {
  selectedDate.value = todayStr
  loadDailyData()
}

const onSelectHeatmapDate = (date: string) => {
  selectedDate.value = date
  loadDailyData()
}

// Toggle status
const handleToggleHabit = async (habitId: number, nextStatus: string) => {
  try {
    await $fetch('/api/logs/toggle', {
      method: 'POST',
      body: {
        habit_id: habitId,
        date: selectedDate.value,
        status: nextStatus
      }
    })

    // Reload daily data and heatmap
    await loadDailyData()
    await loadHeatmapData()

    // Confetti celebration if 100% completed
    if (dailyData.value.totalCount > 0 && dailyData.value.completedCount === dailyData.value.totalCount) {
      triggerConfetti()
    }
  } catch (err) {
    console.error('Toggle habit failed', err)
  }
}

const openReadingModal = (habit: any, log: any) => {
  currentReadingHabit.value = habit
  currentReadingLog.value = log
  isReadingModalOpen.value = true
}

const handleSaveReading = async (payload: any) => {
  try {
    await $fetch('/api/logs/toggle', {
      method: 'POST',
      body: payload
    })
    await loadDailyData()
    await loadHeatmapData()

    if (dailyData.value.totalCount > 0 && dailyData.value.completedCount === dailyData.value.totalCount) {
      triggerConfetti()
    }
  } catch (err) {
    console.error('Failed to save reading log', err)
  }
}

const handleCancelLog = async (habitId: number, date: string) => {
  try {
    await $fetch('/api/logs/toggle', {
      method: 'POST',
      body: {
        habit_id: habitId,
        date,
        status: 'pending'
      }
    })
    await loadDailyData()
    await loadHeatmapData()
  } catch (err) {
    console.error('Failed to cancel log', err)
  }
}

const handleSaveHabit = async (habitData: any) => {
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
    await loadData()
  } catch (err) {
    console.error('Failed to save habit', err)
  }
}

const handleDeleteHabit = async (id: number) => {
  try {
    await $fetch(`/api/habits/${id}`, { method: 'DELETE' })
    await loadData()
  } catch (err) {
    console.error('Failed to delete habit', err)
  }
}

const triggerConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 }
  })
}

const handleLogout = async () => {
  if (confirm('确定要退出登录吗？')) {
    await logout()
  }
}

// Filter calculations
const filterCategories = computed(() => {
  const items = dailyData.value.items || []
  return [
    { label: '全部', value: 'all', count: items.length },
    { label: '待完成', value: 'pending', count: items.filter(i => i.status !== 'completed').length },
    { label: '已完成', value: 'completed', count: items.filter(i => i.status === 'completed').length },
    { label: '学习跟读', value: 'study', count: items.filter(i => i.habit.category === 'study').length },
    { label: '运动', value: 'fitness', count: items.filter(i => i.habit.category === 'fitness').length },
    { label: '健康', value: 'health', count: items.filter(i => i.habit.category === 'health').length },
    { label: '自律', value: 'self_discipline', count: items.filter(i => i.habit.category === 'self_discipline').length }
  ]
})

const filteredItems = computed(() => {
  const items = dailyData.value.items || []
  if (selectedFilter.value === 'all') return items
  if (selectedFilter.value === 'pending') return items.filter(i => i.status !== 'completed')
  if (selectedFilter.value === 'completed') return items.filter(i => i.status === 'completed')
  return items.filter(i => i.habit.category === selectedFilter.value)
})

const formatDateTitle = (dateStr: string) => {
  const d = dayjs(dateStr)
  return `${d.format('M月D日')}`
}

const getDayOfWeekChinese = (dateStr: string) => {
  const dow = dayjs(dateStr).day()
  const map = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return map[dow]
}
</script>
