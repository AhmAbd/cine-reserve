'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ZoomAwareContainer({ children }) {
  const [zoomFactor, setZoomFactor] = useState(1);
  const [dimensions, setDimensions] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
      
      // Detect zoom level
      if (window.visualViewport) {
        setZoomFactor(window.visualViewport.scale);
      } else {
        // Fallback for browsers without visualViewport
        const zoom = window.innerWidth / window.outerWidth;
        setZoomFactor(zoom);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 min-h-full min-w-full bg-black flex items-center justify-center p-4 overflow-auto"
      style={{
        '--zoom-factor': zoomFactor,
        '--viewport-width': `${dimensions.width}px`,
        '--viewport-height': `${dimensions.height}px`
      }}
    >
      <motion.div
        className="w-full h-full"
        animate={{
          scale: Math.min(1, 1/zoomFactor),
        }}
        transition={{ type: 'spring', stiffness: 100 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}