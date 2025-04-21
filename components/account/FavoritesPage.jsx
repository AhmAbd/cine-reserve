'use client';

import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import useRequireAuth from '../../hooks/useRequireAuth';
import MovieCard from '../../components/MovieCard'; // 👈 Make sure path is correct
import Link from 'next/link';

const FavoritesPage = () => {
  const { user, loading: authLoading } = useRequireAuth();
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchFavorites = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const slugs = userSnap.data()?.favorites || [];

        if (slugs.length === 0) {
          setFavoriteMovies([]);
          return;
        }

        const filmsSnapshot = await getDocs(collection(db, 'films'));
        const allMovies = filmsSnapshot.docs.map(doc => doc.data());

        // Match slugs
        const favorites = allMovies.filter(movie => slugs.includes(movie.slug));
        setFavoriteMovies(favorites);
      } catch (error) {
        console.error('Favoriler alınırken bir hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, authLoading]);

  if (authLoading) {
    return <div className="text-center p-8 text-white">Yükleniyor...</div>;
  }

  if (!user) {
    return <div className="text-center p-8 text-white">Giriş yapmanız gerekiyor.</div>;
  }

  return (
    <div className="w-full min-h-screen bg-[#1f1f1f] text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-purple-400">Favorilerim</h2>

        {loading ? (
          <p className="text-center text-gray-400">Yükleniyor...</p>
        ) : favoriteMovies.length === 0 ? (
          <p className="text-center text-gray-300">Henüz favorilere eklediğiniz bir film yok.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favoriteMovies.map((movie) => (
              <Link key={movie.slug} href={`/movies/${movie.slug}`}>
                <div className="hover:scale-105 transition-transform">
                  <MovieCard movie={movie} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
