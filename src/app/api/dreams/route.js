// In-memory storage for dreams
export let dreams = [];

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// Helper function to validate dream data
export function validateDream(dream) {
    if (!dream.title || typeof dream.title !== 'string' || dream.title.trim().length === 0) {
        return { isValid: false, error: 'Title is required and must be a non-empty string' };
    }
    if (!dream.date || typeof dream.date !== 'string' || dream.date.trim().length === 0) {
        return { isValid: false, error: 'Date is required and must be a non-empty string' };
    }
    if (!dream.content || typeof dream.content !== 'string' || dream.content.trim().length === 0) {
        return { isValid: false, error: 'Content is required and must be a non-empty string' };
    }
    if (!Array.isArray(dream.tags)) {
        return { isValid: false, error: 'Tags must be an array' };
    }
    return { isValid: true };
}

// Factory function to create handlers with a shared dreams array
export function createHandlers(dreams) {
    return {
        async GET(request) {
            return new Response(JSON.stringify(dreams), {
                status: 200,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        },

        async POST(request) {
            const newDream = await request.json();
            const validation = validateDream(newDream);

            if (!validation.isValid) {
                return new Response(JSON.stringify({ error: validation.error }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                });
            }

            newDream.id = (dreams.length + 1).toString();
            dreams.push(newDream);

            return new Response(JSON.stringify(newDream), {
                status: 201,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        },

        async PATCH(request) {
            const url = new URL(request.url);
            const id = url.searchParams.get('id');
            const updatedDream = await request.json();

            const dreamIndex = dreams.findIndex((dream) => dream.id === id);
            if (dreamIndex === -1) {
                return new Response(JSON.stringify({ error: 'Dream not found' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                });
            }

            dreams[dreamIndex] = { ...dreams[dreamIndex], ...updatedDream };

            return new Response(JSON.stringify(dreams[dreamIndex]), {
                status: 200,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        },

        async DELETE(request) {
            const url = new URL(request.url);
            const id = url.searchParams.get('id');

            const dreamIndex = dreams.findIndex((dream) => dream.id === id);
            if (dreamIndex === -1) {
                return new Response(JSON.stringify({ error: 'Dream not found' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                });
            }

            dreams.splice(dreamIndex, 1);

            return new Response(null, {
                status: 204,
                headers: corsHeaders,
            });
        },

        async OPTIONS() {
            return new Response(null, {
                status: 204,
                headers: corsHeaders,
            });
        },
    };
}


