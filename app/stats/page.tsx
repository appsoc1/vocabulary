"use client";

import { Clock, BookOpen, TrendingUp, Play, BarChart3 } from "lucide-react";

export default function StatsPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
                <p className="text-muted-foreground mt-1">Track your learning progress.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Due Today" value="12" icon={<Clock className="text-blue-500" />} />
                <StatCard title="Learning" value="45" icon={<BookOpen className="text-indigo-500" />} />
                <StatCard title="Review" value="128" icon={<TrendingUp className="text-emerald-500" />} />
                <StatCard title="Streak" value="3 Days" icon={<Play className="text-orange-500" />} />
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Learning History</h3>
                <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Statistics chart will be displayed here.</p>
                </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
                <h4 className="font-semibold mb-2">Learning Tip</h4>
                <p className="text-sm text-muted-foreground">
                    Spaced repetition is the most effective way to remember vocabulary long-term.
                    Study consistently every day to maintain your streak!
                </p>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
    return (
        <div className="rounded-xl border bg-card p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <div className="text-2xl font-bold mt-1">{value}</div>
            </div>
            <div className="p-3 bg-accent rounded-full">
                {icon}
            </div>
        </div>
    );
}
