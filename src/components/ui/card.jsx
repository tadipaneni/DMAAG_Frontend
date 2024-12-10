// src/components/ui/card.jsx
export function Card({ children, className = '' }) {
    return <div className={`bg-white shadow rounded-lg ${className}`}>{children}</div>;
  }
  
  export function CardHeader({ children, className = '' }) {
    return <div className={`px-6 py-4 border-b ${className}`}>{children}</div>;
  }
  
  export function CardTitle({ children, className = '' }) {
    return <h3 className={`text-lg font-medium ${className}`}>{children}</h3>;
  }
  
  export function CardContent({ children, className = '' }) {
    return <div className={`px-6 py-4 ${className}`}>{children}</div>;
  }