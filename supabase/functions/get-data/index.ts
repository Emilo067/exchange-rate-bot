import "@supabase/functions-js/edge-runtime.d.ts";

console.log("Hello from Functions!");

export default {
    async fetch(req: Request) {
        if (req.method !== 'GET') {
            return new Response('Method Not Allowed', {status: 405});
        }

        const myCustomData = {
            message: 'hello, it-incubator',
            studentId: '#3210'
        }

        return new Response(
            JSON.stringify(myCustomData),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                // CORS-заголовки, чтобы JSON можно было загружать и в браузере, и через fetch()
                "Access-Control-Allow-Origin": "*",
              }
            }
        )
    }
    };
