import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
  
  const variants = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 shadow-sm hover:shadow-md active:scale-[0.98]",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-teal-500 shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md active:scale-[0.98]",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`} {...props}>
    {children}
  </div>
);

export const Badge = ({ children, variant = 'gray', className = '' }) => {
  const variants = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
    yellow: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
    red: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
    blue: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
    teal: "bg-teal-50 text-teal-700 ring-1 ring-teal-600/20",
    orange: "bg-orange-50 text-orange-700 ring-1 ring-orange-600/20",
    purple: "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20"
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${variants[variant] || variants.gray} ${className}`}>
      {children}
    </span>
  );
};

export const Input = ({ label, id, error, ...props }) => (
  <div className="space-y-1.5">
    {label && <label htmlFor={id} className="block text-sm font-semibold text-gray-700">{label}</label>}
    <input
      id={id}
      className={`block w-full rounded-lg border ${error ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-300'} px-3 py-2.5 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:text-sm transition-colors`}
      {...props}
    />
    {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
  </div>
);

export const Select = ({ label, id, options, error, ...props }) => (
  <div className="space-y-1.5">
    {label && <label htmlFor={id} className="block text-sm font-semibold text-gray-700">{label}</label>}
    <select
      id={id}
      className={`block w-full rounded-lg border ${error ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-300'} px-3 py-2.5 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:text-sm bg-white transition-colors`}
      {...props}
    >
      <option value="">Select option</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
  </div>
);
