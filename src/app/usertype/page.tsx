"use client";

import React, { useState } from "react";
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
  idUsertype: string;
  usertype: string;
}

interface Column {
  header: string;
  accessor: keyof User | ((data: User) => React.ReactNode);
}

const UserPage = (): ReactElement => {
  const usertype: User[] = [
    { no: 1, idUsertype: "UT001", usertype: "Admin" },
    { no: 2, idUsertype: "UT002", usertype: "Instructor" },
    { no: 3, idUsertype: "UT003", usertype: "Student" },
    { no: 4, idUsertype: "UT004", usertype: "Staff" },
    { no: 5, idUsertype: "UT005", usertype: "Manager" },
    { no: 6, idUsertype: "UT006", usertype: "Supervisor" },
    { no: 7, idUsertype: "UT007", usertype: "Coordinator" },
    { no: 8, idUsertype: "UT008", usertype: "Assistant" },
    { no: 9, idUsertype: "UT009", usertype: "Guest" },
    { no: 10, idUsertype: "UT010", usertype: "Viewer" },
  ];

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedUsertype, setSelectedUsertype] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [newUser, setNewUser] = useState<NewUser>({
    idUsertype: "",
    usertype: "",
  });
  const itemsPerPage = 10;

  const usertypes = ["all", ...new Set(usertype.map((user) => user.usertype))];

  const filteredUsers =
    selectedUsertype === "all"
      ? usertype
      : usertype.filter((user) => user.usertype === selectedUsertype);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handleUsertypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedUsertype(e.target.value);
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
    setNewUser({
      idUsertype: user.idUsertype,
      usertype: user.usertype,
    });
    setIsEditModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    setIsModalOpen(false);
    setNewUser({
      idUsertype: "",
      usertype: "",
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle edit form submission logic here
    setIsEditModalOpen(false);
    setNewUser({
      idUsertype: "",
      usertype: "",
    });
  };

  const columns: Column[] = [
    { header: "No", accessor: "no" },
    { header: "ID Usertype", accessor: "idUsertype" },
    { header: "Usertype", accessor: "usertype" },
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
      <div className="p-2">
        <h1 className="text-lg md:text-xl text-gray-700 mb-2">
          UserType
        </h1>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-2">
          <Button
            variant="primary"
            size="small"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto text-xs"
          >
            Add New Usertype
          </Button>

          <div className="flex flex-col sm:flex-row gap-2 text-gray-700 w-full sm:w-auto">
            <select
              value={selectedUsertype}
              onChange={handleUsertypeChange}
              className="px-2 py-1 text-xs border rounded-lg w-full sm:w-auto"
            >
              {usertypes.map((type) => (
                <option key={type} value={type}>
                  {type === "all" ? "All Usertypes" : type}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search..."
              className="px-2 py-1 text-xs border rounded-lg w-full sm:w-auto"
            />
          </div>
        </div>

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

        {/* Add Usertype Modal */}
        {isModalOpen && (
          <Modal onClose={() => setIsModalOpen(false)}>
            <h2 className="text-base font-semibold mb-2 text-gray-700">
              Add New Usertype
            </h2>
            <form onSubmit={handleSubmit} className="space-y-2">
              <div>
                <label className="block text-xs text-gray-700 mb-1">ID Usertype</label>
                <input
                  type="text"
                  name="idUsertype"
                  value={newUser.idUsertype}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Usertype</label>
                <input
                  type="text"
                  name="usertype"
                  value={newUser.usertype}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  className="text-xs px-2 py-1"
                >
                  Add Usertype
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Edit Usertype Modal */}
        {isEditModalOpen && (
          <Modal onClose={() => setIsEditModalOpen(false)}>
            <h2 className="text-base font-semibold mb-2 text-gray-700">
              Edit Usertype
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-2">
              <div>
                <label className="block text-xs text-gray-700 mb-1">ID Usertype</label>
                <input
                  type="text"
                  name="idUsertype"
                  value={newUser.idUsertype}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Usertype</label>
                <input
                  type="text"
                  name="usertype"
                  value={newUser.usertype}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="gray"
                  size="small"
                  onClick={() => setIsEditModalOpen(false)}
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
                  Save Changes
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && (
          <Modal onClose={() => setIsDeleteModalOpen(false)}>
            <h2 className="text-base font-semibold text-gray-700">Delete Usertype</h2>
            <p className="text-xs text-gray-600 mt-2">
              Apakah Anda yakin ingin menghapus usertype ini?
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
                onClick={() => setIsDeleteModalOpen(false)}
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
