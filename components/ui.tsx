'use client';

import React from 'react';
import { ChevronsUpDown } from 'lucide-react';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label: string; unit?: string }>(
  ({ label, unit, id, ...props }, ref) => (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <div className="relative">
        <input
          id={id}
          ref={ref}
          className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition"
          {...props}
        />
        {unit && <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 text-sm">{unit}</span>}
      </div>
    </div>
  )
);
Input.displayName = 'Input';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }>(
    ({ label, id, children, ...props }, ref) => (
        <div className="w-full">
            <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
            <div className="relative">
                <select
                    id={id}
                    ref={ref}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none transition"
                    {...props}
                >
                    {children}
                </select>
                <ChevronsUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
        </div>
    )
);
Select.displayName = 'Select';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost', size?: 'default' | 'sm', children: React.ReactNode }> = 
  ({ variant = 'primary', size = 'default', children, className, ...props }) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none';
    const variantClasses = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
      secondary: 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600',
      ghost: 'hover:bg-gray-700 hover:text-gray-100',
    };
    const sizeClasses = {
      default: 'h-10 py-2 px-4',
      sm: 'h-9 px-3 rounded-md',
    };
    return <button className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} {...props}>{children}</button>;
};

export const Card: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`bg-gray-800/50 border border-gray-700 rounded-lg shadow-lg p-6 ${className}`}>
    <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);
