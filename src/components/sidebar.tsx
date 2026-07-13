'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard, Users, ClipboardList, Bell, Activity,
  LogOut, Syringe, ChevronRight, LineChart, Package,
  MessageSquare, BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  // Patient & General
  { href: '/dashboard',          label: 'Dashboard',    icon: LayoutDashboard, allowedRoles: ['ADMIN', 'PROVIDER', 'PATIENT'] },
  { href: '/dashboard/labs',     label: 'My Labs',      icon: LineChart,       allowedRoles: ['ADMIN', 'PROVIDER', 'PATIENT'] },
  { href: '/dashboard/refills',  label: 'Prescriptions',icon: Package,         allowedRoles: ['ADMIN', 'PROVIDER', 'PATIENT'] },
  { href: '/dashboard/messages', label: 'Messages',     icon: MessageSquare,   allowedRoles: ['ADMIN', 'PROVIDER', 'PATIENT'] },
  { href: '/dashboard/resources',label: 'Resources',    icon: BookOpen,        allowedRoles: ['ADMIN', 'PROVIDER', 'PATIENT'] },
  
  // Admin & Provider specific
  { href: '/dashboard/patients', label: 'Patients',     icon: Users,           allowedRoles: ['ADMIN', 'PROVIDER'] },
  { href: '/dashboard/renewals', label: 'Rx Renewals',  icon: ClipboardList,   allowedRoles: ['ADMIN', 'PROVIDER'] },
  { href: '/dashboard/intake',   label: 'New Intake',   icon: Syringe,         allowedRoles: ['ADMIN', 'PROVIDER'] },
  { href: '/dashboard/reminders',label: 'Reminders',    icon: Bell,            allowedRoles: ['ADMIN', 'PROVIDER'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-56 min-h-screen bg-surface-50 border-r border-surface-300 flex flex-col shrink-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-surface-300">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-teal-500 flex items-center justify-center shadow shadow-teal-500/30 shrink-0">
            <Activity className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">TRT Clinic</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-4 space-y-0.5">
        {NAV.filter(nav => nav.allowedRoles.includes((session?.user as any)?.role ?? 'PATIENT')).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all group',
                active
                  ? 'bg-surface-300 text-white'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-surface-200/60'
              )}>
              <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-teal-400' : 'text-gray-600 group-hover:text-gray-400')} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 text-gray-500" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-2.5 py-4 border-t border-surface-300">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-teal-900 border border-teal-700 flex items-center justify-center text-[10px] font-bold text-teal-300 shrink-0">
            {session?.user?.name?.[0] ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-gray-300 truncate">{session?.user?.name ?? 'Provider'}</p>
            <p className="text-[10px] text-gray-600 truncate">{session?.user?.email}</p>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] text-gray-600 hover:text-red-400 hover:bg-red-950/30 transition-all">
          <LogOut className="w-3.5 h-3.5" /> Sign out
        </button>
      </div>
    </aside>
  );
}
