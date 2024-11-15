import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { User } from '@/models/user'; // Adjust the import path according to your project structure
import { useForm, FormProvider } from 'react-hook-form'; // Import react-hook-form
import Input from '@/components/forms/input'; // Import your Input component
import ImageUpload from '@/components/image-upload'; // Import your ImageUpload component

const EditUserPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [signatureImg, setSignatureImg] = useState<File | null>(null);
  const [citizenshipImg, setCitizenshipImg] = useState<File | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const router = useRouter();
  const { userId } = router.query;
  const methods = useForm(); // Initialize react-hook-form

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (user) {
      setUser({ ...user, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData();
    formData.append('name', user.name);
    formData.append('phone', user.phone);
    formData.append('email', user.email);
    formData.append('address', user.address);
    formData.append('password', user.password); // Include password if you want to update it
    if (signatureImg) {
      formData.append('signImg', signatureImg);
    }
    if (citizenshipImg) {
      formData.append('citizenshipImg', citizenshipImg);
    }

    try {
      await axios.put(`${process.env.NEXT_PUBLIC_BASE_API_URL}/users/${userId}/`, formData, {
        withCredentials: true,
      });
      setNotification('User updated successfully');
      router.push('/manageusers'); // Redirect to manage users page after successful update
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <FormProvider {...methods}>
      <div className="pt-8 w-[500px] mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-slate-900">Edit User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="text" name="name" label="Full Name" value={user.name} onChange={handleInputChange} />
          <Input type="phone" name="phone" label="Phone Number" value={user.phone} onChange={handleInputChange} />
          <Input type="email" name="email" label="Email" value={user.email} onChange={handleInputChange} />
          <Input type="text" name="address" label="Address" value={user.address} onChange={handleInputChange} />
          {/* <Input type="password" name="password" label="Password" value={user.password} onChange={handleInputChange} /> */}
          <label className="block mb-2 text-slate-500 text-sm">Signature Image</label>
          {user.signImg && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Current Signature</label>
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_API_URL}${user.signImg}`}
                alt="User Signature"
                className="h-32 w-32 object-contain"
              />
            </div>
          )}
          <ImageUpload selectedFile={signatureImg} setSelectedFile={setSignatureImg} height="h-[200px]" textSize="text-sm" />

          <label className="block mb-2 text-slate-500 text-sm">Citizenship Image</label>
          {user.citizenshipImg && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Current Citizenship</label>
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_API_URL}${user.citizenshipImg}`}
                alt="Citizenship"
                className="h-32 w-32 object-contain"
              />
            </div>
          )}
          <ImageUpload selectedFile={citizenshipImg} setSelectedFile={setCitizenshipImg} height="h-[200px]" textSize="text-sm" />

          <button type="submit" className="block w-full mt-4 py-2 px-4 bg-blue-500 text-white text-center rounded-lg shadow-md hover:bg-blue-600">
            Save
          </button>
        </form>
        {notification && (
          <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">{notification}</strong>
          </div>
        )}
      </div>
    </FormProvider>
  );
};

export default EditUserPage;
