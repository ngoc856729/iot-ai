import { Device, DeviceDataPoint } from '../types';

// In a real application, this would be a class instance from a library like 'modbus-serial'
// For this simulation, it's an object with a disconnect method.
type PhysicalConnection = any; 

export interface LiveConnection {
    deviceId: string;
    protocol: string;
    connection: PhysicalConnection;
    fetchData: () => Promise<DeviceDataPoint>;
    disconnect: () => void;
}

// --- Mock Connection Implementations ---

// This function simulates fetching data from a live source
const mockDataFetcher = (base: DeviceDataPoint): () => Promise<DeviceDataPoint> => {
    let lastData = base;
    return async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

        // Slightly change data from the last reading to simulate a live feed
        const newTemp = lastData.temperature + (Math.random() - 0.5) * 0.5;
        const newPressure = lastData.pressure + (Math.random() - 0.5) * 2;
        const newVibration = lastData.vibration + (Math.random() - 0.5) * 0.1;
        
        lastData = {
            time: Date.now(),
            temperature: Math.max(20, Math.min(100, newTemp)),
            pressure: Math.max(50, Math.min(250, newPressure)),
            vibration: Math.max(0, Math.min(10, newVibration)),
        };
        return lastData;
    };
};

const connectEthernetIP = async (device: Device): Promise<LiveConnection> => {
    console.log(`Attempting to establish Ethernet/IP connection to ${device.name} at ${device.connectionParams.ipAddress}...`);
    // Simulate network latency for connection
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Simulate connection failure (e.g., 10% chance)
    if (Math.random() < 0.1) {
        throw new Error(`Connection timed out for ${device.name}`);
    }

    const physicalConnection = { port: 44818, ip: device.connectionParams.ipAddress };
    console.log(`Ethernet/IP connection successful for ${device.name}.`);

    return {
        deviceId: device.id,
        protocol: 'Ethernet/IP',
        connection: physicalConnection,
        fetchData: mockDataFetcher(device.currentData),
        disconnect: () => { console.log(`Disconnected Ethernet/IP from ${device.name}`); }
    };
}

const connectModbusRTU = async (device: Device): Promise<LiveConnection> => {
    console.log(`Opening serial port for Modbus RTU device ${device.name} (Slave ID: ${device.connectionParams.slaveAddress})...`);
    // Simulate serial port opening delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

    // Simulate connection failure (e.g., 15% chance for serial)
    if (Math.random() < 0.15) {
        throw new Error(`Serial port could not be opened for ${device.name}`);
    }
    
    const physicalConnection = { slaveId: device.connectionParams.slaveAddress };
    console.log(`Modbus RTU connection successful for ${device.name}.`);

    return {
        deviceId: device.id,
        protocol: 'Modbus RTU',
        connection: physicalConnection,
        fetchData: mockDataFetcher(device.currentData),
        disconnect: () => { console.log(`Disconnected Modbus RTU from ${device.name}`); }
    };
}

// Add other protocol connection functions here...
const connectGeneric = async (device: Device): Promise<LiveConnection> => {
    console.log(`Attempting generic connection for ${device.name} via ${device.protocol}...`);
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 800));
    if (Math.random() < 0.1) {
        throw new Error(`Generic connection failed for ${device.name}`);
    }
    const physicalConnection = { ...device.connectionParams };
    console.log(`Generic connection successful for ${device.name}.`);

     return {
        deviceId: device.id,
        protocol: device.protocol,
        connection: physicalConnection,
        fetchData: mockDataFetcher(device.currentData),
        disconnect: () => { console.log(`Disconnected ${device.protocol} from ${device.name}`); }
    };
}


/**
 * Establishes a connection to a device based on its protocol.
 * @param device The device to connect to.
 * @returns A promise that resolves with a LiveConnection object.
 */
export const connectToDevice = (device: Device): Promise<LiveConnection> => {
    switch(device.protocol) {
        case 'Ethernet/IP':
        case 'EtherCAT':
        case 'Modbus TCP/IP':
            return connectEthernetIP(device); // Simulate with the same logic for now
        case 'Modbus RTU':
        case 'Profibus': // Simulate with same logic
            return connectModbusRTU(device);
        case 'HART':
        default:
            return connectGeneric(device);
    }
};

/**
 * Disconnects from a device.
 * @param connection The LiveConnection object to terminate.
 */
export const disconnectFromDevice = (connection: LiveConnection): void => {
    try {
        connection.disconnect();
    } catch (e) {
        console.error("Error during disconnection:", e);
    }
};
