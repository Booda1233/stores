
import { useState, useEffect, useCallback } from 'react';

export const useTextToSpeech = (text: string) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const play = useCallback(() => {
    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }
    stop();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
      setIsSpeaking(false);
      setIsPaused(false);
    };
    window.speechSynthesis.speak(utterance);
  }, [text, isSpeaking, isPaused, stop]);

  const pause = useCallback(() => {
    if(isSpeaking && !isPaused) {
        window.speechSynthesis.pause();
        setIsPaused(true);
    }
  }, [isSpeaking, isPaused]);

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      stop();
    };
  }, [stop]);

  return { isSpeaking, isPaused, play, pause, stop };
};
