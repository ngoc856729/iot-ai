import React, { Fragment } from 'react';
import type { GeminiAnalysis } from '../types';
import { Icon } from './icons';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: GeminiAnalysis | null;
  deviceName: string;
  isLoading: boolean;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, analysis, deviceName, isLoading }) => {
  if (!isOpen) return null;

  const riskColor = analysis?.riskLevel === 'High' ? 'text-red-400' :
                    analysis?.riskLevel === 'Medium' ? 'text-yellow-400' :
                    'text-green-400';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity">
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
        <div className="flex justify-between items-center p-4 border-b border-black/10 dark:border-white/10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Predictive Analysis for {deviceName}</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-full">
            <Icon name="close" className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Analyzing data with Gemini...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-600 dark:text-gray-300">Risk Level</h3>
                <p className={`text-3xl font-bold ${riskColor}`}>{analysis.riskLevel}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-600 dark:text-gray-300">Prediction Summary</h3>
                <p className="text-gray-800 dark:text-gray-200 bg-black/5 dark:bg-white/5 p-4 rounded-lg">{analysis.prediction}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-600 dark:text-gray-300">Recommended Actions</h3>
                <ul className="space-y-2 text-gray-800 dark:text-gray-200">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="bg-black/5 dark:bg-white/5 p-3 rounded-lg flex items-start">
                      <i className="fa-solid fa-wrench text-blue-500 mr-3 mt-1"></i>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center h-64 flex flex-col justify-center items-center">
                <i className="fa-solid fa-triangle-exclamation text-red-500 text-4xl mb-4"></i>
                <p className="text-red-500 dark:text-red-400 text-lg font-semibold">Analysis Failed</p>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Could not retrieve predictive analysis. Please check the console for errors and ensure your API key is configured correctly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};