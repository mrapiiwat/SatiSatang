import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaPlus } from 'react-icons/fa';
import type { FloatingBubbleProps } from '../../types/home';

const FloatingBubble: React.FC<FloatingBubbleProps> = ({ onClick }) => {
  const BUBBLE_SIZE = 65;
  const MARGIN = 15;
  const TOP_LIMIT_RATIO = 0.88;

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
  const getTopLimit = () => window.innerHeight * TOP_LIMIT_RATIO;
  const getBottomLimit = () => window.innerHeight - BUBBLE_SIZE - MARGIN;

  const [position, setPosition] = useState({
    x: window.innerWidth - BUBBLE_SIZE - MARGIN,
    y: getBottomLimit(),
  });

  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isSnapping, setIsSnapping] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const snapToEdge = useCallback(() => {
    const middle = window.innerWidth / 2;
    const snapX =
      position.x + BUBBLE_SIZE / 2 > middle ? window.innerWidth - BUBBLE_SIZE - MARGIN : MARGIN;

    setIsSnapping(true);
    setPosition({
      x: clamp(snapX, MARGIN, window.innerWidth - BUBBLE_SIZE - MARGIN),
      y: clamp(position.y, getTopLimit(), getBottomLimit()),
    });

    setTimeout(() => setIsSnapping(false), 300);
  }, [position.x, position.y]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const newX = e.clientX - offset.x;
        const newY = e.clientY - offset.y;
        setPosition({
          x: clamp(newX, MARGIN, window.innerWidth - BUBBLE_SIZE - MARGIN),
          y: clamp(newY, getTopLimit(), getBottomLimit()),
        });
      });
    },
    [dragging, offset],
  );

  const handleMouseUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    snapToEdge();
  }, [dragging, snapToEdge]);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0];
      setDragging(true);
      setOffset({ x: touch.clientX - position.x, y: touch.clientY - position.y });
      startPos.current = { x: touch.clientX, y: touch.clientY };
      setIsSnapping(false);
    },
    [position.x, position.y],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!dragging) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const touch = e.touches[0];
        const newX = touch.clientX - offset.x;
        const newY = touch.clientY - offset.y;
        setPosition({
          x: clamp(newX, MARGIN, window.innerWidth - BUBBLE_SIZE - MARGIN),
          y: clamp(newY, getTopLimit(), getBottomLimit()),
        });
      });

      e.preventDefault();
    },
    [dragging, offset],
  );

  const handleTouchEnd = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    snapToEdge();
  }, [dragging, snapToEdge]);

  useEffect(() => {
    // Mouse
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Touch
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    const handleResize = () => {
      setPosition({
        x: clamp(position.x, MARGIN, window.innerWidth - BUBBLE_SIZE - MARGIN),
        y: clamp(position.y, getTopLimit(), getBottomLimit()),
      });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
    };
  }, [
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    position.x,
    position.y,
  ]);

  return (
    <div
      onMouseDown={(e) => {
        setDragging(true);
        setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
        startPos.current = { x: e.clientX, y: e.clientY };
        setIsSnapping(false);
      }}
      className={`fixed rounded-full bg-blue-500 text-white flex items-center justify-center select-none shadow-lg cursor-grab active:cursor-grabbing ${
        isSnapping ? 'transition-all duration-300 ease-out' : ''
      }`}
      style={{
        width: BUBBLE_SIZE,
        height: BUBBLE_SIZE,
        left: position.x,
        top: position.y,
        zIndex: 30,
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className="w-full h-full flex items-center justify-center"
      >
        <FaPlus size={25} />
      </button>
    </div>
  );
};

export default FloatingBubble;
