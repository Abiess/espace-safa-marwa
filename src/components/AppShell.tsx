import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Upload, FileText, ShoppingBag, Settings, Menu, X, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  icon: ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  { to: '/', icon: <Home size={20} />, label: 'Dashboard' },
  { to: '/vendors', icon: <ShoppingBag size={20} />, label: 'Vendors' },
  { to: '/products', icon: <FileText size={20} />, label: 'Products' },
  { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
];

interface AppShellProps {
  children: ReactNode;
  onUpload?: () => void;
}

export function AppShell({ children, onUpload }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 h-16 bg-background border-b z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          <h1 className="text-xl font-bold">Receipt Manager</h1>
        </div>

        <div className="flex items-center gap-2">
          {onUpload && (
            <Button onClick={onUpload} size="sm" className="gap-2">
              <Upload size={16} />
              <span className="hidden sm:inline">Upload</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </div>
      </div>

      <div
        className={cn(
          'fixed top-16 left-0 bottom-0 w-64 bg-background border-r z-30 transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                location.pathname === item.to
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="pt-16 lg:pl-64">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
