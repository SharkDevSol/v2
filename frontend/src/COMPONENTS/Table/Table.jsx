import React, { useState, useMemo, useEffect } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, X } from 'lucide-react';
import styles from './Table.module.css';

/**
 * Enhanced Table component with sorting, pagination, filtering, and row selection
 * @param {Object} props - Component props
 * @param {Array} props.columns - Column definitions [{key, header, accessor, width, render, sortable, filterable, align}]
 * @param {Array} props.data - Data array
 * @param {Function} props.onRowClick - Row click handler
 * @param {boolean} props.loading - Loading state
 * @param {string} props.emptyMessage - Empty state message
 * @param {boolean} props.striped - Striped rows
 * @param {boolean} props.bordered - Bordered table
 * @param {boolean} props.sortable - Enable sorting (default: true)
 * @param {boolean} props.filterable - Enable filtering (default: false)
 * @param {boolean} props.paginated - Enable pagination (default: false)
 * @param {number} props.pageSize - Items per page (default: 10)
 * @param {boolean} props.selectable - Enable row selection (default: false)
 * @param {string} props.selectionMode - 'single' or 'multiple' (default: 'multiple')
 * @param {Function} props.onSelectionChange - Callback when selection changes
 * @param {Array} props.selectedRows - Controlled selected rows
 * @param {string} props.className - Additional CSS classes
 */
