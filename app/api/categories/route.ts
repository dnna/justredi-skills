import { NextResponse } from 'next/server';
import { getCategoryHierarchy } from '@/lib/categories';

export async function GET() {
  try {
    const categories = await getCategoryHierarchy();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}