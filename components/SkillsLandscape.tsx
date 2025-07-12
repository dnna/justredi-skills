import { Container } from '@/components/Container';
import Link from 'next/link';

export function SkillsLandscape({ skills }: { skills: any[] }) {
  const maxJobs = Math.max(...skills.map((s) => s.job_count), 0);
  const totalJobs = skills.reduce((sum, skill) => sum + skill.job_count, 0);

  const getSegmentColor = (index: number, total: number) => {
    const colors = [
      '#10b981', // green-500
      '#06d6a0', // emerald-400
      '#14b8a6', // teal-500
      '#06b6d4', // cyan-500
      '#3b82f6', // blue-500
    ];
    return colors[index % colors.length];
  };

  const RadialChart = () => {
    const centerX = 200;
    const centerY = 200;
    const radius = 140;
    const innerRadius = 60;
    
    let currentAngle = -90; // Start from top

    const createPath = (startAngle: number, endAngle: number, outerRadius: number, innerRadius: number) => {
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;

      const x1 = centerX + outerRadius * Math.cos(startAngleRad);
      const y1 = centerY + outerRadius * Math.sin(startAngleRad);
      const x2 = centerX + outerRadius * Math.cos(endAngleRad);
      const y2 = centerY + outerRadius * Math.sin(endAngleRad);

      const x3 = centerX + innerRadius * Math.cos(endAngleRad);
      const y3 = centerY + innerRadius * Math.sin(endAngleRad);
      const x4 = centerX + innerRadius * Math.cos(startAngleRad);
      const y4 = centerY + innerRadius * Math.sin(startAngleRad);

      const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

      return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
    };

    const getLabelPosition = (startAngle: number, endAngle: number) => {
      const midAngle = (startAngle + endAngle) / 2;
      const labelRadius = (radius + innerRadius) / 2;
      const x = centerX + labelRadius * Math.cos((midAngle * Math.PI) / 180);
      const y = centerY + labelRadius * Math.sin((midAngle * Math.PI) / 180);
      return { x, y };
    };

    return (
      <div className="flex flex-col items-center">
        <svg width="400" height="400" className="mb-8">
          {skills.map((skill, index) => {
            const segmentAngle = (skill.job_count / totalJobs) * 270; // 270 degrees for 3/4 circle
            const startAngle = currentAngle;
            const endAngle = currentAngle + segmentAngle;
            const path = createPath(startAngle, endAngle, radius, innerRadius);
            const color = getSegmentColor(index, skills.length);
            const labelPos = getLabelPosition(startAngle, endAngle);
            
            currentAngle += segmentAngle;

            return (
              <g key={skill.id}>
                <Link href={`/skills/${skill.id}`}>
                  <path
                    d={path}
                    fill={color}
                    stroke="white"
                    strokeWidth="2"
                    className="transition-all duration-300 hover:brightness-110 cursor-pointer"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }}
                  />
                </Link>
                
                {segmentAngle > 15 && ( // Only show labels for segments large enough
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-xs font-semibold fill-white pointer-events-none"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
                  >
                    {skill.job_count}
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Center circle with title */}
          <circle
            cx={centerX}
            cy={centerY}
            r={innerRadius}
            fill="white"
            stroke="#e5e7eb"
            strokeWidth="2"
          />
          <text
            x={centerX}
            y={centerY - 10}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-sm font-bold fill-gray-900"
          >
            Δεξιότητες
          </text>
          <text
            x={centerX}
            y={centerY + 10}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-xs fill-gray-600"
          >
            {totalJobs} προφίλ
          </text>
        </svg>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
          {skills.map((skill, index) => {
            const color = getSegmentColor(index, skills.length);
            const percentage = ((skill.job_count / totalJobs) * 100).toFixed(1);
            
            return (
              <Link key={skill.id} href={`/skills/${skill.id}`}>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex-grow min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {skill.preferred_label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {skill.job_count} προφίλ ({percentage}%)
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="py-20 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Το Τοπίο των Δεξιοτήτων στην Ελλάδα
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Οι πιο περιζήτητες ψηφιακές δεξιότητες στην αγορά εργασίας, με βάση τα διαθέσιμα
            εργασιακά προφίλ.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-6xl">
          <RadialChart />
        </div>
      </Container>
    </section>
  );
}
