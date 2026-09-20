<template>
  <component :is="resolvedIcon" :size="size" :class="customClass" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import * as icons from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    name: string
    size?: number | string
    customClass?: string
  }>(),
  {
    size: 20,
    customClass: ''
  }
)

const resolvedIcon = computed(() => {
  const iconName = props.name || 'Calendar'
  // Lucide exports icons in PascalCase
  const match = (icons as any)[iconName] || (icons as any)[iconName.charAt(0).toUpperCase() + iconName.slice(1)] || icons.Calendar
  return match
})
</script>
