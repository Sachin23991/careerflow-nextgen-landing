import { Home, MessageSquare, FileText, Search, Award, BookOpen, GraduationCap, Users } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'chatbot', label: 'Career Assistant', icon: MessageSquare },
    { id: 'resume-builder', label: 'Resume Builder', icon: FileText },
    { id: 'resume-analyzer', label: 'Resume Analyzer', icon: Search },
    { id: 'job-finder', label: 'Job Finder', icon: Award },
    { id: 'scholarship-finder', label: 'Scholarship Finder', icon: Award },
    { id: 'course-recommender', label: 'Course Recommender', icon: BookOpen },
    { id: 'college-finder', label: 'College Finder', icon: GraduationCap },
    { id: 'mentorship', label: 'Mentorship', icon: Users },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-30">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Career Flow</h1>
        <p className="text-sm text-gray-500 mt-1">Your Career Companion</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200 group ${
                isActive
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon size={20} className={`transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600">Need help?</p>
          <button className="text-sm text-gray-900 font-medium mt-1 hover:underline">
            Contact Support
          </button>
        </div>
      </div>
    </aside>
  );
}
