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
        async signIn({ user, account }) {
            // OAuthログイン時にDBにユーザーを登録
            if (account?.provider === "google" || account?.provider === "line") {
                try {
                    // LINE用のメール生成
                    let email = user.email;
                    if (!email && account.provider === "line" && account.providerAccountId) {
                        email = `${account.providerAccountId}@line.user`;
                    }
                    if (email) {
                        await dbOps.createOrGetUser(email, user.name || undefined);
                    }
                } catch (error) {
                    console.error("[Auth] OAuth user creation error:", error);
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.sub = user.id;
            }
            // アカウント情報を保存（初回ログイン時のみ）
            if (account) {
                token.provider = account.provider;
                token.providerAccountId = account.providerAccountId;
            }
            return token;
        },
        async session({ session, token }) {
            if (token?.sub) {
                session.user.id = token.sub;
            }
            // LINEユーザーはemailがないので、providerAccountIdから安定したemailを生成
            if (!session.user.email && token.providerAccountId && token.provider === "line") {
                session.user.email = `${token.providerAccountId}@line.user`;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
});
