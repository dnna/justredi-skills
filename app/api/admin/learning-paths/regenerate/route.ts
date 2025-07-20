import { NextRequest, NextResponse } from 'next/server';
import { triggerLearningPathRegeneration } from '@/lib/admin-db';
import { regenerateLearningPathsForJob } from '@/lib/learning-path-generator';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobIds, regenerate = false } = body;

    if (jobIds && !Array.isArray(jobIds)) {
      return NextResponse.json({ error: 'jobIds must be an array of numbers' }, { status: 400 });
    }

    if (regenerate) {
      if (jobIds && jobIds.length > 0) {
        const results: Array<{
          jobId: number;
          success: boolean;
          message: string;
          pathsCreated?: number;
        }> = [];
        for (const jobId of jobIds) {
          try {
            const result = await regenerateLearningPathsForJob(Number(jobId));
            results.push({ jobId, ...result });
          } catch (error) {
            results.push({
              jobId,
              success: false,
              message: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }

        const successCount = results.filter((r) => r.success).length;
        return NextResponse.json({
          success: true,
          message: `Regenerated learning paths for ${successCount} of ${jobIds.length} job profiles`,
          results,
        });
      } else {
        const jobProfiles = (await query('SELECT id FROM job_profiles ORDER BY id')) as any[];
        let successCount = 0;
        const errors: Array<{
          jobId: number;
          error: string;
        }> = [];

        for (const job of jobProfiles) {
          try {
            await regenerateLearningPathsForJob(job.id);
            successCount++;
          } catch (error) {
            errors.push({
              jobId: job.id,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }

        return NextResponse.json({
          success: true,
          message: `Regenerated learning paths for ${successCount} of ${jobProfiles.length} job profiles`,
          errors: errors.length > 0 ? errors : undefined,
        });
      }
    } else {
      const result = await triggerLearningPathRegeneration(jobIds);

      return NextResponse.json({
        success: true,
        message: jobIds
          ? `Learning paths cleared for ${jobIds.length} job profiles.`
          : 'All learning paths cleared.',
        result,
      });
    }
  } catch (error) {
    console.error('Error with learning path regeneration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
