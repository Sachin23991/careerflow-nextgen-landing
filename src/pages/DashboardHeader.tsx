import { Bell, Settings, User, Sun, Moon } from 'lucide-react';
interface DashboardHeaderProps {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
}

export default function DashboardHeader({ theme, setTheme }: DashboardHeaderProps) {
  return (
    <header className="fixed top-0 right-0 left-64 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-10">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back!</h2>
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">Let's achieve your career goals today</p>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
            <Bell size={20} className="text-gray-700 dark:text-gray-200" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
            <Settings size={20} className="text-gray-700 dark:text-gray-200" />
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            {theme === 'dark' ? <Sun size={18} className="text-gray-700 dark:text-gray-200" /> : <Moon size={18} className="text-gray-700 dark:text-gray-200" />}
          </button>

          <button className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
            <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center">
              <User size={16} className="text-white dark:text-gray-900" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">Profile</span>
          </button>
        </div>
      </div>
    </header>
  );
}
