import { withAuth } from "next-auth/middleware";

export default withAuth;

export const config = {
    // Protect everything except these paths
<<<<<<< HEAD
    matcher: ["/((?!api/auth|api/movers|api/momentum|api/header-data|login|admin-login|register|_next/static|_next/image|favicon.ico|$).*)"],
=======
    matcher: ["/((?!api/auth|api/movers|api/momentum|api/penny-stocks|api/overnight-analysis|api/header-data|login|admin-login|register|_next/static|_next/image|favicon.ico).*)"],
>>>>>>> 4aead95 (Fix: Penny Stocks, Common Lists, Overnight Analysis, and Market Sessions crash. Applied core data flow and session detection logic.)
};
