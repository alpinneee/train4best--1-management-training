"use client";

import { ReactNode } from "react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((data: T) => ReactNode);
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onPageChange?: (page: number) => void;
  currentPage?: number;
  totalPages?: number;
  itemsPerPage?: number;
  totalItems?: number;
}

export default function Table<T>({
  columns,
  data,
  onPageChange,
  currentPage = 1,
  totalPages = 1,
  itemsPerPage = 5,
  totalItems = 0,
}: TableProps<T>) {
  const renderCell = (item: T, column: Column<T>): ReactNode => {
    if (typeof column.accessor === "function") {
      return column.accessor(item);
    }
    return String(item[column.accessor as keyof T]);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Desktop Table View */}
      <div className="w-full overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 text-xs font-semibold text-gray-600 tracking-wider ${
                    column.className || ""
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, rowIndex) => (
              <tr 
                key={rowIndex} 
                className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 text-sm text-gray-600 ${
                      column.className || ""
                    }`}
                  >
                    {renderCell(item, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {onPageChange && totalPages > 1 && (
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex-1 text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => onPageChange(i + 1)}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    currentPage === i + 1
                      ? "bg-blue-50 text-blue-600 border border-blue-600"
                      : "text-gray-600 hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
