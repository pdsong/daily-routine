<template>
  <div class="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col justify-between max-w-md mx-auto relative border-x border-white/[0.04] shadow-2xl overflow-x-hidden selection:bg-emerald-500/20">
    
    <!-- Ambient subtle fluid glow in background -->
    <div class="fixed top-0 left-1/2 -translate-x-1/2 w-[480px] h-72 bg-gradient-to-b from-emerald-500/5 via-teal-500/[0.02] to-transparent blur-3xl pointer-events-none -z-10" />
    <div class="fixed bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-64 bg-gradient-to-t from-sky-500/[0.03] to-transparent blur-3xl pointer-events-none -z-10" />

    <!-- Top safe spacing -->
    <div class="h-[env(safe-area-inset-top,0px)]" />

    <!-- Main Content Area -->
    <main class="flex-1 pb-28 px-4 pt-3">
      <slot />
    </main>

    <!-- Bottom Navigation Bar -->
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import BottomNav from '~/components/BottomNav.vue'
</script>
