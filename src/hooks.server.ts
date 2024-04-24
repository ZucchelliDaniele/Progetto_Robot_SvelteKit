/** @type {import('@sveltejs/kit').Handle} */

var logged = false;

export async function handle({ event, resolve }) {
    const currentUrl = new URL(event.request.url);
    const rootPath = currentUrl.origin; // Extract the root path from the current URL

    if (!event.url.pathname.startsWith('/pair') && !logged) {		
        const redirectUrl = rootPath + '/pair'; // Concatenate '/pair' to the root path
        return Response.redirect(redirectUrl, 302);
    }

    const response = await resolve(event);	
    return response;
}
