'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Kullanıcıyı Firestore'dan al ve role kontrol et
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
        // Admin rolüne sahipse dashboard sayfasına yönlendir
        router.push('/admin/dashboard');
      } else {
        setError('Bu kullanıcı bir admin değil.');
      }
    } catch (err) {
      setError('Giriş yapılamadı: ' + err.message);
    }
  };  

  return (
    <form onSubmit={handleLogin} className="bg-black shadow-md rounded px-8 py-6 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4 text-center">Admin Girişi</h2>

      <input
        type="email"
        placeholder="Email"
        className="w-full px-3 py-2 border rounded mb-4"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Şifre"
        className="w-full px-3 py-2 border rounded mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      <button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded"
      >
        Giriş Yap
      </button>
    </form>
  );
}