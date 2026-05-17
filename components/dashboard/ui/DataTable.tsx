/**
 * DataTable — a generic, sortable, paginated table for portal admin views.
 *
 * Features:
 *   • Sortable columns (click header to toggle asc/desc)
 *   • Client-side search filter (pass searchQuery from parent)
 *   • Pagination (page size: 20)
 *   • Loading skeleton rows
 *   • Empty state (delegated to caller via emptyState prop)
 *   • Responsive (horizontal scroll on small screens)
 *
 * Usage:
 *   <DataTable
 *     columns={[
 *       { key: 'name', header: 'Name', sortable: true, render: (row) => row.full_name },
 *       { key: 'role', header: 'Role', render: (row) => <StatusBadge value={row.role} /> },
 *     ]}
 *     data={students}
 *     rowKey={(row) => row.id}
 *     searchQuery={query}
 *     loading={isLoading}
 *     onRowClick={(row) => navigate(`/dashboard/admin/students/${row.id}`)}
 *   />
 */

import React, { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Column<T> {
  key: string;
  header: string;
  /** If true, the column header is clickable for sorting. */
  sortable?: boolean;
  /** Custom cell renderer. Receives the full row object. */
  render?: (row: T) => React.ReactNode;
  /** For sorting, extract a comparable primitive. Defaults to row[key]. */
  sortValue?: (row: T) => string | number | Date | null | undefined;
  /** Additional class on the <td>. */
  cellClass?: string;
  /** Additional class on the <th>. */
  headClass?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  /** External search query — filters rows by stringifying every cell value. */
  searchQuery?: string;
  loading?: boolean;
  /** Number of loading skeleton rows to show. Default 6. */
  skeletonRows?: number;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  /** Extra class on the table wrapper div. */
  className?: string;
  pageSize?: number;
}

// ---------------------------------------------------------------------------
// Skeleton row
// ---------------------------------------------------------------------------

const SkeletonRow: React.FC<{ cols: number }> = ({ cols }) => (
  <tr className="border-b border-white/10">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-white/5 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
      </td>
    ))}
  </tr>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DataTable<T>({
  columns,
  data,
  rowKey,
  searchQuery = '',
  loading = false,
  skeletonRows = 6,
  onRowClick,
  emptyState,
  className = '',
  pageSize = 20,
}: DataTableProps<T>) {
  const [sortKey, setSortKey]   = useState<string | null>(null);
  const [sortDir, setSortDir]   = useState<'asc' | 'desc'>('asc');
  const [page, setPage]         = useState(0);

  // ── Filter ─────────────────────────────────────────────────────────────── //
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = col.sortValue ? col.sortValue(row) : (row as any)[col.key];
        return String(val ?? '').toLowerCase().includes(q);
      })
    );
  }, [data, searchQuery, columns]);

  // ── Sort ───────────────────────────────────────────────────────────────── //
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filtered;

    return [...filtered].sort((a, b) => {
      const av = col.sortValue ? col.sortValue(a) : (a as any)[sortKey] ?? '';
      const bv = col.sortValue ? col.sortValue(b) : (b as any)[sortKey] ?? '';

      let cmp = 0;
      if (av instanceof Date && bv instanceof Date) {
        cmp = av.getTime() - bv.getTime();
      } else if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv));
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns]);

  // ── Paginate ───────────────────────────────────────────────────────────── //
  const pageCount   = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const paginated   = sorted.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  // ── Sort click ─────────────────────────────────────────────────────────── //
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  // Reset page when data changes
  React.useEffect(() => setPage(0), [searchQuery, data.length]);

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0a0f1e]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-[10px] font-bold ryze-text-muted uppercase tracking-widest whitespace-nowrap select-none ${
                    col.sortable ? 'cursor-pointer hover:ryze-text-inverse transition-colors' : ''
                  } ${col.headClass ?? ''}`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && (
                      <span className="opacity-50">
                        {sortKey === col.key ? (
                          sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                        ) : (
                          <ChevronsUpDown size={12} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <SkeletonRow key={i} cols={columns.length} />
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  {emptyState ?? (
                    <span className="ryze-text-muted text-sm">No results found.</span>
                  )}
                </td>
              </tr>
            ) : (
              paginated.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-white/10 last:border-0 transition-colors ${
                    onRowClick
                      ? 'cursor-pointer hover:bg-white/[0.03]'
                      : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 ryze-text-inverse whitespace-nowrap ${col.cellClass ?? ''}`}
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as any)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && pageCount > 1 && (
        <div className="flex items-center justify-between text-xs ryze-text-muted">
          <span>
            Showing {currentPage * pageSize + 1}–
            {Math.min((currentPage + 1) * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            <span className="px-2">
              {currentPage + 1} / {pageCount}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={currentPage >= pageCount - 1}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
