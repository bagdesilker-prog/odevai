
import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { LIVE_CONVERSATION_MODEL } from '../constants';
import { encode, decode, decodeAudioData } from '../services/audioUtils';

let ai: GoogleGenAI;

export const useLiveConversation = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const sessionRef = useRef<LiveSession | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  const getAiInstance = useCallback(() => {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
  }, []);

  const stopListening = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
      mediaStreamSourceRef.current.disconnect();
      mediaStreamSourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
    }
    setIsListening(false);
    setTranscript('');
  }, []);

  const startListening = useCallback(async () => {
    if (isListening) return;

    setIsListening(true);
    setTranscript('');
    nextStartTimeRef.current = 0;
    audioSourcesRef.current.clear();
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    const localAi = getAiInstance();

    const sessionPromise = localAi.live.connect({
        model: LIVE_CONVERSATION_MODEL,
        callbacks: {
            onopen: () => console.log('Live session opened.'),
            onmessage: async (message: LiveServerMessage) => {
                if (message.serverContent?.inputTranscription) {
                    setTranscript(message.serverContent.inputTranscription.text);
                }

                const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                if (audioData && outputAudioContextRef.current) {
                    const outputCtx = outputAudioContextRef.current;
                    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);

                    const decoded = decode(audioData);
                    const audioBuffer = await decodeAudioData(decoded, outputCtx, 24000, 1);
                    const source = outputCtx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputCtx.destination);
                    
                    source.addEventListener('ended', () => {
                        audioSourcesRef.current.delete(source);
                    });
                    
                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;
                    audioSourcesRef.current.add(source);
                }

                if (message.serverContent?.interrupted) {
                    for (const source of audioSourcesRef.current.values()) {
                        source.stop();
                    }
                    audioSourcesRef.current.clear();
                    nextStartTimeRef.current = 0;
                }
            },
            onerror: (err) => {
                console.error('Live session error:', err);
                stopListening();
            },
            onclose: () => {
                console.log('Live session closed.');
                stopListening();
            }
        },
        config: {
            responseModalities: [Modality.AUDIO],
            inputAudioTranscription: {},
        }
    });

    sessionPromise.then(session => {
        sessionRef.current = session;
        if (!audioContextRef.current) return;
        
        mediaStreamSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
        
        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            
            // FIX: Replaced inefficient .map with a performant for-loop for blob creation.
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
            }

            const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
            };
            
            // FIX: Used the session object from the promise's closure to prevent stale references,
            // instead of relying on a ref and an extra conditional check.
            session.sendRealtimeInput({ media: pcmBlob });
        };

        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
        scriptProcessorRef.current.connect(audioContextRef.current.destination);

    }).catch(err => {
        console.error("Failed to connect live session", err);
        stopListening();
    });

  }, [isListening, getAiInstance, stopListening]);

  return { isListening, transcript, startListening, stopListening };
};
