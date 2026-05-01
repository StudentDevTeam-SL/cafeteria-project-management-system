import { createContext, useContext, useState, useEffect } from 'react';

const SoundContext = createContext();

export const useSoundContext = () => useContext(SoundContext);

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5); 
  const [soundType, setSoundType] = useState('pop'); 

  const SOUNDS = {
    pop: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    bell: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  };

  const playSound = () => {
    if (!soundEnabled) return;
    const audio = new Audio(SOUNDS[soundType] || SOUNDS.pop);
    audio.volume = volume;
    audio.play().catch(() => {}); // Catch play restrictions on some browsers
  };

  return (
    <SoundContext.Provider value={{ soundEnabled, setSoundEnabled, volume, setVolume, soundType, setSoundType, playSound }}>
      {children}
    </SoundContext.Provider>
  );
};
