
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import SuspendUser from './SuspendUser'; // Kullanıcı askıya alma bileşeni

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        console.error('Error fetching users: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>; // Yükleniyor durumu
  }

  return (
    <div className="bg-black-100 p-6 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4">Kullanıcılar</h2>

      <input
        type="text"
        placeholder="Kullanıcı ara"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-full p-2 border rounded-md"
      />

      <ul>
        {filteredUsers.map((user) => (
          <li key={user.id} className="flex justify-between items-center mb-4">
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <SuspendUser userId={user.id} currentStatus={user.suspended} />
          </li>
        ))}
      </ul>
    </div>
  );
}
