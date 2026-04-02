import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 300; // Cache for 5 minutes

function extractFolderId(link: string): string | null {
  if (!link) return null;
  // Match /folders/FOLDER_ID
  const folderMatch = link.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) return folderMatch[1];
  // Match id=FOLDER_ID
  const idMatch = link.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];
  // If it looks like a raw folder ID already (no slashes, no dots)
  if (/^[a-zA-Z0-9_-]{10,}$/.test(link.trim())) return link.trim();
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const folderIdParam = searchParams.get('folderId');

  const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

  if (!apiKey || apiKey === 'your-google-drive-api-key-here') {
    return NextResponse.json({ images: [], error: 'GOOGLE_DRIVE_API_KEY not configured' }, { status: 200 });
  }

  if (!folderIdParam) {
    return NextResponse.json({ images: [] }, { status: 200 });
  }

  const folderId = extractFolderId(folderIdParam);
  if (!folderId) {
    return NextResponse.json({ images: [] }, { status: 200 });
  }

  try {
    const query = encodeURIComponent(`'${folderId}' in parents and mimeType contains 'image/'`);
    const fields = encodeURIComponent('files(id,name)');
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&key=${apiKey}&pageSize=25&orderBy=name`;

    const res = await fetch(url, { next: { revalidate: 300 } });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Drive API error:', res.status, errText);
      return NextResponse.json({ images: [], error: `Drive API error: ${res.status}` }, { status: 200 });
    }

    const data = await res.json();
    const files: { id: string; name: string }[] = data.files ?? [];

    const images = files.slice(0, 25).map((file) => ({
      id: file.id,
      name: file.name,
      thumbUrl: `https://lh3.googleusercontent.com/d/${file.id}=s400`,
      fullUrl: `https://lh3.googleusercontent.com/d/${file.id}=s1600`,
    }));

    return NextResponse.json({ images }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Drive images fetch error:', message);
    return NextResponse.json({ images: [], error: message }, { status: 200 });
  }
}
