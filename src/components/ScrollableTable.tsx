import React, { useRef, useState, useEffect, useCallback } from 'react';

interface ScrollableTableProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ScrollableTable
 * A wrapper that renders children (a <table>) inside a horizontally scrollable
 * container and shows a permanently-visible custom scroll track below the table
 * that works on ALL browsers including iOS and Android.
 */
export default function ScrollableTable({ children, className = '', style }: ScrollableTableProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [thumbWidth, setThumbWidth] = useState(0);
  const [thumbLeft, setThumbLeft] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);

  const recalculate = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const { scrollWidth, clientWidth, scrollLeft } = el;
    const scrollable = scrollWidth > clientWidth + 1;
    setIsScrollable(scrollable);
    if (scrollable) {
      const ratio = clientWidth / scrollWidth;
      const tw = Math.max(ratio * clientWidth, 40);
      const maxScroll = scrollWidth - clientWidth;
      const tl = maxScroll > 0 ? (scrollLeft / maxScroll) * (clientWidth - tw) : 0;
      setThumbWidth(tw);
      setThumbLeft(tl);
    }
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    recalculate();
    el.addEventListener('scroll', recalculate, { passive: true });
    const ro = new ResizeObserver(recalculate);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', recalculate);
      ro.disconnect();
    };
  }, [recalculate]);

  // Drag thumb to scroll
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);

  const onThumbPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartScrollLeft.current = contentRef.current?.scrollLeft ?? 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onThumbPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !contentRef.current || !trackRef.current) return;
    const el = contentRef.current;
    const trackWidth = trackRef.current.clientWidth;
    const { scrollWidth, clientWidth } = el;
    const ratio = scrollWidth / clientWidth;
    const dx = (e.clientX - dragStartX.current) * ratio;
    el.scrollLeft = Math.max(0, Math.min(dragStartScrollLeft.current + dx, scrollWidth - clientWidth));
  };

  const onThumbPointerUp = () => {
    isDragging.current = false;
  };

  // Click on track (not thumb) to jump scroll position
  const onTrackClick = (e: React.MouseEvent) => {
    if (!contentRef.current || !trackRef.current || e.target === thumbRef.current) return;
    const el = contentRef.current;
    const trackRect = trackRef.current.getBoundingClientRect();
    const { scrollWidth, clientWidth } = el;
    const clickRatio = (e.clientX - trackRect.left) / trackRect.width;
    el.scrollLeft = clickRatio * (scrollWidth - clientWidth);
  };

  return (
    <div className={className} style={{ ...style, position: 'relative', width: '100%' }}>
      {/* Scrollable content */}
      <div
        ref={contentRef}
        className="table-container"
        style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>

      {/* Custom always-visible scroll track */}
      {isScrollable && (
        <div
          ref={trackRef}
          onClick={onTrackClick}
          style={{
            position: 'relative',
            height: '8px',
            borderRadius: '999px',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            margin: '6px 0 2px 0',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          <div
            ref={thumbRef}
            onPointerDown={onThumbPointerDown}
            onPointerMove={onThumbPointerMove}
            onPointerUp={onThumbPointerUp}
            onPointerCancel={onThumbPointerUp}
            style={{
              position: 'absolute',
              top: '1px',
              height: '6px',
              width: `${thumbWidth}px`,
              left: `${thumbLeft}px`,
              borderRadius: '999px',
              backgroundColor: 'var(--border-color-hover)',
              transition: isDragging.current ? 'none' : 'left 0.05s linear',
              cursor: 'grab',
              touchAction: 'none',
            }}
          />
        </div>
      )}
    </div>
  );
}
