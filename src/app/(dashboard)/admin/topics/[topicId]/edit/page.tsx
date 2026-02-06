"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
    ChevronRight,
    ArrowLeft,
    Save,
    Video,
    FileText,
    File,
    Trash2,
    Eye,
    Layout
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

import { getTopic } from "@/actions/curriculum";
import { updateTopic, deleteTopic } from "@/actions/lesson";

const EditTopicPage = ({ params }: { params: Promise<{ topicId: string }> }) => {
    const { topicId } = use(params);
    const router = useRouter();
    const [topic, setTopic] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [pdfUrl, setPdfUrl] = useState("");

    const fetchData = async () => {
        setIsLoading(true);
        const data = await getTopic(topicId);
        if (data) {
            setTopic(data);
            setTitle(data.title);
            setContent(data.content || "");
            setVideoUrl(data.videoUrl || "");
            setPdfUrl(data.pdfUrl || "");
        } else {
            toast.error("Topic not found");
            router.push("/admin/topics");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [topicId]);

    const onSaveTopic = async () => {
        try {
            setIsSubmitting(true);
            const values: any = {
                title,
                content,
                videoUrl,
                pdfUrl,
            };
            await updateTopic(topicId, values);
            toast.success("Topic updated");
            fetchData();
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onDeleteTopic = async () => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteTopic(topicId);
            toast.success("Topic deleted");
            router.push("/admin/topics");
        } catch {
            toast.error("Something went wrong");
        }
    };

    if (isLoading) {
        return <div className="p-6 text-slate-400">Loading topic data...</div>;
    }

    return (
        <div className="p-6 space-y-6 font-sans">
            <div className="flex items-center gap-x-2 text-sm text-slate-500">
                <span>Dashboards</span>
                <ChevronRight className="h-4 w-4" />
                <span>Topics</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-slate-900 font-medium">Edit Topic</span>
            </div>

            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    className="flex items-center gap-x-2 text-slate-500 hover:text-slate-900 px-0"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to previous
                </Button>
                <div className="flex items-center gap-x-2">
                    <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button onClick={onSaveTopic} disabled={isSubmitting} className="bg-slate-900 hover:bg-slate-800">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader className="border-b">
                            <CardTitle className="text-[16px] font-bold">Topic Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Topic Title</label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Introduction to Next.js"
                                />
                            </div>
                            <div className="flex items-center gap-x-2">
                                <label className="text-sm font-medium">Topic Type:</label>
                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold uppercase py-1">
                                    {topic.type}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-x-2">
                                <label className="text-sm font-medium">Associated Lesson:</label>
                                <span className="text-sm text-slate-600 font-medium">{topic.lesson?.title}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader className="border-b">
                            <CardTitle className="text-[16px] font-bold">Topic Content</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Content Text</label>
                                    <Textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Enter the main text content for this topic..."
                                        className="min-h-[200px] text-[13px]"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {(topic.type === "VIDEO" || topic.type === "TEXT") && (
                        <Card className="border-none shadow-sm">
                            <CardHeader className="border-b flex flex-row items-center justify-between gap-x-2">
                                <div className="flex items-center gap-x-2">
                                    <Video className="h-4 w-4 text-rose-500" />
                                    <CardTitle className="text-[16px] font-bold">Video Resource</CardTitle>
                                </div>
                                {videoUrl && (
                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                        Active
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Video URL</label>
                                    <Input
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                    <p className="text-[11px] text-slate-500">
                                        Enter a YouTube, Vimeo, or direct MP4 URL.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {(topic.type === "PDF" || topic.type === "TEXT") && (
                        <Card className="border-none shadow-sm">
                            <CardHeader className="border-b flex flex-row items-center justify-between gap-x-2">
                                <div className="flex items-center gap-x-2">
                                    <File className="h-4 w-4 text-blue-500" />
                                    <CardTitle className="text-[16px] font-bold">PDF Document</CardTitle>
                                </div>
                                {pdfUrl && (
                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                        Active
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">PDF URL</label>
                                    <Input
                                        value={pdfUrl}
                                        onChange={(e) => setPdfUrl(e.target.value)}
                                        placeholder="https://example.com/document.pdf"
                                    />
                                    <p className="text-[11px] text-slate-500">
                                        Enter the direct link to the PDF file.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="border-rose-100 border bg-rose-50/30">
                        <CardHeader>
                            <CardTitle className="text-[14px] font-bold text-rose-800">Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-rose-600 mb-4">
                                Once you delete a topic, it cannot be undone. All user progress for this topic will be lost.
                            </p>
                            <Button variant="destructive" size="sm" onClick={onDeleteTopic} className="bg-rose-600 hover:bg-rose-700">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Topic
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EditTopicPage;
