// components/PageWrapper.tsx
import { motion } from 'framer-motion';
import React from 'react';

type AnimationType =
  | 'fade'
  | 'fade-slide'
  | 'scale-fade'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'rotate'
  | 'flip';

interface PageWrapperProps {
  children: React.ReactNode;
  animation?: AnimationType;
  duration?: number;
}

const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  animation = 'scale-slide',
  duration = 0.4,
}) => {
  let variants;

  switch (animation) {
    case 'fade':
      variants = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
      break;
    case 'fade-slide':
      variants = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
      };
      break;
    case 'scale-fade':
      variants = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.05 },
      };
      break;
    case 'slide-left':
      variants = {
        initial: { x: 100, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -100, opacity: 0 },
      };
      break;
    case 'slide-right':
      variants = {
        initial: { x: -100, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: 100, opacity: 0 },
      };
      break;
    case 'slide-up':
      variants = {
        initial: { y: 50, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -50, opacity: 0 },
      };
      break;
    case 'slide-down':
      variants = {
        initial: { y: -50, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: 50, opacity: 0 },
      };
      break;
    case 'rotate':
      variants = {
        initial: { rotate: -5, opacity: 0 },
        animate: { rotate: 0, opacity: 1 },
        exit: { rotate: 5, opacity: 0 },
      };
      break;
    case 'flip':
      variants = {
        initial: { rotateY: 90, opacity: 0 },
        animate: { rotateY: 0, opacity: 1 },
        exit: { rotateY: -90, opacity: 0 },
      };
      break;
    default:
      variants = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
  }

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration }}
      style={{ position: 'absolute', width: '100%' }}
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;
