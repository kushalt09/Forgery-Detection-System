import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface Transaction {
  transaction_id: string;  
  accountNo: string;
  username: string;
  forgery_confidence: number;
  verification_status: string;
  signImg: string;
  chequeImg: string;
  croppedImg: string;
  createdAt: string;
}

const ViewTransactionPage = () => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      const fetchTransaction = async () => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_API_URL}/detection/transaction/${id}/`
          );
          setTransaction(response.data);
          setLoading(false);
        } catch (err) {
          setError('Failed to load transaction.');
          setLoading(false);
        }
      };

      fetchTransaction();
    }
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!transaction) return null;

  return (
    <div className="pt-8 bg-[#F4F9FF] min-h-screen">
      <div className="max-w-[1000px] mx-auto">
        <h2 className="text-5xl text-center font-bold text-slate-900 mb-8">
          View Transaction
        </h2>

        <div className="bg-white p-8 rounded-lg shadow-md space-y-4">
          <div>
            <h3 className="font-bold">Transaction ID:</h3>
            <p>{transaction.transaction_id}</p>
          </div>

          <div>
            <h3 className="font-bold">Account Name (Username):</h3>
            <p>{transaction.username}</p>
          </div>

          <div>
            <h3 className="font-bold">Account Number:</h3>
            <p>{transaction.accountNo}</p>
          </div>

          <div>
            <h3 className="font-bold">Forgery Status:</h3>
            <p>{transaction.verification_status}</p>
          </div>

          <div>
            <h3 className="font-bold">Forgery Confidence:</h3>
            <p>{transaction.forgery_confidence.toFixed(2)}%</p>
          </div>

          <div>
            <h3 className="font-bold">Time:</h3>
            <p>{new Date(transaction.createdAt).toLocaleString()}</p>
          </div>

          <div>
            <label className="block text-slate-900 font-medium">Original Signature</label>
            {transaction.signImg ? (
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_API_URL}/${transaction.signImg}`}
                alt="Original Signature"
                className="h-48 w-48 object-contain mt-2"
              />
            ) : (
              'No signature'
            )}
          </div>

          <div>
            <label className="block text-slate-900 font-medium">Uploaded Signature</label>
            {transaction.chequeImg ? (
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_API_URL}/${transaction.chequeImg}`}
                alt="Uploaded Signature"
                className="h-48 w-48 object-contain mt-2"
              />
            ) : (
              'No uploaded signature'
            )}
          </div>

          <div>
            <label className="block text-slate-900 font-medium">Cropped Signature</label>
            {transaction.croppedImg ? (
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_API_URL}/${transaction.croppedImg}`}
                alt="Cropped Signature"
                className="h-48 w-48 object-contain mt-2"
              />
            ) : (
              'No cropped signature'
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTransactionPage;
