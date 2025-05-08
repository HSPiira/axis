import { signInWithAzure } from "@/app/actions/auth";

export default function SignIn() {
    return (
        <button
            onClick={() => signInWithAzure()}
            className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 rounded-lg py-2 flex items-center justify-center gap-2"
        >
            <svg width="20" height="20" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                <path fill="#f35325" d="M1 1h10v10H1z" />
                <path fill="#81bc06" d="M12 1h10v10H12z" />
                <path fill="#05a6f0" d="M1 12h10v10H1z" />
                <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
            Sign in with Microsoft
        </button>
    )
} 