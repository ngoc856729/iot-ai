import React from 'react';

interface IconProps {
  name: string;
  className?: string;
}

const iconMap: Record<string, string> = {
    dashboard: 'fa-solid fa-table-cells-large',
    protocols: 'fa-solid fa-shield-halved',
    devices: 'fa-solid fa-server',
    settings: 'fa-solid fa-gear',
    edit: 'fa-solid fa-pencil',
    delete: 'fa-solid fa-trash',
    add: 'fa-solid fa-plus',
    temperature: 'fa-solid fa-temperature-half',
    pressure: 'fa-solid fa-gauge-high',
    vibration: 'fa-solid fa-water',
    close: 'fa-solid fa-xmark',
    chat: 'fa-solid fa-robot',
    sun: 'fa-solid fa-sun',
    moon: 'fa-solid fa-moon',
    bell: 'fa-solid fa-bell',
};

export const Icon: React.FC<IconProps> = ({ name, className = '' }) => {
  const iconClass = iconMap[name] || 'fa-solid fa-question-circle';
  return <i className={`${iconClass} ${className}`}></i>;
};