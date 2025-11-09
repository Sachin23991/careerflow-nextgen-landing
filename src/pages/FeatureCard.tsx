import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface FeatureCardProps {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  action: string;
  gradient: string;
  onClick: () => void;
}

export default function FeatureCard({ id, icon: Icon, title, description, action, gradient, onClick }: FeatureCardProps) {
  return (
    // card: light = white, dark = subtle sky-blue tint; keep border + hover
    <div className="rounded-2xl p-6 bg-white dark:bg-sky-700/20 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-colors duration-150">
      <div className="flex items-start gap-4">
        {/* icon / badge (keeps provided gradient) */}
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${gradient} text-white`}>
          <Icon size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-200">{description}</p>
        </div>
      </div>

      <div className="mt-4">
        {/* action button: dark uses white bg with dark text for contrast */}
        <button
          onClick={onClick}
          className="mt-3 inline-flex items-center px-4 py-2 rounded-md bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-95 transition-colors duration-150"
        >
          {action}
        </button>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
}

export function StatCard({ label, value, icon: Icon, trend }: StatCardProps) {
  return (
    // card: light = white, dark = subtle sky-blue tint; keep border + hover
    <div className="rounded-xl p-4 bg-white dark:bg-sky-700/10 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Icon size={20} className="text-gray-700 dark:text-gray-200" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-300">{label}</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{trend}</p>
        </div>
      </div>
    </div>
  );
}
