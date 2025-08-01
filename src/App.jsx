import { useState, useCallback, useEffect, useRef } from 'react'
import { useAccount, useConnect, useDisconnect, useWalletClient, usePublicClient } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { Contract } from 'ethers'
import { BrowserProvider } from 'ethers'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Loader2, CheckCircle, XCircle, AlertCircle, Wallet, WifiOff } from 'lucide-react'
import './App.css'

// Sample contract addresses for Monad Testnet (100 contracts)
const CONTRACT_ADDRESSES = [
  '0x1234567890123456789012345678901234567890',
  '0x2234567890123456789012345678901234567891',
  '0x3234567890123456789012345678901234567892',
  '0x4234567890123456789012345678901234567893',
  '0x5234567890123456789012345678901234567894',
  '0x6234567890123456789012345678901234567895',
  '0x7234567890123456789012345678901234567896',
  '0x8234567890123456789012345678901234567897',
  '0x9234567890123456789012345678901234567898',
  '0xa234567890123456789012345678901234567899',
  // Generate remaining 90 addresses programmatically
  ...Array.from({ length: 90 }, (_, i) => {
    const num = (i + 11).toString(16).padStart(2, '0')
    return `0x${num}34567890123456789012345678901234567${num.slice(-2)}`
  })
]

// Simple ABI for interact() method
const CONTRACT_ABI = [
  {
    name: 'interact',
    type: 'function',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable'
  }
]

