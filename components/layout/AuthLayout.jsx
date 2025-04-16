import React from 'react';
import Image from 'next/image';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      {/* Form Bölümü */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Görsel Bölüm (Masaüstü için) */}
      <div className="hidden md:block md:w-1/2 relative">
        <Image
          src="/images/cineverse-bg.jpg"
          alt="Cineverse Giriş"
          layout="fill"
          objectFit="cover"
          className="brightness-75"
        />
      </div>
    </div>
  );
};

export default AuthLayout;
