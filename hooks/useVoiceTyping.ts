"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface UseVoiceTypingProps {
  onAddTask: (text: string) => void;
  onInterimResult?: (text: string) => void;
  onError?: (error: string) => void;
}

export const useVoiceTyping = ({ onAddTask, onInterimResult, onError }: UseVoiceTypingProps) => {
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const isMounted = useRef(false);
  const lastTranscript = useRef('');
  const currentTranscript = useRef('');

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition({
    transcribing: true,
    clearTranscriptOnListen: true,
  });

  // Handle mounting
  useEffect(() => {
    isMounted.current = true;
    setIsSupported(browserSupportsSpeechRecognition);

    return () => {
      isMounted.current = false;
      if (listening) {
        SpeechRecognition.stopListening();
      }
    };
  }, [browserSupportsSpeechRecognition, listening]);

  // Update transcript when it changes
  useEffect(() => {
    if (!isMounted.current || !transcript || transcript === lastTranscript.current) return;
    
    lastTranscript.current = transcript;
    currentTranscript.current = transcript;
    
    if (listening) {
      onInterimResult?.(transcript);
    }
  }, [transcript, listening, onInterimResult]);

  // Check for microphone permission
  const checkMicrophonePermission = useCallback(async () => {
    if (!isMounted.current) return false;

    try {
      const result = await navigator.mediaDevices.getUserMedia({ audio: true });
      for (const track of result.getTracks()) {
        track.stop();
      }
      
      if (isMounted.current) {
        setHasPermission(true);
      }
      return true;
    } catch (error) {
      if (isMounted.current) {
        setHasPermission(false);
        onError?.('Microphone access is required for voice input. Please allow microphone access and try again.');
      }
      return false;
    }
  }, [onError]);

  const startListening = useCallback(async () => {
    if (!isMounted.current) return;

    try {
      const permissionGranted = await checkMicrophonePermission();
      if (!permissionGranted || !isMounted.current) return;

      resetTranscript();
      lastTranscript.current = '';
      currentTranscript.current = '';
      await SpeechRecognition.startListening({ continuous: true });
    } catch (error) {
      if (isMounted.current) {
        if (error instanceof Error) {
          onError?.(`Failed to start voice recognition: ${error.message}`);
        } else {
          onError?.('Failed to start voice recognition');
        }
      }
    }
  }, [onError, checkMicrophonePermission, resetTranscript]);

  const stopListening = useCallback(() => {
    if (!isMounted.current) return;

    try {
      SpeechRecognition.stopListening();
    } catch (error) {
      if (isMounted.current) {
        if (error instanceof Error) {
          onError?.(`Failed to stop voice recognition: ${error.message}`);
        } else {
          onError?.('Failed to stop voice recognition');
        }
      }
    }
  }, [onError]);

  const addCurrentTranscript = useCallback(() => {
    if (!currentTranscript.current?.trim()) return;

    try {
      onAddTask(currentTranscript.current.trim());
      if (listening) {
        // Reset transcript for next task while still recording
        resetTranscript();
        lastTranscript.current = '';
        currentTranscript.current = '';
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }, [onAddTask, listening, resetTranscript]);

  // Return safe values during SSR
  if (typeof window === 'undefined') {
    return {
      isListening: false,
      startListening: () => {},
      stopListening: () => {},
      addCurrentTranscript: () => {},
      isSupported: false,
      hasPermission: null,
      currentText: ''
    };
  }

  return {
    isListening: listening,
    startListening,
    stopListening,
    addCurrentTranscript,
    isSupported,
    hasPermission,
    currentText: currentTranscript.current
  };
}; 