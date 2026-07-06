import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "https://yallastore.my.id",
});

export const { signIn, signUp, signOut, useSession } = authClient;
