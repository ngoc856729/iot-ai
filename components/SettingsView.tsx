import React, { useState } from 'react';
import { AISettings, AIProvider } from '../types';

interface SettingsViewProps {
    settings: AISettings;
    onSave: (settings: AISettings) => void;
    onSimulateNotification: (level: 'Warning' | 'Critical') => void;
}

const providerNames: Record<AIProvider, string> = {
    gemini: 'Google Gemini',
    openai: 'OpenAI',
    anthropic: 'Anthropic (Claude)',
    iotteam: 'IoTTeam',
};

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-600 dark:text-gray-400">{label}</label>
        <input
            {...props}
            className="mt-1 block w-full bg-gray-100/70 dark:bg-gray-900/70 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    </div>
);

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave, onSimulateNotification }) => {
    const [localSettings, setLocalSettings] = useState<AISettings>(settings);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

    const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provider = e.target.value as AIProvider;
        setLocalSettings(prev => ({ ...prev, provider }));
    };

    const handleSettingChange = (provider: AIProvider, field: string, value: string) => {
        setLocalSettings(prev => ({
            ...prev,
            [provider]: {
                ...prev[provider],
                [field]: value
            }
        }));
    };
    
    const handleSave = () => {
        onSave(localSettings);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    };

    const currentProvider = localSettings.provider;

    return (
        <div className="p-6 text-gray-800 dark:text-gray-300">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>
            
            {/* AI Provider Settings */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg p-6 rounded-xl border border-white/20 mb-8 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">AI Provider Configuration</h3>
                
                <div className="mb-6">
                    <label htmlFor="ai-provider" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Active AI Provider</label>
                    <select
                        id="ai-provider"
                        value={currentProvider}
                        onChange={handleProviderChange}
                        className="mt-1 block w-full max-w-xs bg-gray-100/70 dark:bg-gray-900/70 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {Object.keys(providerNames).map(key => (
                            <option key={key} value={key}>{providerNames[key as AIProvider]}</option>
                        ))}
                    </select>
                </div>
                
                <div className="space-y-4">
                    {Object.keys(providerNames).map(pKey => {
                         const providerKey = pKey as AIProvider;
                         const isVisible = currentProvider === providerKey;
                         return (
                            <div key={providerKey} className={`p-4 border border-black/10 dark:border-white/10 rounded-lg transition-all duration-300 ${isVisible ? 'bg-black/5 dark:bg-white/5 opacity-100' : 'opacity-50'}`}>
                                <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-3">{providerNames[providerKey]} Settings</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormInput
                                        label="API Key"
                                        type="password"
                                        id={`${providerKey}-apiKey`}
                                        value={localSettings[providerKey].apiKey}
                                        onChange={(e) => handleSettingChange(providerKey, 'apiKey', e.target.value)}
                                        placeholder="Enter your API key"
                                    />
                                    <FormInput
                                        label="Model Name"
                                        type="text"
                                        id={`${providerKey}-model`}
                                        value={localSettings[providerKey].model}
                                        onChange={(e) => handleSettingChange(providerKey, 'model', e.target.value)}
                                        placeholder="e.g., gemini-2.5-flash"
                                    />
                                    {(providerKey === 'openai' || providerKey === 'iotteam') && (
                                         <FormInput
                                            label="Base URL (Optional)"
                                            type="text"
                                            id={`${providerKey}-baseURL`}
                                            value={localSettings[providerKey].baseURL || ''}
                                            onChange={(e) => handleSettingChange(providerKey, 'baseURL', e.target.value)}
                                            placeholder="https://api.openai.com/v1"
                                        />
                                    )}
                                </div>
                            </div>
                         )
                    })}
                </div>
                
                <div className="flex justify-end mt-6">
                    <button
                        onClick={handleSave}
                        className="inline-flex items-center justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 transition-all duration-150"
                    >
                        {saveStatus === 'saved' ? (
                           <> <i className="fa-solid fa-check mr-2"></i> Saved! </>
                        ) : (
                           'Save Settings'
                        )}
                    </button>
                </div>
            </div>

            {/* System Tools */}
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg p-6 rounded-xl border border-white/20 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">System Tools</h3>
                 <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Use these tools for testing and development purposes.</p>
                <div className="flex items-center space-x-4">
                     <button
                        onClick={() => onSimulateNotification('Warning')}
                        className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 focus:ring-offset-gray-800"
                    >
                       <i className="fa-solid fa-triangle-exclamation mr-2"></i> Simulate Warning
                    </button>
                    <button
                        onClick={() => onSimulateNotification('Critical')}
                        className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-800"
                    >
                       <i className="fa-solid fa-burst mr-2"></i> Simulate Critical
                    </button>
                </div>
            </div>
        </div>
    );
};
