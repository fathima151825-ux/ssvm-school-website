import { NextRequest, NextResponse } from 'next/server';

const MSG91_API_KEY = process.env.MSG91_API_KEY || '';
const MSG91_VOICE_ENDPOINT = 'https://api.msg91.com/api/v5/voice/';

interface VoicePayload {
  message: string;
  recipients: string[]; // normalized 91XXXXXXXXXX format
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) return digits;
  if (digits.length === 10 && /^[6-9]/.test(digits)) return `91${digits}`;
  return '';
}

export async function POST(request: NextRequest) {
  try {
    const body: VoicePayload = await request.json();
    const { message, recipients } = body;

    if (!recipients || recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients provided' }, { status: 400 });
    }

    if (!MSG91_API_KEY) {
      return NextResponse.json(
        { error: 'MSG91_API_KEY not configured. Please set the environment variable.' },
        { status: 503 }
      );
    }

    // Normalize all numbers to 91XXXXXXXXXX
    const normalizedNumbers = recipients
      .map(normalizePhone)
      .filter((n) => n.length === 12);

    if (normalizedNumbers.length === 0) {
      return NextResponse.json({ error: 'No valid phone numbers after normalization' }, { status: 400 });
    }

    // MSG91 Voice API — send in batches of 50
    const BATCH_SIZE = 50;
    const results: any[] = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < normalizedNumbers.length; i += BATCH_SIZE) {
      const batch = normalizedNumbers.slice(i, i + BATCH_SIZE);

      const payload = {
        message,
        mobile: batch.join(','),
        language: 'english',
      };

      const response = await fetch(MSG91_VOICE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authkey: MSG91_API_KEY,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      results.push(result);

      if (response.ok && result.type === 'success') {
        successCount += batch.length;
      } else {
        failCount += batch.length;
      }
    }

    return NextResponse.json({
      success: failCount === 0,
      totalSent: normalizedNumbers.length,
      successCount,
      failCount,
      results,
    });
  } catch (error: any) {
    console.error('MSG91 Voice API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send voice call' },
      { status: 500 }
    );
  }
}
