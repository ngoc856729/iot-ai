import { Device, DeviceStatus, DeviceDataPoint, ConnectionStatus } from '../types';
import { LiveConnection } from './connectionService';

/**
 * Creates a new device object with default initial data.
 * @param id - The unique ID for the new device.
 * @param name - The display name of the new device.
 * @param protocol - The communication protocol for the new device.
 * @param connectionParams - The protocol-specific connection parameters.
 * @returns A new Device object.
 */
export const createNewDevice = (id: string, name: string, protocol: string, connectionParams: Record<string, any>): Device => {
    const now = Date.now();
    const initialDataPoint = {
        time: now,
        temperature: 50 + (Math.random() - 0.5) * 10, // Some randomness
        pressure: 120 + (Math.random() - 0.5) * 20,
        vibration: 1.5 + (Math.random() - 0.5) * 0.5,
    };
    return {
        id,
        name,
        protocol,
        connectionParams,
        status: DeviceStatus.Normal,
        connectionStatus: ConnectionStatus.Disconnected,
        currentData: initialDataPoint,
        history: [initialDataPoint],
    };
};

/**
 * Simulates one tick of data updates for a list of devices.
 * @param currentDevices - The array of devices to update.
 * @returns A new array with updated device data.
 */
export const simulateDeviceUpdates = (currentDevices: Device[]): Device[] => {
  if (!currentDevices) return [];

  return currentDevices.map(device => {
    const { currentData } = device;

    // More realistic simulation: tend to drift back to a baseline unless already in a warning/critical state
    const tempDrift = (currentData.temperature > 70) ? 0.5 : -0.2;
    const pressureDrift = (currentData.pressure > 160) ? 1 : -0.5;
    const vibrationDrift = (currentData.vibration > 3) ? 0.1 : -0.05;

    const newTemp = currentData.temperature + tempDrift + (Math.random() - 0.45) * 1.5;
    const newPressure = currentData.pressure + pressureDrift + (Math.random() - 0.5) * 4;
    const newVibration = currentData.vibration + vibrationDrift + (Math.random() - 0.48) * 0.15;

    const newDataPoint: DeviceDataPoint = {
        time: Date.now(),
        temperature: Math.max(20, Math.min(100, newTemp)),
        pressure: Math.max(50, Math.min(250, newPressure)),
        vibration: Math.max(0, Math.min(10, newVibration)),
    };

    const newHistory = [...device.history, newDataPoint].slice(-50);

    let newStatus = DeviceStatus.Normal;
    if (newDataPoint.temperature > 85 || newDataPoint.pressure > 200 || newDataPoint.vibration > 5) {
        newStatus = DeviceStatus.Critical;
    } else if (newDataPoint.temperature > 75 || newDataPoint.pressure > 180 || newDataPoint.vibration > 3.5) {
        newStatus = DeviceStatus.Warning;
    }

    return { ...device, currentData: newDataPoint, history: newHistory, status: newStatus };
  });
};

/**
 * Fetches the latest data point from a live connection and updates the device state.
 * @param device The device to update.
 * @param connection The live connection object for the device.
 * @returns A new, updated device object.
 */
export const pollLiveDeviceData = async (device: Device, connection: LiveConnection): Promise<Device> => {
    const newDataPoint = await connection.fetchData();
    const newHistory = [...device.history, newDataPoint].slice(-50);

    let newStatus = DeviceStatus.Normal;
    if (newDataPoint.temperature > 85 || newDataPoint.pressure > 200 || newDataPoint.vibration > 5) {
        newStatus = DeviceStatus.Critical;
    } else if (newDataPoint.temperature > 75 || newDataPoint.pressure > 180 || newDataPoint.vibration > 3.5) {
        newStatus = DeviceStatus.Warning;
    }

    return {
        ...device,
        currentData: newDataPoint,
        history: newHistory,
        status: newStatus,
        connectionStatus: ConnectionStatus.Connected,
    };
};
