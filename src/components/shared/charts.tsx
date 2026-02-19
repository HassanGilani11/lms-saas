"use client";

import React from "react";

export const BarChart = ({ data }: { data: { name: string; count: number }[] }) => {
    const max = Math.max(...data.map(d => d.count), 1);
    return (
        <div className="h-full w-full flex items-end justify-between gap-2 pt-4">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="relative w-full flex justify-center">
                        <div
                            className="w-full max-w-[40px] bg-indigo-500/20 dark:bg-indigo-400/20 rounded-t-lg group-hover:bg-indigo-500/40 transition-all duration-500"
                            style={{ height: `${(d.count / max) * 160}px` }}
                        >
                            <div
                                className="absolute bottom-0 w-full bg-indigo-600 dark:bg-indigo-400 rounded-t-lg transition-all duration-700"
                                style={{ height: `${(d.count / max) * 100}%` }}
                            />
                        </div>
                        <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow-xl">
                            {d.count}
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{d.name}</span>
                </div>
            ))}
        </div>
    );
};

export const HeatmapMock = ({ data }: { data: { name: string; value: number }[] }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full pt-4">
            {data.length === 0 ? (
                <div className="col-span-2 flex items-center justify-center text-slate-400 italic text-sm">
                    No engagement data yet
                </div>
            ) : (
                data.map((d, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            <span className="truncate">{d.name}</span>
                            <span>{d.value} sales</span>
                        </div>
                        <div className="h-8 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                            <div
                                className="h-full bg-emerald-500/20 dark:bg-emerald-400/10 transition-all duration-1000"
                                style={{ width: `${(d.value / max) * 100}%` }}
                            />
                            <div
                                className="absolute top-0 left-0 h-full bg-emerald-500 dark:bg-emerald-400 opacity-60 rounded-lg transition-all duration-1000"
                                style={{ width: `${(d.value / max) * 100}%` }}
                            />
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};
