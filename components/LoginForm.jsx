'use client';
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase'; // Firebase bağlantısı
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase'; // Firebase Firestore bağlantısı

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Önceki hatayı temizle

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Kullanıcı bilgilerini Firebase'den al
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Kullanıcının askıya alınıp alınmadığını kontrol et
        if (userData.suspended) {
          setError('Hesabınız askıya alınmış. Lütfen destek ile iletişime geçin.');
          return;
        }

        // Eğer askıya alınmamışsa, kullanıcıyı yönlendir
        router.push('/home');
      } else {
        setError('Kullanıcı bilgileri bulunamadı.');
      }
    } catch (err) {
      setError('E-posta veya şifre hatalı!');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white-800 mb-6">Giriş Yap</h1>

      <form className="space-y-5 w-full max-w-md" onSubmit={handleSubmit}>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div>
          <label className="block text-sm mb-1 text-white-700">E-posta</label>
          <input
            type="email"
            name="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="example@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-white-700">Şifre</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="••••••••"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-sm text-purple-600 cursor-pointer"
            >
              {showPassword ? 'Gizle' : 'Göster'}
            </span>
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="form-checkbox" />
            <span>Beni Hatırla</span>
          </label>
          <a href="/forgot-password" className="text-purple-600 hover:underline">Şifremi unuttum</a>
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition"
        >
          Giriş Yap
        </button>

        <p className="text-sm text-center mt-4">
          Henüz üye değil misiniz?{" "}
          <a href="/register" className="text-purple-600 hover:underline">Üye Ol</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
