import { NextResponse } from 'next/server';
import { errorHandler } from '@/lib/apiErrorHandler';
import StorageServerInstance from '@/services/cloudflare/storage';

export const POST = errorHandler(async (request) => {
  const body = await request.json();

  const { presignedUrl, key } = await StorageServerInstance.generatePresignedUrl(body);
  return NextResponse.json({ presignedUrl, key });
});

export const DELETE = errorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  if (!key) {
    return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
  }

  await StorageServerInstance.deleteFromR2(key);
  return NextResponse.json({ success: true });
});