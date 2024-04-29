import axios from "axios";
// @ts-ignore
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// @ts-ignore
export function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

export async function Exit() {
    try {
        // Make a GET request to check the user's login status
        const response = await axios.get('http://localhost:3000/logout', {
            withCredentials: true
        });
        deleteCookie("hash")
        // Update the login status based on the respons
        console.log("Login out successfully.");
        window.location.reload()
    } catch (error) {
        console.error('Login Status Error:', error);
    }
}

export function getUrlWithNoPort() {
    const url = window.location.href;
    const parsedUrl = new URL(url);
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}`;
    return baseUrl;
}