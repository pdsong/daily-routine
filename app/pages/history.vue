<template>
  <div class="space-y-4">
    
    <!-- Top Header -->
    <header class="pt-1 pb-1">
      <h2 class="text-xl font-bold tracking-tight text-slate-100">
        历史打卡与统计
      </h2>
      <p class="text-xs text-slate-400 mt-0.5">
        记录每一天的坚持与成长轨迹
      </p>
    </header>

    <!-- Statistics Overview Grid -->
    <div class="grid grid-cols-2 gap-2.5">
      <!-- Streak -->
      <div class="bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-800/40 rounded-2xl p-3.5 relative overflow-hidden shadow-lg">
        <div class="flex items-center space-x-2 text-amber-400 mb-1">
          <IconRenderer name="Flame" :size="16" />
          <span class="text-xs font-semibold">连续打卡</span>
        </div>
        <div class="text-2xl font-black text-slate-100">
          {{ summary.streak }} <span class="text-xs font-normal text-amber-300">天</span>
        </div>
        <p class="text-[10px] text-slate-400 mt-0.5">保持自律火种</p>
      </div>

      <!-- Total Completions -->
      <div class="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-800/40 rounded-2xl p-3.5 relative overflow-hidden shadow-lg">
        <div class="flex items-center space-x-2 text-emerald-400 mb-1">
          <IconRenderer name="Trophy" :size="16" />
          <span class="text-xs font-semibold">累计打卡</span>
        </div>
        <div class="text-2xl font-black text-slate-100">
          {{ summary.totalCompletions }} <span class="text-xs font-normal text-emerald-300">次</span>
        </div>
        <p class="text-[10px] text-slate-400 mt-0.5">本月完成 {{ summary.monthlyCompletions }} 次</p>
      </div>
    </div>

    <!-- Reading & Fitness Special Cards -->
    <div class="grid grid-cols-2 gap-2.5">
      <!-- Reading Breakdown -->
      <div class="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3.5 shadow-md">
        <div class="flex items-center space-x-1.5 text-amber-400 mb-2">
          <IconRenderer name="BookOpen" :size="15" />
          <span class="text-xs font-semibold text-slate-200">深度阅读</span>
        </div>
        <div class="space-y-1">
          <div class="flex justify-between text-xs">
            <span class="text-slate-400">累计阅读</span>
            <span class="font-bold text-amber-400">{{ summary.reading.totalPages }} 页</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-slate-400">阅读时长</span>
            <span class="font-semibold text-slate-300">{{ Math.round(summary.reading.totalMinutes / 60 * 10) / 10 }} 小时</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-slate-400">阅读书目</span>
            <span class="font-semibold text-slate-300">{{ summary.reading.bookCount }} 本</span>
          </div>
        </div>
      </div>

      <!-- Fitness & Running Breakdown -->
      <div class="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3.5 shadow-md">
        <div class="flex items-center space-x-1.5 text-sky-400 mb-2">
          <IconRenderer name="Activity" :size="15" />
          <span class="text-xs font-semibold text-slate-200">运动锻炼</span>
        </div>
        <div class="space-y-1">
          <div class="flex justify-between text-xs">
            <span class="text-slate-400">运动总时长</span>
            <span class="font-bold text-sky-400">{{ Math.round(summary.running.totalMinutes / 60 * 10) / 10 }} 小时</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-slate-400">运动记录</span>
            <span class="font-semibold text-slate-300">{{ summary.running.runCount }} 次</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-slate-400">平均每次</span>
            <span class="font-semibold text-slate-300">
              {{ summary.running.runCount > 0 ? Math.round(summary.running.totalMinutes / summary.running.runCount) : 0 }} 分钟
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Habit Completion Ranking -->
    <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
      <h3 class="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
        <IconRenderer name="BarChart3" :size="14" class="text-emerald-400" />
        <span>事项完成榜单</span>
      </h3>
      <div class="space-y-2.5">
        <div
          v-for="hb in summary.habitBreakdown"
          :key="hb.id"
          class="flex items-center justify-between text-xs"
        >
          <div class="flex items-center space-x-2 truncate">
            <div class="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 flex-shrink-0">
              <IconRenderer :name="hb.icon" :size="13" />
            </div>
            <span class="text-slate-200 font-medium truncate">{{ hb.title }}</span>
          </div>
          <div class="flex items-center space-x-2 flex-shrink-0">
            <span class="font-bold text-emerald-400">{{ hb.complete_count }} 次</span>
            <span v-if="hb.last_completed_date" class="text-[10px] text-slate-500">({{ hb.last_completed_date.slice(5) }})</span>
          </div>
        </div>
      </div>
    </div>

    <!-- History Log Timeline with Filter -->
    <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <IconRenderer name="Clock" :size="14" class="text-emerald-400" />
          <span>历史打卡明细</span>
        </h3>
        
        <!-- Category Filter -->
        <select
          v-model="selectedCategory"
          class="bg-slate-950 border border-slate-800 text-slate-300 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
          @change="loadHistory"
        >
          <option value="">全部类别</option>
          <option value="study">学习跟读</option>
          <option value="fitness">运动锻炼</option>
          <option value="health">健康用药</option>
          <option value="self_discipline">自律戒断</option>
        </select>
      </div>

      <!-- Log Items -->
      <div v-if="historyLoading" class="py-6 text-center text-slate-500 text-xs">
        加载明细中...
      </div>

      <div v-else-if="historyList.length === 0" class="py-8 text-center text-slate-500 text-xs">
        暂无该分类的历史打卡记录
      </div>

      <div v-else class="space-y-2.5 max-h-96 overflow-y-auto pr-1">
        <div
          v-for="item in historyList"
          :key="item.log_id"
          class="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-start justify-between gap-2"
        >
          <div class="flex items-start space-x-2.5 min-w-0">
            <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <IconRenderer :name="item.habit_icon || 'Check'" :size="15" />
            </div>
            <div class="min-w-0">
              <div class="flex items-center space-x-1.5">
                <span class="text-xs font-semibold text-slate-200 truncate">{{ item.habit_title }}</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                  {{ item.date }}
                </span>
              </div>
              
              <!-- Reading specific details -->
              <div v-if="item.book_title || item.pages_read > 0" class="text-[11px] text-amber-300 mt-1">
                <span v-if="item.book_title">📖 《{{ item.book_title }}》</span>
                <span v-if="item.pages_read > 0" class="ml-1 font-medium">已读 {{ item.pages_read }} 页</span>
                <span v-if="item.duration_minutes > 0" class="ml-1 text-slate-400">({{ item.duration_minutes }}分钟)</span>
              </div>

              <!-- Exercise / Duration details -->
              <div v-else-if="item.duration_minutes > 0" class="text-[11px] text-sky-300 mt-1">
                ⏱️ 用时 {{ item.duration_minutes }} 分钟
              </div>

              <div v-if="item.notes" class="text-[10px] text-slate-400 mt-1 italic line-clamp-2">
                "{{ item.notes }}"
              </div>
            </div>
          </div>

          <div class="text-emerald-400 font-bold text-xs flex items-center gap-1 flex-shrink-0">
            <IconRenderer name="Check" :size="14" />
            <span>完成</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import IconRenderer from '~/components/IconRenderer.vue'

const summary = ref<any>({
  streak: 0,
  totalCompletions: 0,
  totalMinutes: 0,
  totalHabits: 0,
  monthlyCompletions: 0,
  reading: { bookCount: 0, totalPages: 0, totalMinutes: 0, sessionCount: 0 },
  running: { totalMinutes: 0, runCount: 0 },
  habitBreakdown: []
})

const selectedCategory = ref('')
const historyList = ref<any[]>([])
const historyLoading = ref(false)

const loadSummary = async () => {
  try {
    const res: any = await $fetch('/api/stats/summary')
    summary.value = res
  } catch (err) {
    console.error('Failed to load summary', err)
  }
}

const loadHistory = async () => {
  historyLoading.value = true
  try {
    const res: any = await $fetch('/api/stats/history', {
      query: {
        category: selectedCategory.value || undefined,
        limit: 50
      }
    })
    historyList.value = res.list || []
  } catch (err) {
    console.error('Failed to load history', err)
  } finally {
    historyLoading.value = false
  }
}

onMounted(() => {
  loadSummary()
  loadHistory()
})
</script>
