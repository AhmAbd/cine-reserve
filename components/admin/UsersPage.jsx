'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../lib/firebase';
import SuspendUser from './SuspendUser';
import { motion } from 'framer-motion';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Admin kontrolü
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/admin/login');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      if (!userData?.role || userData.role !== 'admin') {
        router.push('/admin/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Kullanıcıları getir
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
    const searchText = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchText) ||
      user.mail.toLowerCase().includes(searchText) ||
      user.id.toLowerCase().includes(searchText)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-gray-900 p-6 rounded-2xl shadow-xl w-full max-w-5xl mx-auto text-white"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl font-bold mb-6 text-purple-400 text-center">👤 Kullanıcı Yönetimi</h2>

      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Kullanıcı ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 pl-10 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-800 text-white"
        />
        <span className="absolute left-3 top-3 text-gray-400">🔍</span>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Sonuç bulunamadı</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-800">
          {filteredUsers.map((user) => (
            <motion.li
              key={user.id}
              className="py-4 flex justify-between items-center px-3"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-400">{user.mail}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {user.id}</p>
                </div>
              </div>
              <SuspendUser
                userId={user.id}
                currentStatus={user.suspended}
                className="px-4 py-2 rounded-lg border border-gray-600 bg-gray-800 hover:bg-gray-700 text-white transition"
              />
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
