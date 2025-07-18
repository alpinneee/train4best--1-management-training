"use client";

import React, { useState, useEffect } from "react";

import Button from "@/components/common/button";
import Layout from "@/components/common/Layout";
import Table from "@/components/common/table";
import Modal from "@/components/common/Modal";

interface Instructure {
  no: number;
  id: string;
  fullName: string;
  phoneNumber: string;
  proficiency: string;
  address: string;
  photo?: string | null;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface HistoryItem {
  id: string;
  type: string;
  description: string;
  changedBy: string;
  date: string | Date;
  details?: {
    [key: string]: any;
  };
}

interface Column {
  header: string;
  accessor: keyof Instructure | ((data: Instructure) => React.ReactNode);
  className?: string;
}

interface ApiResponse {
  data: Instructure[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const InstructurePage = () => {
  const proficiencyCategories = [
    "Programming",
    "Web Development", 
    "Data Science",
    "Mobile Development",
    "UI/UX Design",
  ];

  const [instructures, setInstructures] = useState<Instructure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentInstructure, setCurrentInstructure] = useState<Instructure | null>(null);
  
  // State for history modal
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedInstructure, setSelectedInstructure] = useState<Instructure | null>(null);
  
  // State for eligible users
  const [eligibleUsers, setEligibleUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  
  // State for history data
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    proficiency: "",
    address: "",
    photo: "",
    email: "",
    username: "",
    password: "",
  });
  
  const [selectedProficiency, setSelectedProficiency] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Fetch data from API
  const fetchInstructures = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      if (selectedProficiency !== 'all') {
        queryParams.append('proficiency', selectedProficiency);
      }
      
