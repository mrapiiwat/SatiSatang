import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { FloatingBubbleProps } from '../../../interface/home';
import TrackingFace from '../satang/TrackingFace';

const FloatingBubble: React.FC<FloatingBubbleProps> = ({ onClick }) => {
  const BUBBLE_SIZE = 65;
  const SIDE_MARGIN = 30;
  const VERTICAL_MARGIN = 20;
  const TOP_LIMIT_RATIO = 0.88;
  const STORAGE_KEY = 'bubble_position';

  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
  const getTopLimit = () => window.innerHeight * TOP_LIMIT_RATIO;
  const getBottomLimit = () => window.innerHeight - BUBBLE_SIZE - VERTICAL_MARGIN;

  const [position, setPosition] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedPos = localStorage.getItem(STORAGE_KEY);
      if (savedPos) {
        try {
          const parsed = JSON.parse(savedPos);
          return {
            x: clamp(parsed.x, SIDE_MARGIN, window.innerWidth - BUBBLE_SIZE - SIDE_MARGIN),
            y: clamp(
              parsed.y,
              window.innerHeight * TOP_LIMIT_RATIO,
              window.innerHeight - BUBBLE_SIZE - VERTICAL_MARGIN,
            ),
          };
        } catch (e) {
          console.error('Failed to parse bubble position', e);
        }
      }

      return {
        x: window.innerWidth - BUBBLE_SIZE - SIDE_MARGIN,
        y: window.innerHeight - BUBBLE_SIZE - VERTICAL_MARGIN,
      };
    }

    return { x: 0, y: 0 };
  });

  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isSnapping, setIsSnapping] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const snapToEdge = useCallback(() => {
    const middle = window.innerWidth / 2;
    const snapX =
      position.x + BUBBLE_SIZE / 2 > middle
        ? window.innerWidth - BUBBLE_SIZE - SIDE_MARGIN
        : SIDE_MARGIN;

    const newX = clamp(snapX, SIDE_MARGIN, window.innerWidth - BUBBLE_SIZE - SIDE_MARGIN);
    const newY = clamp(position.y, getTopLimit(), getBottomLimit());

    setIsSnapping(true);

    const newPos = { x: newX, y: newY };
    setPosition(newPos);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPos));

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
          x: clamp(newX, SIDE_MARGIN, window.innerWidth - BUBBLE_SIZE - SIDE_MARGIN),
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
          x: clamp(newX, SIDE_MARGIN, window.innerWidth - BUBBLE_SIZE - SIDE_MARGIN),
          y: clamp(newY, getTopLimit(), getBottomLimit()),
        });
      });
    },
    [dragging, offset],
  );

  const handleTouchEnd = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    snapToEdge();
  }, [dragging, snapToEdge]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    const handleResize = () => {
      const newX = clamp(position.x, SIDE_MARGIN, window.innerWidth - BUBBLE_SIZE - SIDE_MARGIN);
      const newY = clamp(position.y, getTopLimit(), getBottomLimit());

      setPosition({ x: newX, y: newY });
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
      className={`fixed rounded-full bg-blue-500 text-black-900 flex items-center justify-center select-none shadow-lg cursor-grab active:cursor-grabbing ${
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
          const moveX = Math.abs(e.clientX - startPos.current.x);
          const moveY = Math.abs(e.clientY - startPos.current.y);
          if (moveX < 5 && moveY < 5) {
            onClick?.();
          }
        }}
        className="w-full h-full flex items-center justify-center"
      >
        <TrackingFace mode="sati" />
      </button>
    </div>
  );
};

export default FloatingBubble;
