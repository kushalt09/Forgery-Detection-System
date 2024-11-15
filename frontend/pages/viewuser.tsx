import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { User } from '@/models/user'; // Adjust the import path according to your project structure
import Modal from 'react-modal'; // Import react-modal

Modal.setAppElement('#__next'); // This line is important to avoid screen reader issues.

const ViewUserPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();
  const { userId } = router.query;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get<User>(`${process.env.NEXT_PUBLIC_BASE_API_URL}/users/${userId}/`, {
          withCredentials: true,
        });
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleVerifyUser = async () => {
    const confirmVerify = window.confirm("Are you sure you want to verify this user?");
    if (!confirmVerify) return;

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/users/verify/${userId}/`, {}, {
        withCredentials: true,
      });
      setUser((prevUser) => {
        if (prevUser) {
          return { 
            ...prevUser,
            is_verified: true, 
            is_pending: false,
            account_number: response.data.account_number 
          };
        }
        return null;
      });
    } catch (error) {
      console.error('Failed to verify user:', error);
    }
  };

  const handleSetPending = async () => {
    const confirmPending = window.confirm("Are you sure you want to set this user to pending?");
    if (!confirmPending) return;

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_API_URL}/users/pending/${userId}/`, {}, {
        withCredentials: true,
      });
      setUser((prevUser) => {
        if (prevUser) {
          return { 
            ...prevUser,
            is_pending: true,
            is_verified: false,
          };
        }
        return null;
      });
    } catch (error) {
      console.error('Failed to set user to pending:', error);
    }
  };

  const handleOpenPasswordModal = () => {
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChangePassword = async () => {
    const confirmChange = window.confirm("Are you sure you want to reset this user's password? The new password will be sent to the user's email.");
    if (!confirmChange) return;
  
    try {
      // Make the API call to reset the password
      await axios.put(`${process.env.NEXT_PUBLIC_BASE_API_URL}/users/${userId}/change_password/`, {}, {
        withCredentials: true,
      });
  
      // Notify the admin that the password was reset and emailed
      alert('The new password has been generated and sent to the user\'s email.');
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Failed to change password');
    }
  };
  
  

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="pt-8 bg-[#F4F9FF] min-h-screen">
      <div className="max-w-[500px] mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-slate-900">User Details</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <strong className="text-slate-900 font-medium">ID</strong>
            <p className="text-slate-700">{user.id}</p>
          </div>
          <div className="flex justify-between items-center">
            <strong className="text-slate-900 font-medium">Name</strong>
            <p className="text-slate-700">{user.name}</p>
          </div>
          <div className="flex justify-between items-center">
            <strong className="text-slate-900 font-medium">Phone</strong>
            <p className="text-slate-700">{user.phone}</p>
          </div>
          <div className="flex justify-between items-center">
            <strong className="text-slate-900 font-medium">Email</strong>
            <p className="text-slate-700">{user.email}</p>
          </div>
          <div className="flex justify-between items-center">
            <strong className="text-slate-900 font-medium">Address</strong>
            <p className="text-slate-700">{user.address}</p>
          </div>
          <div className="flex justify-between items-center">
            <strong className="text-slate-900 font-medium">Account Number</strong>
            <p className="text-slate-700">{user.account_number ? user.account_number : 'Not Verified'}</p>
          </div>
          <div className="flex justify-between items-center">
            <strong className="text-slate-900 font-medium">Verified</strong>
            <p className="text-slate-700">{user.is_verified ? 'Yes' : user.is_pending ? 'Pending' : 'No'}</p>
          </div>
          <div>
            <label className="block text-slate-900 font-medium">Signature Image</label>
            {user.signImg ? (
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_API_URL}${user.signImg}`}
                alt="User Signature"
                className="h-48 w-48 object-contain mt-2"
              />
            ) : (
              'No signature'
            )}
          </div>
          <div>
            <label className="block text-slate-900 font-medium">Citizenship Image</label>
            {user.citizenshipImg ? (
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_API_URL}${user.citizenshipImg}`}
                alt="Citizenship"
                className="h-48 w-48 object-contain mt-2"
              />
            ) : (
              'No citizenship'
            )}
          </div>
          <div className="flex justify-between items-center">
            {!user.is_verified && !user.is_pending && (
              <button
                className="block mt-4 py-2 px-4 bg-yellow-500 text-white text-center rounded-lg shadow-md hover:bg-yellow-600"
                onClick={handleSetPending}
              >
                Set as Pending
              </button>
            )}
            {!user.is_verified && (
              <button
                className="block mt-4 py-2 px-4 bg-green-500 text-white text-center rounded-lg shadow-md hover:bg-green-600"
                onClick={handleVerifyUser}
              >
                Verify User
              </button>
            )}
          </div>
          <button
            className="block w-full mt-4 py-2 px-4 bg-blue-500 text-white text-center rounded-lg shadow-md hover:bg-blue-600"
            onClick={() => router.push('/manageusers')}
          >
            Back to Manage Users
          </button>
        </div>

        <h2 className="text-2xl font-bold mt-8 text-slate-900">Change Password</h2>
<button
  className="block w-full mt-4 py-2 px-4 bg-amber-500 text-white text-center rounded-lg shadow-md hover:bg-amber-600"
  onClick={handleChangePassword}
>
  Change Password
</button>

      </div>


    </div>
  );
};

export default ViewUserPage;
