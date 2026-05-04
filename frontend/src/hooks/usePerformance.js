import { useState, useEffect, useMemo } from 'react';

/**
 * Hook to detect device performance capabilities and user preferences.
 * Provides a 'lowPerformance' flag to simplify animations.
 */
export const usePerformance = () => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Basic heuristic for low-end devices: 
  // - Low CPU core count (< 4)
  // - Low device memory (< 4GB)
  // - Or explicit user toggle (stored in localStorage)
  const isLowEndHardware = () => {
    if (typeof navigator === 'undefined') return false;
    const cpuCores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;
    return cpuCores < 4 || memory < 4;
  };

  const [lowPerformance, setLowPerformance] = useState(() => {
    const saved = localStorage.getItem('performance_mode');
    if (saved !== null) return saved === 'low';
    return prefersReducedMotion || isLowEndHardware();
  });

  useEffect(() => {
    localStorage.setItem('performance_mode', lowPerformance ? 'low' : 'high');
  }, [lowPerformance]);

  const togglePerformance = () => setLowPerformance(prev => !prev);

  // Performance-aware animation configs
  const animationConfig = useMemo(() => ({
    // Use simple tween instead of spring for low-performance
    transition: lowPerformance 
      ? { duration: 0.2, ease: 'easeOut' }
      : { type: 'spring', stiffness: 300, damping: 30 },
    
    // Duration for non-spring animations
    duration: 0.25,
    easing: [0.4, 0, 0.2, 1], // Standard cubic-bezier
    
    // Flags
    enableHover: !lowPerformance,
    enableComplex: !lowPerformance,
  }), [lowPerformance]);

  return { lowPerformance, togglePerformance, animationConfig };
};
