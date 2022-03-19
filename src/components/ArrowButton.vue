<template>
  <button class="arrow" :disabled="disabled" :class="{ left: left, disabled: disabled }"></button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  props: {
    left: Boolean,
    disabled: Boolean,
  },
  setup() {
    return {};
  },
});
</script>

<style scoped>
button {
  outline: none !important;
  width: 0;
  height: 0;
  border-top: 20px solid transparent;
  border-bottom: 20px solid transparent;
  border-left: 20px solid white;
}

.left {
  transform: scaleX(-1);
}
.disabled {
  opacity: 0;
}
</style>
