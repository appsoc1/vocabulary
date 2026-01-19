"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Folder, PenTool, LayoutDashboard, Type, BarChart3, FileSpreadsheet } from "lucide-react";
import { AuthProvider } from "@/context/AuthContext";
import { UserNav } from "@/components/UserNav";
import { MobileNav } from "@/components/MobileNav";

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isReviewPage = pathname?.startsWith("/review");

    return (
        <AuthProvider>
            {/* Mobile Navigation - hide logo on review page */}
            <MobileNav hideTitle={isReviewPage} />

            {/* Desktop Sidebar */}
            <aside className="w-64 border-r bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 hidden md:flex flex-col p-4 gap-4 sticky top-0 h-screen">
                {/* Logo - hide on review page */}
                {!isReviewPage && (
                    <div className="flex items-center gap-2 px-2 py-4">
                        <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                            E
                        </div>
                        <span className="font-bold text-xl">English SRS</span>
                    </div>
                )}

                <nav className="flex flex-col gap-1 flex-1">
                    <NavItem href="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                    <NavItem href="/folders" icon={<Folder size={20} />} label="Folders" />
                    <NavItem href="/input/word" icon={<Type size={20} />} label="Add Word" />
                    <NavItem href="/input/sentence" icon={<PenTool size={20} />} label="Add Sentence" />
                    <NavItem href="/input/excel" icon={<FileSpreadsheet size={20} />} label="Excel Import" />
                    <NavItem href="/stats" icon={<BarChart3 size={20} />} label="Statistics" />
                </nav>

                <UserNav />

                <div className="text-xs text-muted-foreground px-2 py-4 border-t">
                    © 2024 English Mastery
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                <div className={isReviewPage ? "" : "p-4 md:p-8 max-w-5xl mx-auto space-y-8"}>
                    {children}
                </div>
            </main>
        </AuthProvider>
    );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium"
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
