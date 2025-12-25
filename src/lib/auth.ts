import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import * as dbOps from "@/db/operations";

// シンプルなCredentials認証
export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
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
