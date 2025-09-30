'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Share2, Save, Upload, X, BookOpen } from 'lucide-react';
import { DcfInputs, SavedScenario } from '@/lib/types';
import { initialInputs, STORAGE_KEY } from '@/lib/constants';
import { useDebounce } from '@/lib/utils';
import { calculateDcf } from '@/lib/dcf-engine';
import { Input, Select, Button, Card } from '@/components/ui';
import { WaccHelperModal } from '@/components/dcf/WaccHelperModal';
import { ResultsDisplay } from '@/components/dcf/ResultsDisplay';

export default function DcfCalculatorPage() {
  const [inputs, setInputs] = useState<DcfInputs>(initialInputs);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [isWaccHelperOpen, setWaccHelperOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSavedScenarios(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to load scenarios from localStorage', e);
    }

    const params = new URLSearchParams(window.location.search);
    const queryInputs = params.get('inputs');
    if (queryInputs) {
      try {
        const parsedInputs = JSON.parse(atob(queryInputs));
        if (typeof parsedInputs === 'object' && parsedInputs !== null && 'ticker' in parsedInputs) {
          setInputs(parsedInputs);
          setNotification('Scenario loaded from URL.');
        }
      } catch (e) {
        console.error('Failed to parse inputs from URL', e);
        setNotification('Error: Could not load scenario from URL.');
      }
    }
  }, []);

  const debouncedInputs = useDebounce(inputs, 300);
  const result = useMemo(() => calculateDcf(debouncedInputs), [debouncedInputs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setInputs(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) || 0 : value }));
  };

  const handleExplicitFcfChange = (index: number, value: string) => {
    const newFcfs = [...inputs.explicitFcfs];
    newFcfs[index] = parseFloat(value) || 0;
    setInputs(prev => ({ ...prev, explicitFcfs: newFcfs }));
  };

  useEffect(() => {
    if (inputs.inputMode === 'explicit' && inputs.explicitFcfs.length !== inputs.forecastYears) {
      const newFcfs = Array(inputs.forecastYears).fill(0);
      for(let i = 0; i < Math.min(inputs.explicitFcfs.length, inputs.forecastYears); i++) {
        newFcfs[i] = inputs.explicitFcfs[i];
      }
      setInputs(p => ({ ...p, explicitFcfs: newFcfs }));
    }
  }, [inputs.forecastYears, inputs.inputMode, inputs.explicitFcfs]);

  const handleSaveScenario = () => {
    const name = prompt('Enter a name for this scenario:', inputs.ticker);
    if (name) {
      const newScenario: SavedScenario = { id: Date.now().toString(), name, inputs };
      const updatedScenarios = [...savedScenarios, newScenario];
      setSavedScenarios(updatedScenarios);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScenarios));
      setNotification(`Scenario "${name}" saved.`);
    }
  };

  const handleLoadScenario = (id: string) => {
    if (id === '') return;
    const scenario = savedScenarios.find(s => s.id === id);
    if (scenario) {
      setInputs(scenario.inputs);
      setNotification(`Scenario "${scenario.name}" loaded.`);
    }
  };

  const handleShare = useCallback(() => {
    const serializedInputs = btoa(JSON.stringify(inputs));
    const url = `${window.location.origin}${window.location.pathname}?inputs=${serializedInputs}`;
    navigator.clipboard.writeText(url);
    setNotification('Shareable link copied to clipboard!');
  }, [inputs]);

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').slice(1);
      const fcfData: number[] = [];
      let parseError = false;

      for (const row of rows) {
        if (row.trim() === '') continue;
        const columns = row.split(',');
        if (columns.length >= 2) {
          const fcf = parseFloat(columns[1]);
          if (!isNaN(fcf)) {
            fcfData.push(fcf);
          } else {
            parseError = true;
            break;
          }
        }
      }

      if (parseError) {
        setNotification('Error: Could not parse FCF values in CSV.');
      } else if (fcfData.length !== inputs.forecastYears) {
        setNotification(`Error: CSV has ${fcfData.length} rows, but forecast requires ${inputs.forecastYears} years.`);
      } else {
        setInputs(prev => ({ ...prev, explicitFcfs: fcfData, inputMode: 'explicit' }));
        setNotification('FCF data loaded from CSV.');
      }
    };
    reader.readAsText(file);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-white">DCF Valuation Calculator</h1>
            <div className="flex items-center gap-2">
              <a href="/learn-dcf">
                <Button variant="ghost" size="sm"><BookOpen className="w-4 h-4 mr-2" />Learn DCF</Button>
              </a>
              <Button variant="ghost" size="sm" onClick={handleShare}><Share2 className="w-4 h-4 mr-2" />Share</Button>
              <Button variant="ghost" size="sm" onClick={handleSaveScenario}><Save className="w-4 h-4 mr-2" />Save</Button>
              <Select
                label=""
                value=""
                onChange={(e) => handleLoadScenario(e.target.value)}
                className="min-w-[150px] !mt-0"
              >
                <option value="" disabled>Load Scenario...</option>
                {savedScenarios.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Company & Forecast" className="lg:col-span-1">
            <Input label="Ticker Symbol" name="ticker" value={inputs.ticker} onChange={handleInputChange} />
            <Input label="Forecast Years" name="forecastYears" type="number" value={inputs.forecastYears} onChange={handleInputChange} />
            <Select label="FCF Input Mode" name="inputMode" value={inputs.inputMode} onChange={handleInputChange}>
              <option value="baseGrowth">Base FCF + Growth Rate</option>
              <option value="explicit">Explicit FCF Values</option>
            </Select>

            {inputs.inputMode === 'baseGrowth' ? (
              <>
                <Input label="Base Free Cash Flow" name="baseFcf" type="number" value={inputs.baseFcf} onChange={handleInputChange} unit="$M" />
                <Input label="FCF Growth Rate" name="fcfGrowthRate" type="number" value={inputs.fcfGrowthRate} onChange={handleInputChange} unit="%" />
              </>
            ) : (
              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <h4 className='text-sm font-medium text-gray-300'>Explicit FCFs ($M)</h4>
                  <Button variant='ghost' size='sm' onClick={() => fileInputRef.current?.click()}><Upload size={14} className='mr-2' /> CSV</Button>
                  <input type='file' ref={fileInputRef} onChange={handleCsvUpload} accept='.csv' className='hidden' />
                </div>
                <div className='space-y-2 max-h-48 overflow-y-auto pr-2'>
                  {inputs.explicitFcfs.map((fcf, i) => (
                    <Input key={i} label={`Year ${i + 1}`} type="number" value={fcf} onChange={e => handleExplicitFcfChange(i, e.target.value)} />
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card title="Discount & Terminal Value" className="lg:col-span-1">
            <div className='flex items-end gap-2'>
              <Input label="Discount Rate (WACC)" name="discountRate" type="number" value={inputs.discountRate} onChange={handleInputChange} unit="%" />
              <Button variant='secondary' onClick={() => setWaccHelperOpen(true)} className='h-10'>Helper</Button>
            </div>
            <Input label="Terminal Growth Rate" name="terminalGrowthRate" type="number" value={inputs.terminalGrowthRate} onChange={handleInputChange} unit="%" />
          </Card>

          <Card title="Capital Structure" className="lg:col-span-1">
            <Input label="Shares Outstanding" name="sharesOutstanding" type="number" value={inputs.sharesOutstanding} onChange={handleInputChange} unit="M" />
            <Input label="Net Debt" name="netDebt" type="number" value={inputs.netDebt} onChange={handleInputChange} unit="$M" />
          </Card>
        </div>

        <ResultsDisplay result={result} intrinsicValuePerShare={result?.intrinsicValuePerShare ?? 0} />
      </main>

      <WaccHelperModal 
        isOpen={isWaccHelperOpen} 
        onClose={() => setWaccHelperOpen(false)} 
        onApply={(wacc) => setInputs(p => ({...p, discountRate: parseFloat(wacc.toFixed(2))}))} 
        initialTaxRate={21} // Default, could be an input
      />

      {notification && (
        <div className="fixed bottom-5 right-5 bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-lg flex items-center animate-fade-in-out">
          <p>{notification}</p>
          <Button variant='ghost' size='sm' onClick={() => setNotification(null)} className='-mr-2 ml-2 p-1 rounded-full'><X size={16}/></Button>
        </div>
      )}
    </div>
  );
}

