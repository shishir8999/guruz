import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RotateCw, X, MousePointerClick, ZoomIn, ZoomOut } from "lucide-react";

type Props = {
  images: string[];
  alt?: string;
  onClose?: () => void;
  /** pixels of horizontal drag per frame change */
  sensitivity?: number;
  /** auto-spin on mount for a short hint */
  autoHint?: boolean;
};

/**
 * 360° style viewer that cycles a set of frame images based on horizontal
 * drag / swipe. Works with as few as 2 frames — the more frames supplied,
 * the smoother the rotation feels. Uses the product's existing gallery, so
 * it *simulates* a 360° rotation rather than requiring dedicated capture.
 */
export function Product360Viewer({
  images,
  alt = "Product 360 view",
  onClose,
  sensitivity = 18,
  autoHint = true,
}: Props) {
  const frames = useMemo(() => images.filter(Boolean), [images]);
  const [frame, setFrame] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hintDone, setHintDone] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number | null>(null);
  const startFrameRef = useRef(0);

  const total = frames.length;

  // Preload all frames so drag rotation is stutter-free
  useEffect(() => {
    frames.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [frames]);

  // Brief auto-spin so users notice it's interactive
  useEffect(() => {
    if (!autoHint || total < 2) return;
    let i = 0;
    const id = window.setInterval(() => {
      setFrame((f) => (f + 1) % total);
      i++;
      if (i >= total) {
        window.clearInterval(id);
        setHintDone(true);
      }
    }, 90);
    return () => window.clearInterval(id);
  }, [autoHint, total]);

  const advance = useCallback(
    (deltaFrames: number) => {
      if (total < 2) return;
      setFrame((f) => {
        const next = (f + deltaFrames) % total;
        return next < 0 ? next + total : next;
      });
    },
    [total],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2) {
      // Start pinch
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchRef.current = { dist, zoom };
      startXRef.current = null;
      return;
    }

    if (zoom > 1) {
      panStartRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
      setDragging(true);
      return;
    }
    if (total < 2) return;
    startXRef.current = e.clientX;
    startFrameRef.current = frame;
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (pinchRef.current && pointersRef.current.size >= 2) {
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const nextZoom = Math.min(4, Math.max(1, pinchRef.current.zoom * (dist / pinchRef.current.dist)));
      setZoom(nextZoom);
      if (nextZoom === 1) setPan({ x: 0, y: 0 });
      return;
    }

    if (panStartRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPan({ x: panStartRef.current.px + dx, y: panStartRef.current.py + dy });
      return;
    }

    if (startXRef.current === null) return;
    const dx = e.clientX - startXRef.current;
    const step = Math.round(dx / sensitivity);
    const next = ((startFrameRef.current + step) % total + total) % total;
    setFrame(next);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    startXRef.current = null;
    panStartRef.current = null;
    setDragging(false);
    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.002;
    setZoom((z) => {
      const nz = Math.min(4, Math.max(1, z + delta));
      if (nz === 1) setPan({ x: 0, y: 0 });
      return nz;
    });
  };

  const onDoubleClick = () => {
    if (zoom > 1) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else {
      setZoom(2);
    }
  };

  // Keyboard arrow support
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") advance(1);
    else if (e.key === "ArrowLeft") advance(-1);
  };

  if (!total) return null;

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        role="slider"
        tabIndex={0}
        aria-label={alt}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={frame + 1}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        onWheel={onWheel}
        onDoubleClick={onDoubleClick}
        className={`relative aspect-square select-none overflow-hidden rounded-lg bg-secondary/40 outline-none ring-primary/40 focus-visible:ring-2 ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ touchAction: "pan-y" }}
      >
        {/* Render active frame; keep neighbours mounted at opacity 0 to warm the decode cache */}
        {frames.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={i === 0 ? alt : ""}
            draggable={false}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transition: dragging || pinchRef.current ? "none" : "transform 0.15s ease-out, opacity 0.15s",
            }}
            className={`absolute inset-0 h-full w-full object-contain will-change-transform ${
              i === frame ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* 360 badge */}
        <div className="pointer-events-none absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
          <RotateCw className="h-3 w-3" /> 360°
        </div>

        {/* Zoom controls */}
        <div className="absolute right-2 bottom-2 flex flex-col gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoom((z) => Math.min(4, z + 0.5));
            }}
            aria-label="Zoom in"
            className="rounded-full bg-black/70 p-1.5 text-white hover:bg-black"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoom((z) => {
                const nz = Math.max(1, z - 0.5);
                if (nz === 1) setPan({ x: 0, y: 0 });
                return nz;
              });
            }}
            aria-label="Zoom out"
            className="rounded-full bg-black/70 p-1.5 text-white hover:bg-black"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Progress dots */}
        <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-black/40 px-2 py-1">
          {frames.map((_, i) => (
            <span
              key={i}
              className={`h-1 w-1 rounded-full transition ${
                i === frame ? "bg-white w-3" : "bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Drag hint overlay */}
        {!hintDone && !dragging && (
          <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
            <div className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-[11px] font-medium text-white shadow animate-in fade-in">
              <MousePointerClick className="h-3.5 w-3.5" />
              Drag to rotate
            </div>
          </div>
        )}

        {/* Close button (when used in overlay) */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Exit 360 view"
            className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white transition hover:bg-black"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}