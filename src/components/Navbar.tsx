"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const { data: session } = useSession();
    const router = useRouter();
    const user = session?.user as { name?: string; role?: string } | undefined;
    const isAdmin = user?.role === "admin";

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push("/login");
    };

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">O</span>
                    </div>
                    <span className="font-semibold text-gray-800">Plataforma de Orçamentos</span>
                </Link>

                {session && (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 hidden sm:block">
                            Olá, <span className="font-medium text-gray-700">{user?.name}</span>
                            {isAdmin && (
                                <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">Admin</span>
                            )}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                        >
                            Sair
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
