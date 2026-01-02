'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserInfo, logout, checkAuth, getAuthToken } from '@/lib/api/auth';
import { ChevronDown, User, LogOut, Settings, FileText } from 'lucide-react';
import type { UserResponse } from '@/lib/api/auth';

export default function UserMenu(): React.ReactElement {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const userInfo = getUserInfo();
      const token = getAuthToken();

      if (userInfo && token) {
        // Verify token is still valid
        try {
          const authStatus = await checkAuth(token);
          if (authStatus.authenticated && authStatus.user) {
            setUser(authStatus.user);
            setIsGuest(false);
          } else {
            // Token invalid, user as guest
            setUser(null);
            setIsGuest(true);
          }
        } catch {
          setUser(null);
          setIsGuest(true);
        }
      } else {
        // No auth, user is guest
        setUser(null);
        setIsGuest(true);
      }
    }
    loadUser();
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsGuest(true);
    setIsOpen(false);
    router.push('/');
  };

  const handleLogin = () => {
    setIsOpen(false);
    router.push('/login');
  };

  const displayName = user ? user.name : 'Guest';
  const displayEmail = user ? user.email : 'Not logged in';

  return (
    <div className="relative text-sm">
      <button
        type="button"
        onClick={handleToggle}
        className="inline-flex items-center gap-2 rounded-md border border-blue-500/50 bg-blue-600/20 px-3 py-2 text-blue-100 transition hover:bg-blue-600/40 hover:text-white"
      >
        <User className="h-4 w-4" />
        <span className="font-semibold">{displayName}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={handleClose} aria-hidden="true" />
          <div className="absolute right-0 z-50 mt-2 w-64 rounded-md border border-gray-700 bg-gray-900/95 shadow-xl backdrop-blur">
            {/* User Info Section */}
            <div className="border-b border-gray-800 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/30 text-blue-300">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                  <p className="text-xs text-gray-400 truncate">{displayEmail}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {!isGuest ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      router.push('/precheck');
                    }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/70 hover:text-white transition"
                  >
                    <FileText className="h-4 w-4" />
                    <span>My Resumes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      router.push('/dashboard');
                    }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-gray-800/70 hover:text-white transition"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-400 hover:bg-gray-800/70 hover:text-red-300 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleLogin}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-blue-400 hover:bg-gray-800/70 hover:text-blue-300 transition"
                >
                  <User className="h-4 w-4" />
                  <span>Login / Sign Up</span>
                </button>
              )}
            </div>

            {/* Footer Note */}
            {isGuest && (
              <div className="border-t border-gray-800 p-3">
                <p className="text-xs text-gray-500 text-center">Login to save your progress</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
