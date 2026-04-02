import React, { useState, useRef, useEffect } from 'react';

export interface FloatingVideoPlayerProps {
  open: boolean;
  onClose: () => void;
  content: string | undefined | null;
  showControls?: boolean;
  className?: string;
  handleColor?: string;
  backgroundColor?: string;
}

const FloatingVideoPlayer: React.FC<FloatingVideoPlayerProps> = ({
  open,
  onClose,
  content,
  showControls = true,
  className = '',
  handleColor = '#212121',
  backgroundColor = '#ffffff',
}) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: 480, h: 270 });
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const isTouchDragging = useRef(false);
  const isTouchResizing = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const startSize = useRef({ w: 0, h: 0 });
  const startPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (open) {
      const isMobile = window.innerWidth < 600;
      const w = isMobile ? window.innerWidth - 40 : Math.min(window.innerWidth * 0.4, 480);
      const h = isMobile ? (window.innerWidth - 40) * 0.6 : 270;
      setSize({ w, h });
      setPos({ 
        x: isMobile ? 20 : window.innerWidth - w - 10, 
        y: isMobile ? 60 : window.innerHeight - h - 10 
      });
    }
  }, [open]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        let newX = e.clientX - dragOffset.current.x;
        let newY = e.clientY - dragOffset.current.y;
        newX = Math.max(0, Math.min(window.innerWidth - size.w, newX));
        newY = Math.max(0, Math.min(window.innerHeight - size.h, newY));
        setPos({ x: newX, y: newY });
      }
      if (isResizing.current) {
        const deltaX = e.clientX - startPos.current.x;
        const deltaY = e.clientY - startPos.current.y;
        const newW = Math.max(200, Math.min(startSize.current.w + deltaX, window.innerWidth));
        const newH = Math.max(150, startSize.current.h + deltaY);
        setSize({ w: newW, h: newH });
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isTouchDragging.current && e.touches.length === 1) {
        e.preventDefault();
        let newX = e.touches[0].clientX - dragOffset.current.x;
        let newY = e.touches[0].clientY - dragOffset.current.y;
        newX = Math.max(0, Math.min(window.innerWidth - size.w, newX));
        newY = Math.max(0, Math.min(window.innerHeight - size.h, newY));
        setPos({ x: newX, y: newY });
      }
      if (isTouchResizing.current && e.touches.length === 1) {
        e.preventDefault();
        const deltaX = e.touches[0].clientX - startPos.current.x;
        const deltaY = e.touches[0].clientY - startPos.current.y;
        const newW = Math.max(200, startSize.current.w + deltaX);
        const newH = Math.max(150, startSize.current.h + deltaY);
        setSize({ w: newW, h: newH });
      }
    };

    const onMouseUp = () => {
      isDragging.current = false;
      isResizing.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    const onTouchEnd = () => {
      isTouchDragging.current = false;
      isTouchResizing.current = false;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [size]);

  const onDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  };

  const onTouchDragStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return;
    if (e.touches.length === 1) {
      e.preventDefault();
      isTouchDragging.current = true;
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        dragOffset.current = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
      }
    }
  };

  const onResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = true;
    document.body.style.cursor = 'nwse-resize';
    document.body.style.userSelect = 'none';
    startPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = { w: size.w, h: size.h };
  };

  const onTouchResizeStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      e.stopPropagation();
      isTouchResizing.current = true;
      startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      startSize.current = { w: size.w, h: size.h };
    }
  };

  useEffect(() => {
    if (open && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [open]);

  if (!open || !content) return null;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'fixed',
        zIndex: 999999,
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        width: size.w,
        height: size.h,
        left: pos.x,
        top: pos.y,
        backgroundColor,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      {showControls && (
        <div
          onMouseDown={onDragStart}
          onTouchStart={onTouchDragStart}
          style={{
            cursor: 'grab',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: handleColor,
            color: '#ffffff',
            padding: '8px 12px',
            userSelect: 'none',
            touchAction: 'none',
          }}
        >
          <span style={{ fontSize: '12px', opacity: 0.8 }}>⋮⋮ Drag</span>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div style={{ flex: 1, backgroundColor: '#000', position: 'relative' }}>
        <video
          ref={videoRef}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          controls
          preload="auto"
          playsInline
        >
          <source src={content} type="video/mp4" />
        </video>
      </div>

      <div
        className="resize-handle"
        onMouseDown={onResizeStart}
        onTouchStart={onTouchResizeStart}
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '20px',
          height: '20px',
          cursor: 'nwse-resize',
          backgroundColor: 'rgba(255,255,255,0.3)',
          borderTopLeftRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#333',
          fontSize: '12px',
          fontWeight: 'bold',
          touchAction: 'none',
        }}
      >
        ⤡
      </div>
    </div>
  );
};

export default FloatingVideoPlayer;
