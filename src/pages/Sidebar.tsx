import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, MessageSquare, FileText, Search, Award, BookOpen, GraduationCap, Users } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [logoHover, setLogoHover] = useState(false);
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'chatbot', label: 'Sancara AI', icon: MessageSquare },
    { id: 'resume-builder', label: 'Resume Builder', icon: FileText },
    { id: 'resume-analyzer', label: 'Resume Analyzer', icon: Search },
    { id: 'job-finder', label: 'Job Finder', icon: Award },
    { id: 'scholarship-finder', label: 'Scholarship Finder', icon: Award },
    { id: 'course-recommender', label: 'Course Recommender', icon: BookOpen },
    { id: 'college-finder', label: 'College Finder', icon: GraduationCap },
    { id: 'mentorship', label: 'Mentorship', icon: Users },
  ];

  // map menu ids to app routes; add routes as needed
  const routeFor = (id: string) => {
    const map: Record<string, string | null> = {
      'dashboard': '/',
      // corrected path for Sancara AI / Career Assistant
      'chatbot': '/career-assistant',
      'resume-builder': '/resume-builder',
      'resume-analyzer': '/resume-analyzer',
      'job-finder': '/job-finder',
      'scholarship-finder': '/scholarship-finder',
      'course-recommender': '/course-recommender',
      'college-finder': '/college-finder',
      'mentorship': '/mentorship',
    };
    return map[id] ?? null;
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col transition-all duration-300 z-30">
      <div
        className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3"
        onMouseEnter={() => setLogoHover(true)}
        onMouseLeave={() => setLogoHover(false)}
      >
        {/* logo from public folder - spins continuously while hovered or focused */}
        <img
          src="/logo.png"
          alt="Career Flow Logo"
          tabIndex={0}
          onFocus={() => setLogoHover(true)}
          onBlur={() => setLogoHover(false)}
          className={`w-10 h-10 rounded-md object-contain transform ${logoHover ? 'animate-spin' : ''}`}
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Career Flow</h1>
          <p className="text-sm text-gray-500 mt-1 dark:text-slate-400">Your Career Companion</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const href = routeFor(item.id);
          const commonClass = `w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200 group ${
            isActive
              ? 'bg-gray-900 text-white shadow-md dark:bg-slate-700 dark:text-white'
              : 'text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800'
          }`;

          // If a route exists for the item, use react-router Link for client-side navigation and still call onTabChange
          return href ? (
            <Link
              key={item.id}
              to={href}
              onClick={() => onTabChange(item.id)}
              className={commonClass}
            >
              <Icon
                size={20}
                className={`transition-transform duration-200 ${!isActive ? 'group-hover:scale-110' : ''} ${isActive ? 'text-white' : 'text-gray-700 dark:text-white'}`}
              />
              <span className={`font-medium text-sm ${isActive ? '' : 'text-gray-700 dark:text-white'}`}>{item.label}</span>
            </Link>
          ) : (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={commonClass}
            >
              <Icon
                size={20}
                className={`transition-transform duration-200 ${!isActive ? 'group-hover:scale-110' : ''} ${isActive ? 'text-white' : 'text-gray-700 dark:text-white'}`}
              />
              <span className={`font-medium text-sm ${isActive ? '' : 'text-gray-700 dark:text-white'}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
          <p className="text-xs text-gray-600 dark:text-white">Need help?</p>
          <button className="text-sm text-gray-900 dark:text-white font-medium mt-1 hover:underline">
            Contact Support
          </button>
        </div>
      </div>
    </aside>
  );
}
