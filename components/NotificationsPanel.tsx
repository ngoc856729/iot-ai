import React from 'react';
import type { Notification } from '../types';
import { Icon } from './icons';

interface NotificationsPanelProps {
    isOpen: boolean;
    notifications: Notification[];
    onClose: () => void;
}

const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    if (seconds < 10) return "just now";
    return Math.floor(seconds) + "s ago";
};

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, notifications, onClose }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Click-outside-to-close overlay */}
            <div className="fixed inset-0 z-40" onClick={onClose}></div>
            <div
                className="absolute top-16 right-4 w-full max-w-sm bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden"
                role="dialog"
                aria-modal="true"
                aria-labelledby="notifications-heading"
            >
                <div className="flex justify-between items-center p-4 border-b border-black/10 dark:border-white/10">
                    <h2 id="notifications-heading" className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-full transition-colors">
                        <Icon name="close" className="h-5 w-5" />
                    </button>
                </div>
                {notifications.length > 0 ? (
                    <ul className="max-h-96 overflow-y-auto divide-y divide-black/10 dark:divide-white/10">
                        {notifications.map(notification => (
                            <li key={notification.id} className="p-4 hover:bg-black/5 dark:hover:bg-white/5 flex items-start space-x-3 transition-colors">
                                <div className={`mt-1 flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-white ${notification.level === 'Critical' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                                    <i className="fa-solid fa-triangle-exclamation text-xs"></i>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        {notification.deviceName}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                        {timeAgo(notification.timestamp)}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400">No new notifications.</p>
                    </div>
                )}
            </div>
        </>
    );
};