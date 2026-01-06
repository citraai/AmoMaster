import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Line from "next-auth/providers/line";
import * as dbOps from "@/db/operations";

// シンプルなCredentials認証 + OAuth
export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true, // Cloudflare Workers用
    providers: [
        // Google OAuth
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        // LINE Login
        Line({
            clientId: process.env.LINE_CLIENT_ID,
            clientSecret: process.env.LINE_CLIENT_SECRET,
        }),
        // Email/Password
        Credentials({
            name: "email",
            credentials: {
                email: { label: "メールアドレス", type: "email" },
                password: { label: "パスワード", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                try {
                    // パスワード付きでユーザー登録/認証
                    const user = await dbOps.registerUser(email, password);

                    if (!user) {
                        // パスワード不一致
                        return null;
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name || email.split("@")[0],
                    };
                } catch (error) {
                    console.error("[Auth] DB Error:", error);
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: "/login",
        newUser: "/onboarding",
    },
    callbacks: {
        async signIn() {
            // OAuthログインは常に許可
            return true;
        },
        async session({ session, token }) {
            if (token?.sub) {
                session.user.id = token.sub;
            }
            // OAuthユーザーのDB登録をここで行う
            if (session.user?.email) {
                try {
                    await dbOps.createOrGetUser(session.user.email, session.user.name || undefined);
                } catch (error) {
                    console.error("[Auth] Session user creation error:", error);
                }
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        },
    },
    session: {
        strategy: "jwt",
    },
});
