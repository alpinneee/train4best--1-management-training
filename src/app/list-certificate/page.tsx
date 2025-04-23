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
  validDate: string;
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
      validDate: "20 Maret 2025",
    },
    {
      no: 2,
      name: "Risky Febriana",
      certificateNumber: "1342456789",
      issueDate: "26 Januari 2025",
      validDate: "20 januari 2026",
    },
    {
      no: 3,
      name: "Alfine Makarizo",
      certificateNumber: "1342456789",
      issueDate: "21 Maret 2025",
      validDate: "20 Maret 2026",
    },
    {
      no: 4,
      name: "Cyntia Febiola",
      certificateNumber: "1342456789",
      issueDate: "8 Mei 2025",
      validDate: "20 Maret 2026",
    },
    {
      no: 5,
      name: "Saska Khairani",
      certificateNumber: "1342456789",
      issueDate: "20 Desember 2025",
      validDate: "20 Maret 2026",
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
      className: "min-w-[120px]"
    },
    { 
      header: "Issue Date", 
      accessor: "issueDate",
      className: "min-w-[100px]"
    },
    { 
      header: "Valid Date", 
      accessor: "validDate",
      className: "min-w-[100px]"
    },
    {
      header: "Action",
      accessor: () => (
        <div className="flex gap-1">
          <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 p-1">
            <Printer size={14} /> Print
          </button>
          <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 p-1">
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
        <h1 className="text-lg md:text-xl text-gray-700 mb-2">List Certificate</h1>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input
              type="date"
              className="w-full sm:w-auto px-2 py-1 text-xs border rounded-lg"
              placeholder="Start Date"
            />
            <input
              type="date"
              className="w-full sm:w-auto px-2 py-1 text-xs border rounded-lg"
              placeholder="End Date"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button className="flex items-center justify-center gap-1 px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded-lg hover:bg-gray-200 w-full sm:w-auto">
              <Printer size={14} />
              Print File
            </button>
            <input
              type="text"
              placeholder="Search..."
              className="w-full sm:w-auto px-2 py-1 text-xs border rounded-lg"
            />
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
