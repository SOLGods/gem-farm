<template>
  <Farmer :farm_address="farm_address" @update-farm-address="updateFarm" />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Farmer from '@/components/gem-farm/Farmer.vue';

export default defineComponent({
  components: { Farmer },
  setup() {
    const farm_address = ref<object>();

    const updateFarm = (farm: object) => {
      farm_address.value = farm
    }

    return {
      farm_address,
      updateFarm
    };
  },
});
</script>