function App() {
  const { address, isConnected, chain } = useAccount()
  const { open } = useWeb3Modal()
  const { disconnect } = useDisconnect()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  const [isInteracting, setIsInteracting] = useState(false)
  const [currentContract, setCurrentContract] = useState(0)
  const [completedContracts, setCompletedContracts] = useState(0)
  const [failedContracts, setFailedContracts] = useState(0)
  const [interactions, setInteractions] = useState([])
  
  // Use ref to track if interaction should continue
  const shouldContinueRef = useRef(false)

  // Add interaction result to the list
  const addInteractionResult = useCallback((contractIndex, address, status, error = null) => {
    setInteractions(prev => [{
      id: Date.now() + Math.random(),
      contractIndex: contractIndex + 1,
      address,
      status,
      error,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev.slice(0, 19)]) // Keep only last 20 results
  }, [])

  // Interact with a single contract
  const interactWithContract = useCallback(async (contractAddress, contractIndex) => {
    try {
      console.log(`Attempting to interact with contract ${contractIndex + 1}: ${contractAddress}`)
      if (!walletClient) {
        console.error('interactWithContract: walletClient is null or undefined')
        throw new Error('Wallet client not available')
      }
      if (!publicClient) {
        console.error('interactWithContract: publicClient is null or undefined')
        throw new Error('Public client not available')
      }

      // Create ethers provider from wagmi clients
      const provider = new BrowserProvider(walletClient)
      const signer = await provider.getSigner()
      console.log('Signer obtained:', signer.address)
      
      const contract = new Contract(contractAddress, CONTRACT_ABI, signer)
      console.log('Contract instance created:', contract)
      
      // Call the interact() method
      console.log('Calling interact() method...')
      const tx = await contract.interact()
      console.log('Transaction sent:', tx.hash)
      
      // Wait for transaction confirmation
      console.log('Waiting for transaction confirmation...')
      const receipt = await tx.wait()
      console.log('Transaction receipt:', receipt)
      
      if (receipt.status === 1) {
        addInteractionResult(contractIndex, contractAddress, 'success')
        setCompletedContracts(prev => prev + 1)
        return true
      } else {
        addInteractionResult(contractIndex, contractAddress, 'failed', 'Transaction failed')
        setFailedContracts(prev => prev + 1)
        return false
      }
    } catch (error) {
      console.error(`Error interacting with contract ${contractIndex + 1}:`, error)
      addInteractionResult(contractIndex, contractAddress, 'failed', error.message)
      setFailedContracts(prev => prev + 1)
      return false
    }
  }, [walletClient, publicClient, addInteractionResult])

  // Start interaction with all contracts
  const startInteraction = useCallback(async () => {
    if (!isConnected) {
      open()
      return
    }

    if (chain?.id !== 10143) {
      console.error('startInteraction: Connected to wrong network. Expected Monad Testnet (Chain ID 10143), but got:', chain?.id)
      addInteractionResult(0, 'N/A', 'failed', `Wrong network. Please switch to Monad Testnet (Chain ID 10143). Current: ${chain?.name || 'Unknown'}`)
      return
    }

    try {
      setIsInteracting(true)
      shouldContinueRef.current = true
      setCurrentContract(0)
      setCompletedContracts(0)
      setFailedContracts(0)
      setInteractions([])
      console.log('Starting interaction process...')

      // Interact with each contract sequentially
      for (let i = 0; i < CONTRACT_ADDRESSES.length; i++) {
        if (!shouldContinueRef.current) {
          console.log('Interaction stopped by user.')
          break // Allow stopping
        }

        setCurrentContract(i + 1)
        
        const success = await interactWithContract(CONTRACT_ADDRESSES[i], i)
        console.log(`Interaction with contract ${i + 1} was: ${success ? 'Successful' : 'Failed'}`)
        
        // Add delay to avoid rate limits (1 second between interactions)
        if (i < CONTRACT_ADDRESSES.length - 1 && shouldContinueRef.current) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      console.log('Interaction process completed.')
    } catch (error) {
      console.error('Failed to start interactions:', error)
      addInteractionResult(0, 'N/A', 'failed', `Interaction failed: ${error.message}`)
    } finally {
      setIsInteracting(false)
      shouldContinueRef.current = false
      setCurrentContract(0)
    }
  }, [isConnected, open, interactWithContract, addInteractionResult, chain])

  // Stop interaction
  const stopInteraction = useCallback(() => {
    console.log('Stop interaction requested by user')
    shouldContinueRef.current = false
    setIsInteracting(false)
  }, [])

  const progressPercentage = (currentContract / CONTRACT_ADDRESSES.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800">
            Monad Testnet Contract Interaction
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Interact with 100 smart contracts sequentially
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Wallet Connection Section */}
          <div className="flex justify-center space-x-4">
            {!isConnected ? (
              <Button 
                onClick={() => open()}
                size="lg"
                className="px-6 py-3 text-lg font-semibold"
                variant="outline"
              >
                <Wallet className="mr-2 h-5 w-5" />
                Connect Wallet
              </Button>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700">Connected</div>
                  <div className="text-xs text-gray-500 truncate max-w-32">
                    {address}
                  </div>
                  <div className="text-xs text-blue-600">
                    {chain?.name || 'Unknown Network'}
                  </div>
                </div>
                <Button 
                  onClick={() => disconnect()}
                  size="sm"
                  variant="outline"
                >
                  <WifiOff className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
              </div>
            )}
          </div>

          {/* Main Action Button */}
          <div className="flex justify-center">
            {!isInteracting ? (
              <Button 
                onClick={startInteraction}
                size="lg"
                className="px-8 py-4 text-lg font-semibold"
                disabled={!isConnected}
              >
                {!isConnected ? (
                  <>
                    <Wallet className="mr-2 h-5 w-5" />
                    Connect Wallet to Start
                  </>
                ) : (
                  'Start Interaction with 100 Different Contracts'
                )}
              </Button>
            ) : (
              <Button 
                onClick={stopInteraction}
                variant="destructive"
                size="lg"
                className="px-8 py-4 text-lg font-semibold"
              >
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Stop Interaction
              </Button>
            )}
          </div>

          {/* Progress Section */}
          {(isInteracting || completedContracts > 0) && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {isInteracting ? `Contract ${currentContract}/100` : 'Completed'}
                </div>
                <Progress value={progressPercentage} className="mt-2" />
                <div className="text-sm text-gray-600 mt-1">
                  {Math.round(progressPercentage)}% Complete
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{completedContracts}</div>
                  <div className="text-sm text-gray-600">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{failedContracts}</div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{completedContracts + failedContracts}</div>
                  <div className="text-sm text-gray-600">Total Processed</div>
                </div>
              </div>
            </div>
          )}

          {/* Real-time Feedback */}
          {interactions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">Recent Interactions</h3>
              <div className="max-h-64 overflow-y-auto space-y-2 bg-gray-50 p-4 rounded-lg">
                {interactions.map((interaction) => (
                  <div key={interaction.id} className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm">
                    <div className="flex items-center space-x-3">
                      {interaction.status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div>
                        <div className="font-medium text-sm">
                          Contract {interaction.contractIndex}/100
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {interaction.address}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={interaction.status === 'success' ? 'default' : 'destructive'}>
                        {interaction.status === 'success' ? 'Success' : 'Failed'}
                      </Badge>
                      <span className="text-xs text-gray-500">{interaction.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connection Status */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <AlertCircle className="h-4 w-4" />
              <span>
                {isConnected 
                  ? `Connected to ${chain?.name || 'Unknown Network'}` 
                  : 'Please connect your wallet to continue'
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default App

