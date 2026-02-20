"use client";

import React, { useLayoutEffect, useState } from "react";
import { Button } from "@/ui/components/Button";

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type Props = {
  targetSelector?: string;
  targetRef?: React.RefObject<HTMLElement | null>;
  content: React.ReactNode;
  calloutPosition?: "top" | "bottom" | "left" | "right";
  onContinue: () => void;
};

export function DemoOverlay({
  targetSelector,
  targetRef,
  content,
  calloutPosition = "bottom",
  onContinue,
}: Props) {
  const [rect, setRect] = useState<SpotlightRect | null>(null);

  useLayoutEffect(() => {
    function update() {
      let el: HTMLElement | null = null;
      if (targetRef?.current) {
        el = targetRef.current;
      } else if (targetSelector) {
        el = document.querySelector<HTMLElement>(targetSelector);
      }
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height,
        });
      } else {
        setRect(null);
      }
    }
    update();
    const t = setTimeout(update, 100);
    const ro = new ResizeObserver(update);
    const el = targetRef?.current ?? (targetSelector ? document.querySelector<HTMLElement>(targetSelector) : null);
    if (el) ro.observe(el);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      clearTimeout(t);
      ro.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [targetSelector, targetRef]);

  return (
    <div
      className="fixed inset-0 z-50"
      style={{ pointerEvents: "none" }}
    >
      {/* Backdrop con agujero (4 rectángulos oscuros alrededor del target) */}
      <div
        className="absolute inset-0"
        style={{ pointerEvents: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {rect ? (
          <>
            <div
              className="absolute bg-black/50"
              style={{ top: 0, left: 0, right: 0, height: Math.max(0, rect.top) }}
            />
            <div
              className="absolute bg-black/50"
              style={{
                top: rect.top,
                left: 0,
                width: Math.max(0, rect.left),
                height: rect.height,
              }}
            />
            <div
              className="absolute bg-black/50"
              style={{
                top: rect.top,
                left: rect.left + rect.width,
                right: 0,
                height: rect.height,
              }}
            />
            <div
              className="absolute bg-black/50"
              style={{
                top: rect.top + rect.height,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-black/50" />
        )}
      </div>

      {/* Borde spotlight alrededor del target */}
      {rect && (
        <div
          className="absolute rounded-lg ring-2 ring-brand-500 ring-offset-2 transition-all duration-200"
          style={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Callout en esquina superior derecha, fuera del área de spotlight */}
      <div
        className="absolute right-6 top-6 z-10 flex w-80 max-w-[calc(100vw-3rem)] flex-col gap-4 rounded-lg border border-neutral-border bg-white p-5 shadow-xl"
        style={{ pointerEvents: "auto" }}
      >
        <div className="text-body font-body text-default-font">{content}</div>
        <Button variant="brand-primary" className="w-full" onClick={onContinue}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
