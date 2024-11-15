import FormWrapper from '@/components/forms/form-wrapper';
import Input from '@/components/forms/input';
import ImageUpload from '@/components/image-upload';
import { useRegisterUser } from '@/hooks/use-register-user';
import { RegistrationPayload } from '@/models/user';
import { useUserStore } from '@/store/user-store';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const RegisterPage = () => {
  const [signatureImg, setSignatureImg] = useState<File | null>(null);
  const [citizenshipImg, setCitizenshipImg] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const { mutate: registerUser, isPending, isError, error } = useRegisterUser();
  const setLoginDetails = useUserStore((state) => state.setLoginDetails);
  const loginDetails = useUserStore((state) => state.loginDetails);

  const validate = (data: RegistrationPayload) => {
    const newErrors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^9\d{9}$/;

    if (!emailRegex.test(data.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!phoneRegex.test(data.phone)) {
      newErrors.phone = 'Phone number must be 10 digits starting with 9';
    }
    if (!data.password || data.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };
  const submitHandler = (data: RegistrationPayload) => {
    const newErrors = validate(data);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    const formData: FormData = new FormData();
    formData.append('name', data.name);
    formData.append('phone', data.phone);
    formData.append('email', data.email);
    formData.append('address', data.address);
    formData.append('password', data.password);
    formData.append('signImg', signatureImg as Blob);
    formData.append('citizenshipImg', citizenshipImg as Blob);
  
    registerUser(formData, {
      onSuccess: (user) => {
        console.log(user);
        setLoginDetails(user);
        router.push('/my-account');
      },
      onError: (error) => {
        if (error && typeof error === 'object') {
          setErrors(error);  // Display the detailed error messages
        } else {
          console.error("Registration failed:", error);
          alert("Failed to register. Please try again.");
        }
      }
    });
  };

  useEffect(() => {
    if (loginDetails) {
      if (loginDetails.isAdmin) {
        router.push('/verify');
      } else {
        router.push('/my-account');
      }
    }
  }, [loginDetails, router]);

  return (
    <div>
      <div className="pt-8 w-[500px] mx-auto">
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">
            Create A New Account
          </h2>

          {isError && (
            <p className="font-bold bg-rose-100 py-4 px-4 text-center text-rose-600 mb-4">
              {error.message}
            </p>
          )}

          <FormWrapper
            showLoader={isPending}
            className="space-y-4"
            onSubmit={submitHandler}
          >
            <Input type="text" name="name" label="Full Name" />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            
            <Input type="phone" name="phone" label="Phone Number" />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

            <Input type="email" name="email" label="Email" />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

            <Input type="text" name="address" label="Address" />
            <Input type="password" name="password" label="Password" />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

            <label className="block mb-2 text-slate-500 text-sm">
              Signature Image
            </label>
            <ImageUpload
              selectedFile={signatureImg}
              setSelectedFile={setSignatureImg}
              height="h-[200px]"
              textSize="text-sm"
            />

            <label className="block mb-2 text-slate-500 text-sm">
              Citizenship Image
            </label>
            <ImageUpload
              selectedFile={citizenshipImg}
              setSelectedFile={setCitizenshipImg}
              height="h-[200px]"
              textSize="text-sm"
            />
          </FormWrapper>
          <p className="mt-2 text-slate-500 text-center">
            Already have an account?{' '}
            <Link className="text-amber-500 font-medium" href="/login">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
