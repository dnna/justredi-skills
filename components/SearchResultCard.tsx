'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ChevronRightIcon, 
  BuildingOfficeIcon,
  BookOpenIcon,
  SparklesIcon,
  BriefcaseIcon,
  BuildingOfficeIcon as InstitutionIcon
} from '@heroicons/react/24/outline';

interface SearchResultCardProps {
  item: any;
  category: string;
  index: number;
  iconName: string;
}

const iconMap = {
  courses: BookOpenIcon,
  skills: SparklesIcon,
  job_profiles: BriefcaseIcon,
  institutions: InstitutionIcon,
};

const categoryLabels = {
  courses: 'Μάθημα',
  skills: 'Δεξιότητα',
  job_profiles: 'Εργασιακό Προφίλ',
  institutions: 'Ίδρυμα',
};

export function SearchResultCard({ item, category, index, iconName }: SearchResultCardProps) {
  const Icon = iconMap[iconName as keyof typeof iconMap];
  const categoryLabel = categoryLabels[category as keyof typeof categoryLabels] || category;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        href={`/${category.replace('_', '-')}/${item.id}`}
        className="group/card relative flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:scale-[1.02] hover:border-green-300 hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="line-clamp-2 font-semibold text-gray-900 transition-colors group-hover/card:text-green-600">
              {item.name || item.title}
            </h3>
            {item.description && (
              <p className="mt-2 line-clamp-3 text-sm text-gray-600">{item.description}</p>
            )}
            {item.institution_name && (
              <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                <BuildingOfficeIcon className="h-4 w-4" />
                {item.institution_name}
              </p>
            )}
            {item.skill_count && (
              <p className="mt-2 text-sm text-gray-500">{item.skill_count} δεξιότητες καλύπτονται</p>
            )}
          </div>
          <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400 transition-all group-hover/card:translate-x-1 group-hover/card:text-green-600" />
        </div>

        {/* Category badge */}
        <div className="mt-4 border-t border-gray-100 pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <Icon className="h-3.5 w-3.5" />
            {categoryLabel}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