      const response = await fetch(`/api/instructure?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch instructures');
      }
      
      const data: ApiResponse = await response.json();
      
      setInstructures(data.data);
      setTotalItems(data.meta.total);
      setTotalPages(data.meta.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching instructures:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchInstructures();
  }, [currentPage, selectedProficiency, searchTerm]);

  // Handle search with debounce
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle proficiency filter change
  const handleProficiencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProficiency(e.target.value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Form handling
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      fullName: "",
      phoneNumber: "",
      proficiency: "",
      address: "",
      photo: "",
      email: "",
      username: "",
      password: "",
    });
    setIsEditMode(false);
    setCurrentInstructure(null);
  };

  // Open modal for adding
  const handleAddClick = () => {
    resetForm();
    setIsEditMode(false);
    fetchEligibleUsers(); // Fetch eligible users when opening the modal
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleEditClick = async (instructure: Instructure) => {
    try {
      const response = await fetch(`/api/instructure/${instructure.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch instructure details');
      }
      
      const data = await response.json();
      
      setFormData({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        proficiency: data.proficiency,
        address: data.address,
        photo: data.photo || "",
        email: data.email || "",
        username: data.username || "",
        password: data.password || "",
      });
      
      setCurrentInstructure(instructure);
      setIsEditMode(true);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching instructure details:', err);
      alert('Failed to load instructure details for editing');
    }
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phoneNumber || !formData.proficiency || 
        !formData.address || !formData.email || !formData.username || !formData.password) {
      alert('Please fill all required fields');
      return;
    }
    
    try {
      if (isEditMode && currentInstructure) {
        // Update existing instructure - only update instructure data, not user data
        const response = await fetch(`/api/instructure/${currentInstructure.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            proficiency: formData.proficiency,
            address: formData.address,
            photo: formData.photo,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update instructure');
        }
        
        // Refresh data after update
        fetchInstructures();
        setIsModalOpen(false);
        resetForm();
        alert('Instructure updated successfully');
      } else {
        // Create new instructure
        const response = await fetch('/api/instructure', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create instructure');
        }
        
        // Refresh data after creation
        fetchInstructures();
        setIsModalOpen(false);
        resetForm();
        alert('Instructure created successfully');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      alert(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  // Function to fetch eligible users (users who are not instructors)
  const fetchEligibleUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user?role=participant');
      
      if (!response.ok) {
        throw new Error('Failed to fetch eligible users');
      }
      
      const data = await response.json();
      // Filter users who are not instructors
      const filteredUsers = data.users.filter(
        (user: User) => !user.role.toLowerCase().includes('instruct')
      );
      
      setEligibleUsers(filteredUsers);
    } catch (err) {
      console.error('Error fetching eligible users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load eligible users');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to promote a user to instructor
  const promoteToInstructor = async (user: User) => {
    setIsLoading(true);
    try {
      console.log('Promoting user to instructor:', user);
      
      // Step 1: Update user role to Instructure
      const userResponse = await fetch(`/api/user/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle: 'Instructure',
          username: user.name, // Make sure username is passed
        }),
      });
      
      const userResult = await userResponse.json();
      console.log('User role update response:', userResult);
      
      if (!userResponse.ok) {
        throw new Error(`Failed to update user role: ${userResult.error || 'Unknown error'}`);
      }
      
      // Check if the user already has an instructure ID after role update
      if (!userResult.instructureId) {
        // Only create instructure record if one wasn't created during role update
        console.log('No instructureId found, creating new instructure record');
        
        // Step 2: Create instructure record
        const instructureData = {
          fullName: user.name,
          // Tidak perlu mengisi nilai placeholder, biarkan instruktur mengisi sendiri nanti
        };
        console.log('Creating instructure with data:', instructureData);
        
        const instructureResponse = await fetch('/api/instructure', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(instructureData),
        });
        
        const instructureResult = await instructureResponse.json();
        console.log('Instructure creation response:', instructureResult);
        
        if (!instructureResponse.ok) {
          throw new Error(`Failed to create instructure record: ${instructureResult.error || 'Unknown error'}`);
        }
      } else {
        console.log('User already has instructureId:', userResult.instructureId);
      }
      
      // Refresh data
      fetchInstructures();
      
      // Remove the user from eligible users list
      setEligibleUsers(prev => prev.filter(u => u.id !== user.id));
      
      // When promoting multiple users, don't close modal or show alert for each one
      console.log(`${user.name} has been promoted to Instructor`);
    } catch (err) {
      console.error('Error promoting user:', err);
      setError(err instanceof Error ? err.message : 'Failed to promote user');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this instructure?')) {
      return;
    }
    
    try {
      console.log(`Attempting to delete instructure ID: ${id}`);
      
      const response = await fetch(`/api/instructure/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Delete error:', data);
        
        // Jika ada hint tentang force delete, tanyakan kepada pengguna
        if (data.hint && data.hint.includes('force=true')) {
          if (window.confirm(`${data.error}\n\nDo you want to force delete anyway?`)) {
            // Lakukan force delete
            const forceResponse = await fetch(`/api/instructure/${id}?force=true`, {
              method: 'DELETE',
            });
            
            const forceData = await forceResponse.json();
            
            if (!forceResponse.ok) {
              throw new Error(forceData.error || 'Failed to force delete instructure');
            }
            
            console.log('Force delete success:', forceData);
            alert('Instructure force deleted successfully');
            fetchInstructures();
            return;
          }
        }
        
        throw new Error(data.error || 'Failed to delete instructure');
      }
      
      console.log('Delete success:', data);
      
      if (data.usersUpdated && data.usersUpdated.length > 0) {
        alert(`Instructure deleted successfully. ${data.usersUpdated.length} user(s) have been changed to ${data.newRole || 'default'} role.`);
      } else {
        alert('Instructure deleted successfully');
      }
      
      // Refresh data after deletion
      fetchInstructures();
      
    } catch (err) {
      console.error('Error deleting instructure:', err);
      
      // Show a more user-friendly error message
      if (err instanceof Error) {
        if (err.message.includes('associated with users')) {
          alert('Cannot delete this instructure because they are associated with users. Please remove the user associations first.');
        } else if (err.message.includes('associated with classes')) {
          alert('Cannot delete this instructure because they are associated with classes. Please remove the class associations first.');
        } else {
          alert(`Failed to delete instructure: ${err.message}`);
        }
      } else {
        alert('Failed to delete instructure due to an unknown error');
      }
    }
  };

  // Function to fetch history data for an instructor
  const fetchInstructureHistory = async (instructure: Instructure) => {
    setIsLoadingHistory(true);
    setHistoryItems([]);
    
    try {
      const response = await fetch(`/api/instructure/${instructure.id}/history`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch history data');
      }
      
      const data = await response.json();
      
      if (data && Array.isArray(data.history)) {
        setHistoryItems(data.history);
      } else {
        // If API doesn't return history yet, set empty array
        setHistoryItems([]);
      }
      
      setSelectedInstructure(instructure);
      setIsHistoryModalOpen(true);
    } catch (error) {
      console.error('Error fetching history:', error);
      setHistoryItems([]);
      setSelectedInstructure(instructure);
      setIsHistoryModalOpen(true);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Helper function to format dates
  const formatDate = (dateStr: string | Date): string => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return String(dateStr);
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch (e) {
      return String(dateStr);
    }
  };

  const columns: Column[] = [
    { 
      header: "NO", 
      accessor: "no",
      className: "w-12 text-center"
    },
    { 
      header: "Full Name", 
      accessor: (data: Instructure) => (
        <div className="flex items-center gap-1">
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
          <span className="text-xs">{data.fullName}</span>
        </div>
      ),
      className: "min-w-[200px]"
    },
    { 
      header: "Phone Number", 
      accessor: (data: Instructure) => (
        <span className="text-xs">{data.phoneNumber}</span>
      ),
      className: "min-w-[120px]"
    },
    { 
      header: "Proficiency", 
      accessor: (data: Instructure) => (
        <span className="text-xs">{data.proficiency}</span>
      ),
      className: "min-w-[120px]"
    },
    {
      header: "Action",
      accessor: (data: Instructure) => (
        <div className="flex gap-1 justify-center">
          <button
            className="p-1 border rounded hover:bg-gray-100"
            title="View History"
            onClick={() => fetchInstructureHistory(data)}
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="#374151"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          <button
            className="p-1 border rounded hover:bg-gray-100"
            title="Edit"
            onClick={() => handleEditClick(data)}
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="#374151"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
          <button
            className="p-1 border rounded hover:bg-gray-100"
            title="Delete"
            onClick={() => handleDelete(data.id)}
          >
            <svg
              className="w-3 h-3 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      ),
      className: "w-24 text-center"
    },
  ];

  return (
    <Layout variant="admin">
      <div className="p-2">
        <h1 className="text-lg md:text-xl text-gray-700 mb-2">
          Instructure
        </h1>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-2">
          <div className="flex gap-2">
           
            <Button
              variant="primary"
              size="small"
              onClick={handleAddClick}
              className="w-full sm:w-auto text-xs"
            >
              Add New Instructure
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedProficiency}
              onChange={handleProficiencyChange}
              className="px-2 py-1 text-xs border rounded-lg w-full sm:w-auto"
            >
              <option value="all">All Proficiencies</option>
              {proficiencyCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              className="px-2 py-1 text-xs border rounded-lg w-full sm:w-auto"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <div className="overflow-x-auto -mx-2 px-2">
          {isLoading ? (
               <div className="flex justify-center py-60">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
             </div>
          ) : (
          <Table
            columns={columns}
              data={instructures}
            currentPage={currentPage}
              totalPages={totalPages}
            itemsPerPage={itemsPerPage}
              totalItems={totalItems}
            onPageChange={setCurrentPage}
          />
          )}
        </div>

        {/* Add/Edit Instructure Modal */}
        {isModalOpen && !isEditMode && (
          <Modal onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}>
            <div className="w-full">
              <h2 className="text-base mb-2 text-gray-700">
                Select Users
              </h2>
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Role
                      </th>
                      <th scope="col" className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Select
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {eligibleUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-700">
                          {user.name}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-700">
                          {user.email}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap text-xs text-gray-700">
                          {user.role}
                        </td>
                        <td className="px-2 py-1 whitespace-nowrap">
                          <input 
                            type="checkbox" 
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers(prev => [...prev, user]);
                              } else {
                                setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
                              }
                            }}
                            checked={selectedUsers.some(u => u.id === user.id)}
                          />
                        </td>
                      </tr>
                    ))}
                    {eligibleUsers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-2 py-4 text-center text-xs text-gray-500">
                          No eligible users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="gray"
                  size="small"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="text-xs px-2 py-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => {
                    if (selectedUsers.length > 0) {
                      // Promote all selected users
                      Promise.all(selectedUsers.map(user => promoteToInstructor(user)))
                        .then(() => {
                          alert(`Successfully promoted ${selectedUsers.length} user(s) to Instructor`);
                          setSelectedUsers([]);
                          setIsModalOpen(false);
                        })
                        .catch(err => {
                          console.error("Error promoting users:", err);
                          alert("An error occurred while promoting users");
                        });
                    } else {
                      alert("Please select at least one user");
                    }
                  }}
                  disabled={selectedUsers.length === 0 || isLoading}
                  className="text-xs px-2 py-1"
                >
                  {isLoading ? "Processing..." : `Promote ${selectedUsers.length} Selected User(s)`}
                </Button>
              </div>
            </div>
          </Modal>
        )}
        
        {isModalOpen && isEditMode && (
          <Modal onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}>
            <div className="w-full">
              <h2 className="text-base font-semibold mb-2 text-gray-700">
                Edit Instructure
              </h2>
              <form onSubmit={handleSubmit} className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={isEditMode}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={isEditMode}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Proficiency
                  </label>
                  <select
                    name="proficiency"
                    value={formData.proficiency}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Proficiency</option>
                    {proficiencyCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    required
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Photo URL (Optional)
                  </label>
                  <input
                    type="text"
                    name="photo"
                    value={formData.photo}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="gray"
                    size="small"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="text-xs px-2 py-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="small"
                    type="submit"
                    className="text-xs px-2 py-1"
                  >
                    Update Instructure
                  </Button>
                </div>
              </form>
            </div>
          </Modal>
        )}
        
        {/* History Modal */}
        {isHistoryModalOpen && selectedInstructure && (
          <Modal onClose={() => setIsHistoryModalOpen(false)}>
            <h2 className="text-base font-semibold text-gray-700 mb-2">
              History - {selectedInstructure.fullName}
            </h2>
            {isLoadingHistory ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                {historyItems.length > 0 ? (
                  historyItems.map((item) => (
                    <div key={item.id} className="border-b pb-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-700">{item.type}</p>
                          <p className="text-xs text-gray-600">{item.description}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(item.date)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Changed by: {item.changedBy}</p>
                      
                      {/* Display additional details if available */}
                      {item.details && (
                        <div className="mt-1 text-xs text-gray-500 bg-gray-50 p-1 rounded">
                          {item.details.courseName && (
                            <p>Course: <span className="font-medium">{item.details.courseName}</span></p>
                          )}
                          {item.details.location && (
                            <p>Location: <span className="font-medium">{item.details.location}</span></p>
                          )}
                          {item.details.startDate && (
                            <p>Start Date: <span className="font-medium">{formatDate(item.details.startDate)}</span></p>
                          )}
                          {item.details.endDate && (
                            <p>End Date: <span className="font-medium">{formatDate(item.details.endDate)}</span></p>
                          )}
                          {item.details.value && (
                            <p>Value: <span className="font-medium">{item.details.value}</span></p>
                          )}
                          {item.details.valueType && (
                            <p>Type: <span className="font-medium">{item.details.valueType}</span></p>
                          )}
                          {item.details.participantName && (
                            <p>Participant: <span className="font-medium">{item.details.participantName}</span></p>
                          )}
                          {item.details.remark && (
                            <p>Remark: <span className="font-medium">{item.details.remark}</span></p>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">No history records found</p>
                )}
              </div>
            )}
          </Modal>
        )}
      </div>
    </Layout>
  );
};

export default InstructurePage;
