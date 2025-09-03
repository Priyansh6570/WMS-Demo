'use client'

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Formatter for Indian Rupee
const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

export default function CurrencyInput({ label, value, onValueChange, required, ...props }) {
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
        // Format the initial value
        if (value) {
            setDisplayValue(currencyFormatter.format(value));
        } else {
            setDisplayValue('');
        }
    }, [value]);

    const handleChange = (e) => {
        const input = e.target.value;
        // Remove non-digit characters
        const numericValue = parseInt(input.replace(/[^0-9]/g, ''), 10);

        if (!isNaN(numericValue)) {
            onValueChange(numericValue);
            setDisplayValue(currencyFormatter.format(numericValue));
        } else {
            onValueChange(null);
            setDisplayValue('');
        }
    };
    
    const handleBlur = () => {
        // On blur, if there's a value, format it. Otherwise clear it.
        if (value) {
            setDisplayValue(currencyFormatter.format(value));
        } else {
            setDisplayValue('');
        }
    };

    return (
        <div className="text-gray-700 form-group">
            {label && (
                <label className="form-label">
                    {label}
                    {required && <span className="ml-1 text-red-500">*</span>}
                </label>
            )}
            <input
                {...props}
                type="text" // Use text type to allow currency symbols
                value={displayValue}
                onChange={handleChange}
                onBlur={handleBlur}
                className={cn('input')}
            />
        </div>
    );
}