'use client';

import { useState, useEffect, useMemo } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FiLock, FiUser, FiMail, FiKey, FiShield, FiLogIn } from 'react-icons/fi';

// Security icons configuration
const securityIcons = [
  { icon: <FiLock />, name: 'lock', size: 24 },
  { icon: <FiUser />, name: 'user', size: 28 },
  { icon: <FiMail />, name: 'mail', size: 22 },
  { icon: <FiKey />, name: 'key', size: 26 },
  { icon: <FiShield />, name: 'shield', size: 30 },
  { icon: <FiLogIn />, name: 'login', size: 32 },
];

// Floating icons configuration
const floatingIcons = securityIcons.map((icon, i) => ({
  ...icon,
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  z: Math.random() * 20 - 10,
  delay: Math.random() * 4,
  duration: Math.random() * 6 + 6,
}));

// Particles configuration
const particles = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  z: Math.random() * 100 - 50,
  size: Math.random() * 4 + 1,
}));

const AnimatedLink = ({ href, children, className }) => {
  return (
    <motion.span
      className="inline-block"
      whileHover={{ scale: 1.05, rotateX: 10, rotateY: 5 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={href}
        className={`${className} text-purple-400 hover:text-purple-300 transition-colors`}
        onClick={(e) => {
          e.stopPropagation();
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
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

  // Mouse movement for form tilt
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

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
        await new Promise((resolve) => setTimeout(resolve, 500));
        router.push('/');
      } else {
        setError('Kullanıcı bilgileri bulunamadı.');
      }
    } catch (err) {
      setError('E-posta veya şifre hatalı!');
      console.error('Firebase error:', err);
    }
  };

  const handleContinueWithoutLogin = () => {
    setIsRedirecting(true);
    setTimeout(() => router.push('/'), 500);
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

      {/* 3D Particle Background */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ perspective: 1000 }}>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute bg-purple-400/40 rounded-full shadow-md"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              translateZ: `${particle.z}px`,
            }}
            animate={{
              y: [0, -dimensions.height * 0.6, 0],
              opacity: [0.1, 0.6, 0.1],
              scale: [1, 1.3, 1],
              translateZ: [particle.z, particle.z + 50, particle.z],
            }}
            transition={{
              duration: Math.random() * 12 + 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* 3D Floating Security Icons Background */}
      <div className="absolute inset-0 pointer-events-none z-5" style={{ perspective: 500 }}>
        {floatingIcons.map((icon) => (
          <motion.div
            key={icon.id}
            className="absolute text-purple-400 opacity-70 hover:opacity-100 transition-opacity"
            style={{
              fontSize: `${icon.size}px`,
              left: `${icon.x}%`,
              top: `${icon.y}%`,
              translateZ: `${icon.z}px`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.15, 1],
              rotateZ: [0, 45, 0],
            }}
            transition={{
              duration: icon.duration,
              delay: icon.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            whileHover={{
              opacity: 1,
              scale: 1.5,
              textShadow: '0 0 10px rgba(168, 85, 247, 0.8)',
              transition: { duration: 0.3 },
            }}
          >
            {icon.icon}
          </motion.div>
        ))}
      </div>

      {/* Gradient Background */}
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

      {/* 3D Form Container */}
      <motion.form
        initial={{ opacity: 0, y: 50, rotateX: -30 }}
        animate={{
          opacity: 1,
          y: 0,
          rotateX: 0,
          rotateY: mousePos.x * 15,
          rotateX: -mousePos.y * 15,
        }}
        transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
        onSubmit={handleSubmit}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
        className="relative z-10 w-full max-w-md bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-2xl p-8 border border-purple-500/30 shadow-2xl backdrop-blur-sm"
        style={{ perspective: 1000 }}
      >
        {/* Form Header */}
        <div className="text-center mb-8">
          <motion.div
            className="w-20 h-20 bg-purple-600/30 rounded-full flex items-center justify-center mx-auto mb-4"
            initial={{ scale: 0, rotateX: -90 }}
            animate={{ scale: 1, rotateX: 0 }}
            whileHover={{ scale: 1.2, rotateY: 360, translateZ: 20 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-purple-400"
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
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            Giriş Yap
          </h1>
          <p className="text-gray-400 text-sm">Hesabınıza erişmek için giriş yapın</p>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-red-400 text-sm text-center mb-6 bg-red-900/30 rounded-lg p-3 shadow-md"
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
            className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
            placeholder="email@example.com"
            required
            whileFocus={{
              borderColor: '#a855f7',
              boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
              scale: 1.01,
              rotateX: 5,
              translateZ: 10,
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
              className="w-full px-4 py-3 pr-20 bg-gray-800/30 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
              placeholder="••••••••"
              required
              whileFocus={{
                borderColor: '#a855f7',
                boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
                scale: 1.01,
                rotateX: 5,
                translateZ: 10,
              }}
              transition={{ duration: 0.2 }}
            />
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-purple-400 bg-gray-800/50 px-4 py-2 rounded-md"
              whileHover={{ backgroundColor: 'rgba(46, 16, 101, 0.5)', scale: 1.05, translateZ: 10 }}
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
              whileTap={{ scale: 0.9, rotate: 45 }}
              transition={{ duration: 0.2 }}
            />
            <span>Beni Hatırla</span>
          </label>
          <AnimatedLink href="/forgot-password" className="px-3 py-2 text-sm">
            Şifremi unuttum
          </AnimatedLink>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          className="relative w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-semibold overflow-hidden"
          whileHover={{
            scale: 1.05,
            boxShadow: '0 0 20px rgba(192, 132, 252, 0.6)',
            rotateX: 10,
            translateZ: 20,
          }}
          whileTap={{
            scale: 0.95,
            boxShadow: '0 0 10px rgba(192, 132, 252, 0.3)',
            rotateX: -10,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/50 to-pink-500/50"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          />
          <span className="relative z-10">Giriş Yap</span>
        </motion.button>

        {/* Continue Without Login Button */}
        <motion.button
          type="button"
          onClick={handleContinueWithoutLogin}
          className="relative w-full py-3 mt-4 bg-gray-800/50 border border-purple-500/30 text-white rounded-lg font-semibold"
          whileHover={{
            scale: 1.05,
            backgroundColor: 'rgba(46, 16, 101, 0.5)',
            borderColor: '#a855f7',
            rotateX: 10,
            translateZ: 20,
          }}
          whileTap={{
            scale: 0.95,
            boxShadow: '0 0 10px rgba(192, 132, 252, 0.3)',
            rotateX: -10,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          Giriş Yapmadan Devam Et
        </motion.button>

        {/* Register Link */}
        <p className="text-sm text-center mt-6 text-gray-400">
          Henüz üye değil misiniz?{' '}
          <AnimatedLink href="/register" className="px-3 py-2">
            Üye Ol
          </AnimatedLink>
        </p>
      </motion.form>
    </div>
  );
};

export default Login;