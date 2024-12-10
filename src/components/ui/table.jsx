// src/components/ui/table.jsx
export function Table({ className, children, ...props }) {
    return (
      <div className="relative w-full overflow-auto">
        <table
          className={`w-full caption-bottom text-sm ${className}`}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
  
  export function TableHeader({ className, ...props }) {
    return (
      <thead className={`bg-gray-100 ${className}`} {...props} />
    );
  }
  
  export function TableBody({ className, ...props }) {
    return (
      <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props} />
    );
  }
  
  export function TableRow({ className, ...props }) {
    return (
      <tr
        className={`border-b transition-colors hover:bg-gray-50/50 ${className}`}
        {...props}
      />
    );
  }
  
  export function TableHead({ className, ...props }) {
    return (
      <th
        className={`h-12 px-4 text-left align-middle font-medium text-gray-500 
          [&:has([role=checkbox])]:pr-0 ${className}`}
        {...props}
      />
    );
  }
  
  export function TableCell({ className, ...props }) {
    return (
      <td
        className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
        {...props}
      />
    );
  }
  
  export function TableCaption({ className, ...props }) {
    return (
      <caption
        className={`mt-4 text-sm text-gray-500 ${className}`}
        {...props}
      />
    );
  }