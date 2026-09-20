<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between max-w-md mx-auto relative shadow-2xl border-x border-slate-900">
    <!-- Top safe spacing -->
    <div class="h-[env(safe-area-inset-top,0px)] bg-slate-950" />

    <!-- Main Content Area -->
    <main class="flex-1 pb-24 px-4 pt-3">
      <slot />
    </main>

    <!-- Bottom Navigation Bar -->
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import BottomNav from '~/components/BottomNav.vue'
</script>
