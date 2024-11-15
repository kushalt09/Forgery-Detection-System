import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const fetchUserDetails = async (accountNumber: string) => {
  const response = await axios.get(`/api/user/${accountNumber}`);
  return response.data;
};

export const useFetchUserDetails = () => {
  return useMutation(fetchUserDetails);
};