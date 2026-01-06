import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import * as dbOps from "@/db/operations";

// LINE Provider (カスタム実装)
const LineProvider = {
    id: "line",
    name: "LINE",
    type: "oauth" as const,
    authorization: {
        url: "https://access.line.me/oauth2/v2.1/authorize",
        params: { scope: "profile openid email" },
    },
    token: "https://api.line.me/oauth2/v2.1/token",
    userinfo: "https://api.line.me/v2/profile",
    clientId: process.env.LINE_CLIENT_ID,
    clientSecret: process.env.LINE_CLIENT_SECRET,
    profile(profile: { userId: string; displayName: string; pictureUrl?: string }) {
        return {
            id: profile.userId,
            name: profile.displayName,
            image: profile.pictureUrl,
            email: `${profile.userId}@line.user`,
        };
    },
};

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
        LineProvider,
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
        async signIn({ user, account }) {
            // OAuthログイン時にDBにユーザーを登録
            if (account?.provider === "google" || account?.provider === "line") {
                try {
                    const email = user.email || `${user.id}@${account.provider}.user`;
                    await dbOps.createOrGetUser(email, user.name || undefined);
                } catch (error) {
                    console.error("[Auth] OAuth user creation error:", error);
                }
            }
            return true;
        },
        async session({ session, token }) {
            if (token?.sub) {
                session.user.id = token.sub;
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
