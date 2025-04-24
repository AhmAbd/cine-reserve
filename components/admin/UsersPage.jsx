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
      <div className="fixed inset-0 h-screen w-screen bg-black flex items-center justify-center">
        <motion.div
          className="relative w-20 h-20"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 60 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M30 5 A25 25 0 0 1 55 30 A25 25 0 0 1 30 55"
              stroke="url(#spinnerGradient)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="100 150"
            />
            <defs>
              <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
          <div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: '0 0 15px rgba(168, 85, 247, 0.5), 0 0 30px rgba(236, 72, 153, 0.3)',
            }}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 h-screen w-screen bg-black flex items-center justify-center p-4 overflow-hidden">
      {/* Background Elements */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-black via-purple-950 to-black pointer-events-none z-0"
        initial={{
          background: 'linear-gradient(180deg, #000000 0%, #000000 50%, #000000 100%)',
        }}
        animate={{
          background: 'linear-gradient(180deg, #000000 0%, #2d1a4b 50%, #000000 100%)',
        }}
        transition={{ duration: 3, ease: 'easeInOut' }}
      />

      {/* Static Stars */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full pointer-events-none"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: 0,
            opacity: 0,
          }}
          animate={{
            scale: Math.random() * 0.5 + 0.5,
            opacity: Math.random() * 0.6 + 0.2,
          }}
          transition={{
            duration: Math.random() * 2 + 1,
            ease: 'easeInOut',
            delay: Math.random() * 1,
          }}
        />
      ))}

      {/* Nebula Glow */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl pointer-events-none"
        initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
        animate={{ scale: 1, opacity: 0.4, x: 0, y: 0 }}
        transition={{ duration: 2, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none"
        initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
        animate={{ scale: 1, opacity: 0.5, x: 0, y: 0 }}
        transition={{ duration: 2.5, ease: 'easeOut' }}
      />

      {/* Main Container */}
      <motion.div
        className="relative z-10 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-5xl mx-auto text-white border border-purple-500/20 flex flex-col"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6 text-center">
          👤 Kullanıcı Yönetimi
        </h2>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <motion.input
            type="text"
            placeholder="Kullanıcı ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            whileFocus={{
              borderColor: '#a855f7',
              boxShadow: '0 0 0 2px rgba(168, 85, 247, 0.3)',
            }}
            transition={{ duration: 0.2 }}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>

        {/* Scrollable User List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">Sonuç bulunamadı</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-800">
              {filteredUsers.map((user) => (
                <motion.li
                  key={user.id}
                  className="py-4 flex justify-between items-center px-4 bg-gray-800/30 rounded-lg mb-2"
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(55, 65, 81, 0.5)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.mail}</p>
                      <p className="text-xs text-gray-500 mt-1">ID: {user.id}</p>
                    </div>
                  </div>
                  <SuspendUser
                    userId={user.id}
                    currentStatus={user.suspended}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-semibold hover:from-purple-700 hover:to-pink-600 transition"
                  />
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
}