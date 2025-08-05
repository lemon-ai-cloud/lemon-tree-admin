<template>
  <div class="page-header lemon-theme">
    <div class="header-content">
      <div class="header-left">
        <component :is="icon" class="header-icon" />
        <div>
          <a-typography-title :level="titleLevel" class="header-title">
            {{ title }}
          </a-typography-title>
          <a-typography-text class="header-subtitle">
            {{ subtitle }}
          </a-typography-text>
        </div>
      </div>
      <div class="header-actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  subtitle: string
  icon: any
  titleLevel?: 1 | 2 | 3 | 4 | 5
}

withDefaults(defineProps<Props>(), {
  titleLevel: 2
})
</script>

<style scoped lang="scss">
@use '@/styles/theme' as *;

.page-header {
  margin-bottom: 20px;
  background: #F5F5F5;
  padding: 16px 20px;
  border-radius: 6px;
  border: 1px solid #F0F0F0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 24px;
  color: #5ab067;
}

.header-title {
  margin-bottom: 2px !important;
  color: #333333 !important;
  font-size: 18px !important;
}

.header-subtitle {
  color: #666666;
  font-size: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    padding: 12px 16px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style> 