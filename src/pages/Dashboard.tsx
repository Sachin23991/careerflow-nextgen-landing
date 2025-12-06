import { useState, useEffect } from 'react';
import { MessageSquare, FileText, Search, Award, BookOpen, GraduationCap, Users, TrendingUp, Clock, Target } from 'lucide-react';
import FeatureCard, { StatCard } from '../components/FeatureCard';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

interface DashboardProps {
  onNavigate?: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Theme state persisted to localStorage and applied to the document root
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (onNavigate) onNavigate(tab);
  };

  const features = [
    {
      id: 'chatbot',
      icon: MessageSquare,
      title: 'Career Assistant',
      description: 'Get instant answers to all your career-related questions with AI-powered guidance',
      action: 'Start Chat',
      gradient: 'bg-blue-500',
    },
    {
      id: 'resume-builder',
      icon: FileText,
      title: 'Resume Builder',
      description: 'Create professional resumes with our easy-to-use builder and templates',
      action: 'Build Resume',
      gradient: 'bg-green-500',
    },
    {
      id: 'resume-analyzer',
      icon: Search,
      title: 'Resume Analyzer',
      description: 'Get detailed feedback and improvement suggestions for your resume',
      action: 'Analyze Now',
      gradient: 'bg-purple-500',
    },
    {
      id: 'job-finder',
      icon: Award,
      title: 'Job Finder',
      description: 'Discover job opportunities tailored to your skills and preferences',
      action: 'Find Jobs',
      gradient: 'bg-orange-500',
    },
    {
      id: 'scholarship-finder',
      icon: Award,
      title: 'Scholarship Finder',
      description: 'Find scholarships and funding opportunities for your education',
      action: 'Explore Scholarships',
      gradient: 'bg-yellow-500',
    },
    {
      id: 'course-recommender',
      icon: BookOpen,
      title: 'Course Recommender',
      description: 'Get personalized course recommendations to boost your career',
      action: 'Get Recommendations',
      gradient: 'bg-pink-500',
    },
    {
      id: 'college-finder',
      icon: GraduationCap,
      title: 'College Finder',
      description: 'Find the perfect college that matches your career aspirations',
      action: 'Search Colleges',
      gradient: 'bg-indigo-500',
    },
    {
      id: 'mentorship',
      icon: Users,
      title: 'Mentorship',
      description: 'Connect with experienced mentors for personalized career guidance',
      action: 'Find Mentor',
      gradient: 'bg-teal-500',
    },
  ];

  const stats = [
    { label: 'Career Goals', value: '3', icon: Target, trend: '+2 this month' },
    { label: 'Hours Learning', value: '24', icon: Clock, trend: '+12%' },
    { label: 'Applications', value: '12', icon: TrendingUp, trend: '+5 this week' },
  ];

  return (
    <>
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <DashboardHeader theme={theme} setTheme={setTheme} />
      <main className="ml-64 pt-20 p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Career Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-300">Track your progress and access all career tools in one place</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Access</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.id}
                  {...feature}
                  onClick={() => handleTabChange(feature.id)}
                />
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-bold mb-2">Ready to take the next step?</h3>
              <p className="text-gray-300 mb-6">
                Our AI-powered career assistant is here to help you navigate your career journey
              </p>
              <button
                onClick={() => handleTabChange('chatbot')}
                className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200"
              >
                Talk to Career Assistant
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
