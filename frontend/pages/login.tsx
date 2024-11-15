import React, { useState, useEffect } from 'react';
import FormWrapper from '@/components/forms/form-wrapper';
import Input from '@/components/forms/input';
import { useLoginUser } from '@/hooks/use-login-user';
import { LoginPayload } from '@/models/user';
import { useUserStore } from '@/store/user-store';
import Link from 'next/link';
import { useRouter } from 'next/router';

const LoginPage = () => {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState('');

  const { mutate: loginUser, isPending, isError } = useLoginUser();
  const setLoginDetails = useUserStore((state) => state.setLoginDetails);
  const loginDetails = useUserStore((state) => state.loginDetails);

  useEffect(() => {
    if (loginDetails) {
      if (loginDetails.isAdmin) {
        router.push('/adminlogin');
      } else {
        router.push('/my-account');
      }
    }
  }, [loginDetails, router]);

  const submitHandler = (data: LoginPayload) => {
    loginUser(data, {
      onSuccess: (user) => {
        setSuccessMessage('Login Successful!');
        setLoginDetails(user);
        if (user.isAdmin) {
          router.push('/adminlogin');
        } else {
          router.push('/my-account');
        }
      },
    });
  };

  return (
    <div>
      <div className="pt-8 w-[500px] mx-auto">
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">
            Login To Your Account
          </h2>

          {isError && (
            <p className="font-bold bg-rose-100 py-4 px-4 text-center text-rose-600 mb-4">
              Login Failed!
            </p>
          )}

          {successMessage && (
            <p className="font-bold bg-green-100 py-4 px-4 text-center text-green-600 mb-4">
              {successMessage}
            </p>
          )}

          <FormWrapper
            showLoader={isPending}
            className="space-y-4"
            onSubmit={submitHandler}
          >
            <Input type="phone" name="phone" label="Phone Number" />
            <Input type="password" name="password" label="Password" />
            <div className="pt-2"></div>
          </FormWrapper>
          <p className="mt-2 text-slate-500 text-center">
            Don&apos;t have an account?{' '}
            <Link className="text-amber-500 font-medium" href="/register">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
