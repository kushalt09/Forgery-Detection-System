import { useEffect, useState } from 'react';
import axios from 'axios';
import router from 'next/router';

interface Transaction {
  transaction_id: string;
  accountNo: string;
  forgery_confidence: number;
  verification_status: string;
  createdAt: string;  // Added field for transaction time
}

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');  // State for sorting order

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_API_URL}/detection/transactions/`);
        setTransactions(response.data);
        setFilteredTransactions(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load transactions.');
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Filter transactions based on search query
  useEffect(() => {
    setFilteredTransactions(
      transactions.filter(transaction =>
        transaction.accountNo.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, transactions]);

  // Sort transactions by time
  const sortTransactionsByTime = () => {
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });
    setFilteredTransactions(sortedTransactions);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="pt-8 bg-[#F4F9FF] min-h-screen">
      <div className="max-w-[1000px] mx-auto">
        <h2 className="text-5xl text-center font-bold text-slate-900 mb-8">
          Transactions
        </h2>

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by Account Number"
            className="w-full px-4 py-2 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Transaction ID</th>
              <th className="py-2 px-4 border-b">Account No</th>
              <th className="py-2 px-4 border-b">Forgery Confidence</th>
              <th className="py-2 px-4 border-b">Verification Status</th>
              <th
                className="py-2 px-4 border-b cursor-pointer"
                onClick={sortTransactionsByTime}  // Sort when clicking on the "Time" column header
              >
                Time {sortOrder === 'asc' ? '↑' : '↓'}
              </th>
              <th className="py-2 px-4 border-b">Actions</th> {/* Add Actions column */}
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.transaction_id}>
                <td className="py-2 px-4 border-b">{transaction.transaction_id}</td>
                <td className="py-2 px-4 border-b">{transaction.accountNo}</td>
                <td className="py-2 px-4 border-b">{transaction.forgery_confidence}%</td>
                <td className="py-2 px-4 border-b">{transaction.verification_status}</td>
                <td className="py-2 px-4 border-b">{new Date(transaction.createdAt).toLocaleString()}</td>  {/* Display time */}
                <td className="py-2 px-4 border-b">
                  {/* View Button */}
                  <button
                    onClick={() => router.push(`/view-transactions?id=${transaction.transaction_id}`)}  // Navigate to the view-transactions page
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsPage;
