"use client";

import React, { useState } from "react";
import Layout from "@/components/common/Layout";
import { Printer, FileText } from "lucide-react";
import Table from "@/components/common/table";

interface Certificate {
  no: number;
  name: string;
  certificateNumber: string;
  issueDate: string;
}

interface Column<T> {
  header: string;
  accessor: keyof T | ((data: T) => React.ReactNode);
  className?: string;
}

const CertificatePage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const certificates: Certificate[] = [
    {
      no: 1,
      name: "Ilham Ramadhan",
      certificateNumber: "1342456789",
      issueDate: "20 Maret 2024",
    },
    {
      no: 2,
      name: "Risky Febriana",
      certificateNumber: "1342456789",
      issueDate: "26 Januari 2025",
    },
    {
      no: 3,
      name: "Alfine Makarizo",
      certificateNumber: "1342456789",
      issueDate: "21 Maret 2025",
    },
    {
      no: 4,
      name: "Cyntia Febiola",
      certificateNumber: "1342456789",
      issueDate: "8 Mei 2025",
    },
    {
      no: 5,
      name: "Saska Khairani",
      certificateNumber: "1342456789",
      issueDate: "20 Desember 2025",
    },
  ];

  const columns: Column<Certificate>[] = [
    { 
      header: "No", 
      accessor: "no",
      className: "w-12 text-center"
    },
    { 
      header: "Name", 
      accessor: "name",
      className: "min-w-[120px]"
    },
    { 
      header: "Certificate Number", 
      accessor: "certificateNumber",
      className: "min-w-[140px]"
    },
    { 
      header: "Issue Date", 
      accessor: "issueDate",
      className: "min-w-[100px]"
    },
    {
      header: "Action",
      accessor: () => (
        <div className="flex gap-1">
          <button className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-xs p-1">
            <Printer size={14} /> Print
          </button>
          <button className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-xs p-1">
            <FileText size={14} /> Detail
          </button>
        </div>
      ),
      className: "min-w-[120px]"
    },
  ];

  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(certificates.length / ITEMS_PER_PAGE);

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return certificates.slice(startIndex, endIndex);
  };

  return (
    <Layout>
      <div className="p-2">
        <h1 className="text-lg md:text-xl text-gray-700 mb-2">Certificate Expired</h1>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input
              type="date"
              className="w-full sm:w-auto px-2 py-1 text-xs border rounded"
              placeholder="Start Date"
            />
            <input
              type="date"
              className="w-full sm:w-auto px-2 py-1 text-xs border rounded"
              placeholder="End Date"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">
              <Printer size={14} />
              Print File
            </button>
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-2 py-1 pl-7 text-xs border rounded"
              />
              <svg 
                className="absolute left-2 top-1/2 -translate-y-1/2" 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24"
              >
                <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto -mx-2 px-2">
          <Table
            columns={columns}
            data={getCurrentPageItems()}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={certificates.length}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </Layout>
  );
};

export default CertificatePage;
