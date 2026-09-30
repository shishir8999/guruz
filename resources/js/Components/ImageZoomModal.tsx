import { useEffect, useRef, useState } from "react";
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

type Props = {
  images: string[];
  index?: number;
  alt?: string;
  onClose: () => void;
};

/** Fullscreen zoomable image viewer with pinch / wheel / drag pan. */
export function ImageZoomModal({ images, index = 0, alt = "Product image", onClose }: Props) {
  const [i, setI] = useState(index);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(6, z + 0.5));
      else if (e.key === "-") setZoom((z) => Math.max(1, z - 0.5));
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const next = () => {
    reset();
    setI((v) => (v + 1) % Math.max(1, images.length));
  };
  const prev = () => {
    reset();
    setI((v) => (v - 1 + images.length) % Math.max(1, images.length));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const pts = Array.from(pointers.current.values());
      pinch.current = { dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), zoom };
      return;
    }
    if (zoom > 1) {
      panStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current && pointers.current.size >= 2) {
      const pts = Array.from(pointers.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const nz = Math.min(6, Math.max(1, pinch.current.zoom * (dist / pinch.current.dist)));
      setZoom(nz);
      if (nz === 1) setPan({ x: 0, y: 0 });
      return;
    }
    if (panStart.current) {
      setPan({ x: panStart.current.px + (e.clientX - panStart.current.x), y: panStart.current.py + (e.clientY - panStart.current.y) });
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    panStart.current = null;
    try { (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId); } catch {}
  };
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => {
      const nz = Math.min(6, Math.max(1, z + -e.deltaY * 0.003));
      if (nz === 1) setPan({ x: 0, y: 0 });
      return nz;
    });
  };
  const onDoubleClick = () => {
    if (zoom > 1) reset();
    else setZoom(2.5);
  };

  const src = images[i];
  if (!src) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col" role="dialog" aria-modal="true">
      <div className="flex items-center justify-between px-3 py-2 text-white">
        <div className="text-xs opacity-80">{i + 1} / {images.length}</div>
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom((z) => Math.max(1, z - 0.5))} aria-label="Zoom out" className="p-2 rounded-full hover:bg-white/10"><ZoomOut className="h-4 w-4" /></button>
          <button onClick={() => setZoom((z) => Math.min(6, z + 0.5))} aria-label="Zoom in" className="p-2 rounded-full hover:bg-white/10"><ZoomIn className="h-4 w-4" /></button>
          <button onClick={reset} aria-label="Reset zoom" className="p-2 rounded-full hover:bg-white/10"><RotateCcw className="h-4 w-4" /></button>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded-full hover:bg-white/10"><X className="h-5 w-5" /></button>
        </div>
      </div>
      <div
        className="relative flex-1 overflow-hidden select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onDoubleClick={onDoubleClick}
        style={{ touchAction: "none", cursor: zoom > 1 ? "grab" : "zoom-in" }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="absolute inset-0 m-auto max-h-full max-w-full object-contain will-change-transform"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: panStart.current || pinch.current ? "none" : "transform 0.15s ease-out",
          }}
        />
        {images.length > 1 && (
          <>
            <button onClick={prev} aria-label="Previous image" className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"><ChevronLeft className="h-5 w-5" /></button>
            <button onClick={next} aria-label="Next image" className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"><ChevronRight className="h-5 w-5" /></button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-2 bg-black/80">
          {images.map((s, idx) => (
            <button
              key={s + idx}
              onClick={() => { reset(); setI(idx); }}
              className={`h-14 w-14 shrink-0 rounded-md overflow-hidden border-2 ${idx === i ? "border-white" : "border-transparent opacity-60 hover:opacity-100"}`}
              aria-label={`Image ${idx + 1}`}
            >
              <img src={s} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}