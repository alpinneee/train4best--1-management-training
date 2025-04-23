"use client";

import React, { useState } from "react";
import type { ReactElement } from "react";
import Button from "@/components/common/button";
import Modal from "@/components/common/Modal";
import Layout from "@/components/common/Layout";
import Table from "@/components/common/table";

interface Rule {
  no: number;
  roleName: string;
  description: string;
  status: "Active" | "Inactive";
}

interface Column {
  header: string;
  accessor: keyof Rule | ((data: Rule) => React.ReactNode);
}

export default function UserRulePage(): ReactElement {
  const userRules: Rule[] = [
    {
      no: 1,
      roleName: "Super Admin",
      description: "Full access to all features",
      status: "Active",
    },
    {
      no: 2,
      roleName: "Admin",
      description: "Manage users and content",
      status: "Active",
    },
    {
      no: 3,
      roleName: "Manager",
      description: "View reports and manage team",
      status: "Active",
    },
    {
      no: 4,
      roleName: "Staff",
      description: "Basic access to system",
      status: "Active",
    },
    {
      no: 5,
      roleName: "Guest",
      description: "Limited view access",
      status: "Inactive",
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    roleName: "",
    description: "",
    status: "Active" as "Active" | "Inactive",
  });

  const handleEditClick = (rule: Rule) => {
    setNewRule({
      roleName: rule.roleName,
      description: rule.description,
      status: rule.status,
    });
    setIsEditModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewRule((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    setNewRule({
      roleName: "",
      description: "",
      status: "Active",
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditModalOpen(false);
    setNewRule({
      roleName: "",
      description: "",
      status: "Active",
    });
  };

  const columns: Column[] = [
    {
      header: "No",
      accessor: "no",
    },
    {
      header: "Role Name",
      accessor: "roleName",
    },
    {
      header: "Description", 
      accessor: "description",
    },
    {
      header: "Status",
      accessor: (rule) => (
        <span
          className={`px-1.5 py-0.5 rounded text-xs ${
            rule.status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {rule.status}
        </span>
      ),
    },
    {
      header: "Action",
      accessor: (rule) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditClick(rule)}
            className="text-blue-600 hover:text-blue-800 text-xs"
          >
            Edit
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-red-500 hover:text-red-700 text-xs"
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
          User Rules
        </h1>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-2">
          <Button
            variant="primary"
            size="small"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto text-xs"
          >
            Add New Rule
          </Button>
          <input
            type="text"
            placeholder="Search..."
            className="px-2 py-1 text-xs border rounded-lg w-full sm:w-auto"
          />
        </div>

        <div className="overflow-x-auto -mx-2 px-2">
          <Table columns={columns} data={userRules} />
        </div>

        {/* Add Rule Modal */}
        {isModalOpen && (
          <Modal onClose={() => setIsModalOpen(false)}>
            <h2 className="text-base font-semibold mb-2 text-gray-700">
              Add New Rule
            </h2>
            <form onSubmit={handleSubmit} className="space-y-2">
              <div>
                <label className="block text-xs text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  name="roleName"
                  value={newRule.roleName}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  name="description"
                  value={newRule.description}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={newRule.status}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
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
                  className="text-xs px-2 py-1"
                >
                  Add Rule
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Edit Rule Modal */}
        {isEditModalOpen && (
          <Modal onClose={() => setIsEditModalOpen(false)}>
            <h2 className="text-base font-semibold mb-2 text-gray-700">
              Edit Rule
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-2">
              <div>
                <label className="block text-xs text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  name="roleName"
                  value={newRule.roleName}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  name="description"
                  value={newRule.description}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={newRule.status}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
            <h2 className="text-base font-semibold text-gray-700">Delete Rule</h2>
            <p className="text-xs text-gray-600 mt-2">
              Apakah Anda yakin ingin menghapus rule ini?
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
}
