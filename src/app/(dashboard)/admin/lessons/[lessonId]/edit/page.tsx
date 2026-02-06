"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
    ChevronRight,
    ArrowLeft,
    Save,
    X,
    PlusCircle,
    GripVertical,
    Video,
    FileText,
    File,
    Trash2,
    Pencil,
    ChevronDown,
    ChevronUp
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { getLesson } from "@/actions/curriculum";
import { updateLesson, createTopic, deleteTopic, updateTopic } from "@/actions/lesson";

const EditLessonPage = ({ params }: { params: Promise<{ lessonId: string }> }) => {
    const { lessonId } = use(params);
    const router = useRouter();
    const [lesson, setLesson] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lessonTitle, setLessonTitle] = useState("");

    // Topic States
    const [isCreatingTopic, setIsCreatingTopic] = useState(false);
    const [newTopicTitle, setNewTopicTitle] = useState("");
    const [newTopicType, setNewTopicType] = useState<"VIDEO" | "TEXT" | "PDF">("VIDEO");
    const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
    const [editTopicContent, setEditTopicContent] = useState("");
    const [editTopicUrl, setEditTopicUrl] = useState("");

    const fetchData = async () => {
        setIsLoading(true);
        const data = await getLesson(lessonId);
        if (data) {
            setLesson(data);
            setLessonTitle(data.title);
        } else {
            toast.error("Lesson not found");
            router.push("/admin/lessons");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [lessonId]);

    const onSaveLesson = async () => {
        try {
            setIsSubmitting(true);
            await updateLesson(lessonId, { title: lessonTitle });
            toast.success("Lesson updated");
            fetchData();
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const onCreateTopic = async () => {
        try {
            if (!newTopicTitle) return;
            await createTopic(lessonId, newTopicTitle, newTopicType);
            toast.success("Topic created");
            setIsCreatingTopic(false);
            setNewTopicTitle("");
            fetchData();
        } catch {
            toast.error("Something went wrong");
        }
    };

    const onDeleteTopic = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteTopic(id);
            toast.success("Topic deleted");
            fetchData();
        } catch {
            toast.error("Something went wrong");
        }
    };

    const onEditTopicContent = async (topicId: string) => {
        try {
            const values: any = { content: editTopicContent };
            if (editTopicUrl) {
                const topic = lesson.topics.find((t: any) => t.id === topicId);
                if (topic.type === "VIDEO") values.videoUrl = editTopicUrl;
                if (topic.type === "PDF") values.pdfUrl = editTopicUrl;
            }
            await updateTopic(topicId, values);
            toast.success("Topic updated");
            setEditingTopicId(null);
            fetchData();
        } catch {
            toast.error("Something went wrong");
        }
    };

    const startEditingTopic = (topic: any) => {
        setEditingTopicId(topic.id);
        setEditTopicContent(topic.content || "");
        setEditTopicUrl(topic.type === "VIDEO" ? topic.videoUrl || "" : topic.pdfUrl || "");
    };

    if (isLoading) {
        return <div className="p-6 text-slate-400">Loading lesson data...</div>;
    }

    return (
        <div className="p-6 space-y-6 font-sans">
            <div className="flex items-center gap-x-2 text-sm text-slate-500">
                <span>Dashboards</span>
                <ChevronRight className="h-4 w-4" />
                <span>Lessons</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-slate-900 font-medium">Edit Lesson</span>
            </div>

            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    className="flex items-center gap-x-2 text-slate-500 hover:text-slate-900 px-0"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to lessons
                </Button>
                <div className="flex items-center gap-x-2">
                    <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button onClick={onSaveLesson} disabled={isSubmitting} className="bg-slate-900 hover:bg-slate-800">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader className="border-b">
                            <CardTitle className="text-[16px] font-bold">Lesson Details</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Lesson Title</label>
                                    <Input
                                        value={lessonTitle}
                                        onChange={(e) => setLessonTitle(e.target.value)}
                                        placeholder="e.g. Introduction to React"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader className="border-b flex flex-row items-center justify-between">
                            <CardTitle className="text-[16px] font-bold">Lesson Topics</CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-indigo-600 hover:text-indigo-700 font-bold"
                                onClick={() => setIsCreatingTopic(!isCreatingTopic)}
                            >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add Topic
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {isCreatingTopic && (
                                <div className="bg-slate-50 p-4 rounded-lg mb-4 space-y-4">
                                    <Input
                                        placeholder="Topic title..."
                                        value={newTopicTitle}
                                        onChange={(e) => setNewTopicTitle(e.target.value)}
                                    />
                                    <div className="flex items-center gap-x-2">
                                        {(["VIDEO", "TEXT", "PDF"] as const).map((type) => (
                                            <Button
                                                key={type}
                                                size="sm"
                                                variant={newTopicType === type ? "default" : "outline"}
                                                onClick={() => setNewTopicType(type)}
                                                className="text-[12px] font-bold"
                                            >
                                                {type}
                                            </Button>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-x-2">
                                        <Button size="sm" variant="outline" onClick={() => setIsCreatingTopic(false)}>Cancel</Button>
                                        <Button size="sm" className="bg-slate-900" onClick={onCreateTopic}>Create</Button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                {lesson.topics.map((topic: any) => (
                                    <div key={topic.id} className="border border-slate-200 rounded-lg overflow-hidden">
                                        <div className="bg-white p-3 flex items-center gap-x-3">
                                            <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                                {topic.type === "VIDEO" && <Video className="h-4 w-4 text-rose-500" />}
                                                {topic.type === "TEXT" && <FileText className="h-4 w-4 text-slate-500" />}
                                                {topic.type === "PDF" && <File className="h-4 w-4 text-blue-500" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[13px] font-medium text-slate-700">{topic.title}</p>
                                                <div className="flex items-center gap-x-2 mt-1">
                                                    <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-500">
                                                        {topic.type}
                                                    </Badge>
                                                    {topic.isFree && (
                                                        <Badge variant="secondary" className="text-[10px] bg-green-50 text-green-600 border-green-100">
                                                            Free
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-slate-900"
                                                    onClick={() => router.push(`/admin/topics/${topic.id}/edit`)}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-rose-600"
                                                    onClick={() => onDeleteTopic(topic.id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {lesson.topics.length === 0 && (
                                    <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-lg">
                                        <p className="text-sm text-slate-400 font-medium">No topics in this lesson yet.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EditLessonPage;
