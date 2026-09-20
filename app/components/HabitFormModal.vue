<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity">
    <div class="bg-slate-900 border border-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-6 duration-200">
      
      <!-- Header -->
      <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div>
          <h3 class="text-base font-semibold text-slate-100">{{ isEditing ? '编辑事项' : '新建重复事项 / 习惯' }}</h3>
          <p class="text-xs text-slate-400">设置时间段、提醒窗口或定量目标</p>
        </div>
        <button
          class="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          @click="close"
        >
          <IconRenderer name="X" :size="16" />
        </button>
      </div>

      <!-- Quick Templates (Only when creating) -->
      <div v-if="!isEditing" class="px-5 pt-3 pb-1 border-b border-slate-800/60 bg-slate-950/40">
        <span class="text-[11px] font-medium text-slate-400 block mb-2">⚡ 快速套用预设模板</span>
        <div class="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button
            v-for="tpl in templates"
            :key="tpl.title"
            type="button"
            class="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/80 text-xs text-slate-200 whitespace-nowrap border border-slate-700/60 transition-all active:scale-95 flex-shrink-0"
            @click="applyTemplate(tpl)"
          >
            <IconRenderer :name="tpl.icon" :size="14" :class="getColorText(tpl.color)" />
            <span>{{ tpl.title }}</span>
          </button>
        </div>
      </div>

      <!-- Form Body -->
      <div class="p-5 space-y-4 overflow-y-auto flex-1">
        
        <!-- Title & Category -->
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">事项名称 *</label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="例如：英语晨读、夜跑、吃降压药、不吃晚饭..."
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        <!-- Category & Type -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">事项分类</label>
            <select
              v-model="form.category"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="study">📚 学习跟读</option>
              <option value="fitness">🏃 运动锻炼</option>
              <option value="health">💊 健康用药</option>
              <option value="self_discipline">🛡️ 自律断舍离</option>
              <option value="work">💼 工作任务</option>
              <option value="life">🌱 日常生活</option>
              <option value="other">✨ 其他</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">任务模式</label>
            <select
              v-model="form.type"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="time_slot">🕒 固定时段 (如 08:00-08:30)</option>
              <option value="reminder_window">🔔 提醒窗口 (如 10:30 吃药)</option>
              <option value="quantified_log">📖 自由定量 (如 阅读/页数)</option>
              <option value="abstinence">🛡️ 自律戒断 (如 不吃晚饭)</option>
              <option value="check_only">✅ 常规一键打卡</option>
            </select>
          </div>
        </div>

        <!-- Conditional Time Fields -->
        <!-- 1. Time Slot -->
        <div v-if="form.type === 'time_slot'" class="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
          <div class="flex items-center space-x-1.5 text-xs text-sky-400 font-medium">
            <IconRenderer name="Clock" :size="14" />
            <span>设定执行时间段</span>
          </div>
          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <span class="text-[11px] text-slate-400 mb-1 block">开始时间</span>
              <input
                v-model="form.start_time"
                type="time"
                class="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <span class="text-[11px] text-slate-400 mb-1 block">结束时间</span>
              <input
                v-model="form.end_time"
                type="time"
                class="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        <!-- 2. Reminder Window (Medicine) -->
        <div v-else-if="form.type === 'reminder_window'" class="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
          <div class="flex items-center space-x-1.5 text-xs text-rose-400 font-medium">
            <IconRenderer name="Bell" :size="14" />
            <span>设定提醒与截止时间</span>
          </div>
          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <span class="text-[11px] text-slate-400 mb-1 block">提醒开始时间</span>
              <input
                v-model="form.start_time"
                type="time"
                placeholder="08:00"
                class="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <span class="text-[11px] text-slate-400 mb-1 block">目标完成时间</span>
              <input
                v-model="form.target_time"
                type="time"
                placeholder="10:30"
                class="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        <!-- 3. Quantified Log (Reading) -->
        <div v-else-if="form.type === 'quantified_log'" class="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
          <div class="flex items-center space-x-1.5 text-xs text-amber-400 font-medium">
            <IconRenderer name="BookOpen" :size="14" />
            <span>定量目标与自由记录 (不限制时间)</span>
          </div>
          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <span class="text-[11px] text-slate-400 mb-1 block">计量单位</span>
              <select
                v-model="form.target_metric"
                class="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="pages">页数 (阅读)</option>
                <option value="minutes">时长 (分钟)</option>
                <option value="count">次数</option>
              </select>
            </div>
            <div>
              <span class="text-[11px] text-slate-400 mb-1 block">每日建议目标</span>
              <input
                v-model.number="form.target_value"
                type="number"
                placeholder="例如: 20"
                class="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <!-- 4. Abstinence info -->
        <div v-else-if="form.type === 'abstinence'" class="bg-purple-950/30 p-3 rounded-xl border border-purple-800/40 text-xs text-purple-300 flex items-center space-x-2">
          <IconRenderer name="ShieldCheck" :size="16" class="text-purple-400 flex-shrink-0" />
          <span>自律模式：记录每天抵制诱惑、保持断食或清淡饮食等自律成就。</span>
        </div>

        <!-- Repeat Rules -->
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">重复周期</label>
          <div class="grid grid-cols-3 gap-2 mb-2.5">
            <button
              v-for="rt in repeatTypes"
              :key="rt.value"
              type="button"
              class="py-2 text-xs font-medium rounded-xl border transition-all"
              :class="[
                form.repeat_type === rt.value
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              ]"
              @click="form.repeat_type = rt.value"
            >
              {{ rt.label }}
            </button>
          </div>

          <!-- Custom Days Selector -->
          <div v-if="form.repeat_type === 'custom_days'" class="flex justify-between gap-1 mt-2">
            <button
              v-for="day in weekDaysList"
              :key="day.val"
              type="button"
              class="w-9 h-9 rounded-xl text-xs font-semibold flex items-center justify-center border transition-all"
              :class="[
                isDaySelected(day.val)
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              ]"
              @click="toggleCustomDay(day.val)"
            >
              {{ day.label }}
            </button>
          </div>
        </div>

        <!-- Color & Icon Picker -->
        <div class="grid grid-cols-2 gap-3">
          <!-- Color -->
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">主题色彩</label>
            <div class="flex gap-2 items-center flex-wrap">
              <button
                v-for="c in colorList"
                :key="c"
                type="button"
                class="w-6 h-6 rounded-full transition-transform"
                :class="[
                  getColorCircle(c),
                  form.color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-70 hover:opacity-100'
                ]"
                @click="form.color = c"
              />
            </div>
          </div>

          <!-- Icon Selector -->
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">图标</label>
            <div class="flex gap-1.5 flex-wrap">
              <button
                v-for="ic in iconList"
                :key="ic"
                type="button"
                class="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                :class="[
                  form.icon === ic
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/60'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                ]"
                @click="form.icon = ic"
              >
                <IconRenderer :name="ic" :size="15" />
              </button>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">描述 / 备忘 (可选)</label>
          <input
            v-model="form.description"
            type="text"
            placeholder="简要说明或打卡激励语..."
            class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

      </div>

      <!-- Action Footer -->
      <div class="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center space-x-3">
        <button
          v-if="isEditing"
          type="button"
          class="px-4 py-2.5 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-colors"
          @click="onDelete"
        >
          删除事项
        </button>
        <button
          type="button"
          class="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-98"
          @click="save"
        >
          {{ isEditing ? '保存修改' : '确认创建' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import IconRenderer from './IconRenderer.vue'

const props = defineProps<{
  isOpen: boolean
  habit?: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: any): void
  (e: 'delete', id: number): void
}>()

const isEditing = computed(() => !!props.habit?.id)

const colorList = ['emerald', 'sky', 'rose', 'amber', 'purple', 'indigo']
const iconList = ['Headphones', 'Activity', 'Flame', 'Pill', 'BookOpen', 'ShieldCheck', 'Moon', 'Sun', 'Coffee', 'Dumbbell', 'CalendarCheck']

const repeatTypes = [
  { label: '每天', value: 'daily' },
  { label: '工作日', value: 'weekdays' },
  { label: '自定义', value: 'custom_days' }
]

const weekDaysList = [
  { label: '一', val: 1 },
  { label: '二', val: 2 },
  { label: '三', val: 3 },
  { label: '四', val: 4 },
  { label: '五', val: 5 },
  { label: '六', val: 6 },
  { label: '日', val: 7 }
]

const templates = [
  {
    title: '英语跟读任务',
    category: 'study',
    type: 'time_slot',
    start_time: '08:00',
    end_time: '08:30',
    icon: 'Headphones',
    color: 'sky',
    description: '晨间跟读英语口语 30 分钟',
    repeat_type: 'daily'
  },
  {
    title: '晨跑任务',
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
    title: '早晨吃药',
    category: 'health',
    type: 'reminder_window',
    start_time: '08:00',
    target_time: '10:30',
    icon: 'Pill',
    color: 'rose',
    description: '08:00 起提醒，10:30 前完成服药',
    repeat_type: 'daily'
  },
  {
    title: '自由阅读',
    category: 'study',
    type: 'quantified_log',
    target_metric: 'pages',
    target_value: 20,
    icon: 'BookOpen',
    color: 'amber',
    description: '不限时间，记录书名、页数与阅读时长',
    repeat_type: 'daily'
  },
  {
    title: '今日不吃晚饭 (断食自律)',
    category: 'self_discipline',
    type: 'abstinence',
    icon: 'ShieldCheck',
    color: 'purple',
    description: '轻断食保持自律，今日不吃晚饭',
    repeat_type: 'daily'
  },
  {
    title: '不吃零食 / 不喝汽水',
    category: 'self_discipline',
    type: 'abstinence',
    icon: 'ShieldCheck',
    color: 'purple',
    description: '抵制高糖高热量零食与饮料',
    repeat_type: 'daily'
  }
]

const defaultForm = () => ({
  title: '',
  description: '',
  icon: 'CalendarCheck',
  color: 'emerald',
  category: 'other',
  type: 'check_only',
  start_time: '08:00',
  end_time: '08:30',
  target_time: '10:30',
  target_metric: 'pages',
  target_value: 20,
  repeat_type: 'daily',
  repeat_days: '1,2,3,4,5,6,7'
})

const form = ref(defaultForm())

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      if (props.habit) {
        form.value = {
          ...defaultForm(),
          ...props.habit
        }
      } else {
        form.value = defaultForm()
      }
    }
  }
)

const applyTemplate = (tpl: any) => {
  form.value = {
    ...form.value,
    ...tpl
  }
}

const isDaySelected = (dayVal: number) => {
  const days = (form.value.repeat_days || '').split(',').map(d => d.trim())
  return days.includes(String(dayVal))
}

const toggleCustomDay = (dayVal: number) => {
  let days = (form.value.repeat_days || '').split(',').map(d => d.trim()).filter(Boolean)
  const strVal = String(dayVal)
  if (days.includes(strVal)) {
    days = days.filter(d => d !== strVal)
  } else {
    days.push(strVal)
    days.sort((a, b) => Number(a) - Number(b))
  }
  form.value.repeat_days = days.join(',')
}

const getColorCircle = (color: string) => {
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

const close = () => {
  emit('close')
}

const save = () => {
  if (!form.value.title || !form.value.title.trim()) {
    alert('请输入事项名称')
    return
  }
  emit('save', form.value)
  close()
}

const onDelete = () => {
  if (props.habit?.id && confirm(`确定要删除事项 "${props.habit.title}" 吗？历史打卡记录也会被清理。`)) {
    emit('delete', props.habit.id)
    close()
  }
}
</script>
