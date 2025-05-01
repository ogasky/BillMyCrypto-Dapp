import React, { useContext } from 'react';
import { TransactionContext } from './TransactionContext';
import { formatDistanceToNow } from 'date-fns';

function TransactionList() {
  const { transactions, error } = useContext(TransactionContext);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6">Transaction History</h2>

      {/* Display any error */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Empty state */}
      {transactions.length === 0 ? (
        <p className="text-gray-500 text-center">No transactions yet.</p>
      ) : (
        <div className="space-y-6">
          {transactions.map((tx, index) => (
            <div
              key={index}
              className="border border-gray-200 p-5 rounded-xl shadow-md bg-gradient-to-tr from-white to-gray-50 hover:shadow-lg transition"
            >
              {/* Tx Hash */}
              <p className="text-sm text-gray-500 mb-2">Tx Hash:</p>
              <a
                href={`https://polygonscan.com/tx/${tx.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 break-all underline mb-3 block"
              >
                {tx.txHash}
              </a>

              {/* Payment Details */}
              <div className="text-gray-700 space-y-1 text-sm">
                <p><strong>Amount:</strong> {tx.amount} {tx.token}</p>

                {/* Conditional Render: Bill Payment or General Payment */}
                {tx.billerDetails ? (
                  <>
                    <p><strong>Payment Type:</strong> Bill Payment</p>
                    <p><strong>Biller:</strong> {tx.billerDetails.billerAccountName}</p>
                    <p><strong>NGN Amount:</strong> {tx.amountInNgn}</p>
                    <p><strong>Sender:</strong> {tx.billerDetails.senderName}</p>
                    <p><strong>Bank:</strong> {tx.billerDetails.billerBankName}</p>
                    <p><strong>Account Number:</strong> {tx.billerDetails.billerAccountNumber}</p>
                  </>
                ) : (
                  <>
                    <p><strong>Payment Type:</strong> General Payment</p>
                    <p><strong>Recipient:</strong> {tx.recipient}</p>
                  </>
                )}

                {/* Status */}
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      tx.status === "Settled" ? "text-green-600" : "text-yellow-500"
                    }`}
                  >
                    {tx.status}
                  </span>
                </p>

                {/* Timestamp */}
                <p className="text-gray-400 text-xs">
                  {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TransactionList;
