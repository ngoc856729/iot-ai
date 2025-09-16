import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DeviceCard } from './components/DeviceCard';
import { AnalysisModal } from './components/AnalysisModal';
import { Icon } from './components/icons';
import { INITIAL_DEVICES, PROTOCOL_INFO, DEFAULT_AI_SETTINGS } from './constants';
import { Device, GeminiAnalysis, ConnectionStatus, Notification, DeviceStatus, AISettings, ChatMessage } from './types';
import { getPredictiveAnalysis, streamChatResponse } from './services/geminiService';
import { simulateDeviceUpdates, createNewDevice, pollLiveDeviceData } from './services/deviceService';
import { DeviceManagementView } from './components/DeviceManagementView';
import { ChatView } from './components/ChatView';
import { SettingsView } from './components/SettingsView';
import { NotificationsPanel } from './components/NotificationsPanel';
import { connectToDevice, disconnectFromDevice, LiveConnection } from './services/connectionService';

type View = 'dashboard' | 'protocols' | 'devices' | 'chat' | 'settings';
type Mode = 'simulation' | 'live';
export type ConversationState = 'idle' | 'listening' | 'processing' | 'speaking';
type Theme = 'light' | 'dark';

const Header: React.FC<{
    theme: Theme;
    toggleTheme: () => void;
    notifications: Notification[];
    onNotificationsToggle: () => void;
}> = ({ theme, toggleTheme, notifications, onNotificationsToggle }) => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    return (
        <header className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg sticky top-0 z-40 shadow-md shadow-blue-500/10 border-b border-white/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <i className="fa-solid fa-industry text-3xl text-blue-500"></i>
                        <h1 className="ml-3 text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Factory Insight AI</h1>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={toggleTheme} className="h-10 w-10 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 transition-colors" aria-label="Toggle theme">
                            <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="text-lg" />
                        </button>
                        <div className="relative">
                             <button onClick={onNotificationsToggle} className="h-10 w-10 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 transition-colors" aria-label="View notifications">
                                <Icon name="bell" className="text-lg" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center ring-2 ring-white dark:ring-gray-900" style={{ fontSize: '0.6rem' }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

const Sidebar: React.FC<{ currentView: View; setView: (view: View) => void }> = ({ currentView, setView }) => {
    const navItemClasses = (view: View) =>
        `flex items-center px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 relative ${
            currentView === view 
            ? 'bg-blue-600/20 text-blue-500 dark:text-blue-400' 
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-800/60'
        }`;

    return (
        <aside className="w-64 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border-r border-white/20 p-4 flex flex-col">
            <nav className="flex-grow space-y-2">
                <a onClick={() => setView('dashboard')} className={navItemClasses('dashboard')}>
                    {currentView === 'dashboard' && <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full"></div>}
                    <Icon name="dashboard" className="w-6 text-center text-lg mr-3" />
                    <span className="font-medium">Dashboard</span>
                </a>
                <a onClick={() => setView('devices')} className={navItemClasses('devices')}>
                    {currentView === 'devices' && <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full"></div>}
                    <Icon name="devices" className="w-6 text-center text-lg mr-3" />
                    <span className="font-medium">Devices</span>
                </a>
                <a onClick={() => setView('chat')} className={navItemClasses('chat')}>
                     {currentView === 'chat' && <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full"></div>}
                    <Icon name="chat" className="w-6 text-center text-lg mr-3" />
                    <span className="font-medium">AI Chat</span>
                </a>
                 <a onClick={() => setView('settings')} className={navItemClasses('settings')}>
                     {currentView === 'settings' && <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full"></div>}
                    <Icon name="settings" className="w-6 text-center text-lg mr-3" />
                    <span className="font-medium">Settings</span>
                </a>
                <a onClick={() => setView('protocols')} className={navItemClasses('protocols')}>
                     {currentView === 'protocols' && <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r-full"></div>}
                    <Icon name="protocols" className="w-6 text-center text-lg mr-3" />
                    <span className="font-medium">Protocols</span>
                </a>
            </nav>
        </aside>
    );
};

const ModeToggle: React.FC<{ mode: Mode; onModeChange: (mode: Mode) => void; }> = ({ mode, onModeChange }) => {
    return (
        <div className="flex items-center space-x-2 bg-gray-200/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 rounded-full p-1">
            <button onClick={() => onModeChange('simulation')} className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${mode === 'simulation' ? 'bg-white dark:bg-gray-900 text-gray-800 dark:text-white shadow' : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-900/50'}`}>
                Simulation
            </button>
            <button onClick={() => onModeChange('live')} className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${mode === 'live' ? 'bg-white dark:bg-gray-900 text-gray-800 dark:text-white shadow' : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-900/50'}`}>
                Live Data
            </button>
        </div>
    )
}

const DashboardView: React.FC<{ devices: Device[]; handleAnalyzeDevice: (id: string) => void; analyzingDeviceId: string | null; mode: Mode; onModeChange: (mode: Mode) => void; }> = ({ devices, handleAnalyzeDevice, analyzingDeviceId, mode, onModeChange }) => (
    <div className="p-6">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {mode === 'simulation' ? 'Dashboard (Simulation)' : 'Dashboard (Live)'}
            </h2>
            <ModeToggle mode={mode} onModeChange={onModeChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {devices.map((device) => (
                <DeviceCard
                    key={device.id}
                    device={device}
                    onAnalyze={handleAnalyzeDevice}
                    isAnalyzing={analyzingDeviceId === device.id}
                    mode={mode}
                />
            ))}
        </div>
    </div>
);

interface ProtocolsViewProps {
    protocols: Record<string, string>;
    onAddProtocol: (name: string, description: string) => void;
}

const ProtocolsView: React.FC<ProtocolsViewProps> = ({ protocols, onAddProtocol }) => {
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim() && newDescription.trim()) {
            onAddProtocol(newName.trim(), newDescription.trim());
            setNewName('');
            setNewDescription('');
        }
    };

    return (
        <div className="p-6 text-gray-700 dark:text-gray-300">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Industrial Communication Protocols</h2>
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg p-6 rounded-xl border border-white/20 mb-8 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Protocol</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="protocol-name" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Protocol Name</label>
                        <input
                            type="text"
                            id="protocol-name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="mt-1 block w-full bg-gray-100/80 dark:bg-gray-900/80 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., CAN bus"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="protocol-description" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Description</label>
                        <textarea
                            id="protocol-description"
                            rows={3}
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            className="mt-1 block w-full bg-gray-100/80 dark:bg-gray-900/80 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Describe the protocol..."
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800"
                        >
                            Add Protocol
                        </button>
                    </div>
                </form>
            </div>

            <div className="space-y-6">
                {Object.entries(protocols).map(([protocol, description]) => (
                    <div key={protocol} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg p-4 rounded-xl border border-white/20">
                        <h3 className="text-xl font-semibold text-blue-500 dark:text-blue-400">{protocol}</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
    const [view, setView] = useState<View>('dashboard');
    const [mode, setMode] = useState<Mode>('simulation');
    const [protocols, setProtocols] = useState<Record<string, string>>(PROTOCOL_INFO);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [geminiAnalysis, setGeminiAnalysis] = useState<GeminiAnalysis | null>(null);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
    const [analyzingDeviceId, setAnalyzingDeviceId] = useState<string | null>(null);
    const [conversationState, setConversationState] = useState<ConversationState>('idle');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [aiSettings, setAiSettings] = useState<AISettings>(() => {
        try {
            const savedSettings = localStorage.getItem('aiSettings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                // Ensure the Gemini API key from env is respected if available and no key is saved
                if (!parsed.gemini.apiKey && process.env.API_KEY) {
                    parsed.gemini.apiKey = process.env.API_KEY;
                }
                return parsed;
            }
        } catch (e) {
            console.error("Failed to load AI settings from localStorage", e);
        }
        return DEFAULT_AI_SETTINGS;
    });

    const [theme, setTheme] = useState<Theme>(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            return 'dark';
        }
        return 'light';
    });

    const connections = useRef(new Map<string, LiveConnection>());
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const prevDevicesRef = useRef<Map<string, DeviceStatus>>(new Map(INITIAL_DEVICES.map(d => [d.id, d.status])));

    useEffect(() => {
        localStorage.setItem('aiSettings', JSON.stringify(aiSettings));
    }, [aiSettings]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };
    
    const handleNotificationsToggle = () => {
        setIsNotificationsOpen(prev => !prev);
        if (!isNotificationsOpen) {
            // Mark all as read when opening
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        }
    }

    const setDeviceConnectionStatus = useCallback((deviceId: string, status: ConnectionStatus) => {
        setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, connectionStatus: status } : d));
    }, []);

    // Effect to handle connecting/disconnecting when mode changes
    useEffect(() => {
        const handleModeChange = () => {
            if (mode === 'live') {
                setDevices(currentDevices => {
                    currentDevices.forEach(device => {
                        if (!connections.current.has(device.id)) {
                            setDeviceConnectionStatus(device.id, ConnectionStatus.Connecting);
                            connectToDevice(device)
                                .then(conn => {
                                    connections.current.set(device.id, conn);
                                    setDeviceConnectionStatus(device.id, ConnectionStatus.Connected);
                                })
                                .catch(error => {
                                    console.error(`Failed to connect to device ${device.id}:`, error);
                                    setDeviceConnectionStatus(device.id, ConnectionStatus.Error);
                                });
                        }
                    });
                    return currentDevices;
                });
            } else { // 'simulation'
                for (const [deviceId, conn] of connections.current.entries()) {
                    conn.disconnect();
                    connections.current.delete(deviceId);
                }
                setDevices(prev => prev.map(d => ({ ...d, connectionStatus: ConnectionStatus.Disconnected })));
            }
        };

        handleModeChange();

        return () => {
            for (const conn of connections.current.values()) {
                conn.disconnect();
            }
            connections.current.clear();
        };
    }, [mode, setDeviceConnectionStatus]);

    // Effect for polling data and creating notifications
    useEffect(() => {
        const pollData = async () => {
            let updatedDevices: Device[];
            if (mode === 'simulation') {
                updatedDevices = simulateDeviceUpdates(devices);
            } else {
                 const updatePromises = devices.map(async (device) => {
                    const conn = connections.current.get(device.id);
                    if (conn && device.connectionStatus === ConnectionStatus.Connected) {
                        try {
                            return await pollLiveDeviceData(device, conn);
                        } catch (e) {
                            console.error(`Error polling data for ${device.id}`, e);
                            setDeviceConnectionStatus(device.id, ConnectionStatus.Error);
                            conn.disconnect();
                            connections.current.delete(device.id);
                            return device;
                        }
                    }
                    return device;
                });
                updatedDevices = await Promise.all(updatePromises);
            }
            
            setDevices(updatedDevices);
            
            const newNotifications: Notification[] = [];
            updatedDevices.forEach(device => {
                const prevStatus = prevDevicesRef.current.get(device.id);
                if (prevStatus === DeviceStatus.Normal && (device.status === DeviceStatus.Warning || device.status === DeviceStatus.Critical)) {
                    newNotifications.push({
                        id: Date.now() + Math.random(),
                        deviceId: device.id,
                        deviceName: device.name,
                        message: `Status changed to ${device.status}.`,
                        timestamp: new Date().toISOString(),
                        level: device.status as 'Warning' | 'Critical',
                        isRead: false,
                    });
                }
            });

            if (newNotifications.length > 0) {
                setNotifications(prev => [...newNotifications, ...prev].slice(0, 50)); // Keep last 50
            }
            
            const newStatusMap = new Map<string, DeviceStatus>();
            updatedDevices.forEach(d => newStatusMap.set(d.id, d.status));
            prevDevicesRef.current = newStatusMap;
        };

        const intervalId = setInterval(pollData, 2000);
        return () => clearInterval(intervalId);
    }, [mode, setDeviceConnectionStatus, devices]);

    const handleAddProtocol = (name: string, description: string) => {
        setProtocols(prev => ({ ...prev, [name]: description }));
    };

    const handleAddDevice = (deviceData: { id: string, name: string, protocol: string, connectionParams: Record<string, any> }): boolean => {
        if (devices.some(d => d.id === deviceData.id)) {
            return false;
        }
        const newDevice = createNewDevice(deviceData.id, deviceData.name, deviceData.protocol, deviceData.connectionParams);
        setDevices(prev => [...prev, newDevice]);
        return true;
    };

    const handleUpdateDevice = (updatedDeviceData: { id: string, name: string, protocol: string, connectionParams: Record<string, any> }) => {
        setDevices(prev => prev.map(d => d.id === updatedDeviceData.id
            ? {
                ...d,
                name: updatedDeviceData.name,
                protocol: updatedDeviceData.protocol,
                connectionParams: updatedDeviceData.connectionParams
            }
            : d
        ));
    };

    const handleDeleteDevice = (deviceId: string) => {
        const conn = connections.current.get(deviceId);
        if (conn) {
            conn.disconnect();
            connections.current.delete(deviceId);
        }
        setDevices(prev => prev.filter(d => d.id !== deviceId));
    };

    const handleAnalyzeDevice = async (deviceId: string) => {
        const deviceToAnalyze = devices.find(d => d.id === deviceId);
        if (!deviceToAnalyze) return;

        setSelectedDevice(deviceToAnalyze);
        setModalOpen(true);
        setIsLoadingAnalysis(true);
        setAnalyzingDeviceId(deviceId);
        setGeminiAnalysis(null);

        const analysis = await getPredictiveAnalysis(deviceToAnalyze, aiSettings);
        setGeminiAnalysis(analysis);
        setIsLoadingAnalysis(false);
        setAnalyzingDeviceId(null);
    };
    
    const speakSentences = useCallback((sentences: string[]) => {
        if (sentences.length === 0) {
            setConversationState('listening'); // Loop back to listening
            return;
        }

        const textToSpeak = sentences[0];
        const remainingSentences = sentences.slice(1);

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utteranceRef.current = utterance;

        utterance.onstart = () => {
            setConversationState('speaking');
        };
        
        utterance.onend = () => {
            speakSentences(remainingSentences);
        };
        
        utterance.onerror = (e) => {
            console.error("Speech synthesis error", e);
            setConversationState('listening');
        };

        window.speechSynthesis.speak(utterance);
    }, []);


    const handleSendMessage = async (message: string) => {
        if (conversationState === 'processing') return;

        setConversationState('processing');
        setChatHistory(prev => [...prev, { role: 'user', parts: [{ text: message }] }]);

        try {
            const stream = streamChatResponse(chatHistory, message, aiSettings);
            let accumulatedText = "";
            const sentences: string[] = [];
            let fullResponse = "";

            for await (const chunk of stream) {
                accumulatedText += chunk;
                fullResponse += chunk;
                const parts = accumulatedText.split(/(?<=[.?!])\s+/);
                if (parts.length > 1) {
                    const completeSentences = parts.slice(0, -1);
                    sentences.push(...completeSentences);
                    speakSentences(completeSentences); // Start speaking as sentences complete
                    accumulatedText = parts[parts.length - 1];
                }
            }
            
            if (accumulatedText.trim()) {
                sentences.push(accumulatedText.trim());
                 speakSentences([accumulatedText.trim()]);
            }
            
            setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: fullResponse }] }]);

        } catch (error) {
            console.error("Error sending chat message:", error);
            const errorMessage = `Sorry, I encountered an error. Please check the AI provider settings.`;
            speakSentences([errorMessage]);
            setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: errorMessage }] }]);
        }
    };
    
    const handleInterrupt = () => {
        if (utteranceRef.current) {
            utteranceRef.current.onend = null;
        }
        window.speechSynthesis.cancel();
        setConversationState('listening');
    };
    
    const handleSimulateNotification = (level: 'Warning' | 'Critical') => {
        if (devices.length === 0) return;
        const randomDevice = devices[Math.floor(Math.random() * devices.length)];
        const newNotification: Notification = {
             id: Date.now() + Math.random(),
             deviceId: randomDevice.id,
             deviceName: randomDevice.name,
             message: `Simulated ${level.toLowerCase()} event detected.`,
             timestamp: new Date().toISOString(),
             level: level,
             isRead: false,
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 50));
    };

    useEffect(() => {
        return () => {
            if (window.speechSynthesis) {
                if (utteranceRef.current) {
                    utteranceRef.current.onend = null;
                }
                window.speechSynthesis.cancel();
            }
        }
    }, [view]);

    const closeModal = () => {
        setModalOpen(false);
        setSelectedDevice(null);
        setGeminiAnalysis(null);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
            <Header theme={theme} toggleTheme={toggleTheme} notifications={notifications} onNotificationsToggle={handleNotificationsToggle} />
            <div className="flex flex-1 overflow-hidden relative">
                <Sidebar currentView={view} setView={setView} />
                <main className="flex-1 overflow-y-auto flex flex-col">
                    {view === 'dashboard' && <DashboardView devices={devices} handleAnalyzeDevice={handleAnalyzeDevice} analyzingDeviceId={analyzingDeviceId} mode={mode} onModeChange={setMode} />}
                    {view === 'protocols' && <ProtocolsView protocols={protocols} onAddProtocol={handleAddProtocol} />}
                    {view === 'devices' &&
                        <DeviceManagementView
                            devices={devices}
                            protocols={Object.keys(protocols)}
                            onAddDevice={handleAddDevice}
                            onUpdateDevice={handleUpdateDevice}
                            onDeleteDevice={handleDeleteDevice}
                        />}
                    {view === 'chat' &&
                        <ChatView
                            conversationState={conversationState}
                            setConversationState={setConversationState}
                            onSendMessage={handleSendMessage}
                            onInterrupt={handleInterrupt}
                            theme={theme}
                        />
                    }
                    {view === 'settings' && 
                        <SettingsView 
                            settings={aiSettings}
                            onSave={setAiSettings}
                            onSimulateNotification={handleSimulateNotification}
                        />
                    }
                </main>
                 <NotificationsPanel 
                    isOpen={isNotificationsOpen}
                    notifications={notifications}
                    onClose={() => setIsNotificationsOpen(false)}
                 />
            </div>
            <AnalysisModal
                isOpen={modalOpen}
                onClose={closeModal}
                analysis={geminiAnalysis}
                deviceName={selectedDevice?.name || ''}
                isLoading={isLoadingAnalysis}
            />
        </div>
    );
};

export default App;