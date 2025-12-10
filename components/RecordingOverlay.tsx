import React, { useState, useEffect, useRef } from 'react';
import { X, Square, RotateCcw, Pause, Play, Check } from 'lucide-react';
import { AppSettings } from '../types';

interface RecordingOverlayProps {
  onClose: () => void;
  onFinish: (blob: Blob) => void;
  settings: AppSettings;
}

export const RecordingOverlay: React.FC<RecordingOverlayProps> = ({ onClose, onFinish, settings }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    startRecording();
    return () => {
      stopRecordingCleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        // Only trigger finish if we aren't just resetting
        // Logic handled in handleStop
      };

      recorder.start();
      setMediaRecorder(recorder);
      startTimer();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      onClose(); // Close if no permission
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopRecordingCleanup = () => {
    stopTimer();
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handlePauseResume = () => {
    if (!mediaRecorder) return;
    if (mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      stopTimer();
      setIsPaused(true);
    } else if (mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      startTimer();
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    if (!mediaRecorder) return;
    
    stopTimer();
    
    // We need to wait for the final data chunk
    mediaRecorder.addEventListener('stop', () => {
       const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
       onFinish(audioBlob);
    }, { once: true });
    
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
  };

  const handleReset = () => {
    stopRecordingCleanup();
    audioChunks.current = [];
    setDuration(0);
    setIsPaused(false);
    startRecording();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#FF5500] text-white p-6 transition-all duration-300">
      {/* Header */}
      <div className="w-full flex justify-end">
        <button 
          onClick={onClose}
          className="p-3 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-sm transition"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Visuals */}
      <div className="flex flex-col items-center justify-center space-y-8 w-full">
        <div className="font-serif text-7xl font-light tracking-tighter">
          {formatTime(duration)}
        </div>

        {/* Fake Visualizer */}
        <div className="flex items-end justify-center h-16 space-x-1.5 w-full max-w-xs">
           {!isPaused && Array.from({ length: 12 }).map((_, i) => (
             <div 
               key={i} 
               className="w-2 bg-white/80 rounded-full wave-bar"
               style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 50 + 20}%` }}
             />
           ))}
           {isPaused && <div className="text-white/70 font-sans text-sm tracking-widest uppercase">Paused</div>}
        </div>

        {/* Output Language Pill */}
        <div className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
          {settings.language} Output
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-8 pb-12 w-full max-w-sm">
        <button 
          onClick={handleReset}
          className="p-4 bg-white/20 rounded-full hover:bg-white/30 text-white transition"
        >
          <RotateCcw size={24} />
        </button>

        <button 
          onClick={handleStop}
          className="p-8 bg-white text-[#FF5500] rounded-2xl hover:scale-105 active:scale-95 transition-transform shadow-xl"
        >
          <Square fill="currentColor" size={32} />
        </button>

        <button 
          onClick={handlePauseResume}
          className="p-4 bg-white/20 rounded-full hover:bg-white/30 text-white transition"
        >
          {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
        </button>
      </div>
    </div>
  );
};
