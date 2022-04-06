<template>
  <div class="flex justify-center mb-10">
    <div class="nes-select is-dark flex-1">
      <select required id="wallet" v-model="chosenWallet">
        <option class="text-gray-500" :value="null">Choose wallet..</option>
        <option :value="WalletName.Phantom">Phantom</option>
        <option :value="WalletName.Sollet">Sollet</option>
        <option :value="WalletName.SolletExtension">Sollet Extension</option>
        <option :value="WalletName.Solflare">Solflare</option>
        <option :value="WalletName.SolflareWeb">Solflare Web</option>
      </select>
    </div>
    <div class="nes-select is-dark flex-1">
      <select required id="cluster" v-model="selectedFarm" @change="selectedFarm && $emit('update-farm-address', selectedFarm)">
        <option class="text-gray-500" :value="null">Choose farm..</option>
        <option v-for="item in farms" :key="item.title" :value="item">
          {{ item.title }}
        </option>
      </select>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, onMounted, ref} from 'vue';
import { WalletName } from '@solana/wallet-adapter-wallets';
import useCluster, { Cluster } from '@/composables/cluster';
import useWallet from '@/composables/wallet';

export default defineComponent({
  props: {
    farm_address: {
      type: Object,
      default: () => {
        return {}
      },
    }
  },
  setup() {
    // cluster
    const { cluster, setCluster, getClusterURL } = useCluster();
    const chosenCluster = computed({
      get() {
        return cluster.value;
      },
      set(newVal: Cluster) {
        setCluster(newVal);
      },
    });

    onMounted( () => {
      setCluster(Cluster.Mainnet)
    });

    // wallet
    const { getWalletName, setWallet } = useWallet();
    const chosenWallet = computed({
      get() {
        return getWalletName();
      },
      set(newVal: WalletName | null) {
        setWallet(newVal, getClusterURL());
      },
    });

    const selectedFarm = ref<object | null>(null)

    const farms = [
      {
        title: 'SOLGods',
        id: 'H64UEArwk4uRW6KQDEaeFuxjsyZ1uDX3ZH41cY63Xo4H'
      },
      {
        title: 'The Fracture',
        id: '8YaDn4xzVizh4zS9Mm9uo2nxwXcRvPKtn2k7rWvMdGYp'
      }
    ]

    return {
      Cluster,
      chosenCluster,
      WalletName,
      chosenWallet,
      selectedFarm,
      farms
    };
  },
});
</script>

<style scoped>
.nes-select:first-child {
  margin-right: 20px;
}
.nes-select select {
  border-image-source: unset !important;
  border: 1px solid white;
}
.nes-select:after {
  width: 0;
  height: 0;
  box-shadow: unset !important;

  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 20px solid white;
  transform: rotateX(30deg);
  top: calc(50% - 10px);
  right: 20px;
}
</style>
