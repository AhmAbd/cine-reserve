'use client';

import dynamic from 'next/dynamic';

const FavoritesPage = dynamic(() => import('../../../components/account/FavoritesPage'), {
  ssr: false,
});

export default function Page() {
  return <FavoritesPage />;
}
