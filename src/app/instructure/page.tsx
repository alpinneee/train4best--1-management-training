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
  userId?: string | null;
  username?: string | null;
  email?: string | null;
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentInstructure, setCurrentInstructure] =
    useState<Instructure | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    proficiency: "",
    address: "",
    photo: "",
    email: "",
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
        queryParams.append("search", searchTerm);
      }

      if (selectedProficiency !== "all") {
        queryParams.append("proficiency", selectedProficiency);
      }

      const response = await fetch(`/api/instructure?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch instructures");
      }

      const data: ApiResponse = await response.json();

      setInstructures(data.data);
      setTotalItems(data.meta.total);
      setTotalPages(data.meta.totalPages);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching instructures:", err);
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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
      password: "",
    });
    setIsEditMode(false);
    setCurrentInstructure(null);
  };

  // Open modal for adding
  const handleAddClick = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleEditClick = async (instructure: Instructure) => {
    try {
      const response = await fetch(`/api/instructure/${instructure.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch instructure details");
      }

      const data = await response.json();

      setFormData({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        proficiency: data.proficiency,
        address: data.address,
        photo: data.photo || "",
        email: data.email || "",
        password: "",
      });

      setCurrentInstructure(instructure);
      setIsEditMode(true);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error fetching instructure details:", err);
      alert("Failed to load instructure details for editing");
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.phoneNumber ||
      !formData.proficiency ||
      !formData.address ||
      !formData.email
    ) {
      alert("Please fill all required fields");
      return;
    }

    // Validasi password (hanya diperlukan untuk create, tidak untuk update)
    if (!isEditMode && !formData.password) {
      alert("Password is required when creating a new instructor");
      return;
    }

    try {
      if (isEditMode && currentInstructure) {
        // Update existing instructure
        const response = await fetch(
          `/api/instructure/${currentInstructure.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update instructure");
        }
      } else {
        // Create new instructure
        const response = await fetch("/api/instructure", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to create instructure");
        }
      }

      // Close modal and refresh data
      setIsModalOpen(false);
      resetForm();
      fetchInstructures();
    } catch (err) {
      console.error("Error saving instructure:", err);
      alert(err instanceof Error ? err.message : "Failed to save instructure");
    }
  };

  // Handle delete
  const handleDelete = async (force = false) => {
    if (!currentInstructure) return;

    try {
      console.log(
        `Attempting to delete instructure ID: ${currentInstructure.id}`
      );

      const url = force
        ? `/api/instructure/${currentInstructure.id}?force=true`
        : `/api/instructure/${currentInstructure.id}`;

      const response = await fetch(url, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Delete error:", data);

        // Jika ada hint tentang force delete, tanyakan kepada pengguna
        if (data.hint && data.hint.includes("force=true")) {
          setError(`${data.error}. Do you want to force delete anyway?`);
          return; // Menunggu pengguna memilih force delete
        }

        throw new Error(data.error || "Failed to delete instructure");
      }

      console.log("Delete success:", data);
      setIsDeleteModalOpen(false);
      setCurrentInstructure(null);

      // Refresh data after deletion
      fetchInstructures();
    } catch (err) {
      console.error("Error deleting instructure:", err);

      // Show a more user-friendly error message
      if (err instanceof Error) {
        if (err.message.includes("associated with users")) {
          setError(
            "Cannot delete this instructure because they are associated with users. Please remove the user associations first."
          );
        } else if (err.message.includes("associated with classes")) {
          setError(
            "Cannot delete this instructure because they are associated with classes. Please remove the class associations first."
          );
        } else {
          setError(`Failed to delete instructure: ${err.message}`);
        }
      } else {
        setError("Failed to delete instructure due to an unknown error");
      }
    }
  };

  const columns: Column[] = [
    {
      header: "NO",
      accessor: "no",
      className: "w-12 text-center",
    },
    {
      header: "Full Name",
      accessor: (data: Instructure) => (
        <div className="flex items-center gap-1">
          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
          <span className="text-xs text-gray-800">{data.fullName}</span>
        </div>
      ),
      className: "min-w-[200px]",
    },
    {
      header: "Phone Number",
      accessor: (data: Instructure) => (
        <span className="text-xs text-gray-800">{data.phoneNumber}</span>
      ),
      className: "min-w-[120px]",
    },
    {
      header: "Email",
      accessor: (data: Instructure) => (
        <span className="text-xs text-gray-800">{data.email || "-"}</span>
      ),
      className: "min-w-[180px]",
    },
    {
      header: "Proficiency",
      accessor: (data: Instructure) => (
        <span className="text-xs text-gray-800">{data.proficiency}</span>
      ),
      className: "min-w-[120px]",
    },
    {
      header: "Action",
      accessor: (data: Instructure) => (
        <div className="flex gap-1 justify-center">
          <button
            className="p-1 border rounded hover:bg-gray-100"
            title="View History"
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
            onClick={() => {
              setCurrentInstructure(data);
              setIsDeleteModalOpen(true);
            }}
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
      className: "w-24 text-center",
    },
  ];

  return (
    <Layout>
      <div className="p-2">
        <h1 className="text-lg md:text-xl text-gray-800 mb-2">Instructure</h1>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-2">
          <div>
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
        {error && !error.includes("force delete") && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            <span>{error}</span>
            <button
              className="float-right font-bold"
              onClick={() => setError(null)}
            >
              &times;
            </button>
          </div>
        )}
        <div className="overflow-x-auto -mx-2 px-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : instructures.length === 0 ? (
            <div className="text-center py-8 text-gray-800">
              No instructors found.
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
        {isModalOpen && (
          <Modal
            onClose={() => {
              setIsModalOpen(false);
              resetForm();
            }}
          >
            <div className="w-full">
              <h2 className="text-base font-semibold mb-2 text-gray-800">
                {isEditMode ? "Edit Instructure" : "Add New Instructure"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-800 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-800 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    required
                  />
                </div>
                {!isEditMode && (
                  <div>
                    <label className="block text-xs font-medium text-gray-800 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                      required={!isEditMode}
                    />
                    <p className="text-xs text-gray-800 mt-1">
                      {isEditMode
                        ? "Leave empty to keep current password"
                        : "Password for login to the system"}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-800 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-800 mb-1">
                    Proficiency <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="proficiency"
                    value={formData.proficiency}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
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
                  <label className="block text-xs font-medium text-gray-800 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    rows={3}
                    required
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-800 mb-1">
                    Photo URL (Optional)
                  </label>
                  <input
                    type="text"
                    name="photo"
                    value={formData.photo}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
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
                    {isEditMode ? "Update" : "Add"} Instructure
                  </Button>
                </div>
              </form>
            </div>
          </Modal>
        )}
        {/* Delete Modal */}
        {isDeleteModalOpen && currentInstructure && (
          <Modal
            onClose={() => {
              setIsDeleteModalOpen(false);
              setCurrentInstructure(null);
              setError(null);
            }}
          >
            <h2 className="text-base font-semibold text-gray-800">
              Delete Instructure
            </h2>
            <p className="text-xs text-gray-800 mt-2">
              Are you sure you want to delete instructure{" "}
              <span className="font-semibold">
                {currentInstructure.fullName}
              </span>
              ?
            </p>
            <p className="text-xs text-gray-800 mt-2">
              This will also delete the linked user account. This action cannot
              be undone.
            </p>
            {error && error.includes("force delete") && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 mt-2 rounded text-xs">
                <p>Warning: {error}</p>
              </div>
            )}
            <div className="flex justify-end mt-3 gap-2">
              <Button
                variant="gray"
                size="small"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setCurrentInstructure(null);
                  setError("");
                }}
                className="text-xs px-2 py-1"
              >
                Cancel
              </Button>
              {error && error.includes("force delete") ? (
                <Button
                  variant="red"
                  size="small"
                  onClick={() => handleDelete(true)}
                  className="text-xs px-2 py-1"
                >
                  Force Delete
                </Button>
              ) : (
                <Button
                  variant="red"
                  size="small"
                  onClick={() => handleDelete(false)}
                  className="text-xs px-2 py-1"
                >
                  Delete
                </Button>
              )}
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

export default InstructurePage;
