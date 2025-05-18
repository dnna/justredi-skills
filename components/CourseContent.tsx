'use client';

import { useState } from 'react';

// Component to recursively render course content nodes
function CourseContentNode({ node }: { node: any }) {
  // Skip empty nodes or nodes without text
  if (!node || (!node.text && (!node.children || node.children.length === 0))) {
    return null;
  }

  // Render based on node label/type
  switch (node.label) {
    case 'ROOT':
      // Root node just renders children
      return (
        <div className="course-content-root space-y-4">
          {node.children?.map((child: any, index: number) => (
            <CourseContentNode key={child.node_id || index} node={child} />
          ))}
        </div>
      );

    case 'HEADING':
    case 'SECTION_HEADER':
      // Determine heading level based on node level but starting at h2 for any level below 2
      // This ensures even if the content starts at level 2, it will use h2 (main section heading)
      const headingLevel = node.level <= 0 ? 2 : Math.min(node.level + 1, 6);
      const HeadingTag = `h${headingLevel}` as keyof JSX.IntrinsicElements;
      return (
        <div className="mt-8 first:mt-0">
          <HeadingTag className="font-bold text-gray-900">{node.text}</HeadingTag>
          <div className="mt-2 space-y-4">
            {node.children?.map((child: any, index: number) => (
              <CourseContentNode key={child.node_id || index} node={child} />
            ))}
          </div>
        </div>
      );

    case 'SECTION':
      return (
        <section className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm">
          {node.text && <h3 className="font-semibold text-gray-900 mb-2">{node.text}</h3>}
          <div className="space-y-3">
            {node.children?.map((child: any, index: number) => (
              <CourseContentNode key={child.node_id || index} node={child} />
            ))}
          </div>
        </section>
      );

    case 'PARAGRAPH':
      return (
        <div>
          <p className="text-gray-600 leading-relaxed">{node.text}</p>
          {node.children?.map((child: any, index: number) => (
            <CourseContentNode key={child.node_id || index} node={child} />
          ))}
        </div>
      );

    case 'LIST_ITEM':
      // Just create a list item without checking parent
      // (We'll handle lists dynamically)
      return (
        <ul className="list-disc pl-5 space-y-2">
          <li className="text-gray-600">
            {node.text}
            {node.children?.length > 0 && (
              <div className="mt-2">
                {node.children.map((child: any, index: number) => (
                  <CourseContentNode key={child.node_id || index} node={child} />
                ))}
              </div>
            )}
          </li>
        </ul>
      );

    case 'LIST':
      return (
        <ul className="list-disc pl-5 space-y-2">
          {node.children?.map((child: any, index: number) => (
            <CourseContentNode key={child.node_id || index} node={child} />
          ))}
        </ul>
      );

    case 'NOTE':
    case 'IMPORTANT':
      return (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4 rounded-r-md">
          <p className="text-blue-700 font-medium">{node.text}</p>
          {node.children?.length > 0 && (
            <div className="mt-2">
              {node.children.map((child: any, index: number) => (
                <CourseContentNode key={child.node_id || index} node={child} />
              ))}
            </div>
          )}
        </div>
      );

    default:
      // Default rendering for other node types
      return (
        <div className="my-3 first:mt-0">
          {node.text && <p className="text-gray-600">{node.text}</p>}
          {node.children?.length > 0 && (
            <div className="ml-4 mt-2 space-y-2">
              {node.children.map((child: any, index: number) => (
                <CourseContentNode key={child.node_id || index} node={child} />
              ))}
            </div>
          )}
        </div>
      );
  }
}

// Main component for course content section
export function CourseContent({ content }: { content: any[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <div
        className={`mt-6 prose prose-indigo max-w-none relative overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[5000px]' : 'max-h-[800px]'
        }`}
      >
        {content.map((node: any, index: number) => (
          <CourseContentNode key={node.node_id || index} node={node} />
        ))}

        {!isExpanded && (
          <div
            className="absolute bottom-0 left-0 right-0 h-60 bg-gradient-to-t from-white to-transparent pointer-events-none"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`px-6 py-3 text-base font-medium rounded-lg shadow ${
            isExpanded
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
          {isExpanded ? 'Show less content' : 'Show all content'}
        </button>
      </div>
    </div>
  );
}
