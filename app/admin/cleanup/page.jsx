'use client';

import { useEffect } from 'react';
import { deleteInvalidTickets } from '../../../utils/deleteInvalidTickets';

export default function CleanupPage() {
  useEffect(() => {
    deleteInvalidTickets();
  }, []);

  return (
    <div className="text-white p-10">
      🧹 Invalid ticket cleanup is running... Check console for results.
    </div>
  );
}
