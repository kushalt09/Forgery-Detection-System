import { useRouter } from 'next/router';

const AdminLoginPage = () => {
  const router = useRouter();

  const handleOptionClick = (option: string) => {
    if (option === 'checkForgery') {
      router.push('/verify'); // Redirect to verify page
    } else if (option === 'manageusers') {
      router.push('/manageusers'); // Redirect to manage users page
    } else if (option === 'viewTransactions') {
      router.push('/transactions'); // Redirect to view transactions page
    }
  };

  return (
    <div className="pt-8 bg-[#F4F9FF] min-h-screen">
      <div className="max-w-[1000px] mx-auto">
        <h2 className="text-5xl text-center font-bold text-slate-900">
          Admin Dashboard
        </h2>
        <div className="flex flex-col items-center mt-8 space-y-4">
          <button
            onClick={() => handleOptionClick('manageusers')}
            className="w-full py-2 px-4 bg-blue-500 text-white text-center rounded-lg shadow-md hover:bg-blue-600"
          >
            Manage Users
          </button>
          <button
            onClick={() => handleOptionClick('checkForgery')}
            className="w-full py-2 px-4 bg-green-500 text-white text-center rounded-lg shadow-md hover:bg-green-600"
          >
            Check Forgery
          </button>
          <button
            onClick={() => handleOptionClick('viewTransactions')}
            className="w-full py-2 px-4 bg-purple-500 text-white text-center rounded-lg shadow-md hover:bg-purple-600"
          >
            View Transactions
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
