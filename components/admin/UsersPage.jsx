'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import SuspendUser from './SuspendUser';

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
          name: doc.data().name || 'İsimsiz Kullanıcı',
          mail: doc.data().mail || 'Email yok',
          suspended: doc.data().suspended || false,
        }));
        setUsers(usersList);
      } catch (error) {
        console.error('Kullanıcılar yüklenirken hata: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const userName = user.name || '';
    const userEmail = user.mail || '';
    const userId = user.id || '';
    const searchText = searchTerm.toLowerCase();
    
    return (
      userName.toLowerCase().includes(searchText) || 
      userEmail.toLowerCase().includes(searchText) ||
      userId.toLowerCase().includes(searchText)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-black-100 p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-bold mb-6 text-white">Kullanıcı Yönetimi</h2>

      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Kullanıcı ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
        />
        <span className="absolute left-3 top-3 text-gray-400">
          🔍
        </span>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Sonuç bulunamadı</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-700">
          {filteredUsers.map((user) => (
            <li key={user.id} className="py-4 flex justify-between items-center px-3">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-white">{user.name}</p>
                  <p className="text-sm text-gray-300">{user.mail}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {user.id}</p>
                </div>
              </div>
              <SuspendUser 
                userId={user.id} 
                currentStatus={user.suspended} 
                className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 text-white"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}