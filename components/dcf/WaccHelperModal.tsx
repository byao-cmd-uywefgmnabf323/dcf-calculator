'use client';

import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { Input, Button } from '../ui';
import { formatPercent } from '@/lib/utils';

interface WaccHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (wacc: number) => void;
  initialTaxRate: number;
}

export const WaccHelperModal: React.FC<WaccHelperModalProps> = ({ isOpen, onClose, onApply, initialTaxRate }) => {
  const [rf, setRf] = useState(4.5);
  const [beta, setBeta] = useState(1.1);
  const [mrp, setMrp] = useState(5.5);
  const [costOfDebt, setCostOfDebt] = useState(6.0);
  const [taxRate, setTaxRate] = useState(initialTaxRate);
  const [equityWeight, setEquityWeight] = useState(80);
  const [debtWeight, setDebtWeight] = useState(20);

  const wacc = useMemo(() => {
    const costOfEquity = rf + beta * mrp;
    const afterTaxCostOfDebt = costOfDebt * (1 - taxRate / 100);
    return (equityWeight / 100) * costOfEquity + (debtWeight / 100) * afterTaxCostOfDebt;
  }, [rf, beta, mrp, costOfDebt, taxRate, equityWeight, debtWeight]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md relative">
        <Button variant="ghost" onClick={onClose} className="absolute top-2 right-2 p-2 rounded-full"><X size={20} /></Button>
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">WACC Helper</h3>
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-indigo-400 border-b border-gray-600 pb-2">Cost of Equity (CAPM)</h4>
            <Input label="Risk-Free Rate" type="number" value={rf} onChange={e => setRf(parseFloat(e.target.value))} unit="%" />
            <Input label="Beta" type="number" value={beta} onChange={e => setBeta(parseFloat(e.target.value))} />
            <Input label="Market Risk Premium (MRP)" type="number" value={mrp} onChange={e => setMrp(parseFloat(e.target.value))} unit="%" />

            <h4 className="text-md font-semibold text-indigo-400 border-b border-gray-600 pb-2">Cost of Debt</h4>
            <Input label="Pre-Tax Cost of Debt" type="number" value={costOfDebt} onChange={e => setCostOfDebt(parseFloat(e.target.value))} unit="%" />
            <Input label="Tax Rate" type="number" value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value))} unit="%" />

            <h4 className="text-md font-semibold text-indigo-400 border-b border-gray-600 pb-2">Capital Structure</h4>
            <Input label="Weight of Equity" type="number" value={equityWeight} onChange={e => setEquityWeight(parseFloat(e.target.value))} unit="%" />
            <Input label="Weight of Debt" type="number" value={debtWeight} onChange={e => setDebtWeight(parseFloat(e.target.value))} unit="%" />
          </div>
          <div className="mt-6 bg-gray-900 p-4 rounded-lg text-center">
            <p className="text-gray-400">Calculated WACC</p>
            <p className="text-2xl font-bold text-indigo-400">{formatPercent(wacc)}</p>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button variant="primary" onClick={() => { onApply(wacc); onClose(); }}>Apply WACC</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
