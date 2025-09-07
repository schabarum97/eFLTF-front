<template>
  <q-item
    clickable
    :to="link"
    @click="$emit('click')"
    tag="router-link"
  >
    <q-item-section v-if="icon" avatar class="q-ml-none">
      <q-icon :name="icon" size="28px" class="text-primary" />
    </q-item-section>

    <q-item-section>
      <q-item-label class="text-weight-medium">{{ title }}</q-item-label>
      <q-item-label caption v-if="caption" class="text-grey">{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
defineOptions({ name: 'EssentialLink' })

const props = defineProps({
  title: { type: String, required: true },
  caption: { type: String, default: '' },
  link: { type: String, default: '#' },
  icon: { type: String, default: '' }
})
</script>

<style scoped>
.essential-link {
  transition: background-color 0.2s, transform 0.1s;
  border-radius: 8px;
}

.essential-link:hover {
  background-color: #f5f5f5;
  transform: translateX(3px);
}

.essential-link--active {
  background-color: #e0e0e0;
}
</style>
