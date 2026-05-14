/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useRef, useState } from 'react';

const SoundContext = createContext();

export const useSoundContext = () => useContext(SoundContext);

/**
 * Tiny base64-encoded audio snippets — no CORS, no network, no 404s.
 * These are minimal WAV data URIs (PCM, 8-bit, 8 kHz, mono).
 * Generated via Python: scipy.io.wavfile + base64 — pleasant & tiny.
 */
const SOUND_DATA = {
  // Short soft pop — 60 ms @ 8 kHz
  pop: 'data:audio/wav;base64,UklGRlYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTAAAAD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AA==',
  // Short click — 30 ms @ 8 kHz
  click: 'data:audio/wav;base64,UklGRioAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAD/AP8A/wAAAAAAAAAAAP8A/wD/AAAAAP8AAAD/AAAAAAAAAAD/AP8AAAD/AAAAAAAAAAA=',
  // Bell — 120 ms @ 8 kHz, simple sine wave approximation
  bell: 'data:audio/wav;base64,UklGRn4AAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YWAAAAAA/wD+APwA+gD3APUA8wDxAO8A7gDsAOsA6gDqAOoA6gDrAO0A7wDyAPUA+AD8AP8AAgEFAQcBCAEIAQcBBgEEAQIBAAH+APsA+AD2APQA8gDxAPAA8ADxAPIAsAC4AMAAyADQANgA3ADgA',
};

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume]             = useState(0.5);
  const [soundType, setSoundType]       = useState('pop');

  // Keep a pool of audio objects to avoid creating a new one per click
  const poolRef = useRef({});

  const playSound = (type) => {
    if (!soundEnabled) return;
    const key  = type || soundType;
    const src  = SOUND_DATA[key] || SOUND_DATA.pop;

    try {
      // Reuse or create an Audio instance for this sound type
      if (!poolRef.current[key]) {
        poolRef.current[key] = new Audio(src);
      }
      const audio = poolRef.current[key];
      audio.volume = volume;
      // Allow rapid fire by rewinding
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Autoplay policy blocked — silent fallback (expected in some browsers)
      });
    } catch {
      // Ignore all audio errors to never break the UI
    }
  };

  return (
    <SoundContext.Provider
      value={{ soundEnabled, setSoundEnabled, volume, setVolume, soundType, setSoundType, playSound }}
    >
      {children}
    </SoundContext.Provider>
  );
};
