<template>
  <section class="app-section">
    <div class="app-section__header">
      <div class="app-section__title-group">
        <h2 class="app-section__title">{{ title }}</h2>
        <p v-if="caption" class="app-section__caption">{{ caption }}</p>
      </div>

      <slot name="action">
        <button v-if="actionLabel" class="app-section__action" type="button" @click="emit('action')">
          {{ actionLabel }}
        </button>
      </slot>
    </div>

    <div class="app-section__content">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    default: '',
  },
  actionLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['action'])
</script>
