import React, { useState } from 'react';
import SatangTextMode from '../../components/user/SatangTextMode';
import SatangVoiceMode from '../../components/user/SatangVoiceMode';

const Satang: React.FC = () => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [text, setText] = useState('');

  const playBeep = (frequency: number, duration = 0.2) => {
    const ctx = new window.AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration + 0.05);
  };

  const toggleVoiceMode = () => {
    setIsVoiceMode((prev) => !prev);
  };

  const toggleMic = () => {
    setIsMicOn((prev) => {
      if (prev) playBeep(400);
      else playBeep(900);
      return !prev;
    });
  };

  return (
    <div>
      {isVoiceMode ? (
        <SatangVoiceMode
          toggleMic={toggleMic}
          isMicOn={isMicOn}
          toggleVoiceMode={toggleVoiceMode}
        />
      ) : (
        <SatangTextMode toggleVoiceMode={toggleVoiceMode} text={text} setText={setText} />
      )}
    </div>
  );
};

export default Satang;
