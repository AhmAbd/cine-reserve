'use client';

import React, { useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { confirmPasswordReset } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function ResetPasswordForm() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [oobCode, setOobCode] = useState('');

  useEffect(() => {
    // SSR hatası almamak için window.location'ı sadece tarayıcıda çalıştır
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('oobCode');
      if (code) {
        setOobCode(code);
      } else {
        setError('Geçersiz bağlantı.');
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oobCode) {
      setError('Şifre sıfırlama kodu bulunamadı.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Şifreler uyuşmuyor.');
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess('Şifreniz başarıyla sıfırlandı. Giriş sayfasına yönlendiriliyorsunuz...');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      setError('Şifre sıfırlama başarısız. Kod süresi dolmuş olabilir.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black-100">
      <div className="bg-black p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-center">Yeni Şifre Belirle</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-2">{success}</p>}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Yeni Şifre</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Şifreyi Onayla</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded"
            >
              Şifreyi Sıfırla
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
