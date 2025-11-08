import React from 'react';
import { PiMicrophoneLight, PiMicrophoneSlash } from 'react-icons/pi';
import { RxCross2 } from 'react-icons/rx';
import type { SatangVoiceModeProps } from '../../../types/satang';

const SatangVoiceMode: React.FC<SatangVoiceModeProps> = ({
  toggleMic,
  isMicOn,
  toggleVoiceMode,
}) => {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-between px-6 py-6">
      <div className="bg-[#E5F4FD] rounded-xl flex-1 w-full mb-5"></div>
      <div className="flex flex-row justify-between px-10 py-4">
        <div
          onClick={toggleMic}
          className="flex justify-center items-center w-16 h-16 bg-black-300 rounded-full cursor-pointer hover:bg-black-400"
        >
          {isMicOn ? <PiMicrophoneLight size={24} /> : <PiMicrophoneSlash size={24} />}
        </div>
        <div
          onClick={toggleVoiceMode}
          className="flex justify-center items-center w-16 h-16 bg-black-300 rounded-full hover:bg-black-400 cursor-pointer"
        >
          <RxCross2 size={24} />
        </div>
      </div>
    </div>
  );
};

export default SatangVoiceMode;
