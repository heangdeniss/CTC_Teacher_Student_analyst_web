export function KpiGrid({ children }) {
  return <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-6">{children}</div>;
}

export function ChartGrid({ children, cols = 2 }) {
  const classes = { 1: '', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3' }[cols];
  return <div className={`grid grid-cols-1 gap-4 ${classes}`}>{children}</div>;
}
