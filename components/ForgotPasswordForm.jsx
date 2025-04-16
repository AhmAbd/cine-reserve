'use client';

import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Şifre sıfırlama bağlantısı e-postanıza gönderildi.');
    } catch (error) {
      console.error(error);
      setMessage('Bir hata oluştu. Lütfen geçerli bir e-posta girin.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-black-100">
      <h2 className="text-2xl font-bold mb-4">Şifremi Unuttum</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          className="w-full p-2 border rounded mb-2"
          placeholder="E-posta adresiniz"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700"
        >
          Şifreyi Sıfırla
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-center">{message}</p>}
    </div>
  );
};

export default ForgotPasswordForm;
