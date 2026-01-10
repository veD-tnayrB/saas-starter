import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/project/:path*",
    "/admin/:path*",
    "/api/projects/:path*",
    "/api/user/:path*",
  ],
};
