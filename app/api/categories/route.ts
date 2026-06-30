import { createCategory, getCategories } from '@/lib/services/categoryService';
import { getCategoryEmoji } from '@/lib/utils/categoryIcon';

export async function GET() {
    try {
        const categories = await getCategories();

        return new Response(
            JSON.stringify({ success: true, categories }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error: unknown) {
        console.error('Error fetching categories:', error);
        const message = error instanceof Error ? error.message : String(error);
        return new Response(
            JSON.stringify({
                success: false,
                error: message,
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, icon_url, background_color } = body;

        if (!name) {
            return new Response(
                JSON.stringify({ success: false, error: 'Category name is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const result = await createCategory(
            name,
            background_color || '#E5E7EB',
            undefined,
            icon_url || getCategoryEmoji(name)
        );

        if (result.success) {
            return new Response(
                JSON.stringify({ success: true, id: result.id }),
                { status: 201, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const err = result.error;
        let errorMessage = 'Failed to create category';
        if (typeof err === 'string') errorMessage = err;
        else if (err && typeof err === 'object' && 'message' in err) errorMessage = String((err as { message: unknown }).message);
        else if (err != null) errorMessage = String(err);

        return new Response(
            JSON.stringify({ success: false, error: errorMessage }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error: unknown) {
        console.error('Error creating category:', error);
        const message = error instanceof Error ? error.message : String(error);
        return new Response(
            JSON.stringify({
                success: false,
                error: message,
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
