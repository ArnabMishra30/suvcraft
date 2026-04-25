'use client';

import { useState } from 'react';
import Sidebar from './sidebar';
import Topbar from './topbar';
import RouteLoader from './route-loader';

export default function AdminShell({ user, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 lg:flex">
      <RouteLoader />
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar user={user} onMenuClick={() => setOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}