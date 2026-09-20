<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity">
    <div class="bg-slate-900 border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-6 duration-200">
      
      <!-- Header -->
      <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div class="flex items-center space-x-2.5">
          <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <IconRenderer name="BookOpen" :size="18" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-slate-100">阅读打卡与记录</h3>
            <p class="text-xs text-slate-400">记录阅读进度与读书心得</p>
          </div>
        </div>
        <button
          class="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          @click="close"
        >
          <IconRenderer name="X" :size="16" />
        </button>
      </div>

      <!-- Form Body -->
      <div class="p-5 space-y-4 overflow-y-auto flex-1">
        <!-- Book Title -->
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">书名 / 阅读材料</label>
          <input
            v-model="form.book_title"
            type="text"
            placeholder="例如：《被讨厌的勇气》、《经济学原理》..."
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 transition-all"
          />
          <!-- Recent Books Chips -->
          <div v-if="recentBooks.length > 0" class="flex flex-wrap gap-1.5 mt-2">
            <span class="text-[11px] text-slate-500 self-center mr-1">最近阅读:</span>
            <button
              v-for="b in recentBooks"
              :key="b"
              type="button"
              class="text-[11px] bg-slate-800/80 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 px-2.5 py-1 rounded-lg transition-colors border border-slate-700/50"
              @click="form.book_title = b"
            >
              {{ b }}
            </button>
          </div>
        </div>

        <!-- Pages Read -->
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">阅读页数</label>
          <div class="grid grid-cols-2 gap-2.5 mb-2">
            <div>
              <span class="text-[11px] text-slate-400 mb-1 block">起始页码 (可选)</span>
              <input
                v-model.number="startPage"
                type="number"
                placeholder="例如: 120"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80"
                @input="calculateTotalPages"
              />
            </div>
            <div>
              <span class="text-[11px] text-slate-400 mb-1 block">结束页码 (可选)</span>
              <input
                v-model.number="endPage"
                type="number"
                placeholder="例如: 155"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80"
                @input="calculateTotalPages"
              />
            </div>
          </div>
          <div>
            <span class="text-[11px] text-slate-400 mb-1 block">本次阅读总页数</span>
            <input
              v-model.number="form.pages_read"
              type="number"
              min="0"
              placeholder="本次读了多少页"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-amber-400 font-semibold focus:outline-none focus:border-amber-500/80"
            />
          </div>
        </div>

        <!-- Duration -->
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">阅读时长 (分钟)</label>
          <div class="flex items-center space-x-2">
            <input
              v-model.number="form.duration_minutes"
              type="number"
              min="0"
              placeholder="阅读时长"
              class="w-28 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-medium focus:outline-none focus:border-amber-500/80"
            />
            <div class="flex flex-1 gap-1.5">
              <button
                v-for="mins in [15, 30, 45, 60]"
                :key="mins"
                type="button"
                class="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded-xl transition-colors border border-slate-700/50"
                @click="form.duration_minutes = (form.duration_minutes || 0) + mins"
              >
                +{{ mins }}分
              </button>
            </div>
          </div>
        </div>

        <!-- Notes / Thoughts -->
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">读书感悟 / 备忘笔记 (可选)</label>
          <textarea
            v-model="form.notes"
            rows="3"
            placeholder="记录今天的精彩句子或感悟..."
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/80 transition-all resize-none"
          ></textarea>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center space-x-3">
        <button
          v-if="initialLog"
          type="button"
          class="px-4 py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-colors"
          @click="onCancelLog"
        >
          取消打卡
        </button>
        <button
          type="button"
          class="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-98"
          @click="save"
        >
          {{ initialLog ? '保存更新' : '完成阅读打卡' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import IconRenderer from './IconRenderer.vue'

const props = defineProps<{
  isOpen: boolean
  habit: any
  initialLog?: any
  date: string
  recentBooks?: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: {
    habit_id: number
    date: string
    status: string
    pages_read: number
    duration_minutes: number
    book_title: string
    notes: string
  }): void
  (e: 'cancel-log', habitId: number, date: string): void
}>()

const startPage = ref<number | null>(null)
const endPage = ref<number | null>(null)

const form = ref({
  book_title: '',
  pages_read: 0,
  duration_minutes: 30,
  notes: ''
})

const recentBooks = ref<string[]>(props.recentBooks || ['原则', '纳瓦尔宝典', '深度工作', '置身事内'])

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      if (props.initialLog) {
        form.value.book_title = props.initialLog.book_title || ''
        form.value.pages_read = props.initialLog.pages_read || 0
        form.value.duration_minutes = props.initialLog.duration_minutes || 30
        form.value.notes = props.initialLog.notes || ''
      } else {
        form.value.book_title = form.value.book_title || ''
        form.value.pages_read = 0
        form.value.duration_minutes = 30
        form.value.notes = ''
      }
      startPage.value = null
      endPage.value = null
    }
  }
)

const calculateTotalPages = () => {
  if (startPage.value !== null && endPage.value !== null && endPage.value >= startPage.value) {
    form.value.pages_read = endPage.value - startPage.value + 1
  }
}

const close = () => {
  emit('close')
}

const save = () => {
  emit('save', {
    habit_id: props.habit.id,
    date: props.date,
    status: 'completed',
    pages_read: form.value.pages_read || 0,
    duration_minutes: form.value.duration_minutes || 0,
    book_title: form.value.book_title,
    notes: form.value.notes
  })
  close()
}

const onCancelLog = () => {
  emit('cancel-log', props.habit.id, props.date)
  close()
}
</script>
