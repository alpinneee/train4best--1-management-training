"use client";

import React, { useState, useRef } from "react";
import Layout from "@/components/common/Layout";
import Button from "@/components/common/button";
import Modal from "@/components/common/Modal";
import Table from "@/components/common/table";

interface User {
  no: number;
  username: string;
  idUser: string;
  jobTitle: string;
  photo?: string;
}

interface Column {
  header: string;
  accessor: keyof User | ((data: User) => React.ReactNode);
}

const UserPage = () => {
  const [users, setUsers] = useState<User[]>([
    {
      no: 1,
      username: "Sandero Taeil Ishara",
      idUser: "S0848T", 
      jobTitle: "Programming",
    },
    {
      no: 2,
      username: "Mikael Ferdinand",
      idUser: "S0848T",
      jobTitle: "Marketing Specialist",
    },
    {
      no: 3,
      username: "Swara Ajeng Mahesa", 
      idUser: "S0848T",
      jobTitle: "Sales Manager",
    },
    {
      no: 4,
      username: "Dywantara Suroso",
      idUser: "S0848T",
      jobTitle: "Financial Analist",
    },
    {
      no: 5,
      username: "Citra Anugerah",
      idUser: "S0848T",
      jobTitle: "Programming",
    },
    {
      no: 6,
      username: "Dywantara Suroso",
      idUser: "S0848T",
      jobTitle: "Financial Analist",
    },
    {
      no: 7,
      username: "Citra Anugerah",
      idUser: "S0848T",
      jobTitle: "Programming",
    },
    {
      no: 8,
      username: "Dywantara Suroso",
      idUser: "S0848T",
      jobTitle: "Financial Analist",
    },
    {
      no: 9,
      username: "Citra Anugerah",
      idUser: "S0848T",
      jobTitle: "Programming",
    },
    {
      no: 10,
      username: "Dywantara Suroso",
      idUser: "S0848T",
      jobTitle: "Financial Analist",
    },
    {
      no: 11,
      username: "Citra Anugerah",
      idUser: "S0848T",
      jobTitle: "Programming",
    },
    {
      no: 12,
      username: "Dywantara Suroso",
      idUser: "S0848T",
      jobTitle: "Financial Analist",
    },
    {
      no: 13,
      username: "Citra Anugerah",
      idUser: "S0848T",
      jobTitle: "Programming",
    },
    {
      no: 14,
      username: "Dywantara Suroso",
      idUser: "S0848T",
      jobTitle: "Financial Analist",
    },
    {
      no: 15,
      username: "Citra Anugerah",
      idUser: "S0848T",
      jobTitle: "Programming",
    },
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJobTitle, setSelectedJobTitle] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: "",
    idUser: "",
    jobTitle: "",
    photo: "",
  });
  const itemsPerPage = 10;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const jobTitles = ["all", ...new Set(users.map((user) => user.jobTitle))];

  const filteredUsers =
    selectedJobTitle === "all"
      ? users
      : users.filter((user) => user.jobTitle === selectedJobTitle);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handleJobTitleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedJobTitle(e.target.value);
    setCurrentPage(1);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setNewUser({
      username: user.username,
      idUser: user.idUser,
      jobTitle: user.jobTitle,
      photo: user.photo || '',
    });
    setPreviewUrl(user.photo || null);
    setIsEditModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUserData: User = {
      no: users.length + 1,
      username: newUser.username,
      idUser: newUser.idUser,
      jobTitle: newUser.jobTitle,
      photo: previewUrl || '',
    };

    setUsers(prev => [...prev, newUserData]);
    setIsModalOpen(false);
    
    setNewUser({
      username: "",
      idUser: "",
      jobTitle: "",
      photo: "",
    });
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.no === selectedUser.no 
            ? { 
                ...selectedUser, 
                ...newUser,
                photo: previewUrl || user.photo || '',
              } 
            : user
        )
      );
    }
    setIsEditModalOpen(false);
    setSelectedUser(null);
    setNewUser({
      username: "",
      idUser: "",
      jobTitle: "",
      photo: "",
    });
    setPreviewUrl(null);
  };

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File terlalu besar. Maksimal 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload an image file (PNG or JPG)');
    }
  };

  const columns: Column[] = [
    {
      header: "No",
      accessor: "no",
    },
    {
      header: "Username", 
      accessor: "username",
    },
    {
      header: "ID User",
      accessor: "idUser",
    },
    {
      header: "Job Title",
      accessor: "jobTitle", 
    },
    {
      header: "Action",
      accessor: (user: User) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditClick(user)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl text-gray-700 mb-4">Users</h1>

        <div className="mb-4 flex justify-between">
          <Button
            variant="primary"
            size="small"
            onClick={() => setIsModalOpen(true)}
          >
            Add New User
          </Button>

          <div className="flex gap-2 text-gray-700">
            <select
              value={selectedJobTitle}
              onChange={handleJobTitleChange}
              className="px-2 py-1 text-sm rounded-lg"
            >
              {jobTitles.map((title) => (
                <option key={title} value={title}>
                  {title === "all" ? "All Job Titles" : title}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search..."
              className="px-2 py-1 text-sm rounded-lg"
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={currentUsers}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredUsers.length}
          onPageChange={setCurrentPage}
        />

        {/* Add User Modal */}
        {isModalOpen && (
          <Modal onClose={() => setIsModalOpen(false)}>
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Add New User
            </h2>
            <div className="flex gap-6">
              {/* Bagian Upload Foto */}
              <div className="w-1/3">
                <div 
                  className={`aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  } mb-2 relative cursor-pointer`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files[0];
                    handleFile(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <svg 
                        className="mx-auto h-12 w-12 text-gray-400" 
                        stroke="currentColor" 
                        fill="none" 
                        viewBox="0 0 48 48"
                      >
                        <path 
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                          strokeWidth={2} 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                        />
                      </svg>
                      <p className="mt-1 text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG up to 2MB
                      </p>
                    </div>
                  )}
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFile(file);
                      }
                    }}
                  />
                </div>
                {previewUrl && (
                  <button 
                    type="button"
                    className="w-full px-3 py-2 text-sm text-red-600 hover:text-red-700 text-center"
                    onClick={() => {
                      setPreviewUrl(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              {/* Form Pengisian */}
              <div className="flex-1">
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-700">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={newUser.username}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2 text-gray-700">ID User</label>
                    <input
                      type="text"
                      name="idUser"
                      value={newUser.idUser}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Job Title</label>
                    <select
                      name="jobTitle"
                      value={newUser.jobTitle}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Job Title</option>
                      {jobTitles
                        .filter((title) => title !== "all")
                        .map((title) => (
                          <option key={title} value={title}>
                            {title}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="gray"
                      size="small"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="small"
                      type="submit"
                    >
                      Add User
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </Modal>
        )}

        {/* Edit User Modal */}
        {isEditModalOpen && (
          <Modal onClose={() => setIsEditModalOpen(false)}>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Edit User
            </h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={newUser.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded text-gray-700"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">ID User</label>
                <input
                  type="text"
                  name="idUser"
                  value={newUser.idUser}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded text-gray-700"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Job Title</label>
                <select
                  name="jobTitle"
                  value={newUser.jobTitle}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded text-gray-700"
                  required
                >
                  <option value="">Select Job Title</option>
                  {jobTitles
                    .filter((title) => title !== "all")
                    .map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="gray"
                  size="small"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  type="submit"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && (
          <Modal onClose={() => setIsDeleteModalOpen(false)}>
            <h2 className="text-lg font-semibold text-gray-700">Delete User</h2>
            <p className="text-sm text-gray-600 mt-2">
              Apakah Anda yakin ingin menghapus user ini?
            </p>
            <div className="flex justify-end mt-4 gap-2">
              <Button
                variant="gray"
                size="small"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="red"
                size="small"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Hapus
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

export default UserPage;
