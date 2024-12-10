// src/components/ui/button.jsx

export function Button({ children, className = '', ...props }) {
    return (
      <button
        className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 
          transition-colors disabled:opacity-50 ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
  