<template>
  <div class="nes-container with-title">
    <p class="title">{{ title }}</p>
    <slot />
    <div class="flex flex-wrap">
      <NFTCard
        v-for="nft in nfts"
        :key="nft"
        :nft="nft"
        @selected="handleSelected"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NFTCard from '@/components/gem-bank/NFTCard.vue';

export default defineComponent({
  components: { NFTCard },
  emits: ['selected'],
  props: {
    title: String,
    nfts: Array,
  },
  setup(props, ctx) {
    const handleSelected = (e: any) => {
      ctx.emit('selected', e);
    };
    return {
      handleSelected,
    };
  },
});
</script>

<style scoped>
.nes-container {
  position: relative;
  padding: 0 !important;
  background-color: transparent !important;
}
.title {
  position: absolute !important;
  top: -60px;
  left: 0;
}
@media (max-width: 767px) {
  .title {
    top: -84px;
  }
}
</style>
