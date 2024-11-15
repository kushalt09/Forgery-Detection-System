// import { VerificationResult } from '@/models/verification';
import { ForgeryStatus } from '@/models/verification';
import { useMutation } from '@tanstack/react-query';

const verifySignature = async (
  verPayload: FormData
): Promise<VerificationResult> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_API_URL}/detection/check_forgery/`,
    {
      method: 'POST',
      body: verPayload,
    }
  );

  if (!res.ok) {
    throw new Error(
      `Failed to verify the signature. ${(await res.json()).message}`
    );
  }

  return res.json();
};

export const useVerification = () => {
  return useMutation<VerificationResult, Error, FormData>({
    mutationFn: verifySignature,
  });
};

export interface VerificationResult {
  originalSignImg: string;
  status: ForgeryStatus;
  confidence: number;
  transaction_id: string; // Add transaction_id
  croppedImg: string; // Add croppedImg
}