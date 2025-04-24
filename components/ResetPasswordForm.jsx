'use client';

import React, { useEffect, useState } from 'react';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResetPasswordForm() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [oobCode, setOobCode] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('oobCode');
      if (code) {
        setOobCode(code);
      } else {
        setMessage({
          text: 'Geçersiz bağlantı.',
          type: 'error',
        });
      }
    }
  }, []);

  useEffect(() => {
    if (message?.type === 'success') {
      const timeout = setTimeout(() => {
        router.push('/login');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [message, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!oobCode) {
      setMessage({
        text: 'Şifre sıfırlama kodu bulunamadı.',
        type: 'error',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({
        text: 'Şifreler uyuşmuyor.',
        type: 'error',
      });
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage({
        text: 'Şifreniz başarıyla sıfırlandı. Giriş sayfasına yönlendiriliyorsunuz...',
        type: 'success',
      });
    } catch (err) {
      setMessage({
        text: 'Şifre sıfırlama başarısız. Kod süresi dolmuş olabilir.',
        type: 'error',
      });
    }
  };

  return (
    <div className="fixed inset-0 h-screen w-screen bg-black flex items-center justify-center p-4 overflow-hidden">
      {/* Background Elements */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black pointer-events-none z-0"
        animate={{
          background: [
            'linear-gradient(135deg, #0a0a0a 0%, #1f1f1f 50%, #0a0a0a 100%)',
            'linear-gradient(135deg, #0a0a0a 0%, #2d1a4b 50%, #0a0a0a 100%)',
            'linear-gradient(135deg, #0a0a0a 0%, #1f1f1f 50%, #0a0a0a 100%)',
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Subtle Glowing Orbs */}
      <motion.div
        className="absolute top-1/5 left-1/5 w-80 h-80 bg-purple-900/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [-30, 30, -30],
          y: [-30, 30, -30],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/5 right-1/5 w-80 h-80 bg-pink-900/10 rounded-full blur-3xl pointer-events-none"
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.3, 0.5, 0.3],
          x: [30, -30, 30],
          y: [30, -30, 30],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Message Modal */}
      <AnimatePresence>
        {message && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className={`relative z-40 p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4 ${
                message.type === 'success'
                  ? 'bg-gradient-to-br from-green-600 to-green-700'
                  : 'bg-gradient-to-br from-red-600 to-red-700'
              }`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="text-center">
                <motion.div
                  className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {message.type === 'success' ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-green-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-red-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {message.type === 'success' ? 'Başarılı!' : 'Hata!'}
                </h3>
                <p className="text-gray-200 mb-4">{message.text}</p>
                {message.type === 'success' && (
                  <div className="w-full bg-green-100/20 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-green-100 h-full rounded-full"
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ duration: 3 }}
                    />
                  </div>
                )}
                {message.type === 'error' && (
                  <motion.button
                    className="mt-4 px-4 py-1 bg-gray-800/50 text-white rounded-lg text-sm"
                    onClick={() => setMessage(null)}
                    whileHover={{ backgroundColor: 'rgba(75, 85, 99, 0.7)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Kapat
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Container */}
      <motion.form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-purple-500/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Form Header */}
        <div className="text-center mb-4">
          <motion.div
            className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-3"
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </motion.div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-1">
            Yeni Şifre Belirle
          </h1>
          <p className="text-gray-400 text-xs">Yeni şifrenizi oluşturun</p>
        </div>

        {/* New Password */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-300 mb-1">Yeni Şifre</label>
          <motion.input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="••••••••"
            required
            minLength={6}
            whileFocus={{
              borderColor: '#a855f7',
              boxShadow: '0 0 0 2px rgba(168, 85, 247, 0.3)',
            }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-300 mb-1">Şifreyi Onayla</label>
          <motion.input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="••••••••"
            required
            minLength={6}
            whileFocus={{
              borderColor: '#a855f7',
              boxShadow: '0 0 0 2px rgba(168, 85, 247, 0.3)',
            }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          className="relative w-full py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold text-sm"
          whileHover={{
            scale: 1.02,
            boxShadow: '0 0 15px rgba(192, 132, 252, 0.4)',
          }}
          whileTap={{
            scale: 0.98,
            boxShadow: '0 0 10px rgba(192, 132, 252, 0.2)',
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          Şifreyi Sıfırla
        </motion.button>
      </motion.form>
    </div>
  );
}