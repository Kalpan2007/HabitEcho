'use client';

import { useTransition } from 'react';
import { logoutAction } from '@/actions/auth.actions';
import { useToast, Logo } from '@/components/ui';
import type { User } from '@/types';

// ============================================
// HEADER - Client Component for logout action
// ============================================

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  const [isPending, startTransition] = useTransition();
  const { info } = useToast();

  const handleLogout = () => {
    info('Logging out...', 'You will be redirected to the login page');
    startTransition(() => {
      logoutAction();
    });
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Mobile logo */}
          <div className="flex items-center lg:hidden">
            <Logo size={32} />
          </div>

          {/* Empty div for spacing on desktop */}
          <div className="hidden lg:flex lg:items-center" />

          {/* User menu */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>

            {/* User avatar */}
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-sm font-medium text-indigo-600">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="p-2 text-gray-400 hover:text-gray-500 transition-colors disabled:opacity-50"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
