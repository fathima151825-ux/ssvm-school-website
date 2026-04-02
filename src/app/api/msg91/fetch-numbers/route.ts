import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetType, selectedClasses, selectedSections, customNumbers } = body;

    const supabase = await createClient();

    let phoneNumbers: string[] = [];

    if (targetType === 'all') {
      const { data, error } = await supabase
        .from('students_basic')
        .select('parent_phone');

      if (error) throw new Error(error.message);
      phoneNumbers = (data || []).map((r: any) => r.parent_phone);
    } else if (targetType === 'classes') {
      let query = supabase.from('students_basic').select('parent_phone');

      if (selectedClasses && selectedClasses.length > 0) {
        query = query.in('class', selectedClasses);
      }
      if (selectedSections && selectedSections.length > 0) {
        query = query.in('section', selectedSections);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      phoneNumbers = (data || []).map((r: any) => r.parent_phone);
    } else if (targetType === 'custom') {
      phoneNumbers = (customNumbers || []);
    }

    // Also include saved bulk_contacts if target is all
    if (targetType === 'all') {
      const { data: bulkData } = await supabase
        .from('bulk_contacts')
        .select('phone_number');
      const bulkNumbers = (bulkData || []).map((r: any) => r.phone_number);
      phoneNumbers = [...phoneNumbers, ...bulkNumbers];
    }

    // Normalize to 91XXXXXXXXXX and deduplicate
    const normalize = (raw: string): string => {
      const digits = raw.replace(/\D/g, '');
      if (digits.startsWith('91') && digits.length === 12) return digits;
      if (digits.length === 10 && /^[6-9]/.test(digits)) return `91${digits}`;
      return '';
    };

    const normalized = [...new Set(
      phoneNumbers.map(normalize).filter((n) => n.length === 12)
    )];

    return NextResponse.json({ numbers: normalized, count: normalized.length });
  } catch (error: any) {
    console.error('Fetch numbers error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch numbers' },
      { status: 500 }
    );
  }
}
