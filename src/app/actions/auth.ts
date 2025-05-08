"use server"

import { signIn } from "@/auth"

export async function signInWithAzure() {
    await signIn("microsoft-entra-id", { redirectTo: "/" })
}