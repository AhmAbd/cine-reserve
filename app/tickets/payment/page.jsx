'use client';

import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../../lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import useRequireAuth from '../../../hooks/useRequireAuth';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const { user } = useRequireAuth();

  const seats = searchParams.get('seats')?.split(',') || [];
  const fullCount = parseInt(searchParams.get('full') || '0');
  const studentCount = parseInt(searchParams.get('student') || '0');
  const movieId = searchParams.get('movie');
  const cinemaId = searchParams.get('cinema');

  const [prices, setPrices] = useState({ full: 0, student: 0 });
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentComplete, setPaymentComplete] = useState(false);

  const total = fullCount * prices.full + studentCount * prices.student;

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const priceDoc = await getDoc(doc(db, 'prices', 'ticketTypes'));
        if (priceDoc.exists()) {
          setPrices(priceDoc.data());
        }
      } catch (err) {
        console.error('Failed to fetch prices:', err);
      }
    };
    fetchPrices();
  }, []);

  const fakePayment = async () => {
    setLoading(true);
    setPaymentStatus('');

    try {
      // ✅ Fetch movie and cinema metadata
      const movieSnap = await getDoc(doc(db, 'films', movieId));
      const cinemaSnap = await getDoc(doc(db, 'cinemas', cinemaId));

      const movieName = movieSnap.exists() ? movieSnap.data().title : 'Bilinmeyen Film';
      const cinemaData = cinemaSnap.exists() ? cinemaSnap.data() : {};
      const cinemaName = cinemaData.name || 'Bilinmeyen Sinema';
      const session = (movieSnap.data()?.cinemas || []).find(c => c.id === cinemaId)?.showtime || null;

      // ✅ Save ticket once, with all data
      const ticketData = {
        userId: user.uid,
        movieId,
        movieName,
        cinemaId,
        cinemaName,
        session,
        seats,
        fullCount,
        studentCount,
        totalPrice: total,
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, 'tickets'), ticketData);

      setPaymentStatus('Ödeme başarılı! 🎉');
      setPaymentComplete(true);

      setTimeout(() => {
        window.location.href = '/account/tickets';
      }, 3000);
    } catch (error) {
      console.error('Error during payment:', error);
      setPaymentStatus('❌ Ödeme başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 overflow-hidden relative">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"
        animate={{
          background: [
            'linear-gradient(135deg, #0a0a0a 0%, #1f1f1f 50%, #0a0a0a 100%)',
            'linear-gradient(135deg, #0a0a0a 0%, #2d1a4b 50%, #0a0a0a 100%)',
            'linear-gradient(135deg, #0a0a0a 0%, #1f1f1f 50%, #0a0a0a 100%)',
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="bg-[#1f1f1f] p-8 rounded-xl shadow-xl text-white w-[350px] space-y-4">
          <h2 className="text-2xl font-bold mb-4">Ödeme Bilgileri</h2>

          <p><strong>Koltuklar:</strong> {seats.join(', ') || 'Yok'}</p>
          <p><strong>Tam Bilet:</strong> {fullCount} × {prices.full} ₺</p>
          <p><strong>Öğrenci Bilet:</strong> {studentCount} × {prices.student} ₺</p>
          <p><strong>Toplam:</strong> {total} ₺</p>

          {paymentStatus && (
            <div className="text-center text-green-500 font-semibold mt-4">
              {paymentStatus}
            </div>
          )}

          <button
            className="w-full mt-4 bg-[#a020f0] hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition"
            onClick={fakePayment}
            disabled={loading}
          >
            {loading ? 'Yükleniyor...' : 'Ödemeyi Tamamla'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
