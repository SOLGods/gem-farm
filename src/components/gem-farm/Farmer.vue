<template>
  <div>
    <video ref="video" class="background-video" muted loop>
      <template v-if="isMobile">
        <source src="../../../public/videos/bottom_ver.webm" type='video/webm'>
        <source src="../../../public/videos/bottom_ver.mp4" type='video/mp4'>
      </template>
      <template v-else>
        <source src="../../../public/videos/bottom_hor.webm" type='video/webm'>
        <source src="../../../public/videos/bottom_hor.mp4" type='video/mp4'>
      </template>
    </video>
    <div class="farmer-content">
      <ConfigPane :farm_address="farm_address" @update-farm-address="$emit('update-farm-address', $event)" />
      <div v-if="!wallet" class="text-center connect-wallet-text">Connect wallet</div>
      <div v-else>
        <div v-if="farmerAcc">
          <Vault :key="farmerAcc" class="mb-10" :vault="farmerAcc.vault.toBase58()" @selected-wallet-nft="handleNewSelectedNFT">
            <button v-if="farmerState === 'staked' && selectedNFTs.length > 0" class="app-btn is-primary mr-5" @click="addGems">
              Add Gems (resets staking)
            </button>
            <button v-if="farmerState === 'unstaked'" class="app-btn is-success mr-5" @click="beginStaking">
              Begin staking
            </button>
            <button v-if="farmerState === 'staked'" class="app-btn is-error mr-5" @click="endStaking">
              End staking
            </button>
            <button v-if="farmerState === 'pendingCooldown'" class="app-btn is-error mr-5" @click="endStaking">
              End cooldown
            </button>
            <button class="app-btn is-warning" @click="claim">
              Claim {{ availableA }} A / {{ availableB }} B
            </button>
          </Vault>
        </div>
        <div v-else>
          <div class="w-full text-center mb-5 connect-wallet-text">
            Farmer account not found :( Create a new one?
          </div>
          <div class="w-full text-center">
            <button class="farmer-stake-buttons-item" @click="initFarmer">New Farmer</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, onMounted, ref, watch } from 'vue';
import useWallet from '@/composables/wallet';
import useCluster from '@/composables/cluster';
import { initGemFarm } from '@/common/gem-farm';
import { PublicKey } from '@solana/web3.js';
import ConfigPane from '@/components/ConfigPane.vue';
import FarmerDisplay from '@/components/gem-farm/FarmerDisplay.vue';
import Vault from '@/components/gem-bank/Vault.vue';
import { INFT } from '@/common/web3/NFTget';
import { findFarmerPDA, stringifyPKsAndBNs } from '@gemworks/gem-farm-ts';

