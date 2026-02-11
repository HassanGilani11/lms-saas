"use client";

import { useState } from "react";
import {
    Share2,
    Download,
    Upload,
    CheckCircle2,
    AlertCircle,
    BookOpen,
    Layers,
    FileText,
    Shield,
    HelpCircle,
    ShoppingCart,
    Users2,
    Settings,
    UserCircle,
    Globe,
    FileJson,
    FileSpreadsheet,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { exportData, importData } from "@/actions/import-export";

const ENTITIES = [
    { id: "course", label: "Course", options: ["Posts", "Settings"], icon: BookOpen },
    { id: "lesson", label: "Lesson", options: ["Posts", "Settings"], icon: Layers },
    { id: "topic", label: "Topic", options: ["Posts", "Settings"], icon: FileText },
    { id: "quiz", label: "Quiz", options: ["Posts", "Settings"], icon: HelpCircle },
    { id: "question", label: "Question", options: ["Posts", "Settings"], icon: HelpCircle },
    { id: "order", label: "Order", options: ["Posts"], icon: ShoppingCart },
    { id: "group", label: "Group", options: ["Posts", "Settings"], icon: Users2 },
    { id: "certificate", label: "Certificate", options: ["Posts", "Settings"], icon: Shield },
    { id: "user", label: "User", options: ["Profiles", "Progress"], icon: UserCircle },
    { id: "other", label: "Other", options: ["Global Settings"], icon: Globe },
];

const ToolsPage = () => {
    const [exportType, setExportType] = useState<"everything" | "select">("select");
    const [selectedEntities, setSelectedEntities] = useState<Record<string, string[]>>({});
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const toggleEntityOption = (entityId: string, option: string) => {
        setSelectedEntities(prev => {
            const currentOptions = prev[entityId] || [];
            const newOptions = currentOptions.includes(option)
                ? currentOptions.filter(o => o !== option)
                : [...currentOptions, option];

            return {
                ...prev,
                [entityId]: newOptions
            };
        });
    };

    const handleExport = async (format: "json" | "csv") => {
        setIsExporting(true);
        try {
            const res = await exportData({ type: exportType, entities: selectedEntities });

            if (res.success && res.data) {
                let exportContent = res.data;
                let mimeType = "application/json";

                if (format === "csv") {
                    const parsedData = JSON.parse(res.data);
                    const flattened: any[] = [];

                    // Simple flattener for Excel-friendly view
                    if (parsedData.courses) {
                        parsedData.courses.forEach((c: any) => {
                            flattened.push({
                                Entity: "COURSE",
                                ID: c.id,
                                Title: c.title,
                                Details: c.description || "",
                                Metadata: c.price ? `$${c.price}` : "Free"
                            });
                            c.lessons?.forEach((l: any) => {
                                flattened.push({
                                    Entity: "  LESSON",
                                    ID: l.id,
                                    Title: l.title,
                                    Details: l.description || "",
                                    Metadata: `Pos: ${l.position}`
                                });
                                l.topics?.forEach((t: any) => {
                                    flattened.push({
                                        Entity: "    TOPIC",
                                        ID: t.id,
                                        Title: t.title,
                                        Details: t.type,
                                        Metadata: `Free: ${t.isFree}`
                                    });
                                });
                            });
                        });
                    }

                    if (parsedData.users) {
                        parsedData.users.forEach((u: any) => {
                            flattened.push({
                                Entity: "USER",
                                ID: u.id,
                                Title: u.name || u.username,
                                Details: u.email,
                                Metadata: u.role
                            });
                        });
                    }

                    if (parsedData.purchases) {
                        parsedData.purchases.forEach((p: any) => {
                            flattened.push({
                                Entity: "ORDER",
                                ID: p.id,
                                Title: p.course?.title,
                                Details: p.user?.email,
                                Metadata: new Date(p.createdAt).toLocaleDateString()
                            });
                        });
                    }

                    if (flattened.length > 0) {
                        const headers = Object.keys(flattened[0]);
                        const csvRows = [
                            headers.join(","),
                            ...flattened.map(row =>
                                headers.map(h => `"${String(row[h] || "").replace(/"/g, '""')}"`).join(",")
                            )
                        ];
                        exportContent = csvRows.join("\n");
                        mimeType = "text/csv";
                    }
                }

                const blob = new Blob([exportContent], { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `lms-export-${new Date().getTime()}.${format}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                toast.success(`Exporting as ${format.toUpperCase()} complete.`);
            } else {
                toast.error(res.error || "Failed to export data");
            }
        } catch (error) {
            console.error(error);
            toast.error("An unexpected error occurred during export");
        } finally {
            setIsExporting(false);
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target?.result as string;
            setIsImporting(true);
            try {
                const res = await importData(content);
                if (res.success) {
                    toast.success("Data imported successfully!");
                } else {
                    toast.error(res.error || "Import failed");
                }
            } catch (error) {
                toast.error("Failed to parse import file");
            } finally {
                setIsImporting(false);
            }
        };
        reader.readAsText(file);
        e.target.value = ""; // Reset input
    };

    return (
        <div className="p-6 space-y-8 font-sans text-black">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Import & Export</h1>
                    <p className="text-slate-500 mt-1">Migrate your LMS data between environments or back up your system.</p>
                </div>
            </div>

            <Tabs defaultValue="export" className="space-y-6">
                <TabsList className="bg-slate-100/50 p-1 rounded-xl h-12">
                    <TabsTrigger value="export" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
                        <Download className="h-4 w-4" />
                        Export Data
                    </TabsTrigger>
                    <TabsTrigger value="import" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
                        <Upload className="h-4 w-4" />
                        Import Data
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="export" className="space-y-6">
                    <Card className="border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="border-b bg-slate-50/30">
                            <CardTitle className="text-lg">What do you want to export?</CardTitle>
                            <CardDescription>Select the data you wish to bundle into your export file.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="p-6 border-b">
                                <RadioGroup
                                    value={exportType}
                                    onValueChange={(val: any) => setExportType(val)}
                                    className="flex items-center gap-8"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="everything" id="everything" />
                                        <Label htmlFor="everything" className="cursor-pointer font-medium text-slate-700">Everything</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="select" id="select" />
                                        <Label htmlFor="select" className="cursor-pointer font-medium text-slate-700">I want to select</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className={cn(
                                "divide-y divide-slate-50 transition-opacity duration-300",
                                exportType === "everything" && "opacity-50 pointer-events-none"
                            )}>
                                {ENTITIES.map((entity) => (
                                    <div key={entity.id} className="flex items-center justify-between p-6 hover:bg-slate-50/30 transition-colors">
                                        <div className="flex items-center gap-4 w-1/3">
                                            <div className="h-10 w-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center shrink-0">
                                                <entity.icon className="h-5 w-5 text-slate-500" />
                                            </div>
                                            <span className="font-bold text-slate-900 capitalize">{entity.label}</span>
                                        </div>

                                        <div className="flex gap-8 flex-1 justify-start">
                                            {entity.options.map(option => (
                                                <div key={option} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`${entity.id}-${option}`}
                                                        checked={exportType === "everything" || (selectedEntities[entity.id] || []).includes(option)}
                                                        onCheckedChange={() => toggleEntityOption(entity.id, option)}
                                                    />
                                                    <Label
                                                        htmlFor={`${entity.id}-${option}`}
                                                        className="text-sm text-slate-600 cursor-pointer select-none"
                                                    >
                                                        {option}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 bg-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Export files are generated as compressed ZIP archives.</span>
                                </div>
                                <div className="flex gap-4">
                                    <Button
                                        onClick={() => handleExport("json")}
                                        disabled={isExporting || (exportType === "select" && Object.values(selectedEntities).every(v => v.length === 0))}
                                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold"
                                    >
                                        {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileJson className="h-4 w-4 mr-2" />}
                                        Generate JSON
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleExport("csv")}
                                        disabled={isExporting || (exportType === "select" && Object.values(selectedEntities).every(v => v.length === 0))}
                                        className="font-bold border-slate-200"
                                    >
                                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                                        Export CSV
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="import" className="space-y-6">
                    <Card className="border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="border-b bg-slate-50/30">
                            <CardTitle className="text-lg">Upload Data File</CardTitle>
                            <CardDescription>Select a previously exported JSON or CSV file to restore or import data.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                            <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                                <Upload className="h-10 w-10 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Drag and Drop your file</h3>
                            <p className="text-slate-500 mb-8 max-w-sm">
                                Supported formats: .json, .csv. Maximum file size 50MB.
                                Please ensure the file follows our migration schema.
                            </p>

                            <div className="relative group">
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    accept=".json,.csv"
                                    onChange={handleImport}
                                    disabled={isImporting}
                                />
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="px-8 border-slate-200 group-hover:bg-slate-50 group-hover:border-slate-300 transition-all font-bold"
                                    disabled={isImporting}
                                >
                                    {isImporting ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <Upload className="h-4 w-4 mr-2" />
                                    )}
                                    Select File
                                </Button>
                            </div>

                            <div className="mt-12 w-full max-w-lg">
                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-left flex gap-4">
                                    <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-amber-900 text-sm">Caution: Data Overwrite</h4>
                                        <p className="text-xs text-amber-700 leading-relaxed">
                                            Importing data may overwrite existing records with the same IDs.
                                            We strongly recommend creating a backup of your current database before proceeding.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-slate-100 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base">History</CardTitle>
                                <CardDescription>Recent import and export activities.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm py-2 border-b border-slate-50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">Full System Export</p>
                                                <p className="text-[10px] text-slate-400">JSON • 12.4 MB</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-400 tracking-tighter">2 days ago</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm py-2">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">User Migration</p>
                                                <p className="text-[10px] text-slate-400">CSV • 1.2 MB</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-400 tracking-tighter">5 days ago</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-100 shadow-sm bg-slate-900 text-white">
                            <CardHeader>
                                <CardTitle className="text-base text-white">Developer API</CardTitle>
                                <CardDescription className="text-slate-400">Automate your migrations via our secure CLI tools.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-slate-800 p-4 rounded-lg font-mono text-[11px] text-blue-400">
                                    <p className="mb-1 text-slate-400"># Authenticate & Download</p>
                                    <p>lms-cli auth login --apiKey=[YOUR_KEY]</p>
                                    <p>lms-cli export --everything --format=json</p>
                                </div>
                                <Button className="mt-6 w-full bg-blue-600 hover:bg-blue-500 font-bold border-none">
                                    View CLI Documentation
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ToolsPage;
