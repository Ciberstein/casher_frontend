import React from 'react';
import { useSelector } from 'react-redux';

/** Mientras el servidor responde, la máquina alimenta papel. */
export const Loader = () => {
  const loader = useSelector((state) => state.loader);

  return (
    <div
      className={`${loader && 'hidden'} fixed inset-0 z-[100] bg-ink/45 backdrop-blur-[2px]`}
      role="status"
      aria-live="polite"
    >
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-1 w-24 overflow-hidden rounded-full bg-reverse/25">
            <div className="h-full w-1/3 animate-bar rounded-full bg-sello" />
          </div>
          <span className="eyebrow !text-reverse/70">Procesando</span>
        </div>
      </div>
    </div>
  );
};
