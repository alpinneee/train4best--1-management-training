"use client";

import React from "react";
import { FC, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell } from "lucide-react";

interface NavbarProps {
  onMobileMenuClick: () => void;
}

const Navbar: FC<NavbarProps> = ({ onMobileMenuClick }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <nav className="bg-[#362d98] text-white py-2 mx-4 rounded-2xl shadow-lg ">
      <div className="container mx-auto px-3">
        <div className="flex items-center justify-between">
          {/* Bagian kiri - Menu & Logo */}
          <div className="flex items-center gap-3">
            {/* Tombol Menu */}
            <button
              onClick={onMobileMenuClick}
              className="lg:hidden p-1.5 hover:bg-indigo-700 rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/img/LogoT4B.png"
                alt="Train4best Logo"
                width={100}
                height={16}
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/application" className="hover:text-gray-200 text-sm">
              Application
            </Link>
            <Link href="/dashboard" className="hover:text-gray-200 text-sm">
              Dashboard
            </Link>
          </div>

          {/* Right Side - Notifications & Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative hover:text-gray-200">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-3.5 h-3.5 flex items-center justify-center text-[10px]">
                2
              </span>
            </button>

            {/* Profile with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <Image
                  src="/img/profile.png"
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-[#362d98] rounded-lg shadow-lg overflow-hidden z-50">
                  <div className="px-3 py-2 border-b border-indigo-600/30">
                    <p className="font-semibold text-sm">John Deo</p>
                    <p className="text-xs text-gray-300">Frontend Engineer</p>
                  </div>

                  <Link
                    href="/profile"
                    className="flex items-center px-3 py-2 hover:bg-indigo-600/30 border-b border-indigo-600/30"
                  >
                    <span className="text-sm">Profile</span>
                  </Link>

                  <Link
                    href="/add-account"
                    className="flex items-center px-3 py-2 hover:bg-indigo-600/30 border-b border-indigo-600/30"
                  >
                    <span className="text-sm">Add Account</span>
                  </Link>

                  <Link
                    href="/reset-password"
                    className="flex items-center px-3 py-2 hover:bg-indigo-600/30 border-b border-indigo-600/30"
                  >
                    <span className="text-sm">Reset Password</span>
                  </Link>

                  <Link
                    href="/help"
                    className="flex items-center px-3 py-2 hover:bg-indigo-600/30 border-b border-indigo-600/30"
                  >
                    <span className="text-sm">Help</span>
                  </Link>

                  <button className="flex items-center w-full px-3 py-2 hover:bg-indigo-600/30 text-left">
                    <span className="text-sm">Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
