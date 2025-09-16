import { DeviceStatus, Device, ConnectionStatus, AISettings } from './types';

const now = Date.now();
const initialDataPoint = { time: now, temperature: 55, pressure: 105, vibration: 1.2 };

export interface ProtocolField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select';
  placeholder?: string;
  options?: readonly string[];
}


export const INITIAL_DEVICES: Device[] = [
  {
    id: 'cnc-001',
    name: 'CNC Machine Alpha',
    protocol: 'Ethernet/IP',
    connectionParams: { ipAddress: '192.168.1.10', subnetMask: '255.255.255.0', defaultGateway: '192.168.1.1' },
    status: DeviceStatus.Normal,
    connectionStatus: ConnectionStatus.Disconnected,
    currentData: initialDataPoint,
    history: [initialDataPoint],
  },
  {
    id: 'rbt-002',
    name: 'Welding Robot Beta',
    protocol: 'Profibus',
    connectionParams: { stationAddress: 3, baudRate: 19200 },
    status: DeviceStatus.Normal,
    connectionStatus: ConnectionStatus.Disconnected,
    currentData: { time: now, temperature: 65, pressure: 150, vibration: 2.1 },
    history: [{ time: now, temperature: 65, pressure: 150, vibration: 2.1 }],
  },
  {
    id: 'pmp-003',
    name: 'Coolant Pump Gamma',
    protocol: 'Modbus RTU',
    connectionParams: { slaveAddress: 5, baudRate: 9600, parity: 'None', dataBits: 8, stopBits: 1 },
    status: DeviceStatus.Warning,
    connectionStatus: ConnectionStatus.Disconnected,
    currentData: { time: now, temperature: 78, pressure: 180, vibration: 3.5 },
    history: [{ time: now, temperature: 78, pressure: 180, vibration: 3.5 }],
  },
  {
    id: 'asm-004',
    name: 'Assembly Line Delta',
    protocol: 'EtherCAT',
    connectionParams: { ipAddress: '192.168.1.12', subnetMask: '255.255.255.0', defaultGateway: '192.168.1.1' },
    status: DeviceStatus.Normal,
    connectionStatus: ConnectionStatus.Disconnected,
    currentData: { time: now, temperature: 45, pressure: 90, vibration: 0.8 },
    history: [{ time: now, temperature: 45, pressure: 90, vibration: 0.8 }],
  },
    {
    id: 'vlv-005',
    name: 'Flow Control Valve',
    protocol: 'HART',
    connectionParams: { deviceTag: 'FT-101' },
    status: DeviceStatus.Normal,
    connectionStatus: ConnectionStatus.Disconnected,
    currentData: { time: now, temperature: 50, pressure: 115, vibration: 1.0 },
    history: [{ time: now, temperature: 50, pressure: 115, vibration: 1.0 }],
  },
];

export const PROTOCOL_INFO: Record<string, string> = {
  'Modbus RTU': "A serial communication protocol (RS-485, RS-22) for connecting industrial electronic devices. It's known for its simplicity and reliability.",
  'Modbus TCP/IP': "An adaptation of Modbus for Ethernet networks. It encapsulates Modbus RTU request/response data packets in a TCP/IP wrapper.",
  'Profibus': "A standard for fieldbus communication in automation technology. It's suited for complex communication tasks and time-critical applications.",
  'Ethernet/IP': "An industrial network protocol that adapts the Common Industrial Protocol (CIP) to standard Ethernet. It offers a wide range of network services.",
  'EtherCAT': "Ethernet for Control Automation Technology is an Ethernet-based fieldbus system. It's known for high performance and flexible topology.",
  'HART': "Highway Addressable Remote Transducer Protocol is a hybrid analog+digital protocol widely used in process and instrumentation systems.",
};

export const PROTOCOL_FIELDS: Record<string, ProtocolField[]> = {
  'Modbus RTU': [
    { name: 'slaveAddress', label: 'Slave Address', type: 'number', placeholder: '1-247' },
    { name: 'baudRate', label: 'Baud Rate', type: 'number', placeholder: 'e.g., 9600' },
    { name: 'parity', label: 'Parity', type: 'select', options: ['None', 'Even', 'Odd'] },
    { name: 'dataBits', label: 'Data Bits', type: 'number', placeholder: 'e.g., 8' },
    { name: 'stopBits', label: 'Stop Bits', type: 'number', placeholder: 'e.g., 1' },
  ],
  'Modbus TCP/IP': [
    { name: 'ipAddress', label: 'IP Address', type: 'text', placeholder: 'e.g., 192.168.1.10' },
    { name: 'subnetMask', label: 'Subnet Mask', type: 'text', placeholder: 'e.g., 255.255.255.0' },
    { name: 'defaultGateway', label: 'Default Gateway', type: 'text', placeholder: 'e.g., 192.168.1.1' },
  ],
  'Profibus': [
    { name: 'stationAddress', label: 'Station Address', type: 'number', placeholder: '1-126' },
    { name: 'baudRate', label: 'Baud Rate', type: 'number', placeholder: 'e.g., 19200' },
  ],
  'Ethernet/IP': [
    { name: 'ipAddress', label: 'IP Address', type: 'text', placeholder: 'e.g., 192.168.1.11' },
    { name: 'subnetMask', label: 'Subnet Mask', type: 'text', placeholder: 'e.g., 255.255.255.0' },
    { name: 'defaultGateway', label: 'Default Gateway', type: 'text', placeholder: 'e.g., 192.168.1.1' },
  ],
  'EtherCAT': [
    { name: 'ipAddress', label: 'IP Address', type: 'text', placeholder: 'e.g., 192.168.1.12' },
    { name: 'subnetMask', label: 'Subnet Mask', type: 'text', placeholder: 'e.g., 255.255.255.0' },
    { name: 'defaultGateway', label: 'Default Gateway', type: 'text', placeholder: 'e.g., 192.168.1.1' },
  ],
  'HART': [
    { name: 'deviceTag', label: 'Device Tag', type: 'text', placeholder: 'e.g., FT-101' }
  ]
};

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'gemini',
  gemini: {
    apiKey: process.env.API_KEY || '',
    model: 'gemini-2.5-flash',
  },
  openai: {
    apiKey: '',
    model: 'gpt-4o',
    baseURL: 'https://api.openai.com/v1',
  },
  anthropic: {
    apiKey: '',
    model: 'claude-3-5-sonnet-20240620',
  },
  iotteam: {
    apiKey: '',
    model: 'iot-model-v1',
    baseURL: 'https://api.iotteam.com/v1',
  },
};