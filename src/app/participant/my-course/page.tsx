"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/common/Navbar";
import Sidebar from "@/components/common/Sidebar";
import Modal from "@/components/common/Modal";

interface CourseType {
  id: string;
  course_type: string;
}

interface Course {
  id: string;
  course_name: string;
  courseTypeId: string;
  courseType: string;
}

interface CoursesResponse {
  data: Course[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ClassInfo {
  id: string;
  quota: number;
  price: number;
  status: string;
  start_reg_date: string;
  end_reg_date: string;
  duration_day: number;
  start_date: string;
  end_date: string;
  location: string;
  room: string;
}

interface ClassResponse {
  data: ClassInfo[];
}

interface RegistrationFormData {
  participantId: string;
  classId: string;
  payment_method: string;
}

const DashboardPage = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(8); // Number of courses per page
  
  // Registration modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [availableClasses, setAvailableClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [isClassLoading, setIsClassLoading] = useState(false);
  const [classError, setClassError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("Transfer Bank");
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  
  // Fetch courses from API
  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/courses?search=${search}&page=${page}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      const data: CoursesResponse = await response.json();
      setCourses(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Call fetchCourses when page, search, or limit changes
  useEffect(() => {
    fetchCourses();
  }, [page, search, limit]);

  const handleMobileOpen = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page when search changes
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Get course image based on course name (placeholder function)
  const getCourseImage = (courseName: string) => {
    if (courseName.toLowerCase().includes("aiot")) {
      return "/aiot.jpg";
    } else if (courseName.toLowerCase().includes("program")) {
      return "/programmer.jpg";
    }
    // Default image
    return "/default-course.jpg";
  };

  // Get course description based on course name (placeholder function)
  const getCourseDescription = (courseName: string) => {
    if (courseName.toLowerCase().includes("aiot")) {
      return [
        "Membangun sistem AIoT",
        "Mengembangkan aplikasi smart home, smart agriculture, smart healthcare",
      ];
    } else if (courseName.toLowerCase().includes("program")) {
      return ["introduction (pengenalan web)", "Frontend, backend"];
    }
    return ["Course description not available"];
  };

  // Open registration modal for a specific course
  const openRegistrationModal = async (course: Course) => {
    setSelectedCourse(course);
    setRegistrationMessage(null);
    setMessageType(null);
    setIsClassLoading(true);
    setClassError(null);
    setSelectedClass("");
    setPaymentMethod("Transfer Bank");
    
    try {
      // Fetch available classes for this course
      const response = await fetch(`/api/courses/${course.id}/classes?status=Active`);
      if (!response.ok) {
        throw new Error("Failed to fetch available classes");
      }
      
      const data: ClassResponse = await response.json();
      
      // Check if classes are available
      if (data.data.length === 0) {
        setClassError("No available classes for this course at the moment");
      } else {
        setAvailableClasses(data.data);
        // Set the first class as default
        setSelectedClass(data.data[0].id);
      }
    } catch (err) {
      setClassError(err instanceof Error ? err.message : "Failed to load classes");
    } finally {
      setIsClassLoading(false);
      setShowModal(true);
    }
  };

  // Handle form submission for course registration
  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourse || !selectedClass) {
      setRegistrationMessage("Please select a valid class");
      setMessageType('error');
      return;
    }
    
    setIsRegistering(true);
    setRegistrationMessage(null);
    
    try {
      // In a real application, you would get the participant ID from auth session
      // Here we're using a placeholder
      const participantId = "participant_1"; // Replace with real participant ID
      
      const registrationData: RegistrationFormData = {
        participantId,
        classId: selectedClass,
        payment_method: paymentMethod
      };
      
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to register for course");
      }
      
      setRegistrationMessage("Registration successful! Please proceed with payment.");
      setMessageType('success');
      
      // Reset form after successful registration
      // In a real app, you might want to redirect to a payment page instead
      setTimeout(() => {
        setShowModal(false);
        fetchCourses(); // Refresh courses
      }, 3000);
      
    } catch (err) {
      setRegistrationMessage(err instanceof Error ? err.message : "Registration failed");
      setMessageType('error');
    } finally {
      setIsRegistering(false);
    }
  };

