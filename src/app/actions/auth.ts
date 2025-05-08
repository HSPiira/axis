"use server";

import { signIn } from "@/auth";

export async function signInWithAzure() {
  try {
    await signIn("microsoft-entra-id", { redirectTo: "/dashboard" });
  } catch (error) {
    console.error("Error signing in with Azure:", error);
    throw error;
  }
}
