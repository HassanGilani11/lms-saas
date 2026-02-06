"use client";

import { useState } from "react";
import {
    PlusCircle,
    Pencil,
    Trash2,
    GripVertical,
    ChevronDown,
    ChevronRight,
    Video,
    FileText,
    File,
    ChevronUp,
    Save,
    X,
    CheckCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
    createLesson,
    deleteLesson,
    updateLesson
} from "@/actions/lesson";
import {
    createTopic,
    deleteTopic,
    updateTopic
} from "@/actions/lesson";

import {
    createAttachment,
    deleteAttachment
} from "@/actions/attachment";

interface LessonsFormProps {
    initialData: any;
    courseId: string;
    onRefresh?: () => void;
}

export const LessonsForm = ({
    initialData,
    courseId,
    onRefresh
}: LessonsFormProps) => {
    const [isCreatingLesson, setIsCreatingLesson] = useState(false);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [newLessonTitle, setNewLessonTitle] = useState("");
    const [expandedLessons, setExpandedLessons] = useState<Record<string, boolean>>({});
    const [isCreatingTopic, setIsCreatingTopic] = useState<string | null>(null);
    const [newTopicTitle, setNewTopicTitle] = useState("");
    const [newTopicType, setNewTopicType] = useState<"VIDEO" | "TEXT" | "PDF" | "QUIZ">("VIDEO");
    const [creationMode, setCreationMode] = useState<"TOPIC" | "QUIZ">("TOPIC");
    const [editingProgression, setEditingProgression] = useState<string | null>(null);
    const [progressionRules, setProgressionRules] = useState("");
    const [isAddingAttachment, setIsAddingAttachment] = useState<string | null>(null);
    const [attachmentName, setAttachmentName] = useState("");
    const [attachmentUrl, setAttachmentUrl] = useState("");
    const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
    const [editTopicContent, setEditTopicContent] = useState("");
    const [editTopicUrl, setEditTopicUrl] = useState("");

    const router = useRouter();

    const toggleLesson = (id: string) => {
        setExpandedLessons((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const onCreateLesson = async () => {
        try {
            if (!newLessonTitle) return;
            const lesson = await createLesson(courseId, newLessonTitle);
            if (lesson) {
                toast.success("Lesson created");
                setIsCreatingLesson(false);
                setNewLessonTitle("");
                router.refresh();
                onRefresh?.();
            }
        } catch {
            toast.error("Something went wrong");
        }
    };

    const onDeleteLesson = async (id: string) => {
        try {
            await deleteLesson(id);
            toast.success("Lesson deleted");
            router.refresh();
            onRefresh?.();
        } catch {
            toast.error("Something went wrong");
        }
    };

    const onUpdateProgression = async (lessonId: string) => {
        try {
            let rules = [];
            try {
                rules = JSON.parse(progressionRules);
            } catch {
                toast.error("Invalid JSON for rules");
                return;
            }
            await updateLesson(lessonId, { progressionRules: rules });
            toast.success("Progression rules updated");
            setEditingProgression(null);
            router.refresh();
            onRefresh?.();
        } catch {
            toast.error("Something went wrong");
        }
    };

    const onCreateTopic = async (lessonId: string) => {
        try {
            if (!newTopicTitle) return;
            const topic = await createTopic(lessonId, newTopicTitle, newTopicType);
            if (topic) {
                toast.success(newTopicType === "QUIZ" ? "Quiz created" : "Topic created");
                setIsCreatingTopic(null);
                setNewTopicTitle("");
                router.refresh();
                onRefresh?.();
            }
        } catch {
            toast.error("Something went wrong");
        }
    };

    const onDeleteTopic = async (id: string) => {
        try {
            await deleteTopic(id);
            toast.success("Topic deleted");
            router.refresh();
            onRefresh?.();
        } catch {
            toast.error("Something went wrong");
        }
    };

    const onUpdateTopicContent = async (topicId: string, type: string) => {
        try {
            const values: any = {
                content: editTopicContent
            };
            if (type === "VIDEO") values.videoUrl = editTopicUrl;
            if (type === "PDF") values.pdfUrl = editTopicUrl;

            await updateTopic(topicId, values);
            toast.success("Topic updated");
            setEditingTopicId(null);
            router.refresh();
            onRefresh?.();
        } catch {
            toast.error("Something went wrong");
        }
    };

    const onAddAttachment = async (topicId: string) => {
        try {
            if (!attachmentName || !attachmentUrl) return;
            await createAttachment({
                name: attachmentName,
                url: attachmentUrl,
                topicId,
                courseId
            });
            toast.success("Attachment added");
            setIsAddingAttachment(null);
            setAttachmentName("");
            setAttachmentUrl("");
            router.refresh();
            onRefresh?.();
        } catch {
            toast.error("Something went wrong");
        }
    };

    const onDeleteAttachment = async (id: string) => {
        try {
            await deleteAttachment(id);
            toast.success("Attachment deleted");
            router.refresh();
            onRefresh?.();
        } catch {
            toast.error("Something went wrong");
        }
    };

    return (
        <Card className="border-none shadow-sm md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-lg font-bold">Course Curriculum</CardTitle>
                    <p className="text-sm text-slate-500">Manage your course lessons and topics</p>
                </div>
                <Button
                    type="button"
                    onClick={() => setIsCreatingLesson(true)}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-[12px] font-bold text-slate-600"
                >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Lesson
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {isCreatingLesson && (
                    <div className="flex items-center gap-x-2 p-3 bg-slate-50 rounded-lg">
                        <Input
                            placeholder="e.g. 'Introduction to the Course'"
                            value={newLessonTitle}
                            onChange={(e) => setNewLessonTitle(e.target.value)}
                            className="h-9 text-sm"
                        />
                        <Button type="button" onClick={onCreateLesson} size="sm" className="h-9 font-bold">Create</Button>
                        <Button type="button" onClick={() => setIsCreatingLesson(false)} variant="ghost" size="sm" className="h-9"><X className="h-4 w-4" /></Button>
                    </div>
                )}

                <div className="space-y-4">
                    {initialData?.lessons?.length === 0 && !isCreatingLesson && (
                        <div className="text-sm text-slate-500 italic py-6 text-center border-2 border-dashed rounded-xl">
                            No lessons yet. Click "Add Lesson" to start building your curriculum.
                        </div>
                    )}

                    {initialData?.lessons?.map((lesson: any) => (
                        <div key={lesson.id} className="border rounded-xl bg-white overflow-hidden">
                            <div
                                className="flex items-center gap-x-2 p-4 hover:bg-slate-50/50 transition cursor-pointer"
                                onClick={() => toggleLesson(lesson.id)}
                            >
                                <div className="flex items-center gap-x-2 flex-1">
                                    {expandedLessons[lesson.id] ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                                    <span className="font-bold text-slate-700 text-sm italic mr-2 uppercase tracking-widest text-[10px]">Lesson {lesson.position}</span>
                                    <span className="font-semibold text-slate-900">{lesson.title}</span>
                                </div>
                                <div className="flex items-center gap-x-2">
                                    <Badge variant="outline" className="text-[10px] font-bold text-slate-400 uppercase">
                                        {(() => {
                                            const quizCount = lesson.topics?.filter((t: any) => t.type === "QUIZ").length || 0;
                                            const topicCount = (lesson.topics?.length || 0) - quizCount;
                                            const parts = [];
                                            if (topicCount > 0) parts.push(`${topicCount} Topic${topicCount !== 1 ? 's' : ''}`);
                                            if (quizCount > 0) parts.push(`${quizCount} Quiz${quizCount !== 1 ? 'zes' : ''}`);
                                            return parts.length > 0 ? parts.join(", ") : "Empty";
                                        })()}
                                    </Badge>
                                    <Button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteLesson(lesson.id);
                                        }}
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-rose-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {expandedLessons[lesson.id] && (
                                <div className="px-4 pb-4 space-y-6 bg-slate-50/30">
                                    <Separator className="bg-slate-100" />

                                    {/* Progression Rules Section */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Progression Rules</h4>
                                            {!editingProgression && (
                                                <Button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingProgression(lesson.id);
                                                        setProgressionRules(JSON.stringify(lesson.progressionRules || [], null, 2));
                                                    }}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-[10px] font-bold text-slate-500"
                                                >
                                                    <Pencil className="h-3 w-3 mr-1" />
                                                    Edit Rules
                                                </Button>
                                            )}
                                        </div>
                                        {editingProgression === lesson.id ? (
                                            <div className="space-y-2">
                                                <textarea
                                                    className="w-full text-xs font-mono p-2 border rounded-md min-h-[60px] bg-white"
                                                    value={progressionRules}
                                                    onChange={(e) => setProgressionRules(e.target.value)}
                                                    placeholder='e.g. ["COMPLETED_PREVIOUS"]'
                                                />
                                                <div className="flex gap-x-2">
                                                    <Button type="button" onClick={() => onUpdateProgression(lesson.id)} size="sm" className="h-7 text-[10px] font-bold">Save</Button>
                                                    <Button type="button" onClick={() => setEditingProgression(null)} variant="outline" size="sm" className="h-7 text-[10px] font-bold">Cancel</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-[12px] text-slate-600 bg-white p-2 rounded border border-slate-100">
                                                {lesson.progressionRules && JSON.stringify(lesson.progressionRules) !== "[]"
                                                    ? JSON.stringify(lesson.progressionRules)
                                                    : "No specific rules set."}
                                            </div>
                                        )}
                                    </div>

                                    {/* Topics Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lesson Topics</h4>
                                            <div className="flex gap-x-2">
                                                <Button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCreationMode("TOPIC");
                                                        setNewTopicType("VIDEO");
                                                        setIsCreatingTopic(lesson.id);
                                                    }}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-[10px] font-bold text-slate-500"
                                                >
                                                    <PlusCircle className="h-3.5 w-3.5 mr-1" />
                                                    Add Topic
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCreationMode("QUIZ");
                                                        setNewTopicType("QUIZ");
                                                        setIsCreatingTopic(lesson.id);
                                                    }}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-[10px] font-bold text-slate-500"
                                                >
                                                    <PlusCircle className="h-3.5 w-3.5 mr-1" />
                                                    Add Quiz
                                                </Button>
                                            </div>
                                        </div>

                                        {isCreatingTopic === lesson.id && (
                                            <div className="flex items-center gap-x-2 p-3 bg-white border rounded-lg shadow-sm">
                                                <Input
                                                    placeholder="e.g. 'Setting up your environment'"
                                                    value={newTopicTitle}
                                                    onChange={(e) => setNewTopicTitle(e.target.value)}
                                                    className="h-8 text-sm flex-1"
                                                />
                                                {creationMode === "TOPIC" ? (
                                                    <select
                                                        value={newTopicType}
                                                        onChange={(e) => setNewTopicType(e.target.value as any)}
                                                        className="h-8 text-xs bg-slate-50 px-2 rounded-md border-none ring-1 ring-slate-200"
                                                    >
                                                        <option value="VIDEO">Video</option>
                                                        <option value="TEXT">Text</option>
                                                        <option value="PDF">PDF</option>
                                                    </select>
                                                ) : (
                                                    <Badge variant="secondary" className="h-8">Quiz</Badge>
                                                )}
                                                <Button type="button" onClick={() => onCreateTopic(lesson.id)} size="sm" className="h-8 text-xs font-bold">Add</Button>
                                                <Button type="button" onClick={() => setIsCreatingTopic(null)} variant="ghost" size="sm" className="h-8"><X className="h-4 w-4" /></Button>
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            {lesson.topics?.map((topic: any, index: number) => {
                                                const isQuiz = topic.type === "QUIZ";
                                                const typeIndex = lesson.topics
                                                    .filter((t: any) => isQuiz ? t.type === "QUIZ" : t.type !== "QUIZ")
                                                    .findIndex((t: any) => t.id === topic.id) + 1;

                                                return (
                                                    <div
                                                        key={topic.id}
                                                        className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm"
                                                    >
                                                        <div className="flex items-center justify-between p-3 group hover:bg-slate-50/50 transition">
                                                            <div className="flex items-center gap-x-3">
                                                                {topic.type === "VIDEO" && <Video className="h-4 w-4 text-slate-400" />}
                                                                {topic.type === "TEXT" && <FileText className="h-4 w-4 text-slate-400" />}
                                                                {topic.type === "PDF" && <File className="h-4 w-4 text-slate-400" />}
                                                                {topic.type === "QUIZ" && <CheckCircle className="h-4 w-4 text-slate-400" />}
                                                                <span className="text-[10px] font-bold text-slate-300 uppercase italic">
                                                                    {isQuiz ? "Quiz" : "Topic"} {typeIndex}
                                                                </span>
                                                                <span className="text-[13px] font-semibold text-slate-700">{topic.title}</span>
                                                            </div>
                                                            <div className="flex items-center gap-x-1 opacity-0 group-hover:opacity-100 transition">
                                                                {topic.type === "QUIZ" ? (
                                                                    <Button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            // Assuming topic.quizId is available or we redirect to generic quiz edit
                                                                            // A safer bet if quizId might be missing is checking it, but typically it should be there. 
                                                                            // If not detailed, we'll rely on the standalone page or need to fetch it.
                                                                            // But let's try the direct route first.
                                                                            if (topic.quizId) {
                                                                                router.push(`/admin/quizzes/${topic.quizId}`);
                                                                            } else {
                                                                                toast.error("Quiz ID not found");
                                                                            }
                                                                        }}
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 text-[10px] font-bold text-slate-500"
                                                                    >
                                                                        <Pencil className="h-3 w-3 mr-1" />
                                                                        Edit Quiz
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setEditingTopicId(topic.id);
                                                                            setEditTopicContent(topic.content || "");
                                                                            setEditTopicUrl(topic.videoUrl || topic.pdfUrl || "");
                                                                        }}
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 text-[10px] font-bold text-slate-500"
                                                                    >
                                                                        <Pencil className="h-3 w-3 mr-1" />
                                                                        Edit
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    type="button"
                                                                    onClick={() => setIsAddingAttachment(topic.id)}
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 text-[10px] font-bold text-slate-500"
                                                                >
                                                                    <PlusCircle className="h-3 w-3 mr-1" />
                                                                    Attach
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    onClick={() => onDeleteTopic(topic.id)}
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-slate-400 hover:text-rose-600"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Topic Content Editor */}
                                                        {editingTopicId === topic.id && (
                                                            <div className="p-4 border-t bg-slate-50/50 space-y-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Text Content / Description</label>
                                                                    <textarea
                                                                        className="w-full text-sm p-4 border rounded-xl min-h-[150px] bg-white resize-none focus:ring-1 focus:ring-slate-400 outline-none shadow-sm"
                                                                        value={editTopicContent}
                                                                        onChange={(e) => setEditTopicContent(e.target.value)}
                                                                        placeholder="Describe this topic or provide textual content..."
                                                                    />
                                                                </div>

                                                                {topic.type === "VIDEO" && (
                                                                    <div className="space-y-2">
                                                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Video URL</label>
                                                                        <Input
                                                                            className="h-10 bg-white"
                                                                            value={editTopicUrl}
                                                                            onChange={(e) => setEditTopicUrl(e.target.value)}
                                                                            placeholder="e.g. https://www.youtube.com/watch?v=..."
                                                                        />
                                                                    </div>
                                                                )}

                                                                {topic.type === "PDF" && (
                                                                    <div className="space-y-2">
                                                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">PDF Resource URL</label>
                                                                        <Input
                                                                            className="h-10 bg-white"
                                                                            value={editTopicUrl}
                                                                            onChange={(e) => setEditTopicUrl(e.target.value)}
                                                                            placeholder="e.g. https://example.com/handout.pdf"
                                                                        />
                                                                    </div>
                                                                )}

                                                                <div className="flex gap-x-2 pt-2">
                                                                    <Button type="button" onClick={() => onUpdateTopicContent(topic.id, topic.type)} size="sm" className="h-9 px-4 text-xs font-bold">
                                                                        Save Changes
                                                                    </Button>
                                                                    <Button type="button" onClick={() => setEditingTopicId(null)} variant="outline" size="sm" className="h-9 px-4 text-xs font-bold">
                                                                        Cancel
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Topic Attachments */}
                                                        <div className="px-4 pb-3 pt-1 space-y-2 bg-slate-50/10">
                                                            {isAddingAttachment === topic.id && (
                                                                <div className="flex flex-col gap-y-2 p-2 border rounded bg-white mt-1">
                                                                    <Input
                                                                        placeholder="Resource name"
                                                                        className="h-7 text-xs"
                                                                        value={attachmentName}
                                                                        onChange={(e) => setAttachmentName(e.target.value)}
                                                                    />
                                                                    <Input
                                                                        placeholder="URL"
                                                                        className="h-7 text-xs"
                                                                        value={attachmentUrl}
                                                                        onChange={(e) => setAttachmentUrl(e.target.value)}
                                                                    />
                                                                    <div className="flex gap-x-2">
                                                                        <Button type="button" onClick={() => onAddAttachment(topic.id)} size="sm" className="h-7 text-[10px] font-bold">Add</Button>
                                                                        <Button type="button" onClick={() => setIsAddingAttachment(null)} variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-slate-400">Cancel</Button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {topic.attachments?.map((attachment: any) => (
                                                                <div key={attachment.id} className="flex items-center justify-between text-[11px] text-slate-500 bg-white px-2 py-1 rounded border border-slate-50 group/attachment">
                                                                    <div className="flex items-center gap-x-2">
                                                                        <File className="h-3 w-3 text-slate-400" />
                                                                        <a href={attachment.url} target="_blank" className="hover:underline">{attachment.name}</a>
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        onClick={() => onDeleteAttachment(attachment.id)}
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-5 w-5 text-slate-300 hover:text-rose-500 opacity-0 group-hover/attachment:opacity-100 transition"
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {lesson.topics?.length === 0 && !isCreatingTopic && (
                                                <div className="text-[12px] text-slate-400 italic py-2">No topics in this lesson.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
