'use client';

import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  if (isConnected && address) {
    const isCorrectNetwork = chainId === 80002;
    
    return (
      <button
        onClick={() => disconnect()}
        className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition"
      >
        Disconnect
      </button>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      className="bg-white hover:bg-white/90 text-celo-dark font-semibold px-6 py-2 rounded-lg transition"
    >
      Connect Wallet
    </button>
  );
}
// ConnectButton component
// ConnectButton component
