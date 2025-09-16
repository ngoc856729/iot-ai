import React, { useState, useRef, useEffect } from 'react';
import type { ConversationState } from '../App';

// Add SpeechRecognition type, as it might not be in standard TS lib
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: ((this: SpeechRecognition, ev: any) => any) | null;
    onerror: ((this: SpeechRecognition, ev: any) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

declare global {
    interface Window {
        SpeechRecognition: { new(): SpeechRecognition };
        webkitSpeechRecognition: { new(): SpeechRecognition };
    }
}

interface ChatViewProps {
  conversationState: ConversationState;
  setConversationState: (state: ConversationState) => void;
  onSendMessage: (message: string) => void;
  onInterrupt: () => void;
  theme: 'light' | 'dark';
}

const statusMap: Record<ConversationState, string> = {
    idle: 'Click the orb and start speaking',
    listening: 'Listening...',
    processing: 'Thinking...',
    speaking: 'Speaking...',
};

const Orb: React.FC<{ state: ConversationState, onClick: () => void, theme: 'light' | 'dark' }> = ({ state, onClick, theme }) => {
    const stateClasses: Record<ConversationState, string> = {
        idle: 'animate-pulse-slow',
        listening: 'animate-listen-pulse',
        processing: 'animate-spin-slow',
        speaking: 'animate-speak-pulse',
    };
    
    const orbGradient = theme === 'dark'
        ? 'from-gray-700/80 to-gray-900/80'
        : 'from-white/80 to-gray-300/80';
    
    const innerCoreBg = theme === 'dark' ? 'bg-gray-800/80' : 'bg-gray-300/80';


    return (
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
            {/* Outer rings for speaking animation */}
            <div className={`absolute w-full h-full rounded-full bg-blue-500/10 transition-transform duration-500 ${state === 'speaking' ? 'scale-150 animate-ping-once' : 'scale-0'}`}></div>
            <div className={`absolute w-full h-full rounded-full bg-blue-500/20 transition-transform duration-500 delay-200 ${state === 'speaking' ? 'scale-125 animate-ping-once' : 'scale-0'}`}></div>

            {/* Main Orb */}
            <div
                onClick={onClick}
                className={`w-full h-full rounded-full bg-gradient-to-br ${orbGradient} shadow-2xl cursor-pointer flex items-center justify-center transition-all duration-300 transform hover:scale-105 backdrop-blur-md border border-white/10`}
                aria-label={statusMap[state]}
            >
                {/* Inner core */}
                <div className={`w-5/6 h-5/6 rounded-full ${innerCoreBg} shadow-inner-lg flex items-center justify-center transition-all duration-500 ${state === 'processing' ? 'animate-pulse' : ''}`}>
                    {/* Glowing center */}
                    <div className={`w-3/4 h-3/4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-70 blur-xl transition-all duration-500 ${stateClasses[state]}`}></div>
                </div>
            </div>
        </div>
    );
};


export const ChatView: React.FC<ChatViewProps> = ({ conversationState, setConversationState, onSendMessage, onInterrupt, theme }) => {
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const finalTranscriptRef = useRef<string>('');
    const isSupported = useRef(false);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            isSupported.current = true;
            const recognition = new SpeechRecognition();
            recognition.continuous = false; // Stop after a pause
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                finalTranscriptRef.current = ''; // Reset final transcript on new results
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscriptRef.current += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                 // For future use: could display interimTranscript
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                if (conversationState === 'listening') {
                    setConversationState('idle');
                }
            };

            recognition.onend = () => {
                if (conversationState === 'listening') {
                     if (finalTranscriptRef.current.trim()) {
                         onSendMessage(finalTranscriptRef.current.trim());
                     } else {
                         setConversationState('idle'); // No input detected
                     }
                }
            };

            recognitionRef.current = recognition;
        } else {
            console.warn('Speech Recognition not supported by this browser.');
        }

        // Cleanup
        return () => {
            recognitionRef.current?.stop();
            window.speechSynthesis.cancel();
        };
    }, []);

    useEffect(() => {
        if (conversationState === 'listening') {
            finalTranscriptRef.current = '';
            recognitionRef.current?.start();
        } else {
            recognitionRef.current?.stop();
        }
    }, [conversationState]);


    const handleOrbClick = () => {
        if (!isSupported.current) {
            alert("Sorry, your browser doesn't support speech recognition.");
            return;
        }

        switch (conversationState) {
            case 'idle':
                setConversationState('listening');
                break;
            case 'listening':
                recognitionRef.current?.stop(); // This will trigger onend, which handles the message sending
                break;
            case 'speaking':
                onInterrupt(); // Interrupt the AI and start listening
                break;
            // 'processing' is not clickable
        }
    };


    return (
        <div className="flex flex-col h-full items-center justify-center text-center p-4">
             <style>{`
                @keyframes pulse-slow { 50% { opacity: 0.6; } }
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes listen-pulse { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.1); opacity: 1; } }
                @keyframes speak-pulse { 0%, 100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.05) rotate(5deg); } }
                @keyframes ping-once { 75%, 100% { transform: scale(2); opacity: 0; } }

                .animate-pulse-slow { animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                .animate-spin-slow { animation: spin-slow 5s linear infinite; }
                .animate-listen-pulse { animation: listen-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                .animate-speak-pulse { animation: speak-pulse 1s ease-in-out infinite; }
                .animate-ping-once { animation: ping-once 1s cubic-bezier(0, 0, 0.2, 1); }
                .shadow-inner-lg { box-shadow: inset 0 8px 16px 0 rgba(0,0,0,0.5); }
             `}</style>
            
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">AI Voice Assistant</h2>
            
            <Orb state={conversationState} onClick={handleOrbClick} theme={theme} />
            
            <p className="mt-8 text-lg text-gray-600 dark:text-gray-400 h-8 transition-opacity duration-300">
                {isSupported.current ? statusMap[conversationState] : "Speech recognition not supported in this browser."}
            </p>
        </div>
    );
};