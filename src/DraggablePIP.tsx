import React, { useState, useRef, useEffect, useCallback } from 'react';
import { IconButton, Box, useTheme, useMediaQuery } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import OpenWithIcon from '@mui/icons-material/OpenWith';

export interface DraggablePiPProps {
  open: boolean;
  onClose: () => void;
  content: string | undefined | null;
  initialWidth?: number;
  initialHeight?: number;
  initialPosition?: { x: number; y: number };
  aspectRatio?: number;
  showControls?: boolean;
  className?: string;
}

const DraggablePiP: React.FC<DraggablePiPProps> = ({
  open,
  onClose,
  content,
  initialWidth,
  initialHeight,
  initialPosition,
  aspectRatio = 16 / 9,
  showControls = true,
  className = '',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const calcInitialWidth = initialWidth ?? window.innerWidth / 3;
  const calcInitialHeight = initialHeight ?? (window.innerWidth / 3) * aspectRatio;
  const calcInitialPosition = initialPosition ?? {
    x: window.innerWidth - window.innerWidth / 3 - 20,
    y: window.innerHeight - (window.innerWidth / 3) * aspectRatio - 20,
  };

  const [position, setPosition] = useState(calcInitialPosition);
  const [dimensions, setDimensions] = useState({ width: calcInitialWidth, height: calcInitialHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.resize-handle')) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.resize-handle')) return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  }, [position]);

  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    resizeStart.current = {
      x: clientX,
      y: clientY,
      width: dimensions.width,
      height: dimensions.height,
    };
  }, [dimensions]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - dimensions.width, e.clientX - dragStart.x)),
          y: Math.max(0, Math.min(window.innerHeight - dimensions.height, e.clientY - dragStart.y)),
        });
      }
      if (isResizing) {
        const deltaX = e.clientX - resizeStart.current.x;
        const newWidth = Math.max(200, resizeStart.current.width + deltaX);
        const newHeight = newWidth / aspectRatio;
        setDimensions({ width: newWidth, height: newHeight });
        setPosition((prev) => ({
          x: Math.min(prev.x, window.innerWidth - newWidth),
          y: Math.min(prev.y, window.innerHeight - newHeight),
        }));
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        e.preventDefault();
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - dimensions.width, e.touches[0].clientX - dragStart.x)),
          y: Math.max(0, Math.min(window.innerHeight - dimensions.height, e.touches[0].clientY - dragStart.y)),
        });
      }
      if (isResizing && e.touches.length === 1) {
        e.preventDefault();
        const deltaX = e.touches[0].clientX - resizeStart.current.x;
        const newWidth = Math.max(200, resizeStart.current.width + deltaX);
        const newHeight = newWidth / aspectRatio;
        setDimensions({ width: newWidth, height: newHeight });
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, isResizing, dragStart, dimensions.width, dimensions.height, aspectRatio]);

  useEffect(() => {
    const handleWindowResize = () => {
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - dimensions.width),
        y: Math.min(prev.y, window.innerHeight - dimensions.height),
      }));
      if (isMobile) {
        setDimensions({
          width: window.innerWidth - 40,
          height: (window.innerWidth - 40) * aspectRatio + 20,
        });
      }
    };
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [dimensions.width, dimensions.height, isMobile, aspectRatio]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === containerRef.current) {
          setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
        }
      }
    });
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (open) {
      if (isMobile) {
        setPosition({ x: 20, y: 70 });
        setDimensions({ width: window.innerWidth - 40, height: (window.innerWidth - 40) * aspectRatio + 20 });
      }
      if (videoRef.current && content) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [open, content, isMobile, aspectRatio]);

  if (!open || !content) return null;

  return (
    <Box
      className={`floating-pip-container ${className}`}
      ref={containerRef}
      sx={{
        position: 'fixed',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '8px',
        overflow: 'hidden',
        transition: 'box-shadow 0.3s ease',
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[8],
        width: dimensions.width,
        height: dimensions.height,
        left: position.x,
        top: position.y,
        touchAction: isDragging || isResizing ? 'none' : 'auto',
        '&:hover': {
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
        },
      }}
    >
      {showControls && (
        <Box
          className="drag-handle"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 8px',
            cursor: 'grab',
            userSelect: 'none',
            backgroundColor: theme.palette.grey[900],
            color: theme.palette.common.white,
            '&:active': { cursor: 'grabbing' },
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <Box display="flex" alignItems="center">
            <DragIndicatorIcon fontSize="small" />
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Box sx={{ flex: 1, position: 'relative', backgroundColor: 'black' }}>
        <video
          ref={videoRef}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          controls
          preload="auto"
          playsInline
        >
          <source src={content} type="video/mp4" />
          <track src={content} kind="subtitles" srcLang="en" label="English" />
          Your browser does not support the video tag.
        </video>
      </Box>

      <Box
        className="resize-handle"
        sx={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 16,
          height: 16,
          cursor: 'nwse-resize',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.1)',
          borderTopLeftRadius: '4px',
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.3)' },
        }}
        onMouseDown={handleResizeStart}
        onTouchStart={handleResizeStart}
      >
        <OpenWithIcon sx={{ fontSize: '12px', transform: 'rotate(45deg)' }} />
      </Box>
    </Box>
  );
};

export default DraggablePiP;
