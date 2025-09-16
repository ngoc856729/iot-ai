import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { Device } from '../types';
import { DeviceStatus, ConnectionStatus } from '../types';
import { Icon } from './icons';

interface DeviceCardProps {
  device: Device;
  onAnalyze: (id: string) => void;
  isAnalyzing: boolean;
  mode: 'simulation' | 'live';
}

const statusStyles = {
  [DeviceStatus.Normal]: 'bg-green-500/20 text-green-400 border-green-500/30',
  [DeviceStatus.Warning]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  [DeviceStatus.Critical]: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse',
};

const connectionStatusStyles = {
    [ConnectionStatus.Disconnected]: 'bg-gray-500',
    [ConnectionStatus.Connecting]: 'bg-yellow-500 animate-pulse',
    [ConnectionStatus.Connected]: 'bg-green-500',
    [ConnectionStatus.Error]: 'bg-red-500',
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                <p className="text-sm text-gray-700 dark:text-gray-200 font-semibold">{`Time: ${new Date(label).toLocaleTimeString()}`}</p>
                <p className="text-sm text-blue-500">{`Temp: ${payload[0].value.toFixed(1)}°C`}</p>
                <p className="text-sm text-purple-500">{`Pressure: ${payload[1].value.toFixed(0)} PSI`}</p>
                 <p className="text-sm text-teal-500">{`Vibration: ${payload[2].value.toFixed(2)} G`}</p>
            </div>
        );
    }
    return null;
};


export const DeviceCard: React.FC<DeviceCardProps> = ({ device, onAnalyze, isAnalyzing, mode }) => {
  const { id, name, protocol, status, currentData, history, connectionParams, connectionStatus } = device;
  const { temperature, pressure, vibration } = currentData;

  const chartData = history.map(h => ({
      time: h.time,
      temperature: h.temperature,
      pressure: h.pressure,
      vibration: h.vibration
  }));

  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-white/20 rounded-xl p-4 flex flex-col justify-between shadow-xl hover:shadow-blue-500/20 hover:border-blue-500/50 transition-all duration-300">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2">
                {mode === 'live' && (
                    <span className="flex h-3 w-3 relative" title={`${connectionStatus}`}>
                        <span className={`absolute inline-flex h-full w-full rounded-full ${connectionStatusStyles[connectionStatus]} opacity-75 ${connectionStatus === ConnectionStatus.Connecting ? 'animate-ping' : ''}`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${connectionStatusStyles[connectionStatus]}`}></span>
                    </span>
                )}
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{name}</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 pl-5">{protocol}</p>
          </div>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusStyles[status]}`}>
            {status}
          </span>
        </div>
        
         <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-x-2 flex flex-wrap gap-1">
            {Object.entries(connectionParams).map(([key, value]) => (
                <span key={key} className="inline-block bg-gray-200/70 dark:bg-gray-900/50 px-2 py-0.5 rounded-full">{`${key}: ${value}`}</span>
            ))}
        </div>
        
        <div className="grid grid-cols-3 gap-4 my-4 text-center">
            <div className="flex flex-col items-center">
                <Icon name="temperature" className="text-2xl text-blue-500 dark:text-blue-400 mb-1"/>
                <span className="text-xl font-semibold text-gray-900 dark:text-white">{temperature.toFixed(1)}°C</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Temp</span>
            </div>
            <div className="flex flex-col items-center">
                <Icon name="pressure" className="text-2xl text-purple-500 dark:text-purple-400 mb-1"/>
                <span className="text-xl font-semibold text-gray-900 dark:text-white">{pressure.toFixed(0)}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">PSI</span>
            </div>
            <div className="flex flex-col items-center">
                <Icon name="vibration" className="text-2xl text-teal-500 dark:text-teal-400 mb-1"/>
                <span className="text-xl font-semibold text-gray-900 dark:text-white">{vibration.toFixed(2)} G</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Vibration</span>
            </div>
        </div>

        <div className="h-40 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300/50 dark:stroke-gray-700/50" />
                    <XAxis 
                        dataKey="time" 
                        tickFormatter={(time) => new Date(time).toLocaleTimeString()} 
                        className="stroke-gray-600 dark:stroke-gray-400"
                        fontSize={10}
                        tick={{ fill: 'currentColor' }}
                    />
                    <YAxis yAxisId="left" hide={true} domain={['dataMin - 10', 'dataMax + 10']} />
                     <YAxis yAxisId="right" hide={true} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#3B82F6" strokeWidth={2} dot={false} name="Temp" />
                    <Line yAxisId="left" type="monotone" dataKey="pressure" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Pressure" />
                    <Line yAxisId="right" type="monotone" dataKey="vibration" stroke="#14B8A6" strokeWidth={2} dot={false} name="Vibration"/>
                </LineChart>
            </ResponsiveContainer>
        </div>
      </div>

      <button
        onClick={() => onAnalyze(id)}
        disabled={isAnalyzing}
        className="w-full mt-4 bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
      >
        {isAnalyzing ? 'Analyzing...' : 'Run Predictive Analysis'}
      </button>
    </div>
  );
};