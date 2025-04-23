'use client';

import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence } from 'framer-motion';

export default function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [saveCard, setSaveCard] = useState(false);
  const [use3D, setUse3D] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [isStripeLoaded, setIsStripeLoaded] = useState(false);

  // Check if Stripe is loaded
  useEffect(() => {
    if (stripe && elements) {
      setIsStripeLoaded(true);
      console.log('Stripe and Elements are loaded');
    } else {
      console.log('Stripe or Elements not loaded yet');
    }
  }, [stripe, elements]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      setMessage('Stripe henüz yüklenmedi.');
      return;
    }

    if (!agreed) {
      setMessage('Sözleşmeyi kabul etmeniz gerekiyor.');
      return;
    }

    setLoading(true);
    const cardElement = elements.getElement(CardElement);

    try {
      const { token, error } = await stripe.createToken(cardElement);
      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      if (use3D) console.log('3D Secure yönlendirme simülasyonu...');

      if (saveCard) {
        const userId = 'demo-user-id';
        const cardRef = doc(db, 'users', userId, 'savedCards', uuidv4());

        await setDoc(cardRef, {
          tokenId: token.id,
          last4: token.card.last4,
          brand: token.card.brand,
          createdAt: new Date(),
        });

        setMessage('Kart başarıyla kaydedildi.');
      } else {
        setMessage('Ödeme başarılı.');
      }

      setSuccess(true);
      setTimeout(() => router.push('/success'), 2000);
    } catch (err) {
      setMessage('Bir hata oluştu.');
      console.error('Error:', err);
      setLoading(false);
    }
  };

  if (!isStripeLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-t-purple-500 border-gray-300 rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl shadow-2xl border border-purple-500/30 max-w-lg w-full space-y-6 text-white overflow-hidden"
    >
      {/* Background Glow Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 pointer-events-none"
        animate={{ opacity: [0, 0.3, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.h2
        className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        💸 Güvenli Ödeme
      </motion.h2>

      <motion.div
        className="relative rounded-xl p-5 bg-gray-800/50 border border-purple-500/20 transition-all duration-300 focus-within:ring-2 focus-within:ring-purple-500"
        whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' }}
        transition={{ duration: 0.3 }}
      >
        <CardElement
          options={{
            hidePostalCode: true,
            style: {
              base: {
                iconColor: '#a3bffa',
                color: '#fff',
                fontSize: '18px',
                fontFamily: '"Inter", sans-serif',
                '::placeholder': { color: '#a3a3a3' },
              },
              invalid: {
                iconColor: '#f87171',
                color: '#f87171',
              },
            },
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 pointer-events-none"
          whileHover={{ opacity: 0.4 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>

      <motion.div
        className="flex items-center gap-3 cursor-pointer"
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.2 }}
      >
        <input
          type="checkbox"
          checked={saveCard}
          onChange={() => setSaveCard(!saveCard)}
          className="w-5 h-5 accent-purple-500 rounded-md cursor-pointer"
        />
        <label className="text-sm font-medium">Kartı kaydet</label>
      </motion.div>

      <motion.div
        className="flex items-center gap-3 cursor-pointer"
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.2 }}
      >
        <input
          type="checkbox"
          checked={use3D}
          onChange={() => setUse3D(!use3D)}
          className="w-5 h-5 accent-purple-500 rounded-md cursor-pointer"
        />
        <label className="text-sm font-medium">3D Secure ile ödeme yap</label>
      </motion.div>

      <motion.div
        className="flex items-start gap-3 cursor-pointer"
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.2 }}
      >
        <input
          type="checkbox"
          checked={agreed}
          onChange={() => setAgreed(!agreed)}
          className="w-5 h-5 accent-purple-500 rounded-md cursor-pointer mt-1"
        />
        <label className="text-sm font-medium">
          <a href="/sozlesme" className="text-purple-300 hover:text-purple-100 transition underline" target="_blank">
            Ön Bilgilendirme
          </a>{' '}
          ve{' '}
          <a href="/mesafeli-satis" className="text-purple-300 hover:text-purple-100 transition underline" target="_blank">
            Mesafeli Satış Sözleşmesi'ni
          </a>{' '}
          okudum, onaylıyorum.
        </label>
      </motion.div>

      <AnimatePresence>
        {message && (
          <motion.p
            key="msg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-red-400 font-medium text-center"
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        className="relative w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold shadow-lg overflow-hidden z-10"
        disabled={!isStripeLoaded || loading}
      >
        <span className="relative z-20">
          {loading ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
        </span>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-600 opacity-0 pointer-events-none"
          whileHover={{ opacity: 0.5 }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>

      <AnimatePresence>
        {success && (
          <motion.div
            key="success"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="text-center mt-4 text-green-400 text-sm font-medium flex items-center justify-center gap-2"
          >
            <span>✅ Ödeme işlemi başarılı! Yönlendiriliyorsunuz...</span>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              🎉
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}