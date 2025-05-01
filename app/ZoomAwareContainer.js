'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

export default function ZoomAwareContainer({ children }) {
  const [zoomFactor, setZoomFactor] = useState(1);
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // Zoom seviyesini tespit et
      let zoom = 1;
      if (window.visualViewport) {
        zoom = window.visualViewport.scale || 1;
      } else {
        zoom = window.innerWidth / (window.outerWidth || window.innerWidth);
      }
      setZoomFactor(Math.max(0.1, Math.min(2, zoom))); // Zoom faktörünü sınırla
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // İlk çağrı

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.div
      className="relative min-h-screen min-w-full bg-black flex items-start justify-center p-4"
      style={{
        '--zoom-factor': zoomFactor,
        '--viewport-width': `${dimensions.width}px`,
        '--viewport-height': `${dimensions.height}px`,
      }}
    >
      <motion.div
        className="w-full"
        animate={{
          scale: Math.min(1, 1 / zoomFactor),
        }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        <SimpleBar
          style={{ maxHeight: '100vh', width: '100%' }}
          className="simplebar-custom"
        >
          <div className="min-h-screen w-full p-4">
            {children}
          </div>
        </SimpleBar>
      </motion.div>
    </motion.div>
  );
}