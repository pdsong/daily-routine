<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md transition-opacity">
    <div class="haute-glass w-full max-w-md rounded-t-[28px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-transform duration-300">
      
      <!-- Header -->
      <div class="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
        <div class="flex items-center space-x-2.5">
          <div class="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-300 flex items-center justify-center ring-1 ring-amber-400/20">
            <IconRenderer name="BookOpen" :size="16" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-white tracking-tight">阅读打卡与记录</h3>
            <p class="text-[11px] text-slate-400">记录阅读进度与读书心得</p>
          </div>
        </div>
        <button
          class="w-7 h-7 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          @click="close"
        >
          <IconRenderer name="X" :size="14" />
        </button>
      </div>

      <!-- Form Body -->
      <div class="p-5 space-y-4 overflow-y-auto flex-1">
        <!-- Book Title -->
        <div>
          <label class="block text-[11px] font-medium text-slate-300 mb-1.5">书名 / 阅读材料</label>
          <input
            v-model="form.book_title"
            type="text"
            placeholder="例如：《被讨厌的勇气》、《自控力》..."
            class="w-full bg-[#080a0f] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/80 transition-all"
          />
          <!-- Recent Books Chips -->
          <div v-if="recentBooks.length > 0" class="flex flex-wrap gap-1.5 mt-2">
            <span class="text-[10px] text-slate-400 self-center mr-1">最近在读:</span>
            <button
              v-for="b in recentBooks"
              :key="b"
              type="button"
              class="text-[10px] bg-white/[0.04] hover:bg-amber-400/15 hover:text-amber-300 text-slate-300 px-2.5 py-1 rounded-lg transition-colors border border-white/[0.06]"
              @click="form.book_title = b"
            >
              {{ b }}
            </button>
          </div>
        </div>

        <!-- Pages Read -->
        <div>
          <label class="block text-[11px] font-medium text-slate-300 mb-1.5">阅读页数</label>
          <div class="grid grid-cols-2 gap-2.5 mb-2">
            <div>
              <span class="text-[10px] text-slate-400 mb-1 block">起始页码 (可选)</span>
              <input
                v-model.number="startPage"
                type="number"
                placeholder="例如: 120"
                class="w-full bg-[#080a0f] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/80 tabular-num"
                @input="calculateTotalPages"
              />
            </div>
            <div>
              <span class="text-[10px] text-slate-400 mb-1 block">结束页码 (可选)</span>
              <input
                v-model.number="endPage"
                type="number"
                placeholder="例如: 155"
                class="w-full bg-[#080a0f] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/80 tabular-num"
                @input="calculateTotalPages"
              />
            </div>
          </div>
          <div>
            <span class="text-[10px] text-slate-400 mb-1 block">本次阅读总页数</span>
            <input
              v-model.number="form.pages_read"
              type="number"
              min="0"
              placeholder="本次读了多少页"
              class="w-full bg-[#080a0f] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-amber-400 font-semibold focus:outline-none focus:border-amber-400/80 tabular-num"
            />
          </div>
        </div>

        <!-- Duration -->
        <div>
          <label class="block text-[11px] font-medium text-slate-300 mb-1.5">阅读时长 (分钟)</label>
          <div class="flex items-center space-x-2">
            <input
              v-model.number="form.duration_minutes"
              type="number"
              min="0"
              placeholder="阅读时长"
              class="w-24 bg-[#080a0f] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-medium focus:outline-none focus:border-amber-400/80 tabular-num"
            />
            <div class="flex flex-1 gap-1.5">
              <button
                v-for="mins in [15, 30, 45, 60]"
                :key="mins"
                type="button"
                class="flex-1 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs py-2 rounded-xl transition-colors border border-white/[0.06] active:scale-95 tabular-num"
                @click="form.duration_minutes = (form.duration_minutes || 0) + mins"
              >
                +{{ mins }}分
              </button>
            </div>
          </div>
        </div>

        <!-- Notes / Thoughts -->
        <div>
          <label class="block text-[11px] font-medium text-slate-300 mb-1.5">读书感悟 / 备忘笔记 (可选)</label>
          <textarea
            v-model="form.notes"
            rows="3"
            placeholder="记录今天的精彩句子或感悟..."
            class="w-full bg-[#080a0f] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/80 transition-all resize-none"
          ></textarea>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="p-4 border-t border-white/[0.08] bg-white/[0.02] flex items-center space-x-3">
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
          class="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95"
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
