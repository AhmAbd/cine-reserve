'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import clsx from 'clsx';

export default function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fadeOut, setFadeOut] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
        setFadeOut(true);
        setTimeout(() => {
          router.push('/admin/users');
        }, 600); // animasyon süresiyle eşleşiyor
      } else {
        setError('Bu kullanıcı bir admin değil.');
      }
    } catch (err) {
      setError('Giriş yapılamadı: ' + err.message);
    }
  };

  return (
    <div
      className={clsx(
        "fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 transition-opacity duration-500",
        fadeOut && "opacity-0"
      )}
    >
      <form
        onSubmit={handleLogin}
        className="bg-white/5 backdrop-blur-xl shadow-2xl rounded-2xl px-10 py-8 w-full max-w-md animate-fadeIn border border-white/10"
      >
        <h2 className="text-2xl font-extrabold mb-6 text-center text-white tracking-wide drop-shadow-lg">
          Admin Girişi
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 mb-4 text-white bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-white/60"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Şifre"
          className="w-full px-4 py-3 mb-4 text-white bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-white/60"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-red-400 text-sm mb-4 text-center animate-pulse">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold py-3 rounded-lg transition-transform transform hover:scale-105 active:scale-95 duration-300 shadow-md"
        >
          Giriş Yap
        </button>
      </form>
    </div>
  );
}
