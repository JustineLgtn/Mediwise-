import bcrypt from "bcrypt";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProviders from "next-auth/providers/google";
import GithubProviders from "next-auth/providers/github";
import FacebookProviders from "next-auth/providers/facebook";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import prisma from "@/lib/prisma";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    FacebookProviders({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRETS as string,

      authorization: {
        params: {
          role: "PATIENT" || "ADMIN",
        },
      },
    }),
    GithubProviders({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRETS as string,
      authorization: {
        params: {
          role: "PATIENT" || "ADMIN",
        },
      },
    }),
    GoogleProviders({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRETS as string,

      authorization: {
        params: {
          role: "PATIENT" || "ADMIN",
        },
      },
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        /* 
          You need to provide your own logic here that takes the credentials
          submitted and returns either a object representing a user or value
          that is false/null if the credentials are invalid.
          e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
          You can also use the `req` object to obtain additional parameters
          (i.e., the request IP address) 
        */
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials. Please fill in all fields");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user?.hashedPassword) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );
        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }
        return user;
        // return { ...user, role: user.role.toString() };
        /* 
          If no error and we have user data, return it
          Return null if user data could not be retrieved
        */
      },
    }),
  ],
  callbacks: {
    // Ref: https://authjs.dev/guides/basics/role-based-access-control#with-jwt
    /* comment ko muna start */
    // jwt({ token, user }) {
    //   if (user) {
    //     // token.role = user.role;
    //     // token.departmentId = user.departmentId;
    //   }
    //   console.log("jwt", token, user);
    //   return token;
    // },
    // session({ session, token }) {
    //   //   session.user.role = token.role;
    //   //   session.user.departmentId = token.departmentId;
    //   console.log("session", session, token);
    //   //   return session;
    //   return session;
    // },
    /* comment ko muna end */
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.barangayId = user.barangayId;
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.id;
      session.user.barangayId = token.barangayId;
      return session;
    },
    // signIn(params) {
    //   params.user.role = "PATIENT";
    //   return true;
    // },
    // is user sign in using credentials send email
  },
  pages: {
    signIn: "/",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
