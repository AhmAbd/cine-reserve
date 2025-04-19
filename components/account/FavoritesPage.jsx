'use client';

import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import useRequireAuth from '../../hooks/useRequireAuth';

const FavoritesPage = () => {
  const { user, loading: authLoading } = useRequireAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchFavorites = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        setFavorites(userData?.favorites || []);
      } catch (error) {
        console.error("Favoriler alınırken bir hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, authLoading]);

  if (authLoading) {
    return <div className="text-center p-8">Yükleniyor...</div>;
  }

  if (!user) {
    return <div className="text-center p-8">Giriş yapmanız gerekiyor.</div>;
  }

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto bg-white shadow-xl p-8 rounded-xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-purple-800">Favorilerim</h2>
        {loading ? (
          <p className="text-center text-gray-500">Yükleniyor...</p>
        ) : favorites.length === 0 ? (
          <p className="text-center text-gray-900">Henüz favorilere eklediğiniz bir film yok.</p>
        ) : (
          <ul className="space-y-4">
            {favorites.map((movie, index) => (
              <li key={index} className="p-4 border rounded-lg bg-gray-50">
                <p><strong>Film:</strong> {movie}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;