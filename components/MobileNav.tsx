"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Folder, PenTool, LayoutDashboard, Type, BarChart3, FileSpreadsheet } from "lucide-react";
import { UserNav } from "@/components/UserNav";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/folders", icon: Folder, label: "Folders" },
    { href: "/input/word", icon: Type, label: "Add Word" },
    { href: "/input/sentence", icon: PenTool, label: "Add Sentence" },
    { href: "/input/excel", icon: FileSpreadsheet, label: "Excel Import" },
    { href: "/stats", icon: BarChart3, label: "Statistics" },
];

export function MobileNav({ hideTitle }: { hideTitle?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Header */}
            <header className="h-14 border-b flex items-center justify-between px-4 md:hidden bg-card/80 backdrop-blur sticky top-0 z-50">
                {/* Logo/Title - conditionally hidden */}
                {!hideTitle ? (
                    <Link href="/" className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                            E
                        </div>
                        <span className="font-bold text-lg">English SRS</span>
                    </Link>
                ) : (
                    <div />
                )}

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-md hover:bg-accent transition-colors"
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile Menu Panel */}
            <nav
                className={cn(
                    "fixed top-14 right-0 w-64 h-[calc(100vh-3.5rem)] bg-card border-l shadow-xl z-50 md:hidden transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="flex flex-col h-full p-4">
                    <div className="flex flex-col gap-1 flex-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium"
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="border-t pt-2">
                        <UserNav />
                    </div>
                </div>
            </nav>
        </>
    );
}
