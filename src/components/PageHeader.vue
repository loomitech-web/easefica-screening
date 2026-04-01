<script setup>
import logoBlue from '../assets/logo-blue.png';
import PageSectionHeader from './PageSectionHeader.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="page-header">
    <div class="logo-container">
      <img :src="logoBlue" alt="Easefica Logo" class="logo">
    </div>
    <div class="pageSectionHeaderContainer">
      <PageSectionHeader :title="title" />
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 12px;
}

.pageSectionHeaderContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
}

.logo {
  width: 160px;
  max-width: 100%;
}

@media (max-width: 960px) {
  .pageSectionHeaderContainer {
    margin-bottom: 12px;
  }

  .logo {
    width: 132px;
  }
}
</style>
