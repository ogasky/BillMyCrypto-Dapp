import React, { useState, useContext } from 'react';
import { ethers } from 'ethers';
import { TransactionContext } from './TransactionContext';
import { contractABI, contractAddress } from '../utils/constants';

const TransactionForm = () => {
  const { contract, network, connectWallet, addTransaction } = useContext(TransactionContext);

  const [paymentType, setPaymentType] = useState('general');
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [selectedBiller, setSelectedBiller] = useState('');
  const [billerBankName, setBillerBankName] = useState('');
  const [billerAccountName, setBillerAccountName] = useState('');
  const [billerAccountNumber, setBillerAccountNumber] = useState('');
  const [amountInNgn, setAmountInNgn] = useState('');
  const [senderName, setSenderName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBillerSelection = (e) => {
    const billerId = e.target.value;
    setSelectedBiller(billerId);
    if (billerId && billers[billerId]) {
      const billerDetails = billers[billerId];
      setBillerBankName(billerDetails.bankName);
      setBillerAccountName(billerDetails.accountName);
      setBillerAccountNumber(billerDetails.accountNumber);
    } else {
      setBillerBankName('');
      setBillerAccountName('');
      setBillerAccountNumber('');
    }
  };

  const approveTokenAllowance = async (tokenAddress, amountToApprove, decimals) => {
    const tokenContract = new ethers.Contract(
      tokenAddress,
      ['function approve(address spender, uint256 amount) public returns (bool)', 'function allowance(address owner, address spender) public view returns (uint256)'],
      contract.signer
    );
    const userAddress = await contract.signer.getAddress();
    const currentAllowance = await tokenContract.allowance(userAddress, contract.target);
    const amountInWei = ethers.utils.parseUnits(amountToApprove.toString(), decimals);

    if (currentAllowance.lt(amountInWei)) {
      const approveTransaction = await tokenContract.approve(contract.target, amountInWei);
      await approveTransaction.wait();
      console.log('✅ Token approval successful:', approveTransaction.hash);
    }
  };

  const processGeneralPayment = async (tokenAddress, amountInWei, recipient) => {
    const tx = await contract.processGeneralPayment(tokenAddress, amountInWei, ethers.utils.getAddress(recipient));
    const receipt = await tx.wait();
    return receipt.transactionHash;
  };

  const processBillPayment = async (tokenAddress, amountInWei) => {
    const amountInNgnWei = ethers.utils.parseUnits(amountInNgn, 0);

    const tx = await contract.processPayment(
      tokenAddress,
      amountInWei,
      billerBankName,
      billerAccountName,
      billerAccountNumber,
      amountInNgnWei,
      senderName
    );
    const receipt = await tx.wait();
    return receipt.transactionHash;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      if (!contract) {
        await connectWallet();
        throw new Error('Contract not initialized.');
      }
      if (network !== 'polygonMainnet') {
        throw new Error('Please switch to Polygon MainNet!');
      }

      const tokenAddresses = {
        USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      };
      const tokenAddress = tokenAddresses[selectedToken];
      const decimals = selectedToken === 'USDC' ? 6 : 18;
      const amountInWei = ethers.utils.parseUnits(amount.toString(), decimals);

      await approveTokenAllowance(tokenAddress, amount, decimals);

      let txHash;
      if (paymentType === 'general') {
        if (!amount || !recipientAddress) throw new Error('Amount and recipient are required.');
        txHash = await processGeneralPayment(tokenAddress, amountInWei, recipientAddress);
        addTransaction({ txHash, token: selectedToken, amount, recipient: recipientAddress, timestamp: Date.now(), status: 'Completed' });
      } else {
        if (!amount || !selectedBiller || !billerBankName || !billerAccountName || !billerAccountNumber || !amountInNgn || !senderName)
          throw new Error('All fields are required for bill payments.');
        txHash = await processBillPayment(tokenAddress, amountInWei);
        addTransaction({ txHash, biller: { billerBankName, billerAccountName, billerAccountNumber, senderName }, token: selectedToken, amount, amountInNgn, timestamp: Date.now(), status: 'Pending' });
      }

      alert('✅ Payment submitted successfully!');
    } catch (error) {
      setErrorMessage(error.message || 'Failed to submit payment.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-3xl font-bold text-center mb-6">Make a Payment</h2>

      {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}

      <form onSubmit={handleFormSubmit} className="space-y-5">
        {/* Payment Type */}
        <div>
          <label className="block mb-1 font-semibold">Payment Type</label>
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            className="border p-2 w-full rounded-md"
          >
            <option value="general">General Payment</option>
            <option value="bill">Pay a Bill</option>
          </select>
        </div>

        {/* Token Selection */}
        <div>
          <label className="block mb-1 font-semibold">Token</label>
          <select
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value)}
            className="border p-2 w-full rounded-md"
          >
            <option value="USDC">USDC</option>
            <option value="DAI">DAI</option>
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block mb-1 font-semibold">Amount ({selectedToken})</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 w-full rounded-md"
            placeholder="Enter amount"
            required
          />
        </div>

        {/* Conditional fields */}
        {paymentType === 'general' ? (
          <div>
            <label className="block mb-1 font-semibold">Recipient Address</label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="border p-2 w-full rounded-md"
              placeholder="0x123...abc"
              required
            />
          </div>
        ) : (
          <>
            <div>
              <label className="block mb-1 font-semibold">Select Biller</label>
              <select
                value={selectedBiller}
                onChange={handleBillerSelection}
                className="border p-2 w-full rounded-md"
              >
                <option value="">Select Biller</option>
                <option value="airtel">Airtel</option>
                <option value="billmycrypto">BillMyCrypto</option>
                <option value="codeuplab">CodeUpLab</option>
                <option value="wittyhub">WittyHub</option>
                <option value="zoerd">ZOERD</option>
                <option value="mtn">MTN</option>
              </select>
            </div>
            <input
              type="text"
              value={billerBankName}
              onChange={(e) => setBillerBankName(e.target.value)}
              placeholder="Biller Bank Name"
              className="border p-2 w-full rounded-md"
              required
            />
            <input
              type="text"
              value={billerAccountName}
              onChange={(e) => setBillerAccountName(e.target.value)}
              placeholder="Biller Account Name"
              className="border p-2 w-full rounded-md"
              required
            />
            <input
              type="text"
              value={billerAccountNumber}
              onChange={(e) => setBillerAccountNumber(e.target.value)}
              placeholder="Biller Account Number"
              className="border p-2 w-full rounded-md"
              required
            />
            <input
              type="number"
              value={amountInNgn}
              onChange={(e) => setAmountInNgn(e.target.value)}
              placeholder="Amount in NGN"
              className="border p-2 w-full rounded-md"
              required
            />
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Sender Name"
              className="border p-2 w-full rounded-md"
              required
            />
          </>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md w-full"
        >
          {isSubmitting ? 'Submitting...' : contract ? 'Pay' : 'Connect Wallet'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
