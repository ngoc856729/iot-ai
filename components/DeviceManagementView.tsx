import React, { useState, useEffect } from 'react';
import { Device } from '../types';
import { Icon } from './icons';
import { PROTOCOL_FIELDS } from '../constants';

interface DeviceFormState {
    id: string;
    name: string;
    protocol: string;
    connectionParams: Record<string, any>;
}

interface DeviceManagementViewProps {
    devices: Device[];
    protocols: string[];
    onAddDevice: (device: DeviceFormState) => boolean; // Returns success
    onUpdateDevice: (device: DeviceFormState) => void;
    onDeleteDevice: (deviceId: string) => void;
}

const initialFormState: DeviceFormState = { id: '', name: '', protocol: '', connectionParams: {} };

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input
        {...props}
        className="mt-1 block w-full bg-gray-100/70 dark:bg-gray-900/70 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300/50 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed"
    />
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select
        {...props}
        className="mt-1 block w-full bg-gray-100/70 dark:bg-gray-900/70 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
);

export const DeviceManagementView: React.FC<DeviceManagementViewProps> = ({ devices, protocols, onAddDevice, onUpdateDevice, onDeleteDevice }) => {
    const [formState, setFormState] = useState<DeviceFormState>(initialFormState);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);
    const [error, setError] = useState<string | null>(null);

    const setFormProtocol = (protocol: string) => {
        const newFields = PROTOCOL_FIELDS[protocol] || [];
        const newConnectionParams: Record<string, any> = {};
        // Pre-populate with defaults
        newFields.forEach(field => {
            if (field.type === 'select' && field.options?.length) {
                newConnectionParams[field.name] = field.options[0];
            } else {
                newConnectionParams[field.name] = '';
            }
        });
         setFormState(prev => ({ ...prev, protocol, connectionParams: newConnectionParams }));
    };

    useEffect(() => {
        // Set a default protocol if none is selected and protocols are available
        if (!formState.protocol && protocols.length > 0) {
            setFormProtocol(protocols[0]);
        }
    }, [protocols, formState.protocol]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'protocol') {
            setFormProtocol(value);
        } else {
            setFormState(prev => ({ ...prev, [name]: value }));
        }

        if (name === 'id' && error) {
            setError(null);
        }
    };
    
    const handleConnectionParamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const type = 'type' in e.target ? (e.target as HTMLInputElement).type : 'text';

        setFormState(prev => ({
            ...prev,
            connectionParams: {
                ...prev.connectionParams,
                [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
            }
        }));
    };

    const handleEditClick = (device: Device) => {
        setEditingDevice(device);
        setFormState({ 
            id: device.id, 
            name: device.name, 
            protocol: device.protocol, 
            connectionParams: device.connectionParams || {} 
        });
        setError(null);
        window.scrollTo(0, 0);
    };

    const handleCancelEdit = () => {
        setEditingDevice(null);
        setFormState({ ...initialFormState, protocol: protocols[0] || '' });
        setError(null);
    };
    
    const handleDeleteClick = (deviceId: string) => {
        if (window.confirm('Are you sure you want to delete this device? This action cannot be undone.')) {
            onDeleteDevice(deviceId);
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.id || !formState.name || !formState.protocol) {
            setError("All fields are required.");
            return;
        }

        if (editingDevice) {
            onUpdateDevice(formState);
        } else {
            const success = onAddDevice(formState);
            if (!success) {
                setError(`Device with ID '${formState.id}' already exists.`);
                return; 
            }
        }
        handleCancelEdit(); 
    };
    
    const currentProtocolFields = PROTOCOL_FIELDS[formState.protocol] || [];

    return (
        <div className="p-6 text-gray-800 dark:text-gray-300">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Device Management</h2>

            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg p-6 rounded-xl border border-white/20 mb-8 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{editingDevice ? `Edit Device: ${editingDevice.name}` : 'Add New Device'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="id" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Device ID (Unique)</label>
                            <FormInput
                                type="text" name="id" id="id" value={formState.id} onChange={handleInputChange}
                                disabled={!!editingDevice}
                                placeholder="e.g., cnc-002" required
                            />
                        </div>
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Device Name</label>
                            <FormInput
                                type="text" name="name" id="name" value={formState.name} onChange={handleInputChange}
                                placeholder="e.g., Laser Cutter Epsilon" required
                            />
                        </div>
                        <div>
                            <label htmlFor="protocol" className="block text-sm font-medium text-gray-600 dark:text-gray-400">Protocol</label>
                            <FormSelect name="protocol" id="protocol" value={formState.protocol} onChange={handleInputChange} required>
                                {protocols.map(p => <option key={p} value={p}>{p}</option>)}
                            </FormSelect>
                        </div>
                    </div>
                    
                    {currentProtocolFields.length > 0 && (
                        <div className="pt-4 border-t border-black/10 dark:border-white/10">
                             <h4 className="text-md font-semibold text-gray-800 dark:text-gray-300 mb-2">{formState.protocol} Parameters</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {currentProtocolFields.map(field => (
                                    <div key={field.name}>
                                        <label htmlFor={field.name} className="block text-sm font-medium text-gray-600 dark:text-gray-400">{field.label}</label>
                                        {field.type === 'select' ? (
                                            <FormSelect
                                                name={field.name}
                                                id={field.name}
                                                value={formState.connectionParams[field.name] || ''}
                                                onChange={handleConnectionParamChange}
                                                required
                                            >
                                                {field.options?.map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </FormSelect>
                                        ) : (
                                            <FormInput
                                                type={field.type}
                                                name={field.name}
                                                id={field.name}
                                                value={formState.connectionParams[field.name] || ''}
                                                onChange={handleConnectionParamChange}
                                                placeholder={field.placeholder}
                                                required
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                     {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>}
                     
                    <div className="flex justify-end space-x-3 pt-4">
                         {editingDevice && (
                            <button
                                type="button" onClick={handleCancelEdit}
                                className="inline-flex justify-center py-2 px-4 border border-gray-400 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-800 dark:text-white bg-gray-200/80 dark:bg-gray-700/80 hover:bg-gray-300/80 dark:hover:bg-gray-600/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                         )}
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 transition-colors"
                        >
                           <Icon name={editingDevice ? 'edit' : 'add'} className="mr-2" />
                            {editingDevice ? 'Update Device' : 'Add Device'}
                        </button>
                    </div>
                </form>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Existing Devices</h3>
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-black/10 dark:divide-white/10">
                        <thead className="bg-black/5 dark:bg-white/5">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Protocol</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/10 dark:divide-white/10">
                            {devices.map((device) => (
                                <tr key={device.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600 dark:text-gray-300">{device.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{device.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{device.protocol}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => handleEditClick(device)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-2 rounded-md hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors" aria-label={`Edit ${device.name}`}>
                                            <Icon name="edit" className="h-5 w-5"/>
                                        </button>
                                        <button onClick={() => handleDeleteClick(device.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 rounded-md hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors" aria-label={`Delete ${device.name}`}>
                                            <Icon name="delete" className="h-5 w-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {devices.length === 0 && <p className="text-center py-8 text-gray-500">No devices configured. Add one using the form above.</p>}
            </div>
        </div>
    );
};