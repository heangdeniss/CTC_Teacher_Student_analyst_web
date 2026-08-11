export function ChartCard({ title, action, children, className = '' }) {
  return (
    <section className={`card card-pad flex flex-col ${className}`}>
      <header className="mb-4 flex items-start justify-between gap-4">
        <h3 className="text-chart-title">{title}</h3>
        {action}
      </header>
      <div className="flex-1">{children}</div>
    </section>
  );
}
