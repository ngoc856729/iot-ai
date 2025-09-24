import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Device } from '../types';
import { Icon } from './icons';

interface HistoryViewProps {
    devices: Device[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const time = new Date(label).toLocaleString();
        return (
            <div className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl">
                <p className="text-sm text-gray-700 dark:text-gray-200 font-semibold">{time}</p>
                {payload.map((p: any) => (
                    <p key={p.name} style={{ color: p.color }} className="text-sm">
                        {`${p.name}: ${p.value.toFixed(2)}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

const formatDateForDisplay = (dateString: string): string => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
};

// --- Modern Date Range Picker Component ---
interface DateRangePickerProps {
    startDate: string;
    endDate: string;
    onDatesChange: (start: string, end: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onDatesChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date(endDate + 'T00:00:00'));
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const [selectingStart, setSelectingStart] = useState(true);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleDateClick = (day: Date) => {
        const dayStr = formatDateForInput(day);
        if (selectingStart || day < new Date(startDate)) {
            onDatesChange(dayStr, dayStr);
            setSelectingStart(false);
        } else {
            onDatesChange(startDate, dayStr);
            setSelectingStart(true);
            setIsOpen(false);
        }
    };

    const handlePresetClick = (start: Date, end: Date) => {
        onDatesChange(formatDateForInput(start), formatDateForInput(end));
        setIsOpen(false);
    };

    const generateCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        const days = [];
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const dateStr = formatDateForInput(date);
            const isStartDate = dateStr === startDate;
            const isEndDate = dateStr === endDate;
            const isInRange = date > new Date(startDate) && date < new Date(endDate);
            const isHoveringInRange = hoverDate && !selectingStart && date > new Date(startDate) && date <= hoverDate;
            const isToday = formatDateForInput(new Date()) === dateStr;

            days.push(
                <button
                    key={i}
                    onClick={() => handleDateClick(date)}
                    onMouseEnter={() => !selectingStart && setHoverDate(date)}
                    onMouseLeave={() => setHoverDate(null)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors text-sm font-medium
                        ${isStartDate || isEndDate ? 'bg-blue-600 text-white' : ''}
                        ${isInRange || isHoveringInRange ? 'bg-blue-500/20 dark:bg-blue-400/20' : ''}
                        ${!isStartDate && !isEndDate ? 'hover:bg-gray-200/70 dark:hover:bg-gray-700/70' : ''}
                        ${isToday ? 'border border-blue-500' : ''}
                        ${isStartDate && !isEndDate ? 'rounded-r-none' : ''}
                        ${!isStartDate && isEndDate ? 'rounded-l-none' : ''}
                        ${isInRange ? 'rounded-none' : ''}
                    `}
                >
                    {i}
                </button>
            );
        }
        return days;
    };
    
     const presets = [
        { label: 'Last 7 Days', days: 7 },
        { label: 'Last 30 Days', days: 30 },
    ];


    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="min-w-[280px] w-full bg-gray-100/70 dark:bg-gray-900/70 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
            >
                <div className="flex items-center space-x-2">
                    <i className="fa-solid fa-calendar-days text-gray-500"></i>
                    <span>{`${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)}`}</span>
                </div>
                <i className={`fa-solid fa-chevron-down text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 right-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-10 p-4 flex space-x-4">
                   {/* Presets Column */}
                    <div className="flex flex-col space-y-2 border-r border-black/10 dark:border-white/10 pr-4">
                        <button onClick={() => { const end = new Date(); const start = new Date(); start.setDate(end.getDate() - 6); handlePresetClick(start, end); }} className="text-left text-sm py-1 px-2 rounded hover:bg-black/5 dark:hover:bg-white/5">Last 7 Days</button>
                        <button onClick={() => { const end = new Date(); const start = new Date(); start.setDate(end.getDate() - 29); handlePresetClick(start, end); }} className="text-left text-sm py-1 px-2 rounded hover:bg-black/5 dark:hover:bg-white/5">Last 30 Days</button>
                         <button onClick={() => { const now = new Date(); const start = new Date(now.getFullYear(), now.getMonth(), 1); handlePresetClick(start, now); }} className="text-left text-sm py-1 px-2 rounded hover:bg-black/5 dark:hover:bg-white/5">This Month</button>
                          <button onClick={() => { const now = new Date(); const start = new Date(now.getFullYear(), now.getMonth() - 1, 1); const end = new Date(now.getFullYear(), now.getMonth(), 0); handlePresetClick(start, end); }} className="text-left text-sm py-1 px-2 rounded hover:bg-black/5 dark:hover:bg-white/5">Last Month</button>
                    </div>

                    {/* Calendar */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 rounded-full hover:bg-gray-200/70 dark:hover:bg-gray-700/70">
                                <i className="fa-solid fa-chevron-left h-4 w-4"></i>
                            </button>
                            <span className="font-semibold">{currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 rounded-full hover:bg-gray-200/70 dark:hover:bg-gray-700/70">
                                <i className="fa-solid fa-chevron-right h-4 w-4"></i>
                            </button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-400">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="w-10 h-10 flex items-center justify-center">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {generateCalendarDays()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export const HistoryView: React.FC<HistoryViewProps> = ({ devices }) => {
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0]?.id || '');

    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 6); // inclusive of today, so 6 days back

    const [startDate, setStartDate] = useState<string>(formatDateForInput(oneWeekAgo));
    const [endDate, setEndDate] = useState<string>(formatDateForInput(today));
    
    const handleDatesChange = (start: string, end: string) => {
        setStartDate(start);
        setEndDate(end);
    };

    const selectedDevice = useMemo(() => {
        return devices.find(d => d.id === selectedDeviceId);
    }, [devices, selectedDeviceId]);

    const filteredHistory = useMemo(() => {
        if (!selectedDevice) return [];

        const startTimestamp = new Date(startDate + 'T00:00:00').getTime();
        const endOfDay = new Date(endDate + 'T00:00:00');
        endOfDay.setDate(endOfDay.getDate() + 1);
        const endTimestamp = endOfDay.getTime() - 1;

        return selectedDevice.history.filter(
            (h) => h.time >= startTimestamp && h.time <= endTimestamp
        );
    }, [selectedDevice, startDate, endDate]);

    const reversedHistory = useMemo(() => {
        return [...filteredHistory].reverse();
    }, [filteredHistory]);

    const stats = useMemo(() => {
        if (!filteredHistory.length) return null;

        const temps = filteredHistory.map(h => h.temperature);
        const pressures = filteredHistory.map(h => h.pressure);
        const vibrations = filteredHistory.map(h => h.vibration);

        return {
            avgTemp: temps.reduce((a, b) => a + b, 0) / temps.length,
            maxTemp: Math.max(...temps),
            minTemp: Math.min(...temps),
            avgPressure: pressures.reduce((a, b) => a + b, 0) / pressures.length,
            maxPressure: Math.max(...pressures),
            minPressure: Math.min(...pressures),
            avgVibration: vibrations.reduce((a, b) => a + b, 0) / vibrations.length,
            maxVibration: Math.max(...vibrations),
            minVibration: Math.min(...vibrations),
        };
    }, [filteredHistory]);

    return (
        <div className="p-6 text-gray-800 dark:text-gray-300 h-full flex flex-col">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">History Explorer</h2>

            <div className="relative z-10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg p-4 rounded-xl border border-white/20 mb-6 shadow-lg flex flex-wrap items-center gap-4">
                <div className="flex-grow min-w-[200px]">
                    <label htmlFor="device-select" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Select a Device
                    </label>
                    <select
                        id="device-select"
                        value={selectedDeviceId}
                        onChange={(e) => setSelectedDeviceId(e.target.value)}
                        className="w-full bg-gray-100/70 dark:bg-gray-900/70 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {devices.map(device => (
                            <option key={device.id} value={device.id}>
                                {device.name}
                            </option>
                        ))}
                    </select>
                </div>
                 <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Select Date Range
                    </label>
                    <DateRangePicker startDate={startDate} endDate={endDate} onDatesChange={handleDatesChange} />
                </div>
            </div>

            {selectedDevice ? (
                <div className="flex-grow flex flex-col space-y-6 overflow-y-auto">
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg p-6 rounded-xl border border-white/20 shadow-lg h-[400px] flex flex-col">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Data Trend for {selectedDevice.name}
                        </h3>
                        {filteredHistory.length > 0 ? (
                            <ResponsiveContainer width="100%" height="90%">
                                <LineChart data={filteredHistory} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300/50 dark:stroke-gray-700/50" />
                                    <XAxis
                                        dataKey="time"
                                        tickFormatter={(time) => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        className="stroke-gray-600 dark:stroke-gray-400"
                                        fontSize={12}
                                        tick={{ fill: 'currentColor' }}
                                    />
                                    <YAxis yAxisId="left" stroke="#3B82F6" tick={{ fill: 'currentColor' }} fontSize={12} domain={['auto', 'auto']} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#14B8A6" tick={{ fill: 'currentColor' }} fontSize={12} domain={['auto', 'auto']} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="#3B82F6" strokeWidth={2} dot={false} />
                                    <Line yAxisId="left" type="monotone" dataKey="pressure" name="Pressure (PSI)" stroke="#8B5CF6" strokeWidth={2} dot={false} />
                                    <Line yAxisId="right" type="monotone" dataKey="vibration" name="Vibration (G)" stroke="#14B8A6" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                             <div className="flex-grow flex items-center justify-center text-gray-500 dark:text-gray-400">
                                No data available for the selected date range.
                            </div>
                        )}
                    </div>
                     {stats && (
                        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg p-6 rounded-xl border border-white/20 shadow-lg">
                             <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Historical Statistics
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-blue-500">Temperature</h4>
                                    <p>Avg: <span className="font-mono">{stats.avgTemp.toFixed(2)}°C</span></p>
                                    <p>Min/Max: <span className="font-mono">{stats.minTemp.toFixed(2)}°C / {stats.maxTemp.toFixed(2)}°C</span></p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-semibold text-purple-500">Pressure</h4>
                                    <p>Avg: <span className="font-mono">{stats.avgPressure.toFixed(2)} PSI</span></p>
                                    <p>Min/Max: <span className="font-mono">{stats.minPressure.toFixed(2)} / {stats.maxPressure.toFixed(2)} PSI</span></p>
                                </div>
                                <div className="space-y-1">
                                     <h4 className="font-semibold text-teal-500">Vibration</h4>
                                     <p>Avg: <span className="font-mono">{stats.avgVibration.toFixed(2)} G</span></p>
                                     <p>Min/Max: <span className="font-mono">{stats.minVibration.toFixed(2)} / {stats.maxVibration.toFixed(2)} G</span></p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg overflow-hidden flex-shrink-0">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white p-6 pb-4">
                            Raw Data Log
                        </h3>
                        <div className="max-h-96 overflow-y-auto">
                             <table className="min-w-full divide-y divide-black/10 dark:divide-white/10">
                                <thead className="bg-black/5 dark:bg-white/5 sticky top-0 backdrop-blur-sm">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Temperature (°C)</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pressure (PSI)</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vibration (G)</th>
                                    </tr>
                                </thead>
                                {reversedHistory.length > 0 ? (
                                    <tbody className="divide-y divide-black/10 dark:divide-white/10">
                                        {reversedHistory.map((log) => (
                                            <tr key={log.time} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{new Date(log.time).toLocaleString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-blue-600 dark:text-blue-400">{log.temperature.toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-purple-600 dark:text-purple-400">{log.pressure.toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-teal-600 dark:text-teal-400">{log.vibration.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                ) : null}
                            </table>
                            {reversedHistory.length === 0 && (
                                <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No log entries for the selected date range.
                                </p>
                            )}
                        </div>
                    </div>

                </div>
            ) : (
                <div className="flex-grow flex items-center justify-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg p-6 rounded-xl border border-white/20 shadow-lg">
                    <p className="text-lg text-gray-500 dark:text-gray-400">Please add a device to view its history.</p>
                </div>
            )}
        </div>
    );
};