<template>
  <Farmer :farm_address="farm_address" />
</template>

<!--<script lang="ts">-->
<!--import Farmer from '@/components/gem-farm/Farmer.vue';-->

<!--export default {-->
<!--  components: { Farmer },-->
<!--};-->
<!--</script>-->

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Farmer from '@/components/gem-farm/Farmer.vue';

export default defineComponent({
  components: { Farmer },
  setup() {
    const farm_address = ref<string>();
    farm_address.value = 'ApDCPDJvc9rHRXGFoYHn44ZvNkQo6LqK7VeW4n8Rjy2p'

    return {
      farm_address,
    };
  },
});
</script>