import { withAuth } from "next-auth/middleware";

export default withAuth;

export const config = {
    // EXCLUDE these paths from middleware entirely
    // This is the most robust way to ensure public routes are truly public on Vercel
    matcher: ["/((?!api/auth|api/admin/approve|api/auth/status|login|admin-login|register|api/debug|api/sync|api/movers|api/momentum|api/penny-stocks|api/overnight-analysis|api/header-data|_next/static|_next/image|favicon.ico).*)"],
};
