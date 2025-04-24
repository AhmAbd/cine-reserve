'use client';

import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import useRequireAuth from '../../hooks/useRequireAuth';

const TicketsPage = () => {
  const { user, loading: authLoading } = useRequireAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchTickets = async () => {
      try {
        const q = query(
          collection(db, 'tickets'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc') // ✅ sort by latest
        );
        const querySnapshot = await getDocs(q);
        const fetchedTickets = querySnapshot.docs.map(doc => doc.data());
        setTickets(fetchedTickets);
      } catch (err) {
        console.error('Error fetching tickets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user, authLoading]);

  return (
    <div className="w-full min-h-screen bg-[#1f1f1f] text-white px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-purple-400">
          🎟️ Geçmiş Biletlerim
        </h2>

        {loading ? (
          <p className="text-center text-gray-400">Yükleniyor...</p>
        ) : tickets.length === 0 ? (
          <p className="text-center text-gray-500">
            Hiç bilet bulunamadı.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {tickets.map((ticket, index) => (
              <div
                key={index}
                className="bg-[#2b2b2b] rounded-xl shadow-md p-5 space-y-3 border border-purple-800"
              >
                <div className="text-xl font-semibold text-purple-300">
                  🎬 {ticket.movieName || 'Film Bilinmiyor'}
                </div>

                <div className="text-sm text-gray-400">
                  <span className="font-medium text-white">Seans:</span>{' '}
                  {ticket.session
                    ? new Date(ticket.session).toLocaleString('tr-TR')
                    : '—'}
                </div>

                <div className="text-sm text-gray-400">
                  <span className="font-medium text-white">Sinema:</span>{' '}
                  {ticket.cinemaName || '—'}
                </div>

                <div className="text-sm text-gray-400">
                  <span className="font-medium text-white">Koltuklar:</span>{' '}
                  {ticket.seats?.length > 0
                    ? ticket.seats.join(', ')
                    : '—'}
                </div>

                <div className="text-sm text-gray-400">
                  <span className="font-medium text-white">Rezervasyon Tarihi:</span>{' '}
                  {ticket.timestamp?.toDate
                    ? ticket.timestamp.toDate().toLocaleString('tr-TR')
                    : '—'}
                </div>

                <div className="text-lg font-bold text-green-400">
                  Toplam: {ticket.totalPrice != null ? `${ticket.totalPrice} ₺` : '₺'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketsPage;
