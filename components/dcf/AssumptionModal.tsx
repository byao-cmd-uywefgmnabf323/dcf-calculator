'use client';

import React from 'react';
import { X, Zap } from 'lucide-react';
import { Button } from '../ui';

interface AssumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (rate: number) => void;
  assumptions: {
    base: { rate: number; justification: string };
    bull: { rate: number; justification: string };
    bear: { rate: number; justification: string };
  } | null;
  isLoading: boolean;
}

export const AssumptionModal: React.FC<AssumptionModalProps> = ({ isOpen, onClose, onApply, assumptions, isLoading }) => {
  if (!isOpen) return null;

  const handleApply = (rate: number) => {
    onApply(rate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg relative">
        <Button variant="ghost" onClick={onClose} className="absolute top-2 right-2 p-2 rounded-full"><X size={20} /></Button>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-indigo-400" />
            <h3 className="text-xl font-bold text-white">AI Assumption Helper</h3>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
            </div>
          )}

          {assumptions && (
            <div className="space-y-4">
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <h4 className="font-semibold text-lg text-green-400">Bull Case</h4>
                <p className="text-gray-300 mt-1"><strong>Rate:</strong> {assumptions.bull.rate.toFixed(2)}%</p>
                <p className="text-gray-400 text-sm mt-1"><em>{assumptions.bull.justification}</em></p>
                <Button size="sm" variant="secondary" className="mt-3" onClick={() => handleApply(assumptions.bull.rate)}>Apply</Button>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <h4 className="font-semibold text-lg text-blue-400">Base Case</h4>
                <p className="text-gray-300 mt-1"><strong>Rate:</strong> {assumptions.base.rate.toFixed(2)}%</p>
                <p className="text-gray-400 text-sm mt-1"><em>{assumptions.base.justification}</em></p>
                <Button size="sm" variant="primary" className="mt-3" onClick={() => handleApply(assumptions.base.rate)}>Apply</Button>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <h4 className="font-semibold text-lg text-red-400">Bear Case</h4>
                <p className="text-gray-300 mt-1"><strong>Rate:</strong> {assumptions.bear.rate.toFixed(2)}%</p>
                <p className="text-gray-400 text-sm mt-1"><em>{assumptions.bear.justification}</em></p>
                <Button size="sm" variant="secondary" className="mt-3" onClick={() => handleApply(assumptions.bear.rate)}>Apply</Button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
