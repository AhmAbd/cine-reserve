'use client';

import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import useRequireAuth from '../../hooks/useRequireAuth'; // ✅ hook'u import ettik

const TicketsPage = () => {
  const user = useRequireAuth(); // ✅ auth kontrolü
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return; // kullanıcı gelmeden sorguya girme

    const fetchTickets = async () => {
      const q = query(collection(db, 'tickets'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const fetchedTickets = querySnapshot.docs.map(doc => doc.data());
      setTickets(fetchedTickets);
      setLoading(false);
    };

    fetchTickets();
  }, [user]);

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto bg-white shadow-xl p-8 rounded-xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-purple-800">Geçmiş Biletlerim</h2>
        {loading ? (
          <p className="text-center text-gray-500">Yükleniyor...</p>
        ) : tickets.length === 0 ? (
          <p className="text-center text-gray-900">Hiç bilet geçmişiniz bulunmamaktadır.</p>
        ) : (
          <ul className="space-y-4">
            {tickets.map((ticket, index) => (
              <li key={index} className="p-4 border rounded-lg bg-gray-50">
                <p><strong>Film:</strong> {ticket.movieName}</p>
                <p><strong>Seans:</strong> {ticket.session}</p>
                <p><strong>Sinema:</strong> {ticket.cinemaName}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TicketsPage;
