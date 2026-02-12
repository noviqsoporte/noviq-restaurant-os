import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  CalendarCheck,
  ShoppingBag,
  Package,
  ArrowLeftRight,
  BarChart3,
  CheckSquare,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/reservas', label: 'Reservas', icon: CalendarCheck },
  { href: '/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/inventario', label: 'Inventario', icon: Package },
  { href: '/movimientos', label: 'Movimientos', icon: ArrowLeftRight },
  { href: '/ventas', label: 'Ventas', icon: BarChart3 },
  { href: '/tareas', label: 'Tareas', icon: CheckSquare },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const isActive = (href) => {
    if (href === '/') return router.pathname === '/';
    return router.pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-dark-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-dark-800 border-r border-dark-400
          flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-dark-400">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="NOVIQ" className="w-11 h-11 rounded-lg object-contain" />
            <div>
              <h1 className="text-sm font-bold tracking-wide text-white">NOVIQ</h1>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase">Restaurant OS</p>
            </div>
          </div>
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200 group
                  ${active
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white hover:bg-dark-600'
                  }
                `}
                style={active ? { background: 'rgba(201,149,44,0.1)', color: 'var(--gold-light)' } : {}}
              >
                <Icon size={18} className={active ? '' : 'text-gray-500 group-hover:text-gray-300'} style={active ? { color: 'var(--gold)' } : {}} />
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-dark-400">
          <p className="text-[10px] text-gray-600 text-center">© 2026 NOVIQ</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 flex items-center justify-between px-5 border-b border-dark-400 bg-dark-800/80 backdrop-blur-sm shrink-0">
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="hidden lg:block">
            <h2 className="text-sm font-semibold text-white">
              {navItems.find((n) => isActive(n.href))?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(201,149,44,0.2)', color: 'var(--gold-light)' }}>
              RC
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
