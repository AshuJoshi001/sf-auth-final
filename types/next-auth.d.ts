import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
        idToken?: string; // Include idToken in Session type
        user?: {
            id: string;
        } & DefaultSession["user"];
    }
}