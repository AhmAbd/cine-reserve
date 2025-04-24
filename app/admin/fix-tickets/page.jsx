'use client';

import { useEffect, useState } from 'react';
import { patchOldTickets } from '../../../utils/patchOldTickets';
import useRequireAuth from '../../../hooks/useRequireAuth';

export default function FixTicketsPage() {
  const { user, loading } = useRequireAuth();
  const [status, setStatus] = useState('Bekleniyor...');

  useEffect(() => {
    if (loading || !user) return;

    const runPatch = async () => {
      try {
        setStatus('Başlatılıyor...');
        await patchOldTickets();
        setStatus('✅ Tüm eksik biletler güncellendi.');
      } catch (error) {
        console.error('Hata:', error);
        setStatus('❌ Güncelleme başarısız oldu.');
      }
    };

    runPatch();
  }, [user, loading]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-4 text-purple-400">🎟️ Biletleri Güncelle</h1>
      <p className="text-center text-lg">{status}</p>
    </div>
  );
}
