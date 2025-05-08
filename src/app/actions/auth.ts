"use server";

import { signIn } from "@/auth";

export async function signInWithAzure() {
  try {
    await signIn("microsoft-entra-id", { redirectTo: "/dashboard" });
  } catch (error) {

    throw error;
  }
}