const Table = ({ 
  columns, 
  data = [], 
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  striped = false,
  bordered = false,
  sortable = true,
  filterable = false,
  paginated = false,
  pageSize = 10,
  selectable = false,
  selectionMode = 'multiple',
  onSelectionChange,
  selectedRows = [],
  className = ''
}) => {
  // State management
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [internalSelectedRows, setInternalSelectedRows] = useState([]);

  // Use controlled or internal selection state
  const activeSelectedRows = onSelectionChange ? selectedRows : internalSelectedRows;
  const setActiveSelectedRows = onSelectionChange || setInternalSelectedRows;

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterText]);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortable || !sortConfig.key) return data;

    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sorted;
  }, [data, sortConfig, sortable]);

  // Filtering logic
  const filteredData = useMemo(() => {
    if (!filterable || !filterText) return sortedData;

    return sortedData.filter(row => {
      return columns.some(column => {
        if (column.filterable === false) return false;
        const value = row[column.accessor || column.key];
        return value?.toString().toLowerCase().includes(filterText.toLowerCase());
      });
    });
  }, [sortedData, filterText, columns, filterable]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    if (!paginated) return filteredData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize, paginated]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Sorting handler
  const handleSort = (key) => {
    if (!sortable) return;

    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        if (prevConfig.direction === 'asc') {
          return { key, direction: 'desc' };
        } else if (prevConfig.direction === 'desc') {
          return { key: null, direction: null };
        }
      }
      return { key, direction: 'asc' };
    });
  };

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const newSelection = paginatedData.map((_, index) => 
        (currentPage - 1) * pageSize + index
      );
      setActiveSelectedRows(newSelection);
      onSelectionChange?.(newSelection);
    } else {
      setActiveSelectedRows([]);
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (index) => {
    const globalIndex = (currentPage - 1) * pageSize + index;
    
    if (selectionMode === 'single') {
      const newSelection = activeSelectedRows.includes(globalIndex) ? [] : [globalIndex];
      setActiveSelectedRows(newSelection);
      onSelectionChange?.(newSelection);
    } else {
      const newSelection = activeSelectedRows.includes(globalIndex)
        ? activeSelectedRows.filter(i => i !== globalIndex)
        : [...activeSelectedRows, globalIndex];
      setActiveSelectedRows(newSelection);
      onSelectionChange?.(newSelection);
    }
  };

  const isAllSelected = paginatedData.length > 0 && 
    paginatedData.every((_, index) => 
      activeSelectedRows.includes((currentPage - 1) * pageSize + index)
    );

  const isSomeSelected = paginatedData.some((_, index) => 
    activeSelectedRows.includes((currentPage - 1) * pageSize + index)
  ) && !isAllSelected;

  // Render sort icon
  const renderSortIcon = (columnKey) => {
    if (!sortable) return null;
    
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === 'asc' 
        ? <ChevronUp className={styles.sortIcon} aria-label="Sorted ascending" />
        : <ChevronDown className={styles.sortIcon} aria-label="Sorted descending" />;
    }
    return <ChevronsUpDown className={styles.sortIconInactive} aria-label="Not sorted" />;
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        <div className={styles.spinner} aria-hidden="true" />
        <p>Loading...</p>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className={styles.empty} role="status">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const tableClasses = [
    styles.tableWrapper,
    bordered && styles.bordered,
    className
  ].filter(Boolean).join(' ');

  const tbodyClasses = [
    styles.tbody,
    striped && styles.striped
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.tableContainer}>
      {/* Filter/Search Bar */}
      {filterable && (
        <div className={styles.filterBar}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} aria-hidden="true" />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              aria-label="Search table"
            />
            {filterText && (
              <button
                className={styles.clearButton}
                onClick={() => setFilterText('')}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className={styles.resultCount} aria-live="polite">
            {filteredData.length} {filteredData.length === 1 ? 'result' : 'results'}
          </div>
        </div>
      )}

      {/* Table */}
      <div className={tableClasses}>
        <table className={styles.table} role="table">
          <thead className={styles.thead}>
            <tr role="row">
              {/* Selection column */}
              {selectable && (
                <th className={styles.th} style={{ width: '50px' }} role="columnheader">
                  {selectionMode === 'multiple' && (
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={input => {
                        if (input) input.indeterminate = isSomeSelected;
                      }}
                      onChange={handleSelectAll}
                      className={styles.checkbox}
                      aria-label="Select all rows"
                    />
                  )}
                </th>
              )}
              
              {/* Data columns */}
              {columns.map((column, index) => {
                const columnKey = column.key || column.accessor;
                const isSortable = sortable && column.sortable !== false;
                
                return (
                  <th 
                    key={index}
                    className={`${styles.th} ${isSortable ? styles.sortable : ''}`}
                    style={{ 
                      width: column.width,
                      textAlign: column.align || 'left'
                    }}
                    onClick={() => isSortable && handleSort(columnKey)}
                    role="columnheader"
                    aria-sort={
                      sortConfig.key === columnKey 
                        ? sortConfig.direction === 'asc' ? 'ascending' : 'descending'
                        : 'none'
                    }
                  >
                    <div className={styles.thContent}>
                      <span>{column.header}</span>
                      {isSortable && renderSortIcon(columnKey)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className={tbodyClasses}>
            {paginatedData.map((row, rowIndex) => {
              const globalIndex = (currentPage - 1) * pageSize + rowIndex;
              const isSelected = activeSelectedRows.includes(globalIndex);
              
              return (
                <tr 
                  key={rowIndex}
                  className={`${styles.tr} ${onRowClick ? styles.clickable : ''} ${isSelected ? styles.selected : ''}`}
                  onClick={() => onRowClick?.(row)}
                  role="row"
                  aria-selected={selectable ? isSelected : undefined}
                >
                  {/* Selection cell */}
                  {selectable && (
                    <td className={styles.td} role="cell">
                      <input
                        type={selectionMode === 'single' ? 'radio' : 'checkbox'}
                        checked={isSelected}
                        onChange={() => handleSelectRow(rowIndex)}
                        onClick={(e) => e.stopPropagation()}
                        className={styles.checkbox}
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
                    </td>
                  )}
                  
                  {/* Data cells */}
                  {columns.map((column, colIndex) => {
                    const columnKey = column.key || column.accessor;
                    const value = column.render 
                      ? column.render(row[columnKey], row) 
                      : row[columnKey];
                    
                    return (
                      <td 
                        key={colIndex} 
                        className={styles.td}
                        style={{ textAlign: column.align || 'left' }}
                        role="cell"
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className={styles.pagination} role="navigation" aria-label="Table pagination">
          <div className={styles.paginationInfo}>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className={styles.paginationControls}>
            <button
              className={styles.paginationButton}
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              aria-label="Go to first page"
            >
              First
            </button>
            <button
              className={styles.paginationButton}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              aria-label="Go to previous page"
            >
              Previous
            </button>
            
            {/* Page numbers */}
            <div className={styles.pageNumbers}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    className={`${styles.pageNumber} ${currentPage === pageNum ? styles.active : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                    aria-label={`Go to page ${pageNum}`}
                    aria-current={currentPage === pageNum ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              className={styles.paginationButton}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              aria-label="Go to next page"
            >
              Next
            </button>
            <button
              className={styles.paginationButton}
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Go to last page"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
