import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import Face from '../../../assets/Page-1.svg';

const MESSAGES = [
  'จ้องทำไมหรอ? 👀',
  'พิมพ์อะไรอยู่เนี่ย...',
  'วันนี้เงินเหลือเท่าไหร่?',
  'มีอะไรให้ช่วยไหม?',
  'สู้ๆ นะคนเก่ง! ✌️',
  'แอบมองเธออยู่นะจ๊ะ',
  'อย่ากดแรงนะ เจ็บ...',
  'ประหยัดหน่อยนะช่วงนี้ 💰',
];

const TrackingFace: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDizzy, setIsDizzy] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentMsg, setCurrentMsg] = useState('');

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 120 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const rotateZ = useTransform(mouseX, [-10, 10], [-15, 15]);

  useEffect(() => {
    let lastMouseX = 0;
    let shakeCount = 0;
    let shakeTimer: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.hypot(deltaX, deltaY);
      const angle = Math.atan2(deltaY, deltaX);
      if (Math.abs(e.clientX - lastMouseX) > 50 && distance < 120) {
        shakeCount++;
        if (shakeCount > 5) {
          setIsDizzy(true);
          clearTimeout(shakeTimer);
          shakeTimer = setTimeout(() => {
            setIsDizzy(false);
            shakeCount = 0;
          }, 2000);
        }
      }
      lastMouseX = e.clientX;

      const moveDistance = Math.min(distance / 15, 10);
      mouseX.set(Math.cos(angle) * moveDistance);
      mouseY.set(Math.sin(angle) * moveDistance);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(shakeTimer);
    };
  }, [mouseX, mouseY]);

  const handleMouseEnter = () => {
    const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    setCurrentMsg(randomMsg);
    setIsHovered(true);
  };

  return (
    <div className="relative flex items-center justify-center">
      <AnimatePresence>
        {isHovered && !isDizzy && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -55, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="absolute z-[100] whitespace-nowrap bg-white text-black text-xs font-medium px-4 py-2 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] border border-gray-100 pointer-events-none"
          >
            {currentMsg}
            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex justify-center items-center min-w-16 min-h-16 bg-blue-600 rounded-full shadow-lg cursor-help transition-transform active:scale-95"
      >
        <motion.div
          animate={isDizzy ? { rotate: 360 } : { rotate: 0 }}
          transition={isDizzy ? { repeat: Infinity, duration: 0.5, ease: 'linear' } : {}}
          style={{ x, y, rotateZ }}
          className="w-full h-full flex items-center justify-center overflow-hidden rounded-full"
        >
          <motion.img
            src={Face}
            className="w-8 h-8 select-none"
            draggable={false}
            animate={{
              scaleY: [1, 1, 0.1, 1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              times: [0, 0.9, 0.92, 0.94, 1],
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        <div className="absolute inset-0 pointer-events-none rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.25)]" />
      </div>
    </div>
  );
};

export default TrackingFace;
