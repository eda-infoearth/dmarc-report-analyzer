import { createMiddleware } from "@solidjs/start/middleware";

// add secure headers X-Content-Type-Options, X-Frame-Options, Referrer-Policy

// add: nonce to CSP
const nonce = crypto.randomUUID();
console.log("middleware nonce:", nonce);
// add: CSP header middleware
const csp = `
default-src 'self'; 
script-src 'self' 'nonce-${nonce}'; 
style-src 'self' 'nonce-${nonce}';
`;

export default createMiddleware({
  onRequest: (event) => {
    event.locals.startTime = Date.now();
    event.response.headers.set("Content-Security-Policy", csp);
    event.response.headers.set("X-Content-Type-Options", "nosniff");
    event.response.headers.set("X-Frame-Options", "DENY");
    event.response.headers.set("Referrer-Policy", "no-referrer");
    // pass nonce to request headers for later use in entry-server.tsx
    event.request.headers.set("csp-nonce", nonce);
  },
  onBeforeResponse: (event) => {
    const endTime = Date.now();
    const duration = endTime - event.locals.startTime;
    event.response.headers.set("X-Response-Time", `${duration}ms`);
  },
});