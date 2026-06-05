import { useState } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// PXX Token Contract Address (Ethereum)
const PRESALE_ADDRESS = '0x5CD3b447282624C1C163Fb67f7129d72Bf26517e';

// Minimal ERC-20 ABI — balanceOf, decimals, transfer, and presale buyTokens
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function buyTokens() payable',
  'function transfer(address to, uint256 amount) returns (bool)',
];

export function useWeb3() {
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [ethBalance, setEthBalance] = useState('0.0000');
  const [pxxBalance, setPxxBalance] = useState('0.00');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Fetch PXX balance ────────────────────────────────────────────────────────
  const fetchPxxBalance = async (address: string, wProvider: any) => {
    if (!wProvider || !address) return;
    try {
      const contract = new ethers.Contract(PRESALE_ADDRESS, ERC20_ABI, wProvider);
      const bal = await contract.balanceOf(address);
      const dec = await contract.decimals().catch(() => 18);
      const formatted = ethers.formatUnits(bal, dec);
      setPxxBalance(
        parseFloat(formatted).toLocaleString('en-US', { minimumFractionDigits: 2 })
      );
    } catch (e) {
      console.warn('Could not fetch PXX balance:', e);
    }
  };

  // ── Connect MetaMask wallet ──────────────────────────────────────────────────
  const connectWallet = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      toast.error('MetaMask not detected. Please install it first.');
      return;
    }
    try {
      setLoading(true);
      const accounts: string[] = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });
      const wProvider = new ethers.BrowserProvider((window as any).ethereum);
      const wSigner = await wProvider.getSigner();
      const address = accounts[0];

      setProvider(wProvider);
      setSigner(wSigner);
      setWalletAddress(address);
      setConnected(true);

      // ETH balance
      const bal = await wProvider.getBalance(address);
      setEthBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));

      // PXX balance
      await fetchPxxBalance(address, wProvider);

      toast.success('Wallet connected!');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  // ── Buy PXX tokens (presale) ─────────────────────────────────────────────────
  const buyPxx = async (ethAmount: string) => {
    if (!connected || !signer || !provider) {
      toast.error('Connect your wallet first');
      return;
    }
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      toast.error('Enter a valid ETH amount');
      return;
    }
    try {
      setLoading(true);
      const contract = new ethers.Contract(PRESALE_ADDRESS, ERC20_ABI, signer);
      const tx = await contract.buyTokens({ value: ethers.parseEther(ethAmount) });
      toast.promise(tx.wait(), {
        loading: 'Processing transaction…',
        success: 'PXX tokens purchased! 🎉',
        error: 'Transaction failed',
      });
      await tx.wait();

      // Refresh balances
      const bal = await provider.getBalance(walletAddress);
      setEthBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));
      await fetchPxxBalance(walletAddress, provider);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Buy failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Send PXX tokens to another address ───────────────────────────────────────
  const sendPxx = async (to: string, amount: string) => {
    if (!connected || !signer) {
      toast.error('Connect your wallet first');
      return;
    }
    if (!ethers.isAddress(to)) {
      toast.error('Invalid recipient address');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    try {
      setLoading(true);
      const contract = new ethers.Contract(PRESALE_ADDRESS, ERC20_ABI, signer);
      const decimals = await contract.decimals();
      const value = ethers.parseUnits(amount, decimals);
      const tx = await contract.transfer(to, value);
      toast.promise(tx.wait(), {
        loading: 'Sending PXX…',
        success: 'Transfer successful! ✅',
        error: 'Transfer failed',
      });
      await tx.wait();
      await fetchPxxBalance(walletAddress, provider);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    provider,
    signer,
    walletAddress,
    ethBalance,
    pxxBalance,
    connected,
    loading,
    connectWallet,
    buyPxx,
    sendPxx,
    fetchPxxBalance,
  };
}
