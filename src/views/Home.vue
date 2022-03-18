<template>
  <div>
    <ConfigPane />
    <div v-if="!wallet" class="text-center connect-wallet-text">Pls connect (burner) wallet</div>
    <div v-else>
      <!--farm address-->
      <div class="nes-container with-title mb-10">
        <p class="form-title">Connect to a Farm</p>
        <div class="nes-field mb-7">
          <label for="farm">Farm address:</label>
          <input id="farm" class="farm-input mb-2" v-model="farm" />
        </div>
      </div>

      <div v-if="farmerAcc">
        <FarmerDisplay
            :key="farmerAcc"
            :farm="farm"
            :farmAcc="farmAcc"
            :farmer="farmer"
            :farmerAcc="farmerAcc"
            class="mb-10"
            @refresh-farmer="handleRefreshFarmer"
        />
        <Vault
            :key="farmerAcc"
            class="mb-10"
            :vault="farmerAcc.vault.toBase58()"
            @selected-wallet-nft="handleNewSelectedNFT"
        >
          <button
              v-if="farmerState === 'staked' && selectedNFTs.length > 0"
              class="nes-btn is-primary mr-5"
              @click="addGems"
          >
            Add Gems (resets staking)
          </button>
          <button
              v-if="farmerState === 'unstaked'"
              class="nes-btn is-success mr-5"
              @click="beginStaking"
          >
            Begin staking
          </button>
          <button
              v-if="farmerState === 'staked'"
              class="nes-btn is-error mr-5"
              @click="endStaking"
          >
            End staking
          </button>
          <button
              v-if="farmerState === 'pendingCooldown'"
              class="nes-btn is-error mr-5"
              @click="endStaking"
          >
            End cooldown
          </button>
          <button class="nes-btn is-warning" @click="claim">
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
    <div class="farmer">
      <div class="farmer-wallet-wrapper">
        <button class="farmer-wallet">Connect Wallet</button>
      </div>
      <div class="farmer-stake-wrapper">
        <div class="farmer-stake">
          <div class="farmer-stake-title">Send your God's into Meditation</div>
          <button class="farmer-stake-button">Stake</button>
          <div class="farmer-stake-cards">
            <div class="farmer-stake-card"></div>
            <div class="farmer-stake-card"></div>
            <div class="farmer-stake-card"></div>
          </div>
          <div class="farmer-stake-buttons">
            <button class="farmer-stake-buttons-item">Claim</button>
            <button class="farmer-stake-buttons-item">Claim and Unstake</button>
          </div>
        </div>
        <div class="farmer-stake">
          <div class="farmer-stake-title">Send your Fractures into Meditation</div>
          <button class="farmer-stake-button">Stake</button>
          <div class="farmer-stake-cards">
            <div class="farmer-stake-card"></div>
            <div class="farmer-stake-card"></div>
            <div class="farmer-stake-card"></div>
          </div>
          <div class="farmer-stake-buttons">
            <button class="farmer-stake-buttons-item">Claim</button>
            <button class="farmer-stake-buttons-item">Claim and Unstake</button>
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
  setup() {
    const { wallet, getWallet } = useWallet();
    const { cluster, getConnection } = useCluster();

    let gf: any;
    watch([wallet, cluster], async () => {
      await freshStart();
    });

    //needed in case we switch in from another window
    onMounted(async () => {
      await freshStart();
    });

    // --------------------------------------- farmer details
    const farm = ref<string>();
    const farmAcc = ref<any>();

    const farmerIdentity = ref<string>();
    const farmerAcc = ref<any>();
    const farmerState = ref<string>();

    const availableA = ref<string>();
    const availableB = ref<string>();

    //auto loading for when farm changes
    watch(farm, async () => {
      await freshStart();
    });

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
      await gf.stakeWallet(new PublicKey(farm.value!));
      await fetchFarmer();
      selectedNFTs.value = [];
    };

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
    };
  },
});
</script>

<style scoped>
.farmer {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.farmer-wallet-wrapper {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.farmer-wallet {
  color: white;
  padding: 5px 10px;
  border: 1px solid white;
  box-shadow: 0 0 5px white;
  background: transparent;
  border-radius: 5px;
  font-family: 'Roboto', sans-serif;
  font-size: 18px;
  font-weight: 500;
}
.farmer-title {
  text-align: center;
  color: white;
  font-size: 58px;
  font-weight: bold;
  margin-top: 25px;
  font-family: 'Nanum Myeongjo', serif;
}
.farmer-stake-wrapper {
  display: flex;
}
.farmer-stake {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
}
.farmer-stake:first-child {
  margin-right: 50px;
}
.farmer-stake-cards {
  display: flex;
  align-items: center;
}
.farmer-stake-card {
  width: 120px;
  height: 120px;
  border: 3px solid white;
  margin: 0 15px;
}
.farmer-stake-title {
  color: white;
  text-align: center;
  font-family: 'Nanum Myeongjo', serif;
  font-size: 30px;
}
.farmer-stake-button {
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
.farmer-stake-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 100px;
  width: 100%;
  padding: 0 20px;
}
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
.form-title {
  font-family: 'Nanum Myeongjo', serif;
  font-size: 24px;
  margin-bottom: 15px;
}
.farm-input {
  height: 45px;
  width: 100%;

}
.connect-wallet-text {
  font-size: 18px;
}
</style>