  // Close the modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
  };

  // Format price to IDR
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onMobileMenuClick={handleMobileOpen} />
      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileOpen} onMobileClose={handleMobileOpen} variant="participant" />
        <main className="flex-1 p-6 bg-green-50">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
            <h1 className="text-2xl font-semibold text-gray-600 mb-2 sm:mb-0">
              Courses
            </h1>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 rounded-lg border text-gray-700 border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-300"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-500 p-4 rounded-lg">{error}</div>
          ) : courses.length === 0 ? (
            <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">No courses found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow p-4 flex flex-col"
                >
                  <div className="h-32 w-full relative mb-2">
                    <Image
                      src={getCourseImage(course.course_name)}
                      alt={course.course_name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="mb-2">
                      <div className="font-semibold text-sm">
                        Course Name: {course.course_name}
                      </div>
                      <div className="text-xs text-gray-600">
                        Course Type: {course.courseType}
                      </div>
                      <div className="text-xs mt-1">
                        <span className="font-semibold">Description:</span>
                        <ul className="list-disc ml-4">
                          {getCourseDescription(course.course_name).map((desc, idx) => (
                            <li key={idx}>{desc}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="mt-auto">
                      <button
                        onClick={() => openRegistrationModal(course)}
                        className="w-full bg-green-600 text-white py-1.5 rounded-md hover:bg-green-700 transition-colors text-sm"
                      >
                        Register Now
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-400">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                      </span>
                      <span className="text-gray-400">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h4l2-2 2 2h4a2 2 0 012 2v12a2 2 0 01-2 2z"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {!isLoading && courses.length > 0 && (
            <div className="flex justify-center items-center mt-8 gap-2">
              <button 
                className="p-1 rounded hover:bg-gray-200" 
                onClick={() => handlePageChange(1)}
                disabled={page === 1}
              >
                {"<<"}
              </button>
              <button 
                className="p-1 rounded hover:bg-gray-200" 
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                {"<"}
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Logic to show current page and nearby pages
                let pageNum = page;
                if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                // Only show if page is valid
                if (pageNum > 0 && pageNum <= totalPages) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded ${
                        page === pageNum
                          ? "bg-gray-300 text-gray-700 font-semibold"
                          : "hover:bg-gray-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}
              
              <button 
                className="p-1 rounded hover:bg-gray-200"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                {">"}
              </button>
              <button 
                className="p-1 rounded hover:bg-gray-200"
                onClick={() => handlePageChange(totalPages)}
                disabled={page === totalPages}
              >
                {" >>"}
              </button>
            </div>
          )}
          
          {/* Registration Modal */}
          {showModal && selectedCourse && (
            <Modal onClose={closeModal}>
              <div className="p-2 sm:p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Register for {selectedCourse.course_name}
                </h2>
                
                {/* Registration form */}
                <form onSubmit={handleRegistration}>
                  {/* Success or error message */}
                  {registrationMessage && (
                    <div className={`p-3 mb-4 rounded-md ${messageType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {registrationMessage}
                    </div>
                  )}
                  
                  {/* Classes loading state */}
                  {isClassLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin h-6 w-6 border-2 border-green-500 rounded-full border-t-transparent"></div>
                    </div>
                  ) : classError ? (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                      {classError}
                    </div>
                  ) : (
                    <>
                      {/* Class selection */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Class Schedule:
                        </label>
                        <select 
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-500"
                          required
                        >
                          <option value="">Select a class</option>
                          {availableClasses.map(classInfo => (
                            <option key={classInfo.id} value={classInfo.id}>
                              {new Date(classInfo.start_date).toLocaleDateString()} - {classInfo.location} - {formatPrice(classInfo.price)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Selected class details */}
                      {selectedClass && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-md">
                          {availableClasses.filter(c => c.id === selectedClass).map(classInfo => (
                            <div key={classInfo.id} className="text-sm">
                              <p><span className="font-medium">Location:</span> {classInfo.location} ({classInfo.room})</p>
                              <p><span className="font-medium">Start Date:</span> {new Date(classInfo.start_date).toLocaleDateString()}</p>
                              <p><span className="font-medium">End Date:</span> {new Date(classInfo.end_date).toLocaleDateString()}</p>
                              <p><span className="font-medium">Duration:</span> {classInfo.duration_day} days</p>
                              <p><span className="font-medium">Price:</span> {formatPrice(classInfo.price)}</p>
                              <p><span className="font-medium">Available Slots:</span> {classInfo.quota}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Payment method */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Payment Method:
                        </label>
                        <select 
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-500"
                          required
                        >
                          <option value="Transfer Bank">Transfer Bank</option>
                          <option value="E-Wallet">E-Wallet</option>
                          <option value="Kartu Kredit">Kartu Kredit</option>
                        </select>
                      </div>
                      
                      {/* Registration agreement */}
                      <div className="mb-6">
                        <div className="flex items-start">
                          <input
                            id="terms"
                            name="terms"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 mt-1"
                            required
                          />
                          <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
                            I agree to the course terms and conditions, and understand the payment is required to confirm registration.
                          </label>
                        </div>
                      </div>
                      
                      {/* Submit button */}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={closeModal}
                          className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isRegistering || !selectedClass}
                          className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                            isRegistering || !selectedClass
                              ? "bg-green-400 cursor-not-allowed"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {isRegistering ? "Processing..." : "Register"}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </div>
            </Modal>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
