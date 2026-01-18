
import React, { useEffect, useRef, memo } from 'react';

export const Starfield: React.FC = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker>();

  useEffect(() => {
    if (canvasRef.current) {
      // Ensure we only create the worker once
      if (!workerRef.current) {
        const worker = new Worker('/starfield.worker.ts', { type: 'module' });
        workerRef.current = worker;

        const offscreenCanvas = canvasRef.current.transferControlToOffscreen();
        
        worker.postMessage({ 
          canvas: offscreenCanvas,
          devicePixelRatio: window.devicePixelRatio 
        }, [offscreenCanvas]);

        const handleResize = () => {
          worker.postMessage({
            type: 'resize',
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio
          });
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
          window.removeEventListener('resize', handleResize);
          worker.terminate();
          workerRef.current = undefined;
        };
      }
    }
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#050510]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_90%)] opacity-80 z-10"></div>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-20" />
    </div>
  );
});
