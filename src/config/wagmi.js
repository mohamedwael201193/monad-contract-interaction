import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { WagmiProvider } from 'wagmi'
import { arbitrum, mainnet, polygon, sepolia, bsc, avalanche } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = 'e3b01d837d72bbda3bdc06a8204389be' // You'll need to get this from WalletConnect Cloud

// 2. Define Monad Testnet chain
const monadTestnet = {
  id: 41454, // Replace with actual Monad Testnet chain ID
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    public: { http: ['https://testnet-rpc.monad.xyz'] }, // Replace with actual RPC
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet-explorer.monad.xyz' }, // Replace with actual explorer
  },
}

// 3. Create modal config
const metadata = {
  name: 'Monad Contract Interaction',
  description: 'Interact with 100 smart contracts on Monad Testnet',
  url: 'https://monad-contract-interaction.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// 4. Create Wagmi config
const chains = [monadTestnet, mainnet, arbitrum, polygon, sepolia, bsc, avalanche]
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
})

// 5. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true // Optional - false as default
})

export { config, queryClient }