export default defineComponent({
  components: { Vault, FarmerDisplay, ConfigPane },
  props: {
    farm_address: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  setup(props) {
    const { wallet, getWallet } = useWallet();
    const { cluster, getConnection } = useCluster();

    let gf: any;
    watch([wallet, cluster], async () => {
      await freshStart();
    });

    watch(() => props.farm_address, (value) => {
      farm.value = props.farm_address.id
    });

    //needed in case we switch in from another window
    onMounted(async () => {
      farm.value = props.farm_address.id
      await freshStart();
      updateVideoFiles()
      window.addEventListener('resize', () => {
        updateVideoFiles()
      });
    });

    // --------------------------------------- farmer details
    const isMobile = ref<boolean>();
    const farm = ref<string>();
    const farmAcc = ref<any>();
    const video = ref<any>();

    const farmerIdentity = ref<string>();
    const farmerAcc = ref<any>();
    const farmerState = ref<string>();

    const availableA = ref<string>();
    const availableB = ref<string>();

    //auto loading for when farm changes
    watch(farm, async () => {
      await freshStart();
    });

    const updateVideoFiles = () => {
      isMobile.value = document.documentElement.clientWidth <= 767
    };

    const updateAvailableRewards = async () => {
      availableA.value = farmerAcc.value.rewardA.accruedReward
          .sub(farmerAcc.value.rewardA.paidOutReward)
          .toString();
      availableB.value = farmerAcc.value.rewardB.accruedReward
          .sub(farmerAcc.value.rewardB.paidOutReward)
          .toString();
    };

    const fetchFarn = async () => {
      farmAcc.value = await gf.fetchFarmAcc(new PublicKey(farm.value!));
      console.log(
          `farm found at ${farm.value}:`,
          stringifyPKsAndBNs(farmAcc.value)
      );
    };

    const fetchFarmer = async () => {
      const [farmerPDA] = await findFarmerPDA(
          new PublicKey(farm.value!),
          getWallet()!.publicKey!
      );
      farmerIdentity.value = getWallet()!.publicKey?.toBase58();
      farmerAcc.value = await gf.fetchFarmerAcc(farmerPDA);
      farmerState.value = gf.parseFarmerState(farmerAcc.value);
      await updateAvailableRewards();
      console.log(
          `farmer found at ${farmerIdentity.value}:`,
          stringifyPKsAndBNs(farmerAcc.value)
      );
    };

    const freshStart = async () => {
      if (getWallet() && getConnection()) {
        gf = await initGemFarm(getConnection(), getWallet()!);
        farmerIdentity.value = getWallet()!.publicKey?.toBase58();

        //reset stuff
        farmAcc.value = undefined;
        farmerAcc.value = undefined;
        farmerState.value = undefined;
        availableA.value = undefined;
        availableB.value = undefined;

        try {
          await fetchFarn();
          await fetchFarmer();
        } catch (e) {
          console.log(`farm with PK ${farm.value} not found :(`);
        }
      }
    };

    const initFarmer = async () => {
      await gf.initFarmerWallet(new PublicKey(farm.value!));
      await fetchFarmer();
    };

    // --------------------------------------- staking
    const beginStaking = async () => {
      try {
        await gf.stakeWallet(new PublicKey(farm.value!));
        playVideo()
        await fetchFarmer();
        selectedNFTs.value = [];
      } catch (error) {
        playVideo()
      }
    };

    const playVideo = () => {
      video.value.style.opacity = '1'
      video.value.play()
      // video.value.onended = () => {
      //   video.value.style.opacity = '0'
      // };
    }

    const endStaking = async () => {
      await gf.unstakeWallet(new PublicKey(farm.value!));
      await fetchFarmer();
      selectedNFTs.value = [];
    };

    const claim = async () => {
      await gf.claimWallet(
          new PublicKey(farm.value!),
          new PublicKey(farmAcc.value.rewardA.rewardMint!),
          new PublicKey(farmAcc.value.rewardB.rewardMint!)
      );
      await fetchFarmer();
    };

    const handleRefreshFarmer = async () => {
      await fetchFarmer();
    };

    // --------------------------------------- adding extra gem
    const selectedNFTs = ref<INFT[]>([]);

    const handleNewSelectedNFT = (newSelectedNFTs: INFT[]) => {
      console.log(`selected ${newSelectedNFTs.length} NFTs`);
      selectedNFTs.value = newSelectedNFTs;
    };

    const addSingleGem = async (
        gemMint: PublicKey,
        gemSource: PublicKey,
        creator: PublicKey
    ) => {
      await gf.flashDepositWallet(
          new PublicKey(farm.value!),
          '1',
          gemMint,
          gemSource,
          creator
      );
      await fetchFarmer();
    };

    const addGems = async () => {
      await Promise.all(
          selectedNFTs.value.map((nft) => {
            const creator = new PublicKey(
                //todo currently simply taking the 1st creator
                (nft.onchainMetadata as any).data.creators[0].address
            );
            console.log('creator is', creator.toBase58());

            addSingleGem(nft.mint, nft.pubkey!, creator);
          })
      );
      console.log(
          `added another ${selectedNFTs.value.length} gems into staking vault`
      );
    };

    return {
      wallet,
      farm,
      farmAcc,
      farmer: farmerIdentity,
      farmerAcc,
      farmerState,
      availableA,
      availableB,
      initFarmer,
      beginStaking,
      endStaking,
      claim,
      handleRefreshFarmer,
      selectedNFTs,
      handleNewSelectedNFT,
      addGems,
      video,
      isMobile
    };
  },
});
</script>

<style scoped>
.farmer-stake-buttons-item {
  color: white;
  padding: 5px 15px;
  border: 1px solid white;
  box-shadow: 0 0 5px white;
  background: transparent;
  border-radius: 10px;
  margin: 30px 0 50px;
  font-family: 'Roboto', sans-serif;
  font-size: 20px;
  font-weight: 500;
}
.connect-wallet-text {
  font-size: 18px;
}
.farm-input {
  height: 45px;
  width: 100%;
  background: #212529;
  outline: 0;
  padding: 0 15px;
}
.background-video {
  position: absolute;
  right: 0;
  bottom: 0;
  min-width: 100%;
  min-height: 100%;
  z-index: 0;
  object-fit: cover;
  opacity: 0;
  transition: opacity .5s ease;
}
.farmer-content {
  position: relative;
  z-index: 1;
}
</style>
