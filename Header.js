import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import Image from 'next/image';

const Header = () => {
  const user = auth.currentUser;

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <header className="bg-white shadow-sm mb-8">
      <div className="container mx-auto flex justify-between items-center p-4">
        <div className="flex items-center gap-4">
          {/* Logo Placeholder */}
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            {/* Replace with your actual logo */}
            <Image src="/logo-placeholder.svg" alt="Logo" width={24} height={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-green-600">Banquet AIQ</h1>
            <p className="text-gray-500 text-sm">AIQ Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user && <span className="text-sm text-gray-600 hidden sm:block">Welcome, {user.email}</span>}
          <button onClick={handleLogout} className="btn btn-red">Log Out</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
