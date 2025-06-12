"use client";

import { useState, useEffect } from "react";
import Table from "@/components/common/table";
import Layout from "@/components/common/Layout";
import { Edit, Printer, AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface Payment {
  id: string;
  no: number;
  nama: string;
  tanggal: string;
  paymentMethod: string;
  nomorReferensi: string;
  jumlah: string;
  amount: number;
  status: "Paid" | "Unpaid";
  registrationId: string;
}

interface Column<T> {
  header: string;
  accessor: keyof T | ((data: T, index?: number) => React.ReactNode);
  className?: string;
}

export default function PaymentReport() {
  const [currentPage, setCurrentPage] = useState(1);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

  // Fetch payments
  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Build URL with query parameters
      const params = new URLSearchParams();
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (paymentMethod) {
        params.append('paymentMethod', paymentMethod);
      }
      
      if (startDate) {
        params.append('startDate', startDate);
      }
      
      if (endDate) {
        params.append('endDate', endDate);
      }
      
      // Append params to URL if any exist
      let url = "/api/payment";
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      console.log("Fetching payments from URL:", url);
      const response = await fetch(url);
      
      if (!response.ok) {
        // Try to get more detailed error information
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || `Error: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      // Check if data is in the expected format (with data property)
      if (responseData.data && Array.isArray(responseData.data)) {
        console.log("Payments data received:", responseData.data);
        setPayments(responseData.data);
        
        if (responseData.data.length === 0) {
          console.log("No payments returned from API");
        }
      } else if (Array.isArray(responseData)) {
        // Fallback if API returns direct array
        console.log("Payments data received as direct array");
        setPayments(responseData);
        
        if (responseData.length === 0) {
          console.log("No payments returned from API");
        }
      } else {
        console.error("Invalid response format:", responseData);
        setPayments([]);
        toast.error("Invalid data format received");
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      setPayments([]);
      toast.error(`Failed to load payments: ${error instanceof Error ? error.message : String(error)}`);
      
      // If we're in development, add some demo data
      if (process.env.NODE_ENV === 'development') {
        console.log("Adding fallback demo data for development");
        setPayments([
          {
            id: "demo-1",
            no: 1,
            nama: "Demo User",
            tanggal: new Date().toISOString().split('T')[0],
            paymentMethod: "Transfer Bank",
            nomorReferensi: "TRF-DEMO-001",
            jumlah: "Rp 1.000.000",
            amount: 1000000,
            status: "Paid",
            registrationId: "demo-reg-1"
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete payment
  const deletePayment = async (id: string) => {
    try {
      const response = await fetch(`/api/payment/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      toast.success("Payment deleted successfully");
      fetchPayments(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete payment:", error);
      toast.error("Failed to delete payment");
    } finally {
      setShowDeleteModal(false);
      setPaymentToDelete(null);
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPayments();
  };

  // Handle payment method change
  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentMethod(e.target.value);
  };

  // Init
  useEffect(() => {
    fetchPayments();
  }, []);

  const columns: Column<Payment>[] = [
    { 
      header: "No", 
      accessor: (_payment, index) => {
        return typeof index === 'number' ? (currentPage - 1) * ITEMS_PER_PAGE + index + 1 : '-';
      },
      className: "w-12 text-center"
    },
    { 
      header: "Nama", 
      accessor: "nama",
      className: "min-w-[120px]"
    },
    { 
      header: "Tanggal", 
      accessor: "tanggal",
      className: "min-w-[100px]"
    },
    { 
      header: "Payment Method", 
      accessor: "paymentMethod",
      className: "min-w-[120px]"
    },
    { 
      header: "Nomor Referensi", 
      accessor: "nomorReferensi",
      className: "min-w-[140px]"
    },
    { 
      header: "Jumlah (idr)", 
      accessor: (payment) => {
        // Format jumlah as currency if it's a number
        if (typeof payment.amount === 'number') {
          return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
          }).format(payment.amount);
        }
        // If jumlah is already formatted or amount is not available
        return payment.jumlah || '-';
      },
      className: "min-w-[100px]"
    },
    {
      header: "Status",
      accessor: (payment: Payment) => (
        <span
          className={`px-1 py-0.5 text-xs font-medium rounded-full ${
            payment.status === "Paid"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {payment.status}
        </span>
      ),
      className: "min-w-[80px]"
    },
    {
      header: "Action",
      accessor: (payment) => (
        <div className="flex gap-1">
          <Link 
            href={`/payment/${payment.id}/edit`} 
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs p-1"
          >
            <Edit size={14} />
            Edit
          </Link>
          <button 
            onClick={() => {
              setPaymentToDelete(payment.id);
              setShowDeleteModal(true);
            }}
            className="flex items-center gap-1 text-red-600 hover:text-red-800 text-xs p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
              <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"/>
            </svg>
            Delete
          </button>
        </div>
      ),
      className: "min-w-[120px]"
    },
  ];

  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(payments.length / ITEMS_PER_PAGE);

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return payments.slice(startIndex, endIndex);
  };

  // Delete confirmation modal
  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <AlertCircle size={24} />
          <h3 className="text-lg font-semibold">Confirm Deletion</h3>
        </div>
        <p className="mb-6">Are you sure you want to delete this payment? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button 
            onClick={() => paymentToDelete && deletePayment(paymentToDelete)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="p-2">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg md:text-xl text-gray-700">Payment Report</h1>
          
          {/* <Link 
            href="/payment/new" 
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            <Plus size={16} />
            New Payment
          </Link> */}
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* <select 
              className="w-full sm:w-auto px-2 py-1 text-xs border rounded"
              value={paymentMethod}
              onChange={handlePaymentMethodChange}
            >
              <option value="">All Payment Methods</option>
              <option value="Transfer Bank">Transfer Bank</option>
              <option value="E-Wallet">E-Wallet</option>
              <option value="Kartu Kredit">Kartu Kredit</option>
            </select> */}

            <input
              type="date"
              className="w-full sm:w-auto px-2 py-1 text-xs border rounded text-gray-700"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              className="w-full sm:w-auto px-2 py-1 text-xs border rounded"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button 
              type="button"
              onClick={() => window.print()}
              className="w-full sm:w-auto flex items-center justify-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
            >
              <Printer size={14} />
              Print Report
            </button>
            <div className="relative w-full sm:w-auto flex">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-2 py-1 pl-7 text-xs border rounded"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              <button 
                type="submit"
                className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center py-60">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-2 px-2">
            {payments.length > 0 ? (
              <Table
                columns={columns}
                data={getCurrentPageItems()}
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={payments.length}
                onPageChange={setCurrentPage}
              />
            ) : (
              <div className="text-center p-6 bg-gray-50 rounded-md">
                <p className="text-gray-500">No payments found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showDeleteModal && <DeleteModal />}
    </Layout>
  );
}
