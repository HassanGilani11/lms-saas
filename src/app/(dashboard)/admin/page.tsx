"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users, BookOpen, List, GraduationCap,
    MoreHorizontal, Globe, Monitor, Smartphone,
    Tablet, MapPin
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const AdminDashboardPage = () => {
    return (
        <div className="space-y-8 font-sans animate-in fade-in duration-500">
            {/* Header Section */}
            <div>
                <h1 className="text-sm font-bold text-slate-900 mb-1">Welcome Client!</h1>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Courses", value: "300", icon: BookOpen, color: "bg-blue-50 text-blue-600" },
                    { label: "Categories", value: "150", icon: List, color: "bg-purple-50 text-purple-600" },
                    { label: "Instructors", value: "100", icon: GraduationCap, color: "bg-amber-50 text-amber-600" },
                    { label: "Students", value: "2,318", icon: Users, color: "bg-emerald-50 text-emerald-600" },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white/50 backdrop-blur-sm group hover:shadow-md transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex flex-col space-y-3">
                                <span className="text-[12px] font-medium text-slate-500 uppercase tracking-wider">{stat.label}</span>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                                    <div className={`${stat.color} p-2 rounded-xl group-hover:scale-110 transition-transform`}>
                                        <stat.icon size={20} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Chart Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="xl:col-span-2 border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-x-6">
                            {["Total Users", "Total Projects", "Operating Status"].map((tab, i) => (
                                <span key={i} className={`text-[13px] font-bold cursor-pointer transition-colors ${i === 0 ? "text-slate-900 border-b-2 border-slate-900 pb-1" : "text-slate-400 hover:text-slate-600"}`}>
                                    {tab}
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center gap-x-4">
                            <div className="flex items-center gap-x-2">
                                <span className="h-2 w-2 rounded-full bg-slate-900" />
                                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">This year</span>
                            </div>
                            <div className="flex items-center gap-x-2">
                                <span className="h-2 w-2 rounded-full bg-blue-300" />
                                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">Last year</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[280px] w-full relative pt-4">
                        {/* Custom SVG Wave Chart Implementation */}
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200" preserveAspectRatio="none">
                            {/* Grid Lines */}
                            {[0, 50, 100, 150, 200].map(y => (
                                <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                            ))}

                            {/* Last Year Line (Dashed) */}
                            <path
                                d="M0,150 Q100,100 200,160 T400,120 T600,140 T800,90"
                                fill="none"
                                stroke="#93c5fd"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                            />

                            {/* This Year Line (Solid) */}
                            <path
                                d="M0,170 Q100,120 200,180 T400,140 T600,160 T800,110"
                                fill="none"
                                stroke="#0f172a"
                                strokeWidth="3"
                            />

                            {/* Data Points */}
                            <circle cx="200" cy="180" r="4" fill="#0f172a" stroke="white" strokeWidth="2" />
                            <circle cx="600" cy="160" r="4" fill="#0f172a" stroke="white" strokeWidth="2" />
                        </svg>

                        {/* X-Axis Labels */}
                        <div className="flex justify-between w-full mt-4">
                            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map(m => (
                                <span key={m} className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{m}</span>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Traffic by Website */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-[13px] font-bold">Traffic by Website</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-2">
                        {[
                            { name: "Google", value: 80 },
                            { name: "YouTube", value: 65 },
                            { name: "Instagram", value: 45 },
                            { name: "Pinterest", value: 30 },
                            { name: "Facebook", value: 20 },
                            { name: "Twitter", value: 15 },
                        ].map((site, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-[11px] font-bold text-slate-600">
                                    <span>{site.name}</span>
                                    <div className="flex gap-x-1">
                                        {[1, 2, 3].map(b => (
                                            <div key={b} className={`h-1 w-4 rounded-full ${b <= (site.value / 25) ? "bg-slate-800" : "bg-slate-200"}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
                {/* Traffic by Device */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-[13px] font-bold">Traffic by Device</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px] pt-4">
                        <div className="flex items-end justify-between h-[200px] gap-x-4 px-4">
                            {[
                                { label: "Linux", value: "40%", height: "h-[40%]", color: "bg-blue-200" },
                                { label: "Mac", value: "80%", height: "h-[80%]", color: "bg-emerald-300" },
                                { label: "iOS", value: "60%", height: "h-[60%]", color: "bg-black" },
                                { label: "Windows", value: "90%", height: "h-[90%]", color: "bg-blue-400" },
                                { label: "Android", value: "50%", height: "h-[50%]", color: "bg-purple-300" },
                                { label: "Other", value: "70%", height: "h-[70%]", color: "bg-emerald-400" },
                            ].map((bar, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-y-3 group">
                                    <div className={`${bar.height} w-full rounded-lg ${bar.color} transition-all duration-500 hover:opacity-80 relative overflow-hidden`}>
                                        <div className="absolute top-2 left-0 right-0 text-[8px] text-center font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            {bar.value}
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{bar.label}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Traffic by Location */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-[13px] font-bold">Traffic by Location</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px] flex items-center justify-between px-6 pt-4">
                        <div className="h-40 w-40 relative rounded-full border-[15px] border-slate-100 flex items-center justify-center">
                            {/* Simple Pie Representation */}
                            <div className="absolute inset-0 rounded-full border-[15px] border-blue-400 border-r-transparent border-b-transparent rotate-45" />
                            <div className="absolute inset-0 rounded-full border-[15px] border-emerald-300 border-l-transparent border-t-transparent -rotate-12" />
                            <div className="absolute inset-0 rounded-full border-[15px] border-purple-300 border-l-transparent border-b-transparent rotate-[140deg]" />
                        </div>
                        <div className="space-y-4 pr-10">
                            {[
                                { label: "United States", value: "52.1%", color: "bg-slate-800" },
                                { label: "Canada", value: "22.8%", color: "bg-blue-400" },
                                { label: "Mexico", value: "13.9%", color: "bg-emerald-300" },
                                { label: "Other", value: "11.2%", color: "bg-blue-200" },
                            ].map((loc, i) => (
                                <div key={i} className="flex items-center gap-x-8">
                                    <div className="flex items-center gap-x-2 w-28">
                                        <div className={`h-1.5 w-1.5 rounded-full ${loc.color}`} />
                                        <span className="text-[11px] font-medium text-slate-600">{loc.label}</span>
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-800">{loc.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
