import { LucideIcon, Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: LucideIcon;
}

export default function PlaceholderPage({
  title,
  description,
  icon: Icon = Construction,
}: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="p-4 bg-benaya-100 dark:bg-benaya-900 rounded-full">
        <Icon className="w-8 h-8 text-benaya-600 dark:text-benaya-400" />
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-neo-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="text-neo-gray-600 dark:text-neo-gray-400 max-w-md">
          {description}
        </p>
      </div>

      <div className="text-sm text-neo-gray-500 dark:text-neo-gray-400">
        Cette page sera bientôt disponible
      </div>
    </div>
  );
}
