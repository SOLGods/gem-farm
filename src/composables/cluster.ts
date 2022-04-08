import { readonly, ref } from 'vue';
import { Commitment, Connection } from '@solana/web3.js';

export enum Cluster {
  Mainnet = 'mainnet',
  Devnet = 'devnet',
  Testnet = 'testnet',
  Localnet = 'localnet',
}

const clusterURLMapping = {
  mainnet: process.env.VUE_APP_MAINNET_URL || 'https://bold-hidden-water.solana-mainnet.quiknode.pro/b94f8c6fb6f26fa29792c5304fcea87dd9cfddaa/',
  devnet: process.env.VUE_APP_DEVNET_URL || 'https://api.devnet.solana.com',
  testnet: process.env.VUE_APP_TESTNET_URL || 'https://api.testnet.solana.com',
  localnet: process.env.VUE_APP_LOCALNET_URL || 'http://localhost:8899',
};

const cluster = ref<Cluster>(Cluster.Mainnet);

export default function useCluster() {
  const getClusterURL = (): string => clusterURLMapping[Cluster.Mainnet];

  const getConnection = (committment?: Commitment): Connection =>
    new Connection(getClusterURL(), committment ?? 'processed');
  const setCluster = (newCluster: Cluster) => {
    cluster.value = Cluster.Mainnet;
    // capping at 20 chars due to security (not to expose the token)
    console.log(
      `Cluster updated,  now ${newCluster} (${getClusterURL().substr(0, 20)})`
    );
  };
  return {
    cluster: readonly(cluster),
    getClusterURL,
    getConnection,
    setCluster,
  };
}
