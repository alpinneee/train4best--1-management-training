"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/common/Layout";
import { ArrowLeft, Upload, CheckCircle, AlertCircle } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isActive: boolean;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/payment/${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch payment details: ${response.status}`);
        }
        
        const data = await response.json();
        setPaymentDetails(data);
      } catch (err) {
        console.error("Error fetching payment details:", err);
        setError("Failed to fetch payment details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    const fetchBankAccounts = async () => {
      try {
        const response = await fetch('/api/bank-accounts');
        if (response.ok) {
          const data = await response.json();
          setBankAccounts(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching bank accounts:", error);
      }
    };
    
    fetchPaymentDetails();
    fetchBankAccounts();
  }, [id]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Please select a valid file (JPEG, PNG, or PDF)");
        return;
      }
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      
      setFile(selectedFile);
      
      // Create preview URL for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreviewUrl(null);
      }
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    
    setUploading(true);
    setUploadError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('paymentId', id as string);
      
      const response = await fetch(`/api/payment/upload-proof`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload payment proof");
      }
      
      setUploadSuccess(true);
      toast.success("Payment proof uploaded successfully");
      
      // Refresh payment details after successful upload
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error("Error uploading payment proof:", err);
      setUploadError(err instanceof Error ? err.message : "Failed to upload payment proof");
      toast.error(err instanceof Error ? err.message : "Failed to upload payment proof");
    } finally {
      setUploading(false);
    }
  };
  
  if (loading) {
    return (
      <Layout variant="participant">
        <div className="p-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error || !paymentDetails) {
    return (
      <Layout variant="participant">
        <div className="p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="text-red-500 mr-3 mt-0.5" size={20} />
            <div>
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-700">{error || "Failed to load payment details"}</p>
              <button 
                onClick={() => router.back()}
                className="mt-3 text-blue-600 hover:text-blue-800 flex items-center"
              >
                <ArrowLeft size={16} className="mr-1" /> Go Back
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout variant="participant">
      <div className="p-4">
        <div className="mb-4 flex items-center">
          <button 
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 flex items-center mr-4"
          >
            <ArrowLeft size={16} className="mr-1" /> Back
          </button>
          <h1 className="text-xl font-bold text-gray-800">Payment Details</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Course Information</h2>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <span className="text-gray-600">Course:</span>
              <span className="font-medium text-gray-800">{paymentDetails.courseName}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <span className="text-gray-600">Class:</span>
              <span className="font-medium text-gray-800">{paymentDetails.className}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <span className="text-gray-600">Payment Amount:</span>
              <span className="font-medium text-gray-800">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0
                }).format(paymentDetails.amount || paymentDetails.paymentAmount || 0)}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <span className="text-gray-600">Reference Number:</span>
              <span className="font-medium text-gray-800">{paymentDetails.referenceNumber}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${
                paymentDetails.paymentStatus === 'Paid' ? 'text-green-600' : 
                paymentDetails.paymentStatus === 'Pending' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {paymentDetails.paymentStatus}
              </span>
            </div>
          </div>
          
          <hr className="my-6" />
          
          <div className="space-y-4 p-4">
            <h2 className="text-lg font-semibold text-gray-800">Bank Transfer Information</h2>
            
            <div className="border border-gray-200 rounded-md p-4 space-y-3">
              {bankAccounts.length > 0 ? (
                bankAccounts.map((bank) => (
                  <div key={bank.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                    <div>
                      <span className="block text-gray-600">Bank Name:</span>
                      <span className="font-medium text-gray-800">{bank.bankName}</span>
                    </div>
                    <div>
                      <span className="block text-gray-600">Account Number:</span>
                      <span className="font-medium text-gray-800">{bank.accountNumber}</span>
                    </div>
                    <div>
                      <span className="block text-gray-600">Account Name:</span>
                      <span className="font-medium text-gray-800">{bank.accountName}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div>
                  <div>
                    <span className="block text-gray-600">Bank Name:</span>
                    <span className="font-medium text-gray-800">Bank BCA</span>
                  </div>
                  <div>
                    <span className="block text-gray-600">Account Number:</span>
                    <span className="font-medium text-gray-800">0123456789</span>
                  </div>
                  <div>
                    <span className="block text-gray-600">Account Name:</span>
                    <span className="font-medium text-gray-800">Train4Best Indonesia</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Only show upload section if payment is not paid yet */}
          {paymentDetails.paymentStatus !== 'Paid' && (
            <>
              <hr className="my-6" />
              
              <div className="p-4 space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">Upload Payment Proof</h2>
                
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="payment-proof" className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Proof (JPEG, PNG, or PDF, max 5MB)
                      </label>
                      <input
                        type="file"
                        id="payment-proof"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    
                    {filePreviewUrl && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-1">Preview:</p>
                        <div className="border rounded-md overflow-hidden max-w-xs">
                          <img
                            src={filePreviewUrl}
                            alt="Payment proof preview"
                            className="w-full h-auto max-h-48 object-contain"
                          />
                        </div>
                      </div>
                    )}
                    
                    {file && !filePreviewUrl && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">File selected: {file.name}</p>
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <button
                        onClick={handleUpload}
                        disabled={!file || uploading || uploadSuccess}
                        className={`flex items-center px-4 py-2 rounded-md text-white ${
                          !file || uploading || uploadSuccess 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Uploading...
                          </>
                        ) : uploadSuccess ? (
                          <>
                            <CheckCircle size={16} className="mr-2" />
                            Uploaded Successfully
                          </>
                        ) : (
                          <>
                            <Upload size={16} className="mr-2" />
                            Upload Payment Proof
                          </>
                        )}
                      </button>
                    </div>
                    
                    {uploadError && (
                      <div className="mt-2 text-sm text-red-600">
                        {uploadError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Display existing payment proof if available */}
          {paymentDetails.paymentProof && (
            <>
              <hr className="my-6" />
              
              <div className="p-4 space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">Uploaded Payment Proof</h2>
                
                <div className="border border-gray-200 rounded-md p-4">
                  {paymentDetails.paymentProof.endsWith('.pdf') ? (
                    <div className="text-center py-4">
                      <p className="text-gray-700 mb-2">PDF Document</p>
                      <a
                        href={paymentDetails.paymentProof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        View PDF
                      </a>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <div className="max-w-md">
                        <img
                          src={paymentDetails.paymentProof}
                          alt="Payment proof"
                          className="w-full h-auto rounded-md"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
} 