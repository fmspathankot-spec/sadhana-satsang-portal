'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Users, 
  MapPin, 
  Calendar, 
  FileText, 
  UserPlus,
  Menu,
  X,
  LogOut,
  CheckSquare
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const navigation = [
  { name: 'होम', href: '/', icon: Home },
  { name: 'साधक पंजीकरण', href: '/registration', icon: UserPlus },
  { name: 'साधकों की सूची', href: '/sadhaks', icon: Users },
  { name: 'स्वीकृत सूची', href: '/approved-list', icon: CheckSquare },
  { name: 'सत्संग प्रबंधन', href: '/events', icon: Calendar },
  { name: 'स्थान प्रबंधन', href: '/places', icon: MapPin },
  { name: 'रिपोर्ट', href: '/reports', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('लॉगआउट सफल!');
        router.push('/login');
      } else {
        toast.error('लॉगआउट में त्रुटि');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('लॉगआउट में त्रुटि');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-orange-600 text-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-gradient-to-b from-orange-600 to-orange-700 text-white
          transition-transform duration-300 ease-in-out z-40
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:w-64 w-64
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-orange-500">
          <h1 className="text-2xl font-bold text-center">
            🙏 श्री राम शरणम्
          </h1>
          <p className="text-xs text-orange-100 text-center mt-2">
            साधना सत्संग प्रबंधन
          </p>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${
                    isActive
                      ? 'bg-white text-orange-600 shadow-lg font-semibold'
                      : 'text-orange-50 hover:bg-orange-500 hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-orange-50 hover:bg-red-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            <LogOut className="w-5 h-5" />
            <span>{loggingOut ? 'लॉगआउट हो रहा है...' : 'लॉगआउट'}</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-orange-500">
          <div className="text-xs text-orange-100 space-y-1">
            <p className="font-semibold">संपर्क:</p>
            <p>📞 0186-2224242</p>
            <p>📱 9872035936</p>
            <p className="text-center mt-3 text-orange-200">
              श्री राम जय राम
            </p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}