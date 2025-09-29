'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { DcfResult } from '@/lib/types';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';

interface ResultsDisplayProps {
  result: DcfResult | null;
  intrinsicValuePerShare: number;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, intrinsicValuePerShare }) => {
  if (!result) return null;

  const { enterpriseValue, equityValue, projectedFcf, sensitivityGrid, warnings } = result;

  return (
    <div className="mt-8 space-y-8">
      {warnings.length > 0 && (
        <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 p-4 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 mr-3 mt-0.5" />
            <div>
              <h4 className="font-bold">Input Warning</h4>
              <ul className="list-disc list-inside mt-1 text-sm">
                {warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-gray-800 p-4 rounded-lg"><p className="text-sm text-gray-400">Enterprise Value</p><p className="text-2xl font-bold text-white">{formatCurrency(enterpriseValue * 1_000_000)}</p></div>
        <div className="bg-gray-800 p-4 rounded-lg"><p className="text-sm text-gray-400">Equity Value</p><p className="text-2xl font-bold text-white">{formatCurrency(equityValue * 1_000_000)}</p></div>
        <div className="bg-indigo-800/80 p-4 rounded-lg border border-indigo-600"><p className="text-sm text-indigo-200">Intrinsic Value / Share</p><p className="text-3xl font-extrabold text-white">{formatCurrency(intrinsicValuePerShare)}</p></div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Projected Free Cash Flows ($M)</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {projectedFcf.map((fcf, i) => (
            <div key={i} className="bg-gray-800 p-3 rounded-md text-center flex-shrink-0 w-32">
              <p className="text-xs text-gray-400">Year {i + 1}</p>
              <p className="font-mono font-semibold text-white">{formatNumber(Math.round(fcf))}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Sensitivity Analysis: Intrinsic Value per Share</h3>
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="w-full text-sm text-center bg-gray-800">
            <thead className="bg-gray-900 sticky top-0">
              <tr>
                <th className="p-2 font-medium text-gray-300">WACC \\ g</th>
                {sensitivityGrid.slice(0, 5).map(s => <th key={s.g} className="p-2 font-medium text-gray-300">{formatPercent(s.g)}</th>)}
              </tr>
            </thead>
            <tbody>
              {Array.from(new Set(sensitivityGrid.map(s => s.wacc))).map(wacc => (
                <tr key={wacc} className="border-t border-gray-700">
                  <td className="p-2 font-medium text-gray-300 bg-gray-900">{formatPercent(wacc)}</td>
                  {sensitivityGrid.filter(s => s.wacc === wacc).map((s, i) => (
                    <td key={i} className={`p-2 font-mono ${s.value > intrinsicValuePerShare ? 'text-green-400' : 'text-red-400'}`}>
                      {s.value > 0 ? formatCurrency(s.value) : 'N/A'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
