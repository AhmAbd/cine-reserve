'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../../lib/firebase';
import AddFilm from './AddFilm';
import AddCinema from './AddCinema';
import { motion } from 'framer-motion';

export default function ManagePage() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        router.push('/admin/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen w-screen bg-black flex flex-col">
      {/* Background Gradient */}
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
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        transition={{ duration: 2, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.5 }}
        transition={{ duration: 2.5, ease: 'easeOut' }}
      />

      {/* Main Content with Scroll */}
      <div className="flex-1 overflow-y-auto p-4">
        <motion.div
          className="relative z-10 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-6xl mx-auto text-white border border-purple-500/20 flex flex-col"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-3xl font-extrabold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            🎬 Film ve Sinema
          </motion.h2>

          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-gray-800/80 p-6 rounded-xl shadow-lg"
            >
              <AddFilm />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="bg-gray-800/80 p-6 rounded-xl shadow-lg"
            >
              <AddCinema />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}