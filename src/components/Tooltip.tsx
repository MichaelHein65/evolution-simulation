import { useState, useRef, useEffect, ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  delay?: number;
}

export default function Tooltip({ content, children, delay = 500 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<number>();

  const handleMouseEnter = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setPosition({
      x: e.clientX + 15,
      y: e.clientY + 15,
    });
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {children}
      {isVisible && (
        <div
          className="fixed z-50 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm max-w-xs border border-gray-700"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            pointerEvents: 'none',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
