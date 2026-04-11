"use client";

import { useRef, useState, useCallback } from "react";
import type { BookElement, BookPage, GalleryPhoto } from "./types";

interface Props {
  page: BookPage;
  selectedElement: string | null;
  editingText: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<BookElement>) => void;
  onSetEditingText: (id: string | null) => void;
  photos: GalleryPhoto[];
}

export default function CanvasArea({
  page,
  selectedElement,
  editingText,
  onSelectElement,
  onUpdateElement,
  onSetEditingText,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number; elX: number; elY: number } | null>(null);
  const [resizing, setResizing] = useState<{
    id: string;
    handle: string;
    startX: number;
    startY: number;
    elX: number;
    elY: number;
    elW: number;
    elH: number;
  } | null>(null);

  const getCanvasRect = useCallback(() => canvasRef.current?.getBoundingClientRect(), []);

  function toPercent(px: number, dimension: number) {
    return (px / dimension) * 100;
  }

  function handleMouseDown(e: React.MouseEvent, elId: string) {
    e.stopPropagation();
    const el = page.elements.find((x) => x.id === elId);
    if (!el) return;
    onSelectElement(elId);
    setDragging({ id: elId, startX: e.clientX, startY: e.clientY, elX: el.x, elY: el.y });
  }

  function handleResizeStart(e: React.MouseEvent, elId: string, handle: string) {
    e.stopPropagation();
    const el = page.elements.find((x) => x.id === elId);
    if (!el) return;
    setResizing({ id: elId, handle, startX: e.clientX, startY: e.clientY, elX: el.x, elY: el.y, elW: el.width, elH: el.height });
  }

  function handleMouseMove(e: React.MouseEvent) {
    const rect = getCanvasRect();
    if (!rect) return;

    if (dragging) {
      const dx = toPercent(e.clientX - dragging.startX, rect.width);
      const dy = toPercent(e.clientY - dragging.startY, rect.height);
      onUpdateElement(dragging.id, {
        x: Math.max(0, Math.min(100, dragging.elX + dx)),
        y: Math.max(0, Math.min(100, dragging.elY + dy)),
      });
    }

    if (resizing) {
      const dx = toPercent(e.clientX - resizing.startX, rect.width);
      const dy = toPercent(e.clientY - resizing.startY, rect.height);
      const h = resizing.handle;
      const updates: Partial<BookElement> = {};

      if (h.includes("e")) updates.width = Math.max(5, resizing.elW + dx);
      if (h.includes("w")) {
        updates.width = Math.max(5, resizing.elW - dx);
        updates.x = resizing.elX + dx;
      }
      if (h.includes("s")) updates.height = Math.max(5, resizing.elH + dy);
      if (h.includes("n")) {
        updates.height = Math.max(5, resizing.elH - dy);
        updates.y = resizing.elY + dy;
      }

      onUpdateElement(resizing.id, updates);
    }
  }

  function handleMouseUp() {
    setDragging(null);
    setResizing(null);
  }

  function handleCanvasClick() {
    onSelectElement(null);
    onSetEditingText(null);
  }

  function handleDoubleClick(e: React.MouseEvent, el: BookElement) {
    e.stopPropagation();
    if (el.type === "text") {
      onSetEditingText(el.id);
    }
  }

  const handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
  const handlePosition: Record<string, React.CSSProperties> = {
    nw: { top: -4, left: -4, cursor: "nw-resize" },
    n: { top: -4, left: "50%", transform: "translateX(-50%)", cursor: "n-resize" },
    ne: { top: -4, right: -4, cursor: "ne-resize" },
    e: { top: "50%", right: -4, transform: "translateY(-50%)", cursor: "e-resize" },
    se: { bottom: -4, right: -4, cursor: "se-resize" },
    s: { bottom: -4, left: "50%", transform: "translateX(-50%)", cursor: "s-resize" },
    sw: { bottom: -4, left: -4, cursor: "sw-resize" },
    w: { top: "50%", left: -4, transform: "translateY(-50%)", cursor: "w-resize" },
  };

  function renderElement(el: BookElement) {
    const isSelected = selectedElement === el.id;
    const clipPath = (el.style?.clipPath as string) || "";
    const isPolaroid = clipPath === "polaroid";
    const isRounded = clipPath === "rounded";

    const elementStyle: React.CSSProperties = {
      position: "absolute",
      left: `${el.x}%`,
      top: `${el.y}%`,
      width: `${el.width}%`,
      height: `${el.height}%`,
      transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
      cursor: dragging?.id === el.id ? "grabbing" : "grab",
      zIndex: isSelected ? 10 : undefined,
    };

    return (
      <div
        key={el.id}
        style={elementStyle}
        onMouseDown={(e) => handleMouseDown(e, el.id)}
        onDoubleClick={(e) => handleDoubleClick(e, el)}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Element content */}
        {el.type === "photo" && (
          <div
            className="w-full h-full overflow-hidden"
            style={{
              clipPath: clipPath && !isPolaroid && !isRounded ? clipPath : undefined,
              borderRadius: isRounded ? "20px" : isPolaroid ? "2px" : undefined,
              border: isPolaroid ? "6px solid white" : undefined,
              borderBottom: isPolaroid ? "24px solid white" : undefined,
              boxShadow: isPolaroid ? "0 2px 8px rgba(0,0,0,0.15)" : undefined,
            }}
          >
            {el.content ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={el.content}
                alt=""
                className="w-full h-full object-cover pointer-events-none select-none"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                Drop photo
              </div>
            )}
          </div>
        )}

        {el.type === "text" && (
          editingText === el.id ? (
            <textarea
              autoFocus
              value={el.content}
              onChange={(e) => onUpdateElement(el.id, { content: e.target.value })}
              onBlur={() => onSetEditingText(null)}
              className="w-full h-full resize-none bg-transparent outline-none p-1"
              style={{
                fontFamily: (el.style.fontFamily as string) || "DM Sans",
                fontSize: `${el.style.fontSize || 16}px`,
                color: (el.style.color as string) || "#0C2E3D",
                fontWeight: el.style.bold ? 700 : 400,
                fontStyle: el.style.italic ? "italic" : "normal",
                textDecoration: el.style.underline ? "underline" : "none",
                textAlign: (el.style.align as CanvasTextAlign) || "center",
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              className="w-full h-full flex items-center overflow-hidden p-1"
              style={{
                fontFamily: (el.style.fontFamily as string) || "DM Sans",
                fontSize: `${el.style.fontSize || 16}px`,
                color: (el.style.color as string) || "#0C2E3D",
                fontWeight: el.style.bold ? 700 : 400,
                fontStyle: el.style.italic ? "italic" : "normal",
                textDecoration: el.style.underline ? "underline" : "none",
                textAlign: (el.style.align as CanvasTextAlign) || "center",
                justifyContent: el.style.align === "left" ? "flex-start" : el.style.align === "right" ? "flex-end" : "center",
              }}
            >
              <span className="whitespace-pre-wrap break-words w-full">
                {el.content || "Double-click to edit"}
              </span>
            </div>
          )
        )}

        {el.type === "shape" && (
          <div
            className="w-full h-full bg-brand-200"
            style={{
              clipPath: el.content ? SHAPE_CLIPS_MAP[el.content] : undefined,
            }}
          />
        )}

        {/* Selection handles */}
        {isSelected && (
          <>
            <div className="absolute inset-0 border-2 border-brand-500 pointer-events-none rounded-sm" />
            {handles.map((h) => (
              <div
                key={h}
                className="absolute w-2.5 h-2.5 bg-white border-2 border-brand-500 rounded-full"
                style={{ ...handlePosition[h], position: "absolute" }}
                onMouseDown={(e) => handleResizeStart(e, el.id, h)}
              />
            ))}
          </>
        )}
      </div>
    );
  }

  // Background style
  const bg = page.background || "#FFFFFF";
  const bgStyle: React.CSSProperties = bg.startsWith("url(")
    ? { backgroundImage: bg, backgroundSize: "cover", backgroundPosition: "center" }
    : bg.startsWith("linear")
      ? { background: bg }
      : { backgroundColor: bg };

  return (
    <div
      className="flex-1 flex items-center justify-center p-6 overflow-auto"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        ref={canvasRef}
        className="relative shadow-xl rounded-sm select-none"
        style={{ width: 600, height: 400, ...bgStyle }}
        onClick={handleCanvasClick}
      >
        {page.elements.map(renderElement)}
      </div>
    </div>
  );
}

// Map for shape type rendering (used in shape elements as decorative shapes)
const SHAPE_CLIPS_MAP: Record<string, string> = {
  circle: "circle(50%)",
  oval: "ellipse(50% 40% at 50% 50%)",
  diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  hexagon: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
  star: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
};
