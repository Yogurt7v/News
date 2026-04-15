import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pocketbaseUrl =
    process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://5.53.125.238:8090';

  const filePath = path.join('/');
  const url = `${pocketbaseUrl}/api/files/${filePath}`;

  try {
    const response = await fetch(url, {
      headers: request.headers.get('range')
        ? { Range: request.headers.get('range')! }
        : undefined,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const headers = new Headers();
    const contentType = response.headers.get('Content-Type');
    if (contentType) {
      headers.set('Content-Type', contentType);
    }

    const contentLength = response.headers.get('Content-Length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    const contentRange = response.headers.get('Content-Range');
    if (contentRange) {
      headers.set('Content-Range', contentRange);
      return new NextResponse(response.body, {
        status: 206,
        headers,
      });
    }

    headers.set('Cache-Control', 'public, max-age=86400');
    headers.set('Accept-Ranges', 'bytes');

    return new NextResponse(response.body as unknown as BodyInit, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
