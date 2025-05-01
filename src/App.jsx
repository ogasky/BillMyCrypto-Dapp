import React, { useContext } from 'react';
import TransactionProvider, { TransactionContext } from './components/TransactionContext';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';

function AppContent() {
  const { error } = useContext(TransactionContext);

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 to-blue-600 text-white"
      style={{
        backgroundImage: "url('https://www.transparenttextures.com/patterns/wave-pattern.png')",
        backgroundSize: 'cover',
        backgroundBlendMode: 'overlay',
      }}
    >
      {error && (
        <div className="w-full max-w-7xl mx-auto mt-4">
          <p className="text-red-400 text-center">{error}</p>
        </div>
      )}
      <main className="flex-grow px-4 md:px-10 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-10">
            BillMyCrypto
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg">
              <TransactionForm />
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg">
              <TransactionList />
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-white/10 backdrop-blur-md py-4 text-center text-gray-300 text-sm border-t">
        🔗 Powered by <span className="text-indigo-400 font-semibold">BillMyCrypto Dapp</span> © 2025
      </footer>
    </div>
  );
}

function App() {
  return (
    <TransactionProvider>
      <AppContent />
    </TransactionProvider>
  );
}

export default App;
