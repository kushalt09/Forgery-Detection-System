import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { User } from '@/models/user'; // Adjust the import path according to your project structure

const ManageUserPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'not_verified' | 'pending'>('all');
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get<User[]>(`${process.env.NEXT_PUBLIC_BASE_API_URL}/users/`, {
          withCredentials: true, // Ensure credentials are included in the request
        });
        const nonAdminUsers = response.data.filter(user => !user.isAdmin); // Exclude admin users
        setUsers(nonAdminUsers);
        setFilteredUsers(nonAdminUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    setFilteredUsers(
      users.filter(user => {
        const matchesQuery = 
          (user.name?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
          (user.phone?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
          (user.address?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
          (user.email?.toLowerCase() ?? '').includes(searchQuery.toLowerCase());

        if (filterVerified === 'all') {
          return matchesQuery;
        } else if (filterVerified === 'verified') {
          return matchesQuery && user.is_verified;
        } else if (filterVerified === 'pending') {
          return matchesQuery && user.is_pending;
        } else {
          return matchesQuery && !user.is_verified && !user.is_pending;
        }
      })
    );
  }, [searchQuery, users, filterVerified]);

  const handleDeleteUser = async (userId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_API_URL}/users/${userId}/`, {
        withCredentials: true,
      });
      setUsers(users.filter((user) => user.id !== userId));
      setFilteredUsers(filteredUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleEditUser = (userId: string) => {
    router.push(`/edituser?userId=${userId}`);
  };

  const handleViewUser = (userId: string) => {
    router.push(`/viewuser?userId=${userId}`);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterVerified(e.target.value as 'all' | 'verified' | 'not_verified' | 'pending');
  };

  return (
    <div className="pt-8 bg-[#F4F9FF] min-h-screen">
      <div className="max-w-[1000px] mx-auto">
        <h2 className="text-5xl text-center font-bold text-slate-900">Manage Users</h2>
        <div className="mt-8 flex justify-between items-center">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full mb-4 p-2 border rounded"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select className="ml-4 p-2 border rounded" value={filterVerified} onChange={handleFilterChange}>
            <option value="all">All</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="not_verified">Not Verified</option>
          </select>
        </div>
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border">ID</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Phone</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Address</th>
              <th className="px-4 py-2 border">Account Number</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-2 border">{user.id}</td>
                <td className="px-4 py-2 border">{user.name}</td>
                <td className="px-4 py-2 border">{user.phone}</td>
                <td className="px-4 py-2 border">{user.email}</td>
                <td className="px-4 py-2 border">{user.address}</td>
                <td className="px-4 py-2 border">{user.account_number ? user.account_number : 'Not Verified'}</td>
                <td className="px-4 py-2 border">
                  {user.is_verified ? 'Verified' : user.is_pending ? 'Pending' : 'Not Verified'}
                </td>
                <td className="px-4 py-2 border">
                  <button
                    className="py-1 px-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mr-2"
                    onClick={() => handleEditUser(user.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="py-1 px-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </button>
                  <button
                    className="py-1 px-2 bg-green-500 text-white rounded-lg hover:bg-green-600 ml-2"
                    onClick={() => handleViewUser(user.id)}
                  >
                    <span role="img" aria-label="view">👁️</span>
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

export default ManageUserPage;
