import { useRouter } from 'next/router';
import { useUserStore } from '@/store/user-store';
import { useEffect, useState } from 'react';

const Header = () => {
  const router = useRouter();
  const loginDetails = useUserStore((state) => state.loginDetails);
  const clearLoginDetails = useUserStore((state) => state.clearLoginDetails);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const response = await fetch('/api/csrf-token');
      const data = await response.json();
      setCsrfToken(data.csrfToken);
    };
    fetchCsrfToken();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken || '',
      },
    });

    clearLoginDetails();
    router.push('/login');
  };

  return (
    <header className="bg-white py-4 flex justify-between items-center border-b border-gray-200 px-6">
      <div className="flex items-center gap-x-2 text-2xl text-slate-900">
        <LogoIcon />
        <p>
          <span className="font-bold">Hamro</span>Bank
        </p>
      </div>
      {loginDetails && (
        <div className="flex items-center gap-x-4">
          <p className="text-slate-900">Hi, {loginDetails.name}</p>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-amber-500 text-white font-medium rounded-md hover:bg-amber-600 transition duration-300"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

const LogoIcon = () => (
  <svg
    className="h-10 w-10"
    width="185"
    height="180"
    viewBox="0 0 185 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M72.5749 165.88L72.5583 165.903L72.5419 165.926C69.9941 169.484 68.6608 171.267 67.5318 172.311C67.0754 172.732 66.8594 172.826 66.8314 172.838C66.8228 172.842 66.8143 172.845 66.804 172.849C66.793 172.852 66.7799 172.855 66.7623 172.859C66.7248 172.866 66.6305 172.881 66.4563 172.881C66.3024 172.881 66.2257 172.868 66.2032 172.863C66.1839 172.859 66.1771 172.857 66.166 172.852C66.1484 172.844 65.9349 172.752 65.4747 172.324C64.3437 171.273 63.0028 169.478 60.457 165.924L60.4412 165.902L60.4252 165.88L9.4565 95.8671C7.68183 93.3572 7.11927 91.5389 7.11927 90C7.11927 88.3925 7.66755 86.6618 9.45757 84.1314L60.4276 14.0304L60.4324 14.0238C62.9839 10.5061 64.3218 8.72822 65.4569 7.68011C65.9185 7.25389 66.1343 7.15986 66.1564 7.15035C66.1698 7.14461 66.1786 7.14147 66.1998 7.1373C66.224 7.13251 66.3019 7.11927 66.4563 7.11927C66.6297 7.11927 66.7242 7.13395 66.7628 7.14144C66.7981 7.1483 66.8172 7.15491 66.8372 7.1634C66.8703 7.17744 67.0895 7.27387 67.5482 7.69488C68.6827 8.736 70.0143 10.5036 72.5676 14.0238L72.5724 14.0304L123.542 84.1314C125.332 86.6618 125.881 88.3925 125.881 90C125.881 91.536 125.318 93.358 123.544 95.867L72.5749 165.88Z"
      stroke="#FBBF24"
      strokeWidth="14.2385"
    />
    <path
      d="M123.387 165.819L123.37 165.842L123.353 165.864C120.75 169.42 119.384 171.208 118.222 172.257C117.751 172.683 117.514 172.791 117.454 172.816L117.451 172.818C117.417 172.832 117.302 172.881 116.955 172.881C116.656 172.881 116.565 172.84 116.545 172.831L116.542 172.829C116.493 172.809 116.259 172.703 115.784 172.271C114.621 171.213 113.247 169.414 110.646 165.863L110.63 165.841L110.613 165.819L58.4951 95.8061C56.6765 93.291 56.1193 91.4938 56.1193 90C56.1193 88.438 56.6617 86.7285 58.4961 84.1925L110.616 14.0915L110.621 14.0849C113.228 10.5701 114.599 8.78761 115.766 7.73343C116.243 7.30309 116.479 7.19513 116.533 7.17276C116.533 7.17238 116.535 7.17192 116.536 7.17138C116.56 7.16055 116.655 7.11927 116.955 7.11927C117.302 7.11927 117.42 7.16849 117.457 7.18419L117.46 7.18537C117.525 7.21223 117.765 7.32266 118.239 7.74799C119.406 8.79534 120.771 10.5676 123.379 14.0849L123.384 14.0915L175.504 84.1924C177.338 86.7284 177.881 88.4379 177.881 90C177.881 91.4909 177.323 93.2919 175.505 95.8062L123.387 165.819Z"
      stroke="#FBBF24"
      strokeWidth="14.2385"
    />
  </svg>
);

export default Header;
