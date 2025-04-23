'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const AnimatedLink = ({ href, children, className }) => {
  return (
    <motion.span
      className="inline-block"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={href}
        className={`${className} text-purple-400 hover:text-purple-300 transition-colors`}
        onClick={(e) => {
          e.stopPropagation();
          console.log('Link clicked', { x: e.clientX, y: e.clientY });
        }}
      >
        {children}
      </Link>
    </motion.span>
  );
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
      const handleResize = () => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.suspended) {
          setError('Hesabınız askıya alınmış. Lütfen destek ile iletişime geçin.');
          return;
        }
        
        setIsRedirecting(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        router.push('/');
      } else {
        setError('Kullanıcı bilgileri bulunamadı.');
      }
    } catch (err) {
      setError('E-posta veya şifre hatalı!');
      console.error('Firebase error:', err);
    }
  };

  return (
    <div className="fixed inset-0 h-screen w-screen bg-black flex items-center justify-center p-4 overflow-hidden">
      <AnimatePresence>
        {isRedirecting && (
          <motion.div
            className="absolute inset-0 bg-black z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* Background Elements */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black pointer-events-none z-0"
        animate={{
          background: [
            'linear-gradient(135deg, #0a0a0a 0%, #1f1f1f 50%, #0a0a0a 100%)',
            'linear-gradient(135deg, #0a0a0a 0%, #2d1a4b 50%, #0a0a0a 100%)',
            'linear-gradient(135deg, #0a0a0a 0%, #1f1f1f 50%, #0a0a0a 100%)',
          ],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Form Container */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-purple-500/20"
      >
        {/* Form Header */}
        <div className="text-center mb-6">
          <motion.div 
            className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4"
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            Giriş Yap
          </h1>
          <p className="text-gray-400 text-sm">Hesabınıza erişmek için giriş yapın</p>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-red-400 text-sm text-center mb-6 bg-red-900/20 rounded-lg p-2"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Email Input */}
        <div className="relative mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">E-posta Adresi</label>
          <motion.input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="email@example.com"
            required
            whileFocus={{
              borderColor: '#a855f7',
              boxShadow: '0 0 0 2px rgba(168, 85, 247, 0.3)'
            }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Password Input */}
        <div className="relative mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Şifre</label>
          <div className="relative">
            <motion.input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-20 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
              required
              whileFocus={{
                borderColor: '#a855f7',
                boxShadow: '0 0 0 2px rgba(168, 85, 247, 0.3)'
              }}
              transition={{ duration: 0.2 }}
            />
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-purple-400 bg-gray-800/50 px-4 py-2 rounded-md"
              whileHover={{ backgroundColor: 'rgba(46, 16, 101, 0.3)' }}
              whileTap={{ scale: 0.95 }}
            >
              {showPassword ? 'Gizle' : 'Göster'}
            </motion.button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex justify-between items-center mb-6 text-sm">
          <label className="flex items-center gap-2 text-gray-300">
            <motion.input
              type="checkbox"
              className="h-4 w-4 text-purple-500 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
              whileTap={{ scale: 0.9 }}
            />
            <span>Beni Hatırla</span>
          </label>
          <AnimatedLink
            href="/forgot-password"
            className="px-3 py-2 text-sm"
          >
            Şifremi unuttum
          </AnimatedLink>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          className="relative w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold"
          whileHover={{ 
            scale: 1.02,
            boxShadow: '0 0 15px rgba(192, 132, 252, 0.4)'
          }}
          whileTap={{ 
            scale: 0.98,
            boxShadow: '0 0 10px rgba(192, 132, 252, 0.2)'
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          Giriş Yap
        </motion.button>

        {/* Register Link */}
        <p className="text-sm text-center mt-6 text-gray-400">
          Henüz üye değil misiniz?{' '}
          <AnimatedLink
            href="/register"
            className="px-3 py-2"
          >
            Üye Ol
          </AnimatedLink>
        </p>
      </motion.form>
    </div>
  );
};

export default Login;