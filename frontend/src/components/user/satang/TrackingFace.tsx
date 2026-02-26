import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import axios from '../../../api/axios';
import Face from '../../../assets/Page-1.svg';
import { type TrackingFaceProps } from '../../../interface/satang';

const TrackingFace: React.FC<TrackingFaceProps> = ({ mode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [isDizzy, setIsDizzy] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentMsg, setCurrentMsg] = useState('');
  const [balance, setBalance] = useState<number | null>(null);

  const [tooltipXOffset, setTooltipXOffset] = useState(0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 120 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const rotateZ = useTransform(mouseX, [-10, 10], [-15, 15]);

  const fetchBalance = useCallback(async () => {
    try {
      const res = await axios.get('/users/balance');
      const val = res.data?.balance;

      if (typeof val === 'number') {
        setBalance(val);
      }
    } catch (error) {
      console.error('Failed to fetch balance for TrackingFace:', error);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  const getDynamicMessage = () => {
    if (balance === null) return 'จ้องทำไม? 👀';

    const hour = new Date().getHours();
    const formattedBalance = balance.toLocaleString();

    if (balance <= 0) return 'ยอดติดลบแล้ว! 😭';
    if (balance < 500) return `เหลือ ${formattedBalance} ฿ ประหยัดหน่อย 💰`;

    if (mode === 'satang') {
      if (balance > 100000) return `พอร์ตโตสวย! รวม ${formattedBalance} ฿ 📈`;

      const satangMsgs = [
        `ยอดคงเหลือ ${formattedBalance} ฿`,
        'เช็คภาพรวมกันไหม?',
        'วิเคราะห์ดี มีเงินเก็บ ✨',
        'การเงินมั่นคงดีครับ',
        'ให้พี่สรุปยอดไหนบอกได้นะ',
      ];
      return satangMsgs[Math.floor(Math.random() * satangMsgs.length)];
    } else {
      if (balance > 50000) return 'รวยจัง! ขอยืมหน่อย 🤑';
      if (hour >= 0 && hour < 5) return 'ดึกแล้ว ไปนอนเถอะ 😴';
      if (hour >= 11 && hour < 13) return 'เที่ยงแล้ว หาไรกินด้วย 🍜';

      const satiMsgs = [
        `มีเงินอยู่ ${formattedBalance} ฿ ✨`,
        'จดรายจ่ายหรอ?',
        'มีไรให้ช่วยไหม?',
        'สู้ๆ ฮึบๆ ✌️',
        'วันนี้ใช้เงินเยอะไหม? 🤔',
      ];
      return satiMsgs[Math.floor(Math.random() * satiMsgs.length)];
    }
  };

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
          shakeTimer = window.setTimeout(() => {
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

  useLayoutEffect(() => {
    if (!isHovered || !tooltipRef.current) {
      setTooltipXOffset(0);
      return;
    }

    const rect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const margin = 16;

    let newOffset = 0;

    if (rect.left < margin) {
      newOffset = margin - rect.left;
    } else if (rect.right > viewportWidth - margin) {
      newOffset = viewportWidth - margin - rect.right;
    }

    setTooltipXOffset(newOffset);
  }, [isHovered, currentMsg]);

  const handleMouseEnter = () => {
    setCurrentMsg(getDynamicMessage());
    setIsHovered(true);
  };

  return (
    <div className="relative flex items-center justify-center z-50">
      <AnimatePresence>
        {isHovered && !isDizzy && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: 10, scale: 0.8, x: 0 }}
            animate={{
              opacity: 1,
              y: -55,
              scale: 1,
              x: tooltipXOffset,
              transition: { x: { type: false } },
            }}
            exit={{ opacity: 0, y: 10, scale: 0.8, x: 0 }}
            className="absolute z-[100] whitespace-nowrap bg-white text-black text-xs font-medium px-4 py-2 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] border border-gray-100 pointer-events-none max-w-[90vw]"
          >
            <span className="block truncate max-w-full">{currentMsg}</span>

            <div
              className="absolute bottom-[-6px] left-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"
              style={{ transform: `translateX(calc(-50% - ${tooltipXOffset}px))` }}
            ></div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex justify-center items-center min-w-16 min-h-16 bg-blue-600 rounded-full shadow-lg cursor-pointer transition-transform active:scale-95"
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
