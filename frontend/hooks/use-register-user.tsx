import { User } from '@/models/user';
import { useMutation } from '@tanstack/react-query';

const registerUser = async (regPayload: FormData): Promise<User> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_API_URL}/users/register`,
    {
      method: 'POST',
      body: regPayload,
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw errorData;  // Throw the entire error object for more detailed handling
  }

  return res.json();
};

export const useRegisterUser = () => {
  return useMutation<User, any, FormData>({ 
    mutationFn: registerUser 
  });
};
