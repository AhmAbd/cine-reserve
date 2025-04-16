'use client';

import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export default function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [saveCard, setSaveCard] = useState(false);
  const [use3D, setUse3D] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

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

      // Simülasyon: 3D Secure ile ödeme (gerçek işlem yapılmıyor)
      if (use3D) {
        console.log('3D Secure yönlendirme simülasyonu...');
      }

      // Firebase'e kaydet
      if (saveCard) {
        const userId = 'demo-user-id'; // gerçek kullanıcı ID burada alınmalı
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

      // Başka bir sayfaya yönlendirme
      // router.push('/success');
    } catch (err) {
      setMessage('Bir hata oluştu.');
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray p-6 rounded-lg shadow-md max-w-md w-full space-y-4">
      <h2 className="text-xl font-semibold mb-4">Ödeme Yap</h2>

      <div className="border rounded-md p-4">
        <CardElement options={{ hidePostalCode: true }} />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" checked={saveCard} onChange={() => setSaveCard(!saveCard)} />
        <label>Kartı kaydet</label>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" checked={use3D} onChange={() => setUse3D(!use3D)} />
        <label>3D Secure ile ödemek istiyorum</label>
      </div>

      <div className="flex items-start gap-2">
        <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} />
        <label>
          <span className="text-sm">
            <a href="/sozlesme" className="text-blue-600 underline" target="_blank">
              Ön Bilgilendirme Koşulları'nı
            </a>{' '}
            ve{' '}
            <a href="/mesafeli-satis" className="text-blue-600 underline" target="_blank">
              Mesafeli Satış Sözleşmesi'ni
            </a>{' '}
            okudum, onaylıyorum.
          </span>
        </label>
      </div>

      {message && <p className="text-sm text-red-600">{message}</p>}

      <button
        type="submit"
        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
        disabled={!stripe || loading}
      >
        {loading ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
      </button>
    </form>
  );
}

