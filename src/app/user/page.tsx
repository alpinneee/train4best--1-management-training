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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [newUser, setNewUser] = useState({
    username: "",
    idUser: "",
    jobTitle: "",
    password: "password123",
  });

  const itemsPerPage = 10;

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/user");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Gagal mengambil data user");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: newUser.username,
          idUser: newUser.idUser,
          jobTitle: newUser.jobTitle, // jobTitle akan digunakan sebagai role
          password: newUser.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menambah user");
      }

      // Refresh user list
      await fetchUsers();
      
      // Reset form
      setNewUser({
        username: "",
        idUser: "",
        jobTitle: "",
        password: "password123",
      });
      
      setIsModalOpen(false);
      toast.success("User berhasil ditambahkan");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const roles = ["all", "super_admin", "instructor", "participant"];

  const filteredUsers =
    selectedRole === "all"
      ? users
      : users.filter((user) => user.role === selectedRole);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value);
    setCurrentPage(1);
  };

  const columns: Column[] = [
    {
      header: "No",
      accessor: (user: User) => {
        const index = users.indexOf(user);
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

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setNewUser({
      username: user.name,
      idUser: "",
      jobTitle: user.role,
      password: "password123",
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
          password: newUser.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengupdate user");
      }

      // Refresh user list
      await fetchUsers();
      
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setNewUser({
        username: "",
        idUser: "",
        jobTitle: "",
        password: "password123",
      });
      
      toast.success("User berhasil diupdate");
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/user/${selectedUser.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal menghapus user");
      }

      // Refresh user list
      await fetchUsers();
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      toast.success("User berhasil dihapus");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-2 p-2">
        <h1 className="text-lg md:text-xl text-gray-700 mb-2">
          Users Management
        </h1>

        <div className="mb-2 flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button
            variant="primary"
            size="small"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto"
          >
            Add New User
          </Button>

          <div className="flex flex-col sm:flex-row gap-2 text-gray-700 w-full sm:w-auto">
            <select
              value={selectedRole}
              onChange={handleRoleChange}
              className="px-2 py-1 text-xs rounded-lg w-full sm:w-auto"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role === "all" ? "All Roles" : role}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search..."
              className="px-2 py-1 text-xs rounded-lg w-full sm:w-auto"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm mb-2">
            {error}
          </div>
        )}

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
                  className="w-full px-2 py-1 text-xs rounded border border-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 text-xs text-gray-700">ID User</label>
                <input
                  type="text"
                  name="idUser"
                  value={newUser.idUser}
                  onChange={(e) => setNewUser({ ...newUser, idUser: e.target.value })}
                  className="w-full px-2 py-1 text-xs rounded border border-gray-300"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Role</label>
                <select
                  name="jobTitle"
                  value={newUser.jobTitle}
                  onChange={(e) => setNewUser({ ...newUser, jobTitle: e.target.value })}
                  className="w-full px-2 py-1 text-xs rounded border border-gray-300"
                  required
                >
                  <option value="">Select Role</option>
                  {roles
                    .filter((role) => role !== "all")
                    .map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                </select>
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
            {error && (
              <div className="text-red-500 text-sm mb-2">
                {error}
              </div>
            )}
            <form onSubmit={handleEditSubmit} className="space-y-2">
              <div>
                <label className="block text-xs text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-2 py-1 text-xs rounded border border-gray-300"
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
                  className="w-full px-2 py-1 text-xs rounded border border-gray-300"
                  required
                  disabled={loading}
                >
                  <option value="">Select Role</option>
                  {roles
                    .filter((role) => role !== "all")
                    .map((role) => (
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
                  className="w-full px-2 py-1 text-xs rounded border border-gray-300"
                  placeholder="Leave unchanged to keep current password"
                  disabled={loading}
                />
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
        {isDeleteModalOpen && (
          <Modal onClose={() => setIsDeleteModalOpen(false)}>
            <h2 className="text-base font-semibold text-gray-700">Delete User</h2>
            <p className="text-xs text-gray-600 mt-2">
              Apakah Anda yakin ingin menghapus user ini?
            </p>
            <div className="flex justify-end mt-3 gap-2">
              <Button
                variant="gray"
                size="small"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-xs px-2 py-1"
              >
                Cancel
              </Button>
              <Button
                variant="red"
                size="small"
                onClick={handleDelete}
                className="text-xs px-2 py-1"
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
