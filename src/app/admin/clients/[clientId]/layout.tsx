import React from "react";
import { ClientProvider } from "@/lib/providers/client-provider";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const getClientData = unstable_cache(
  async (clientId: string) => {
    const clientProvider = new ClientProvider();
    const client = await clientProvider.get(clientId);
    return client;
  },
  ["client-data"],
  {
    revalidate: 60, // Cache for 1 minute
    tags: ["client"],
  }
);

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { clientId: string };
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  // Await params before accessing clientId
  const { clientId } = await Promise.resolve(params);
  const client = await getClientData(clientId);

  if (!client) {
    notFound();
  }

  return children;
}
