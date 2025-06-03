'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/common/Layout';
import CourseCard from '@/components/course/CourseCard';
import Modal from '@/components/common/Modal';
import { useRouter } from 'next/navigation';

// Define interfaces for type safety
interface CourseType {
  course_type: string;
}

interface CourseInfo {
  course_name: string;
  courseType: CourseType;
}

interface Course {
  id: string;
  quota: number;
  price: number;
  status: string;
  start_date: Date;
  end_date: Date;
  location: string;
  room: string;
  availableSlots: number;
  course: CourseInfo;
  imageUrl?: string;
}

interface SelectedCourse {
  id: string;
  title: string;
  className: string;
}

interface UserInfo {
  email: string;
  username: string;
  fullName: string;
}

interface RegistrationResult {
  registrationId: string;
  course: string;
  className: string;
  payment: number;
  paymentStatus: string;
  referenceNumber: string;
  courseScheduleId?: string;
  userInfo?: UserInfo;
}

export default function MyCoursePage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<SelectedCourse | null>(null);
  const [registering, setRegistering] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [checkingLoginStatus, setCheckingLoginStatus] = useState(true);
  const [isDbConfigured, setIsDbConfigured] = useState(true);
  const [configuring, setConfiguring] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Email validation function
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  
  // Validate email input
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setManualEmail(value);
    
    if (value && !isValidEmail(value)) {
      setEmailError('Invalid email. Use format: example@domain.com');
    } else {
      setEmailError('');
    }
  };
  
  // Definisikan fetchAvailableCourses sebagai useCallback agar bisa dipanggil dari luar useEffect
  const fetchAvailableCourses = useCallback(async () => {
    setLoading(true);
    try {
      // Always attempt to fetch courses
      console.log('Mengambil data kursus yang tersedia...');
      const response = await fetch(`/api/course/available?limit=10&_=${new Date().getTime()}`);
      
      if (!response.ok) {
        const errorData = await response.text();
        // Cek apakah error karena database belum dikonfigurasi
        if (response.status === 500 && errorData.includes('database')) {
          setIsDbConfigured(false);
          throw new Error('Database belum dikonfigurasi');
        }
        throw new Error(`Gagal mengambil kursus: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if there's login info in the response
      if (data.meta && data.meta.user) {
        setUserEmail(data.meta.user.email || '');
        setUserName(data.meta.user.name || data.meta.user.username || '');
        setIsLoggedIn(true);
      }
      
      if (data.data && Array.isArray(data.data)) {
        // Format data untuk memastikan semua data yang dibutuhkan tersedia
        const formattedCourses = data.data.map((course: any) => {
          // Pastikan course memiliki semua property yang dibutuhkan
          return {
            id: course.id,
            quota: course.quota || 0,
            price: course.price || 0,
            status: course.status || 'Active',
            start_date: course.start_date || new Date(),
            end_date: course.end_date || new Date(),
            location: course.location || 'Unknown',
            room: course.room || 'TBD',
            availableSlots: course.availableSlots || 0,
            course: {
              course_name: course.course?.course_name || `Course ${course.id.substring(0, 5)}`,
              courseType: {
                course_type: course.course?.courseType?.course_type || 'Technical'
              }
            }
          };
        });
        
        setCourses(formattedCourses);
        setError(null);
        setIsDbConfigured(true);
      } else {
        throw new Error('Received invalid data format from API');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      
      if (err instanceof Error && err.message.includes('Database belum dikonfigurasi')) {
        setIsDbConfigured(false);
        setError('Database belum dikonfigurasi. Silakan klik tombol "Konfigurasi Database" di bawah.');
      } else {
        // Remove dummy data and just show error
        setError('Gagal memuat kursus dari server. Silakan coba lagi nanti.');
      }
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Setup database
  const setupDatabase = async () => {
    setConfiguring(true);
    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mode: 'minimal' })
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsDbConfigured(true);
        
        // Simpan email demo user untuk demo yang lebih seamless
        localStorage.setItem('userEmail', 'demo@example.com');
        
        // Reload kursus setelah database dikonfigurasi
        fetchAvailableCourses();
        // Force refresh komponen dengan mengubah key
        setRefreshKey(prev => prev + 1);
        alert('Database berhasil dikonfigurasi!');
        // Force reload halaman 
        window.location.reload();
      } else {
        const error = await response.text();
        console.error('Error configuring database:', error);
        alert('Gagal mengkonfigurasi database. Lihat konsol untuk detail.');
      }
    } catch (error) {
      console.error('Error setting up database:', error);
      alert('Terjadi kesalahan saat mengkonfigurasi database.');
    } finally {
      setConfiguring(false);
    }
  };
  
  // Ambil data kursus dan user yang tersedia saat komponen dimuat
  useEffect(() => {
    // Get user profile information from session
    const getUserProfile = async () => {
      setCheckingLoginStatus(true);
      try {
        console.log('Memeriksa status login user...');
        
        // Try multiple methods to detect login status
        
        // Method 1: Try to get from session endpoint first (prioritas utama)
        try {
          const userResponse = await fetch('/api/user/current');
          if (userResponse.ok) {
            const userData = await userResponse.json();
            
            if (userData.data && userData.data.email) {
              setUserEmail(userData.data.email);
              setUserName(userData.data.username || userData.data.name || '');
              setIsLoggedIn(true);
              localStorage.setItem('userEmail', userData.data.email);
              setCheckingLoginStatus(false);
              return true;
            }
          }
        } catch (sessionError) {
          console.error('Error checking session endpoint:', sessionError);
        }
        
        // Method 2: Check authentication status endpoint
        try {
          const authResponse = await fetch('/api/auth/session');
          if (authResponse.ok) {
            const authData = await authResponse.json();
            console.log('Auth session response:', authData);
            
            if (authData && authData.user) {
              console.log('User authenticated via next-auth session');
              setUserEmail(authData.user.email);
              setUserName(authData.user.name || '');
              setIsLoggedIn(true);
              localStorage.setItem('userEmail', authData.user.email);
              setCheckingLoginStatus(false);
              return true;
            }
          }
        } catch (authError) {
          console.error('Error checking auth session:', authError);
        }
        
        // Method 3: Try to get from local storage as fallback
        const storedEmail = localStorage.getItem('userEmail');
        if (storedEmail) {
          console.log('Email ditemukan di localStorage:', storedEmail);
          setUserEmail(storedEmail);
          
          // Verify this email with the server
          try {
            const verifyResponse = await fetch(`/api/user/verify?email=${encodeURIComponent(storedEmail)}`);
            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              if (verifyData.valid) {
                console.log('Email verified as valid user');
                setIsLoggedIn(true);
                setUserName(verifyData.username || '');
                setCheckingLoginStatus(false);
                return true;
              }
            }
          } catch (verifyError) {
            console.error('Error verifying email:', verifyError);
          }
        }
        
        // Method 4: Try URL parameters as last resort
        const urlParams = new URLSearchParams(window.location.search);
        const emailParam = urlParams.get('email');
        if (emailParam) {
          console.log('Email dari URL:', emailParam);
          setUserEmail(emailParam);
          localStorage.setItem('userEmail', emailParam);
        }
        
        // No login detected
        console.log('No login detected after trying all methods');
        setIsLoggedIn(false);
        setCheckingLoginStatus(false);
        return false;
      } catch (error) {
        console.error('Error getting user profile:', error);
        setIsLoggedIn(false);
        setCheckingLoginStatus(false);
        return false;
      }
    };
    
    // Get user first, then fetch courses
    getUserProfile().then(() => {
      fetchAvailableCourses();
    });
  }, [fetchAvailableCourses, refreshKey]);
  
  const handleRegisterClick = (courseId: string, courseTitle: string, courseClass: string) => {
    if (userEmail && !isLoggedIn) {
      setIsLoggedIn(true);
    }
    
    setSelectedCourse({
      id: courseId,
      title: courseTitle, 
      className: courseClass
    });
    setIsRegisterModalOpen(true);
    setRegistrationError('');
  };
  
  const handleRegisterSubmit = async () => {
    if (!selectedCourse) return;
    
    // Validate email if not logged in and manual email is being used
    if (!isLoggedIn && manualEmail) {
      if (!isValidEmail(manualEmail)) {
        setRegistrationError('Invalid email. Please enter a correct email.');
        return;
      }
    }
    
    // Check terms acceptance
    if (!termsAccepted) {
      setRegistrationError('You must agree to the course terms to continue.');
      return;
    }
    
    setRegistering(true);
    setRegistrationError('');
    
    try {
      // Use either the logged in user's email or manual email if provided
      const emailToUse = isLoggedIn ? userEmail : (manualEmail || userEmail);
      
      // Validate the email to use
      if (!emailToUse || !isValidEmail(emailToUse)) {
        setRegistrationError('Invalid email. Please enter a valid email to register.');
        setRegistering(false);
        return;
      }
      
      const registrationData = {
        classId: selectedCourse.id,
        email: emailToUse,
        paymentMethod: 'Transfer Bank'
      };
      
      // Register the participant
      const response = await fetch('/api/course/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setRegistrationResult(data.data);
        
        // Save successful email for future use
        if (data.data?.userInfo?.email) {
          localStorage.setItem('userEmail', data.data.userInfo.email);
        } else if (emailToUse) {
          localStorage.setItem('userEmail', emailToUse);
        }
      } else {
        // More descriptive error messages in English
        if (data.error?.includes("not found")) {
          setRegistrationError('User information was not found. Please login again and ensure your email is correct.');
        } else if (data.error?.includes("profile is incomplete")) {
          setRegistrationError('Your profile is incomplete. Please complete your profile before registering for a course.');
        } else if (data.error?.includes("already registered")) {
          setRegistrationError('You are already registered for this class.');
        } else if (data.error?.includes("Class is full")) {
          setRegistrationError('Sorry, this class is already full.');
        } else {
          setRegistrationError(data.error || 'Failed to register for the course.');
        }
      }
    } catch (error) {
      console.error('Error registering course:', error);
      setRegistrationError('Failed to register for the course. Please try again.');
    } finally {
      setRegistering(false);
    }
  };
  
  const closeModal = () => {
    setIsRegisterModalOpen(false);
    setSelectedCourse(null);
    setRegistrationResult(null);
    setRegistrationError('');
    setManualEmail('');
    setEmailError('');
    setTermsAccepted(false);
  };
  
  const goToPayment = () => {
    closeModal();
    if (registrationResult) {
      // Redirect langsung ke Midtrans dengan reference number
      window.location.href = `/api/midtrans/payment?reference=${registrationResult.referenceNumber}`;
    }
  };
  
  // Grid layout for displaying course cards
  const renderCourses = () => {
    if (loading || checkingLoginStatus) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
    if (!isDbConfigured) {
      return (
        <div className="space-y-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md text-sm">
            Database is not configured. Please click the button below to configure the database.
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={setupDatabase}
              disabled={configuring}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {configuring ? 'Configuring...' : 'Configure Database'}
            </button>
          </div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="space-y-2">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
          
          {!isDbConfigured && (
            <div className="flex justify-center mt-4">
              <button
                onClick={setupDatabase}
                disabled={configuring}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {configuring ? 'Configuring...' : 'Configure Database'}
              </button>
            </div>
          )}
        </div>
      );
    }
    
    if (courses.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No courses available at this time.</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.course.course_name}
            type={course.course.courseType.course_type}
            image={course.imageUrl || null}
            className={`${course.location} - ${new Date(course.start_date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}`}
            startDate={course.start_date}
            endDate={course.end_date}
            price={course.price}
            location={course.location}
            room={course.room}
            quota={course.quota}
            onRegister={handleRegisterClick}
          />
        ))}
      </div>
    );
  };
  
  return (
    <Layout variant="participant">
      <div className="p-2 sm:p-3 max-w-7xl mx-auto">
        <h1 className="text-xl font-bold text-gray-800 mb-3">Available Courses</h1>
        
        {renderCourses()}
        
        {/* Registration Modal */}
        {isRegisterModalOpen && (
          <Modal onClose={closeModal}>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              {registrationResult ? 'Registration Successful' : 'Course Registration'}
            </h2>
            
            {registrationError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md mb-3 text-sm">
                {registrationError}
              </div>
            )}
            
            {registrationResult ? (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-sm">
                  Registration successful! Please proceed to payment through Midtrans.
                </div>
                
                <div className="space-y-1 p-3 bg-gray-50 rounded-md text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Participant:</span>
                    <span className="font-medium">
                      {registrationResult.userInfo?.fullName || userName || userEmail.split('@')[0]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span>{registrationResult.userInfo?.email || userEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Course:</span>
                    <span className="font-medium">{registrationResult.course}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Class:</span>
                    <span>{registrationResult.className}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment:</span>
                    <span className="font-medium">{new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(registrationResult.payment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference No.:</span>
                    <span className="font-medium">{registrationResult.referenceNumber}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-end mt-3">
                  <button
                    onClick={closeModal}
                    className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
                  >
                    Close
                  </button>
                  {registrationResult.courseScheduleId && (
                    <button
                      onClick={() => router.push(`/course-schedule/${registrationResult.courseScheduleId}`)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      View Schedule
                    </button>
                  )}
                  <button
                    onClick={goToPayment}
                    className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Pay via Midtrans
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {selectedCourse && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-md">
                    <h3 className="font-medium text-gray-800 mb-1 text-sm">{selectedCourse.title}</h3>
                    <p className="text-gray-600 text-xs">{selectedCourse.className}</p>
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded mt-0.5"
                    />
                    <label htmlFor="terms" className="ml-2 block text-xs text-gray-700">
                      I agree to the course terms and understand that payment is required to confirm registration.
                    </label>
                  </div>
                  
                  <div className="flex gap-2 justify-end mt-3">
                    <button
                      onClick={closeModal}
                      className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRegisterSubmit}
                      disabled={registering || (!isLoggedIn && (!manualEmail || !!emailError))}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-sm"
                    >
                      {registering ? 'Processing...' : 'Register'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        )}
      </div>
    </Layout>
  );
} 