import { supabaseServer } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const ids = Array.isArray(body?.ids)
      ? body.ids.map(String).filter((id: string) => id.trim())
      : [];

    if (!ids.length) {
      return new Response(
        JSON.stringify({ success: false, error: 'No store IDs provided.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = supabaseServer();
    const { error, count } = await supabase.from('stores').delete({ count: 'exact' }).in('id', ids);

    if (error) {
      console.error('Error deleting selected stores:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, count: count ?? ids.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error deleting selected stores:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
