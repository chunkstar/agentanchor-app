import { useState } from 'react';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { containsProfanity } from '../lib/profanityFilter';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState({ message: '', isError: false });

  const handleAuth = async (e) => {
    e.preventDefault();
    setFeedback({ message: '', isError: false });

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          tier: 1,
          role: 'user',
          createdAt: new Date(),
        });
        await sendEmailVerification(user);
        setFeedback({ message: 'Verification email sent! Please check your inbox.', isError: false });
      }
    } catch (error) {
      setFeedback({ message: error.message, isError: true });
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setFeedback({ message: 'Please enter your email address to reset your password.', isError: true });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setFeedback({ message: 'Password reset email sent! Please check your inbox.', isError: false });
    } catch (error) {
      setFeedback({ message: error.message, isError: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600">Banquet AIQ</h1>
          <p className="text-gray-500 mt-2">Your intelligent event planning assistant.</p>
        </header>
        <div className="card">
          <div className="mb-6 flex justify-center border-b">
            <button
              onClick={() => setIsLogin(true)}
              className={`tab-btn ${isLogin ? 'active' : ''}`}
            >
              Log In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`tab-btn ${!isLogin ? 'active' : ''}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <button type="submit" className={`btn w-full ${isLogin ? 'btn-green' : 'btn-gray'}`}>
              {isLogin ? 'Log In' : 'Create Free Account'}
            </button>
            {isLogin && (
              <div className="text-center mt-4">
                <a href="#" onClick={handlePasswordReset} className="text-sm text-blue-600 hover:underline">Forgot Password?</a>
              </div>
            )}
          </form>
          
          {feedback.message && (
            <p className={`mt-4 text-sm text-center font-medium ${feedback.isError ? 'text-red-500' : 'text-green-500'}`}>
              {feedback.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
