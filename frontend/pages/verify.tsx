import { useEffect, useState, useRef } from 'react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.min.css';
import FormWrapper from '@/components/forms/form-wrapper';
import Input from '@/components/forms/input';
import ImageUpload from '@/components/image-upload';
import { useVerification } from '@/hooks/use-verification';
import {
  ForgeryStatus,
  VerificationPayload,
  VerificationResult,
} from '@/models/verification';
import { useUserStore } from '@/store/user-store';
import { useRouter } from 'next/router';

const VerifyPage = () => {
  const { mutate: verifySignature, isPending } = useVerification();
  const [chequeImg, setChequeImg] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);

  const user = useUserStore((state) => state.loginDetails);
  const router = useRouter();
  const imageElement = useRef<HTMLImageElement>(null);
  const cropper = useRef<Cropper | null>(null);

  useEffect(() => {
    if (user && !user.isAdmin) {
      router.push('/my-account');
    } else if (!user) {
      router.push('/register');
    }
  }, [user, router]);

  useEffect(() => {
    if (imageElement.current && chequeImg) {
      cropper.current = new Cropper(imageElement.current, {
        aspectRatio: NaN, // No aspect ratio restriction
        viewMode: 1,
        autoCropArea: 1,
        movable: true,
        zoomable: true,
        rotatable: true,
        scalable: true,
      });
    }
  }, [chequeImg]);

  const submitHandler = (data: VerificationPayload) => {
    if (chequeImg) {
      const formData = new FormData();
      formData.append('chequeImg', chequeImg, chequeImg.name); // Send the original cheque image
      formData.append('accountNo', data.accountNo.toString());

      if (cropper.current) {
        const croppedCanvas = cropper.current.getCroppedCanvas();
        if (croppedCanvas) {
          croppedCanvas.toBlob((blob) => {
            if (blob) {
              formData.append('croppedImg', blob, 'cropped-image.png'); // Send the cropped image

              verifySignature(formData, {
                onSuccess: (result) => {
                  setCroppedImage(croppedCanvas.toDataURL()); // Save cropped image for display
                  setVerificationResult(result); // Set the verification result
                  console.log("Transaction ID:", result.transaction_id);
                  console.log("Cropped Image URL:", result.croppedImg);
                  console.log("Original Image URL:", result.originalSignImg);
                },
                onError: (error: Error) => {
                  const errorMessage = error.message;
                  if (errorMessage.includes('account number does not exist')) {
                    alert('Account number does not exist. Please check and try again.');
                  } else {
                    alert('An error occurred during verification. Please try again.');
                    console.error('Verification failed:', errorMessage);
                  }
                },
              });
            }
          });
        }
      } else {
        // If no cropping is done, just send the original cheque image
        verifySignature(formData, {
          onSuccess: (result) => {
            setVerificationResult(result); // Set the verification result
            console.log("Transaction ID:", result.transaction_id);
            console.log("Cropped Image URL:", result.croppedImg);
            console.log("Original Image URL:", result.originalSignImg);
          },
          onError: (error: Error) => {
            const errorMessage = error.message;
            if (errorMessage.includes('account number does not exist')) {
              alert('Account number does not exist. Please check and try again.');
            } else {
              alert('An error occurred during verification. Please try again.');
              console.error('Verification failed:', errorMessage);
            }
          },
        });
      }
    }
  };

  return (
    <div className="pt-8 bg-[#F4F9FF] min-h-screen">
      <div className={`${verificationResult ? 'max-w-[1000px]' : 'max-w-[600px]'} mx-auto`}>
        {verificationResult ? (
          <h2 className="w-max mx-auto text-4xl font-bold text-slate-900 border-b-[6px] border-amber-400 mt-2 mb-16 text-center">
            Verification Results
          </h2>
        ) : (
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Verify Cheque Signature
          </h2>
        )}

        {verificationResult && croppedImage ? (
          <div className="flex flex-col justify-center items-center">
            <div className="w-full flex gap-x-8 mb-6">
              <div className="w-1/3">
                <h2 className="mb-4 ml-2 text-slate-900 text-sm font-medium uppercase">
                  Original Signature (User Uploaded)
                </h2>
                <img
                  className="h-[300px] w-full border border-slate-300 object-fill bg-white rounded-2xl drop-shadow-[8px_-8px_8px_rgba(23,23,23,0.05)]"
                  src={verificationResult.originalSignImg.startsWith('http') ? verificationResult.originalSignImg : `${process.env.NEXT_PUBLIC_BASE_API_URL}${verificationResult.originalSignImg}`}
                  alt="Original signature"
                />
              </div>
              <div className="w-1/3">
                <h2 className="mb-4 ml-2 text-slate-900 text-sm font-medium uppercase">
                  Uploaded Signature (Cheque)
                </h2>
                <img
                  className="h-[300px] w-full border border-slate-300 object-fill bg-white rounded-2xl drop-shadow-[8px_-8px_8px_rgba(23,23,23,0.05)]"
                  src={URL.createObjectURL(chequeImg!)}
                  alt="Uploaded cheque signature"
                />
              </div>
              <div className="w-1/3">
                <h2 className="mb-4 ml-2 text-slate-900 text-sm font-medium font-bold uppercase">
                  Cropped Signature
                </h2>
                <img
                  className="h-[300px] w-full border border-slate-300 object-fill bg-white rounded-2xl drop-shadow-[8px_-8px_8px_rgba(23,23,23,0.05)]"
                  src={croppedImage}
                  alt="Cropped cheque signature"
                />
              </div>
            </div>
            <ForgeryResult
              confidence={verificationResult.confidence}
              status={verificationResult.status}
            />
          </div>
        ) : (
          <FormWrapper
            showLoader={isPending}
            className="space-y-4"
            onSubmit={submitHandler}
            buttonText="Check for Forgery"
          >
            <Input
              bgColor="bg-white shadow-[0px_8px_16px_rgba(23,23,23,0.05)]"
              type="text"
              name="accountNo"
              label="Account Number"
            />

            <label className="block mb-2 text-slate-500 text-sm">
              Cheque Signature
            </label>
            <ImageUpload
              selectedFile={chequeImg}
              setSelectedFile={setChequeImg}
            />
            {chequeImg && (
              <div className="mt-4">
                <h2 className="mb-2 text-slate-900 text-sm font-medium uppercase">
                  Crop Cheque Image
                </h2>
                <img
                  ref={imageElement}
                  src={URL.createObjectURL(chequeImg)}
                  alt="To be cropped"
                  className="max-w-full"
                />
              </div>
            )}
          </FormWrapper>
        )}
      </div>
    </div>
  );
};

const ForgeryResult = ({
  confidence,
  status,
}: {
  confidence: number;
  status: ForgeryStatus;
}) => (
  <div className="flex items-center gap-x-2 py-8">
    <div>
      {status === 'real' ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.2}
          stroke="currentColor"
          className="w-32 h-32 stroke-emerald-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-32 h-32 stroke-rose-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      )}
    </div>
    <div>
      <h3
        className={`font-bold text-2xl mb-2 ${
          status === 'real' ? 'text-emerald-500' : 'text-rose-600'
        }`}
      >
        {status && status[0].toUpperCase() + status.slice(1)} Signatures.
      </h3>
      <p className="text-slate-500 max-w-[400px]">
        With a confidence of <span>{confidence.toFixed(3)}%</span>, the AI model
        has predicted the provided signatures to be{' '}
        <span>{status === 'real' ? 'real' : 'forged'}</span>.
      </p>
    </div>
  </div>
);

export default VerifyPage;
