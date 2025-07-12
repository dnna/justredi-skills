'use client';

import { useEffect } from 'react';

interface LearningPathTrackerProps {
  learningPathId: number;
}

export function LearningPathTracker({ learningPathId }: LearningPathTrackerProps) {
  useEffect(() => {
    fetch('/api/track-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ learningPathId }),
    });
  }, [learningPathId]);

  return null;
}
