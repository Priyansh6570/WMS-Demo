'use client'

import { cn } from '@/lib/utils'

const Input = ({ 
  label,
  error,
  className,
  required = false,
  ...props 
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={cn(
          'input',
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="form-error">{error}</p>
      )}
    </div>
  )
}

export default Input