<script setup>
import logoBlue from '../assets/logo-blue.png';
import PageSectionHeader from './PageSectionHeader.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  iconSrc: {
    type: String,
    required: false,
    default: '',
  },
  icon: {
    type: String,
    required: false,
    default: '',
  },
});
</script>

<template>
  <div class="page-header">
    <!-- <div class="page-icon-container">
      <img v-if="iconSrc" :src="iconSrc" alt="" class="page-icon-image">
      <i v-else-if="icon.startsWith('fi ')" :class="icon" class="page-icon" aria-hidden="true" />
      <v-icon v-else :icon="icon" size="48" />
    </div> -->
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

.page-icon-container {
  display: inline-block;
  justify-content: left;
  align-items: center;
  border: 1px solid var(--ef-border);
  border-radius: var(--border-radius);
  padding: 8px;
}

.page-icon {
  font-size: 48px;
  line-height: 1;
  color: var(--ef-secondary);
}

.page-icon-image {
  width: 48px;
  height: 48px;
  object-fit: contain;
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
