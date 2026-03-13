import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized: ({ req, token }) => {
            const { pathname } = req.nextUrl;

            // Explicit list of public prefixes
            const publicPrefixes = [
                "/api/admin/approve",
                "/api/auth/status",
                "/login",
                "/admin-login",
                "/register",
                "/api/debug",
                "/api/sync"
            ];

            // 1. Static Assets & Next.js internals always allowed
            if (
                pathname.startsWith("/_next") ||
                pathname.startsWith("/static") ||
                pathname.includes("favicon.ico")
            ) {
                return true;
            }

            // 2. Public API and Auth routes always allowed
            if (publicPrefixes.some(prefix => pathname.startsWith(prefix))) {
                return true;
            }

            // 3. Otherwise, check for token
            return !!token;
        },
    },
});

export const config = {
    // Match everything except explicit API data routes that are already public at the API level
    matcher: ["/((?!api/movers|api/momentum|api/penny-stocks|api/overnight-analysis|api/header-data).*)"],
};
