import React, { createContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractABI, contractAddress } from '../utils/constants';

export const TransactionContext = createContext();

const TransactionProvider = ({ children }) => {
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [network, setNetwork] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const initializeWalletAndContract = async () => {
      try {
        console.log('🔵 Initializing wallet and contract...');

        if (!window.ethereum) {
          throw new Error('Please install MetaMask to use this dApp.');
        }

        if (!ethers?.providers?.Web3Provider) {
          throw new Error('Web3Provider is not available. Ensure ethers v5 is installed.');
        }

        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        await web3Provider.send('eth_requestAccounts', []);
        const web3Signer = web3Provider.getSigner();

        setProvider(web3Provider);
        setSigner(web3Signer);

        const { chainId } = await web3Provider.getNetwork();
        console.log('🔵 Chain ID detected:', chainId);

        if (chainId !== 137) {
          throw new Error('Please switch to Polygon MainNet (chain ID 137).');
        }

        setNetwork('polygonMainnet');

        const contractInstance = new ethers.Contract(contractAddress, contractABI, web3Signer);
        setContract(contractInstance);

        setupContractListeners(contractInstance);

        window.ethereum.on('accountsChanged', () => window.location.reload());
        window.ethereum.on('chainChanged', () => window.location.reload());

      } catch (err) {
        console.error('❌ Initialization error:', err);
        setError(err.message || 'Failed to initialize wallet and contract.');
      }
    };

    initializeWalletAndContract();
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) throw new Error('Please install MetaMask!');
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      await web3Provider.send('eth_requestAccounts', []);
      const web3Signer = web3Provider.getSigner();

      setProvider(web3Provider);
      setSigner(web3Signer);

      const { chainId } = await web3Provider.getNetwork();
      if (chainId !== 137) throw new Error('Please switch to Polygon MainNet.');

      setNetwork('polygonMainnet');

      const contractInstance = new ethers.Contract(contractAddress, contractABI, web3Signer);
      setContract(contractInstance);

    } catch (err) {
      console.error('❌ Connect wallet error:', err);
      setError(err.message || 'Failed to connect wallet.');
    }
  };

  const setupContractListeners = (contractInstance) => {
    contractInstance.on('PaymentProcessed', (sender, token, amount, baseAmount, fee, billerDetailsHash, amountInNgn, txHash) => {
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.txHash === txHash
            ? {
                ...tx,
                amount: ethers.utils.formatUnits(amount, 6),
                baseAmount: ethers.utils.formatUnits(baseAmount, 6),
                fee: ethers.utils.formatUnits(fee, 6),
              }
            : tx
        )
      );
    });

    contractInstance.on('GeneralPaymentProcessed', (sender, token, amount, recipient, fee, txHash) => {
      setTransactions((prev) =>
        prev.map((tx) =>
          tx.txHash === txHash
            ? {
                ...tx,
                amount: ethers.utils.formatUnits(amount, 6),
                fee: ethers.utils.formatUnits(fee, 6),
              }
            : tx
        )
      );
    });

    contractInstance.on('BillerSettled', (sender, txHash, billerDetailsHash, amountInNgn) => {
      setTransactions((prev) =>
        prev.map((tx) => (tx.txHash === txHash ? { ...tx, status: 'Settled' } : tx))
      );
    });
  };

  const addTransaction = (transaction) => {
    setTransactions((prev) => [...prev, transaction]);
  };

  return (
    <TransactionContext.Provider
      value={{
        contract,
        provider,
        signer,
        network,
        transactions,
        addTransaction,
        connectWallet,
        error,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export default TransactionProvider;
