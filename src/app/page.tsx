import { auth } from "@/auth";
import SignIn from "@/components/auth/sign-in";
import Image from "next/image";
import { redirect } from "next/navigation";
import { CompanyLogo } from "@/components/admin/layout/sidebar/company-logo";
import { COMPANY_NAME } from "@/lib/constants";
import { CheckCircle2 } from "lucide-react";
import { BrandGradientText } from "@/components/ui/brand-gradient-text";

export default async function Home() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-950 dark:via-black dark:to-gray-900 flex flex-col justify-between">
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <div className="bg-white/80 dark:bg-black/70 shadow-xl rounded-2xl p-8 sm:p-12 flex flex-col items-center max-w-lg w-full border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <CompanyLogo companyName={COMPANY_NAME} size="lg" />
            <BrandGradientText className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {COMPANY_NAME}
            </BrandGradientText>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-2">
            Welcome
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 text-center">
            Your confidential, modern counseling platform.
          </p>

          <ul className="mb-8 w-full space-y-3">
            <li className="flex items-center gap-2 text-sm sm:text-base text-foreground">
              <CheckCircle2 className="text-blue-500 w-5 h-5" />
              Get started by signing in
            </li>
            <li className="flex items-center gap-2 text-sm sm:text-base text-foreground">
              <CheckCircle2 className="text-blue-500 w-5 h-5" />
              See a counselor of your choice
            </li>
            <li className="flex items-center gap-2 text-sm sm:text-base text-foreground">
              <CheckCircle2 className="text-blue-500 w-5 h-5" />
              100% private & secure
            </li>
          </ul>

          <div className="w-full flex flex-col items-center">
            <SignIn />
          </div>
        </div>
      </main>
      <footer className="w-full flex flex-col items-center mt-12 mb-4 px-4">
        <div className="w-full max-w-lg border-t border-gray-200 dark:border-gray-800 mb-4" />
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 md:gap-8 flex-wrap items-center justify-center text-xs sm:text-sm">
          <a
            className="flex items-center gap-1.5 sm:gap-2 hover:underline hover:underline-offset-4 transition-colors"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/file.svg"
              alt="File icon"
              width={16}
              height={16}
              className="w-4 h-4"
            />
            About Us
          </a>
          <a
            className="flex items-center gap-1.5 sm:gap-2 hover:underline hover:underline-offset-4 transition-colors"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/window.svg"
              alt="Window icon"
              width={16}
              height={16}
              className="w-4 h-4"
            />
            Go to Minet Uganda →
          </a>
          <a
            className="flex items-center gap-1.5 sm:gap-2 hover:underline hover:underline-offset-4 transition-colors"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
              className="w-4 h-4"
            />
            Contact Us
          </a>
        </div>
      </footer>
    </div>
  );
}
