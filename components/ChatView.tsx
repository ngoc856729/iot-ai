import React from 'react';
import { useState, useRef, useEffect } from 'react';
import type { ConversationState } from '../App';
import type { ChatMessage } from '../types';
import { Icon } from './icons';

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
  chatHistory: ChatMessage[];
  conversationState: ConversationState;
  setConversationState: (state: ConversationState) => void;
  onSendMessage: (message: string) => void;
  isContinuousMode: boolean;
  onToggleContinuousMode: () => void;
  theme: 'light' | 'dark';
  onClose: () => void;
}

const statusMap: Record<ConversationState, string> = {
    idle: 'Ready to chat. Type or press the mic to start.',
    listening: 'Listening...',
    processing: 'Thinking...',
    speaking: 'Speaking...',
};

const VoiceModeButton: React.FC<{
    isContinuous: boolean;
    state: ConversationState;
    onClick: () => void;
}> = ({ isContinuous, state, onClick }) => {
    const baseClasses = 'w-12 h-12 flex-shrink-0 rounded-full text-white flex items-center justify-center text-xl transition-all duration-300 shadow-lg';
    
    if (isContinuous) {
        let color = 'bg-red-600 hover:bg-red-700';
        let icon = 'fa-stop';
        if (state === 'listening') {
             icon = 'fa-microphone-lines';
             color += ' animate-pulse';
        }
        if (state === 'processing') icon = 'fa-robot animate-spin-slow';
        if (state === 'speaking') icon = 'fa-waveform';

        return (
            <button type="button" onClick={onClick} className={`${baseClasses} ${color}`} aria-label="Stop voice conversation">
                <i className={`fa-solid ${icon}`}></i>
            </button>
        );
    }

    return (
        <button type="button" onClick={onClick} className={`${baseClasses} bg-blue-600 hover:bg-blue-700`} aria-label="Start voice conversation">
            <i className="fa-solid fa-microphone"></i>
        </button>
    );
};

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-fast [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-fast [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse-fast"></div>
    </div>
);

// --- Markdown Renderer for AI Responses ---
const MarkdownContent: React.FC<{ content: string }> = ({ content }) => {
    const [copiedStates, setCopiedStates] = useState<Record<number, boolean>>({});

    const handleCopy = (code: string, index: number) => {
        navigator.clipboard.writeText(code);
        setCopiedStates(prev => ({ ...prev, [index]: true }));
        setTimeout(() => setCopiedStates(prev => ({ ...prev, [index]: false })), 2000);
    };

    // Split by code blocks first to isolate them
    const parts = content.split(/(```(?:\w+)?\n[\s\S]*?\n```)/g);

    const renderTextPart = (text: string, partIndex: number) => {
        const lines = text.trim().split('\n');
        const elements: React.ReactNode[] = [];
        let listType: 'ul' | 'ol' | null = null;
        let listItems: React.ReactNode[] = [];

        const flushList = () => {
            if (listItems.length > 0) {
                if (listType === 'ul') {
                    elements.push(<ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-2 pl-2">{listItems}</ul>);
                } else if (listType === 'ol') {
                    elements.push(<ol key={`ol-${elements.length}`} className="list-decimal list-inside space-y-1 my-2 pl-2">{listItems}</ol>);
                }
                listItems = [];
                listType = null;
            }
        };

        lines.forEach((line, lineIndex) => {
            const key = `${partIndex}-${lineIndex}`;
            
            if (line.startsWith('# ')) { flushList(); elements.push(<h1 key={key} className="text-xl font-bold mt-3 mb-1">{line.substring(2)}</h1>); return; }
            if (line.startsWith('## ')) { flushList(); elements.push(<h2 key={key} className="text-lg font-semibold mt-2 mb-1">{line.substring(3)}</h2>); return; }
            if (line.startsWith('### ')) { flushList(); elements.push(<h3 key={key} className="text-base font-semibold mt-1">{line.substring(4)}</h3>); return; }
            
            const ulMatch = line.match(/^(\s*)- (.*)/);
            if (ulMatch) {
                if (listType !== 'ul') flushList();
                listType = 'ul';
                listItems.push(<li key={key}>{ulMatch[2]}</li>);
                return;
            }
            
            const olMatch = line.match(/^(\s*)\d+\. (.*)/);
            if (olMatch) {
                if (listType !== 'ol') flushList();
                listType = 'ol';
                listItems.push(<li key={key}>{olMatch[2]}</li>);
                return;
            }

            flushList();
            if (line.trim()) {
                elements.push(<p key={key}>{line}</p>);
            }
        });

        flushList(); // Flush any remaining list
        return elements;
    };

    return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
            {parts.map((part, index) => {
                if (part.startsWith('```')) {
                    const codeBlock = part.match(/```(?:\w+)?\n([\s\S]*?)\n```/);
                    if (codeBlock && codeBlock[1]) {
                        const code = codeBlock[1];
                        return (
                            <div key={index} className="bg-gray-900/80 rounded-lg my-2 relative text-white font-mono text-sm not-prose">
                                <button 
                                    onClick={() => handleCopy(code, index)} 
                                    className="absolute top-2 right-2 text-xs text-gray-300 bg-gray-700/80 hover:bg-gray-600/80 px-2 py-1 rounded-md transition-colors z-10">
                                    {copiedStates[index] ? 'Copied!' : 'Copy'}
                                </button>
                                <pre className="p-4 pt-9 overflow-x-auto"><code className="whitespace-pre-wrap">{code}</code></pre>
                            </div>
                        );
                    }
                }
                return <div key={index} className="space-y-2">{renderTextPart(part, index)}</div>;
            }).filter(Boolean)}
        </div>
    );
};


const ChatMessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    const text = message.parts.map(p => p.text).join('');
    const isTyping = message.role === 'model' && text.length === 0;

    return (
        <div className={`flex items-end gap-2 animate-fade-in-up ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-gray-700 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                    <Icon name="chat" className="text-white text-md"/>
                </div>
            )}
             <div
                className={`max-w-xl px-4 py-3 rounded-2xl shadow-md relative ${
                    isUser
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-gray-700/80 rounded-bl-none text-gray-800 dark:text-gray-200'
                }`}
            >
                {isTyping ? <TypingIndicator /> : (
                     isUser ? <p className="whitespace-pre-wrap">{text}</p> : <MarkdownContent content={text} />
                )}
                
                {/* Bubble tails using borders */}
                 <div className={`absolute bottom-0 w-0 h-0 border-[10px] ${
                     isUser 
                        ? 'right-[-10px] border-l-blue-600 border-r-transparent border-t-transparent border-b-blue-600' 
                        : 'left-[-10px] border-r-white dark:border-r-gray-700/80 border-l-transparent border-t-transparent border-b-white dark:border-b-gray-700/80'
                 }`}></div>
            </div>
        </div>
    );
};

const ChatWelcome: React.FC<{ onSuggestionClick: (text: string) => void }> = ({ onSuggestionClick }) => {
    const suggestions = [
        'Summarize device statuses',
        'Any devices in a critical state?',
        'Show me the history for CNC-001',
    ];
    return (
        <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl mb-4">
                 <Icon name="sparkles" className="text-white text-4xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">AI Assistant</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">How can I help you manage your factory floor today?</p>
            <div className="flex flex-wrap justify-center gap-3">
                {suggestions.map((s) => (
                    <button key={s} onClick={() => onSuggestionClick(s)} className="bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm border border-white/20 py-2 px-4 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-md">
                        {s}
                    </button>
                ))}
            </div>
        </div>
    )
}


export const ChatView: React.FC<ChatViewProps> = ({ chatHistory, conversationState, setConversationState, onSendMessage, isContinuousMode, onToggleContinuousMode, theme, onClose }) => {
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const finalTranscriptRef = useRef<string>('');
    const isSupported = useRef(false);
    const [textInput, setTextInput] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logic
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);
    
    // Setup Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            isSupported.current = true;
            const recognition = new SpeechRecognition();
            recognition.continuous = false; // The app's continuous mode logic will handle restarting
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = 0; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                finalTranscriptRef.current = finalTranscript.trim();
                setTextInput(finalTranscript + interimTranscript);
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                if (conversationState === 'listening') {
                    setConversationState('idle');
                }
            };

            recognition.onend = () => {
                if (conversationState === 'listening') {
                    const transcript = finalTranscriptRef.current.trim();
                    if (transcript) {
                        onSendMessage(transcript);
                    } else if (isContinuousMode) {
                        // In continuous mode, if there was no speech (timeout), just start listening again.
                        try {
                           recognitionRef.current?.start();
                        } catch (e) {
                           console.error("Error restarting recognition on timeout:", e);
                           // To avoid spamming errors, go idle if restart fails
                           setConversationState('idle');
                        }
                    } else {
                        // Not in continuous mode and no speech, so go idle.
                        setConversationState('idle');
                    }
                }
            };

            recognitionRef.current = recognition;
        } else {
            console.warn('Speech Recognition not supported by this browser.');
        }

        return () => {
            if (recognitionRef.current) {
                 recognitionRef.current.onresult = null;
                 recognitionRef.current.onerror = null;
                 recognitionRef.current.onend = null;
                 recognitionRef.current.stop();
            }
            if (window.speechSynthesis && window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    useEffect(() => {
        if (conversationState === 'listening') {
            setTextInput('');
            finalTranscriptRef.current = '';
            try {
                recognitionRef.current?.start();
            } catch (e) {
                 console.error("Error starting speech recognition:", e);
                 setConversationState('idle');
            }
        } else {
            recognitionRef.current?.stop();
        }
    }, [conversationState]);
    
    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (textInput.trim() && !isContinuousMode) {
            onSendMessage(textInput.trim());
            setTextInput('');
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleTextSubmit(e as any);
        }
    }


    return (
        <div className="h-full w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
             <style>{`
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin-slow { animation: spin-slow 2s linear infinite; }
                 @keyframes pulse-fast {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.95); }
                }
                .animate-pulse-fast { animation: pulse-fast 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                 @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
                .prose { color: inherit; }
                .prose h1, .prose h2, .prose h3 { color: inherit; font-weight: 600; }
                
                /* Custom Scrollbar for Chat History */
                .chat-history-container {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
                }
                .dark .chat-history-container {
                    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
                }
                .chat-history-container::-webkit-scrollbar {
                    width: 8px;
                }
                .chat-history-container::-webkit-scrollbar-track {
                    background: transparent;
                }
                .chat-history-container::-webkit-scrollbar-thumb {
                    background-color: rgba(0, 0, 0, 0.2);
                    border-radius: 4px;
                }
                .dark .chat-history-container::-webkit-scrollbar-thumb {
                    background-color: rgba(255, 255, 255, 0.2);
                }
                .chat-history-container::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(0, 0, 0, 0.3);
                }
                .dark .chat-history-container::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(255, 255, 255, 0.3);
                }
             `}</style>
            
            <div className="flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10 flex-shrink-0">
                <div className="flex items-center space-x-2">
                    <Icon name="sparkles" className="text-blue-500" />
                    <h2 className="font-bold text-lg text-gray-900 dark:text-white">AI Assistant</h2>
                </div>
                <button onClick={onClose} className="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-full -mr-2" aria-label="Close chat">
                    <Icon name="close" className="h-5 w-5" />
                </button>
            </div>
            
            <div ref={chatContainerRef} className="chat-history-container flex-grow overflow-y-auto space-y-6 p-4 md:p-6">
                {chatHistory.length > 0 ? (
                    chatHistory.map((msg, index) => (
                        <ChatMessageBubble key={index} message={msg} />
                    ))
                ) : (
                    <ChatWelcome onSuggestionClick={(text) => onSendMessage(text)} />
                )}
            </div>
            
             <div className="px-4 py-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border-t border-white/20">
                 <form onSubmit={handleTextSubmit} className="flex items-end space-x-3">
                    {isContinuousMode ? (
                        <div className="flex-grow bg-gray-100/70 dark:bg-gray-900/70 border border-gray-300 dark:border-gray-600 rounded-xl shadow-inner py-3 px-4 text-gray-900 dark:text-white min-h-[52px] flex items-center">
                           <p className={`w-full break-words ${!textInput ? 'text-gray-500 dark:text-gray-400 italic' : ''}`}>
                               {textInput || statusMap[conversationState]}
                           </p>
                       </div>
                    ) : (
                        <>
                             <textarea
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your message..."
                                rows={1}
                                className="flex-grow bg-gray-100/70 dark:bg-gray-900/70 border border-gray-300 dark:border-gray-600 rounded-xl shadow-inner py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none max-h-40 transition-all"
                                style={{ scrollbarWidth: 'none' }} /* Firefox */
                            ></textarea>
                            <button
                                type="submit"
                                disabled={!textInput.trim() || conversationState === 'processing'}
                                className="w-12 h-12 flex-shrink-0 rounded-full text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-xl transition-all duration-300 shadow-lg disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                <i className="fa-solid fa-paper-plane"></i>
                            </button>
                        </>
                    )}
                    <VoiceModeButton 
                        isContinuous={isContinuousMode} 
                        state={conversationState} 
                        onClick={onToggleContinuousMode} 
                    />
                 </form>
                 <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400 h-4">
                    {isSupported.current ? (isContinuousMode ? '' : statusMap[conversationState]) : "Speech recognition not supported in this browser."}
                 </p>
            </div>
        </div>
    );
};
