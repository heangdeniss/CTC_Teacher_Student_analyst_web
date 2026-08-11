import { isKhmer } from '../lib/format';
import { EmptyState } from './StateViews';

/** Compact analytical table for detailed values. */
export function DataTable({ columns, rows, keyOf, maxHeight }) {
  if (rows.length === 0) return <EmptyState />;
  return (
    <div className="overflow-auto" style={maxHeight ? { maxHeight } : undefined}>
      <table className="w-full border-collapse text-small">
        <thead className="sticky top-0 bg-white">
          <tr className="border-b border-line">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-2 py-2 font-medium text-muted ${column.align === 'right' ? 'text-right' : 'text-left'}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={keyOf(row, index)} className="border-b border-line/70 last:border-0">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-2 py-2 ${column.align === 'right' ? 'text-right tabular-nums' : ''}`}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TextCell({ value }) {
  return <span className={isKhmer(value) ? 'km' : ''}>{value}</span>;
}
