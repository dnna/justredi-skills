interface Skill {
  id?: string;
  preferred_label: string;
  skill_type?: string;
  is_digital_skill?: boolean | number | string;
  is_essential?: boolean;
  description?: string;
}

interface SkillTagsProps {
  skills: Skill[];
  maxDisplay?: number;
  showDigitalIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
  colorScheme?: 'default' | 'essential' | 'red' | 'gray';
  interactive?: boolean;
}

export function SkillTags({
  skills,
  maxDisplay = 6,
  showDigitalIcon = true,
  size = 'sm',
  variant = 'default',
  colorScheme = 'default',
  interactive = false,
}: SkillTagsProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  const displayedSkills = skills.slice(0, maxDisplay);
  const remainingCount = skills.length - maxDisplay;

  // Helper function to check if skill is digital
  const isDigitalSkill = (skill: Skill) => {
    return Boolean(
      skill.is_digital_skill && skill.is_digital_skill !== 0 && skill.is_digital_skill !== '0'
    );
  };

  // Helper function to get color classes
  const getColorClasses = (skill: Skill) => {
    if (colorScheme === 'essential') {
      return skill.is_essential
        ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200'
        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-200';
    }
    if (colorScheme === 'red')
      return 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800';
    if (colorScheme === 'gray') return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700';
    return 'bg-gray-100 text-gray-700';
  };

  // Helper function to create skill element
  const createSkillElement = (skill: Skill, index: number) => {
    const colorClasses = getColorClasses(skill);
    const baseClasses = `inline-flex items-center font-medium ${sizeClasses[size]} ${colorClasses}`;
    const shapeClasses = variant === 'compact' ? 'rounded-md' : 'rounded-full';
    const hoverClasses = interactive ? 'transition-colors hover:opacity-80' : '';

    const content = (
      <>
        {showDigitalIcon && isDigitalSkill(skill) && (
          <svg
            className={`mr-1 ${iconSizeClasses[size]}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>
        )}
        {skill.preferred_label}
      </>
    );

    if (interactive && skill.id) {
      return (
        <a
          key={skill.id || index}
          href={`/skills/${skill.id}`}
          className={`${baseClasses} ${shapeClasses} ${hoverClasses}`}
          title={skill.description}
        >
          {content}
        </a>
      );
    }

    return (
      <span
        key={skill.id || index}
        className={`${baseClasses} ${shapeClasses}`}
        title={skill.description}
      >
        {content}
      </span>
    );
  };

  const gapClass = variant === 'compact' ? 'gap-1' : 'gap-2';

  return (
    <div className={`flex flex-wrap ${gapClass}`}>
      {displayedSkills.map((skill, index) => createSkillElement(skill, index))}
      {remainingCount > 0 && (
        <span
          className={`inline-flex items-center font-medium text-gray-500 ${sizeClasses[size]} ${variant === 'compact' ? 'rounded-md' : 'rounded-full'}`}
        >
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}
