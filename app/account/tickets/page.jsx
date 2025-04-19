'use client';

import dynamic from 'next/dynamic';

const TicketsPage = dynamic(() => import('../../../components/account/TicketsPage'), {
  ssr: false,
});

export default function Page() {
  return <TicketsPage />;
}
