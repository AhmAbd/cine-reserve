'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  const navigateToPage = (page) => {
    router.push(`/admin/${page}`);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="space-y-4">
        <button
          className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold"
          onClick={() => navigateToPage('users')}>
          Kullanıcılar
        </button>
        <button
          className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold"
          onClick={() => navigateToPage('manage')}>
          Film ve Sinema Ekle
        </button>
        <button
          className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold"
          onClick={() => navigateToPage('movies')}>
          Filmler Listesi
        </button>
        <button
          className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold"
          onClick={() => navigateToPage('cinemas')}>
          Sinema Salonları Listesi
        </button>
        <button
          className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold"
          onClick={() => navigateToPage('messages')}>
          Gelen Mesajlar
        </button>
      </div>
    </div>
  );
}
