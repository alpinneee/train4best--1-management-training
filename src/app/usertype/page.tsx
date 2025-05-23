"use client";

import React, { useState, useEffect } from "react";
import Layout from "@/components/common/Layout";
import Button from "@/components/common/button";
import Modal from "@/components/common/Modal";
import Table from "@/components/common/table";
import type { ReactElement } from "react";

interface User {
  no: number;
  idUsertype: string;
  usertype: string;
}

interface NewUser {
  idUsertype?: string; // Made optional for creating new usertypes
  usertype: string;
}

interface Column {
  header: string;
  accessor: keyof User | ((data: User) => React.ReactNode);
}

// API functions
const fetchUsertypesAPI = async (): Promise<User[]> => {
  try {
    const response = await fetch("/api/usertype");
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();

    // Tangani format respons baru yang mengembalikan objek dengan properti formattedUserTypes
    if (data.formattedUserTypes) {
      return data.formattedUserTypes;
    } else if (Array.isArray(data)) {
      // Tangani format lama untuk kompatibilitas
      return data;
    } else {
      throw new Error("Unexpected API response format");
    }
  } catch (error) {
    console.error("Failed to fetch usertypes:", error);
    throw error;
  }
};

const addUsertypeAPI = async (newUser: NewUser): Promise<User> => {
  try {
    const response = await fetch("/api/usertype", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ usertype: newUser.usertype }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error: ${response.status}`);
    }

    const data = await response.json();

    // Format respons untuk struktur User
    return {
      no: 0, // Akan diatur dengan benar saat menambahkan ke state
      idUsertype: data.id || data.idUsertype,
      usertype: data.usertype,
    };
  } catch (error) {
    console.error("Failed to add usertype:", error);
    throw error;
  }
};

const editUsertypeAPI = async (
  idUsertype: string,
  updatedUser: NewUser
): Promise<User> => {
  try {
    const response = await fetch(`/api/usertype/${idUsertype}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ usertype: updatedUser.usertype }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error: ${response.status}`);
    }

    const data = await response.json();

    // Format respons untuk struktur User
    return {
      no: 0, // Akan dipertahankan dari state existing
      idUsertype: data.id || data.idUsertype || idUsertype,
      usertype: data.usertype,
    };
  } catch (error) {
    console.error("Failed to update usertype:", error);
    throw error;
  }
};

const deleteUsertypeAPI = async (idUsertype: string): Promise<void> => {
  try {
    const response = await fetch(`/api/usertype/${idUsertype}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to delete usertype:", error);
    throw error;
  }
};

const UserPage = (): ReactElement => {
  const [usertypeData, setUsertypeData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedUsertype, setSelectedUsertype] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [newUser, setNewUser] = useState<NewUser>({
    idUsertype: "",
    usertype: "",
  });
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null); // Add error state
  const [searchTerm, setSearchTerm] = useState<string>(""); // Add search state
  const itemsPerPage = 10;

  // Fetch initial data
  useEffect(() => {
    const loadUsertypes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchUsertypesAPI();
        setUsertypeData(data);
      } catch (error) {
        console.error("Failed to fetch usertypes:", error);
        setError("Failed to load usertypes. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    loadUsertypes();
  }, []);

  const usertypes = [
    "all",
    ...new Set(usertypeData.map((user) => user.usertype)),
  ];

  // Filter by selected usertype and search term
  const filteredUsers = usertypeData
    .filter(
      (user) => selectedUsertype === "all" || user.usertype === selectedUsertype
    )
    .filter(
      (user) =>
        searchTerm === "" ||
        user.usertype.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.idUsertype.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handleUsertypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUsertype(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
    setUserToEdit(user);
    setNewUser({
      idUsertype: user.idUsertype,
      usertype: user.usertype,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const addedUser = await addUsertypeAPI(newUser);
      setUsertypeData((prev) => [
        ...prev,
        { ...addedUser, no: prev.length + 1 },
      ]);
      setIsModalOpen(false);
      setNewUser({ idUsertype: "", usertype: "" });
    } catch (error) {
      console.error("Failed to add usertype:", error);
      setError("Failed to add usertype. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;

    setIsLoading(true);
    setError(null);

    try {
      const updatedUser = await editUsertypeAPI(userToEdit.idUsertype, newUser);
      setUsertypeData((prev) =>
        prev.map((user) =>
          user.idUsertype === userToEdit.idUsertype
            ? { ...updatedUser, no: user.no }
            : user
        )
      );
      setIsEditModalOpen(false);
      setUserToEdit(null);
      setNewUser({ idUsertype: "", usertype: "" });
    } catch (error) {
      console.error("Failed to update usertype:", error);
      setError("Failed to update usertype. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setIsLoading(true);
    setError(null);

    try {
      await deleteUsertypeAPI(userToDelete.idUsertype);
      setUsertypeData((prev) =>
        prev.filter((user) => user.idUsertype !== userToDelete.idUsertype)
      );
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Failed to delete usertype:", error);
      setError("Failed to delete usertype. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column[] = [
    { header: "No", accessor: "no" },
    { header: "ID", accessor: "idUsertype" },
    { header: "User Type", accessor: "usertype" },
    {
      header: "Actions",
      accessor: (user) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEditClick(user)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteClick(user)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">User Types</h1>
          <Button onClick={() => setIsModalOpen(true)}>Add User Type</Button>
        </div>

        <div className="flex gap-4 mb-4">
          <select
            value={selectedUsertype}
            onChange={handleUsertypeChange}
            className="border rounded p-2"
          >
            {usertypes.map((type) => (
              <option key={type} value={type}>
                {type === "all" ? "All Types" : type}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search user types..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="border rounded p-2 flex-grow"
          />
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <Table
            columns={columns}
            data={currentUsers}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Add User Type Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add User Type"
        >
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-2">User Type</label>
              <input
                type="text"
                name="usertype"
                value={newUser.usertype}
                onChange={handleInputChange}
                className="border rounded p-2 w-full"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add User Type"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit User Type Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit User Type"
        >
          <form onSubmit={handleEditSubmit}>
            <div className="mb-4">
              <label className="block mb-2">User Type</label>
              <input
                type="text"
                name="usertype"
                value={newUser.usertype}
                onChange={handleInputChange}
                className="border rounded p-2 w-full"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update User Type"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete User Type Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete User Type"
        >
          <p>Are you sure you want to delete this user type?</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default UserPage;
