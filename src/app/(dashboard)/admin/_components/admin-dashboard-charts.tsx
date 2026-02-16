"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartData {
    thisYear: number[];
    lastYear: number[];
}

interface AdminDashboardChartsProps {
    months: string[];
    users: ChartData;
    projects: ChartData;
    status: ChartData;
}

const AdminDashboardCharts = ({
    months,
    users,
    projects,
    status
}: AdminDashboardChartsProps) => {
    const [activeTab, setActiveTab] = useState<"Total Users" | "Total Projects" | "Operating Status">("Total Users");

    const tabs = ["Total Users", "Total Projects", "Operating Status"] as const;

    const getData = () => {
        switch (activeTab) {
            case "Total Users":
                return users;
            case "Total Projects":
                return projects;
            case "Operating Status":
                return status;
            default:
                return users;
        }
    };

    const currentData = getData();

    // Helper to generate SVG path from data
    const generatePath = (data: number[], isDashed: boolean) => {
        if (!data || data.length === 0) return "";

        const width = 800;
        const height = 200;
        const padding = 20;
        const maxValue = Math.max(...data, ...currentData.lastYear, 100) * 1.1;

        const stepX = width / (data.length - 1);

        let path = `M0,${height - (data[0] / maxValue) * (height - padding)}`;

        for (let i = 1; i < data.length; i++) {
            const x = i * stepX;
            const y = height - (data[i] / maxValue) * (height - padding);

            // Using Quadratic Bezier curves for smoother look
            const prevX = (i - 1) * stepX;
            const prevY = height - (data[i - 1] / maxValue) * (height - padding);
            const cpX = (prevX + x) / 2;
            path += ` Q${cpX},${prevY} ${x},${y}`;
        }

        return path;
    };

    return (
        <Card className="xl:col-span-2 border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between relative z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-x-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            type="button"
                            className={`text-[13px] font-bold cursor-pointer transition-all hover:opacity-70 active:scale-95 outline-none ${activeTab === tab
                                ? "text-slate-900 dark:text-slate-100 border-b-2 border-slate-900 dark:border-slate-100 pb-1"
                                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-x-4">
                    <div className="flex items-center gap-x-2">
                        <span className="h-2 w-2 rounded-full bg-slate-900 dark:bg-slate-100" />
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-tighter">This year</span>
                    </div>
                    <div className="flex items-center gap-x-2">
                        <span className="h-2 w-2 rounded-full bg-blue-300 dark:bg-blue-700" />
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Last year</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="h-[320px] w-full relative pt-4 pb-12">
                <div className="h-[240px] w-full">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200" preserveAspectRatio="none">
                        {/* Grid Lines */}
                        {[0, 50, 100, 150, 200].map(y => (
                            <line key={y} x1="0" y1={y} x2="800" y2={y} className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="1" />
                        ))}

                        {/* Last Year Line (Dashed) */}
                        <path
                            d={generatePath(currentData.lastYear.slice(0, 12), true)}
                            fill="none"
                            className="stroke-blue-300 dark:stroke-blue-700 transition-all duration-500 animate-in fade-in"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                        />

                        {/* This Year Line (Solid) */}
                        <path
                            d={generatePath(currentData.thisYear.slice(0, 12), false)}
                            fill="none"
                            className="stroke-slate-900 dark:stroke-slate-100 transition-all duration-500 animate-in fade-in"
                            strokeWidth="3"
                        />

                        {/* Dynamic Data Points for visual interest */}
                        {currentData.thisYear.length > 0 && (
                            <>
                                <circle
                                    cx={(currentData.thisYear.length - 1) * (800 / (currentData.thisYear.length - 1))}
                                    cy={200 - (currentData.thisYear[currentData.thisYear.length - 1] / (Math.max(...currentData.thisYear, 100) * 1.1)) * 180}
                                    r="4"
                                    className="fill-slate-900 dark:fill-slate-100 stroke-white dark:stroke-slate-900"
                                    strokeWidth="2"
                                />
                            </>
                        )}
                    </svg>
                </div>

                {/* X-Axis Labels */}
                <div className="flex justify-between w-full absolute bottom-4 left-0 px-6">
                    {months.slice(0, 12).map((m, i) => (
                        <span key={m} className={`text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter ${i % 2 !== 0 ? "hidden sm:inline" : ""}`}>
                            {m}
                        </span>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default AdminDashboardCharts;
