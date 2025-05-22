"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/common/Layout";
import Button from "@/components/common/button";
import Modal from "@/components/common/Modal";
import Table from "@/components/common/table";
import { toast } from "react-hot-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Column {
  header: string;
  accessor: keyof User | ((data: User) => React.ReactNode);
}

const UserPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [newUser, setNewUser] = useState({
    username: "",
    jobTitle: "",
    password: "password123",
  });

  const itemsPerPage = 10;

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/user");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again.");
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!newUser.username || !newUser.jobTitle) {
        throw new Error("Username and role are required");
      }

      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newUser.username,
          jobTitle: newUser.jobTitle,
          password: newUser.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add user");
      }

      // Add the new user to the state
      setUsers(prev => [...prev, data]);
      
      // Reset form
      setNewUser({
        username: "",
        jobTitle: "",
        password: "password123",
      });
      
      setIsModalOpen(false);
      toast.success("User added successfully");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get unique roles from users
  const uniqueRoles = Array.from(new Set(users.map(user => user.role)));
  const roles = ["all", ...uniqueRoles];

  // Filter by role and search term
  const filteredUsers = users
    .filter(user => selectedRole === "all" || user.role === selectedRole)
    .filter(user => 
      searchTerm === "" || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setNewUser({
      username: user.name,
      jobTitle: user.role,
      password: "", // Empty password means don't change it
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`/api/user/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newUser.username,
          jobTitle: newUser.jobTitle,
          password: newUser.password || undefined, // Only send password if changed
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user");
      }

      // Update user in state
      setUsers(prev => 
        prev.map(user => user.id === selectedUser.id ? data : user)
      );
      
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setNewUser({
        username: "",
        jobTitle: "",
        password: "",
      });
      
      toast.success("User updated successfully");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (force = false) => {
    if (!selectedUser) return;
    
    setLoading(true);
    setError("");

    try {
      const url = force 
        ? `/api/user/${selectedUser.id}?force=true` 
        : `/api/user/${selectedUser.id}`;
      
      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        
        // If error is about associated records and we're not forcing deletion
        if (data.error === 'Cannot delete user that has associated records' && !force) {
          setLoading(false);
          // Set custom error with action button
          setError("This user has associated records. Delete anyway?");
          return; // Stop here and wait for user decision
        }
        
        throw new Error(data.error || "Failed to delete user");
      }

      // Remove user from state
      setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      toast.success("User deleted successfully");
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const columns: Column[] = [
    {
      header: "No",
      accessor: (user: User) => {
        const index = filteredUsers.indexOf(user);
        return index + 1;
      },
    },
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Email",
      accessor: "email",
    },
    {
      header: "Role",
      accessor: "role",
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
            onClick={() => {
              setSelectedUser(user);
              setIsDeleteModalOpen(true);
            }}
            className="text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  if (loading && users.length === 0) {
    return (
      <Layout>
        <div className="p-2 text-center">Loading users...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-2 p-2">
        <h1 className="text-lg md:text-xl text-gray-700 mb-2">
          Users Management
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 mb-2 rounded relative">
            <span className="block sm:inline">{error}</span>
            <button 
              className="absolute top-0 bottom-0 right-0 px-4 py-2"
              onClick={() => setError("")}
            >
              &times;
            </button>
          </div>
        )}

        {users.length === 0 && !loading ? (
          <div className="text-center py-4 text-gray-500">No users found</div>
        ) : (
          <div className="overflow-x-auto -mx-2 px-2">
            <Table
              columns={columns}
              data={currentUsers}
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredUsers.length}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Add User Modal */}
        {isModalOpen && (
          <Modal onClose={() => setIsModalOpen(false)}>
            <h2 className="text-base font-semibold mb-2 text-gray-700">
              Add New User
            </h2>
            <form onSubmit={handleSubmit} className="space-y-2">
              <div>
                <label className="block mb-1 text-xs text-gray-700">Username</label>
                <input
                  type="text"
                  name="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-2 py-1 text-xs rounded border border-gray-300 text-gray-700"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Role</label>
                <select
                  name="jobTitle"
                  value={newUser.jobTitle}
                  onChange={(e) => setNewUser({ ...newUser, jobTitle: e.target.value })}
                  className="w-full px-2 py-1 text-xs rounded border border-gray-300 text-gray-700"
                  required
                >
                  <option value="">Select Role</option>
                  {uniqueRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-xs text-gray-700">Password</label>
                <input
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-2 py-1 text-xs rounded border border-gray-300 text-gray-700"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="gray"
                  size="small"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs px-2 py-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  type="submit"
                  disabled={loading}
                  className="text-xs px-2 py-1"
                >
                  {loading ? "Adding..." : "Add User"}
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Edit User Modal */}
        {isEditModalOpen && (
          <Modal onClose={() => setIsEditModalOpen(false)}>
            <h2 className="text-base font-semibold mb-2 text-gray-700">
              Edit User
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-2">
              <div>
                <label className="block text-xs text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-2 py-1 text-xs rounded border border-gray-300 text-gray-700"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Role</label>
                <select
                  name="jobTitle"
                  value={newUser.jobTitle}
                  onChange={(e) => setNewUser({ ...newUser, jobTitle: e.target.value })}
                  className="w-full px-2 py-1 text-xs rounded border border-gray-300 text-gray-700"
                  required
                  disabled={loading}
                >
                  <option value="">Select Role</option>
                  {uniqueRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">New Password (Optional)</label>
                <input
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-2 py-1 text-xs rounded border border-gray-300 text-gray-700"
                  placeholder="Leave empty to keep current password"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty to keep current password</p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="gray"
                  size="small"
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-xs px-2 py-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  type="submit"
                  className="text-xs px-2 py-1"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && selectedUser && (
          <Modal onClose={() => setIsDeleteModalOpen(false)}>
            <h2 className="text-base font-semibold text-gray-700">Delete User</h2>
            <p className="text-xs text-gray-600 mt-2">
              Are you sure you want to delete user <span className="font-semibold">{selectedUser.name}</span>?
            </p>
            {error && error.includes("associated records") && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 mt-2 rounded text-xs">
                <p>Warning: This user has associated records. Force deletion may cause data inconsistency.</p>
              </div>
            )}
            <div className="flex justify-end mt-3 gap-2">
              <Button
                variant="gray"
                size="small"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-xs px-2 py-1"
                disabled={loading}
              >
                Cancel
              </Button>
              {error && error.includes("associated records") ? (
                <Button
                  variant="red"
                  size="small"
                  onClick={() => handleDelete(true)}
                  className="text-xs px-2 py-1"
                  disabled={loading}
                >
                  Force Delete
                </Button>
              ) : (
                <Button
                  variant="red"
                  size="small"
                  onClick={() => handleDelete()}
                  className="text-xs px-2 py-1"
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete"}
                </Button>
              )}
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

export default UserPage;
