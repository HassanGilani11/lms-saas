"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
    ChevronLeft,
    Save,
    Plus,
    Trash2,
    GripVertical,
    CheckCircle,
    Copy,
    Settings,
    Clock,
    BookOpen
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { getQuiz, updateQuiz } from "@/actions/quiz";
import { createQuestion, deleteQuestion, updateQuestion } from "@/actions/question";

interface Question {
    id: string;
    text: string;
    type: "MULTIPLE_CHOICE" | "SINGLE_CHOICE" | "TRUE_FALSE" | "ESSAY";
    points: number;
    position: number;
    options: { id: string; text: string; isCorrect: boolean }[];
    correctAnswer?: string;
}

const QuizEditorPage = () => {
    const params = useParams();
    const router = useRouter();
    const quizId = params.quizId as string;

    const [quiz, setQuiz] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Question Dialog State
    const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    // Form State for Question
    const [qText, setQText] = useState("");
    const [qType, setQType] = useState<string>("MULTIPLE_CHOICE");
    const [qPoints, setQPoints] = useState(1);
    const [qOptions, setQOptions] = useState<{ text: string; isCorrect: boolean }[]>([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false }
    ]);

    useEffect(() => {
        const fetchQuiz = async () => {
            const data = await getQuiz(quizId);
            if (!data) {
                toast.error("Quiz not found");
                router.push("/admin/topics"); // Or back to where they came from
                return;
            }
            setQuiz(data);
            setIsLoading(false);
        };
        fetchQuiz();
    }, [quizId, router]);

    const onSaveQuizSettings = async () => {
        setIsSaving(true);
        try {
            await updateQuiz(quizId, {
                title: quiz.title,
                description: quiz.description,
                timeLimit: quiz.timeLimit,
                passingScore: quiz.passingScore,
                shuffleQuestions: quiz.shuffleQuestions
            });
            toast.success("Quiz settings saved");
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    const handleQuestionSubmit = async () => {
        if (!qText) {
            toast.error("Question text required");
            return;
        }

        try {
            setIsSaving(true);
            const questionData = {
                text: qText,
                type: qType as any,
                points: qPoints,
                options: qOptions
            };

            if (editingQuestion) {
                await updateQuestion(editingQuestion.id, quizId, questionData);
                toast.success("Question updated");
            } else {
                await createQuestion(quizId, questionData);
                toast.success("Question created");
            }

            // Refresh data
            const data = await getQuiz(quizId);
            setQuiz(data);

            setIsQuestionDialogOpen(false);
            resetQuestionForm();

        } catch (error) {
            toast.error("Failed to save question");
        } finally {
            setIsSaving(false);
        }
    };

    const resetQuestionForm = () => {
        setEditingQuestion(null);
        setQText("");
        setQType("MULTIPLE_CHOICE");
        setQPoints(1);
        setQOptions([{ text: "", isCorrect: false }, { text: "", isCorrect: false }]);
    };

    const openCreateDialog = () => {
        resetQuestionForm();
        setIsQuestionDialogOpen(true);
    };

    const openEditDialog = (question: Question) => {
        setEditingQuestion(question);
        setQText(question.text);
        setQType(question.type);
        setQPoints(question.points);
        // Map options simply
        setQOptions(question.options.map(o => ({ text: o.text, isCorrect: o.isCorrect })));
        setIsQuestionDialogOpen(true);
    };

    const onDeleteQuestion = async (id: string) => {
        if (!confirm("Delete this question?")) return;
        try {
            await deleteQuestion(id, quizId);
            const data = await getQuiz(quizId);
            setQuiz(data);
            toast.success("Question deleted");
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    if (isLoading) return <div className="p-6">Loading quiz editor...</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            if (quiz?.course?.id) {
                                router.push(`/admin/courses/${quiz.course.id}/edit`);
                            } else if (quiz?.topics?.lesson?.courseId) {
                                // Fallback if linked via topic but not directly on quiz (though structure suggests direct link is better)
                                router.push(`/admin/courses/${quiz.topics.lesson.courseId}/edit`);
                            } else {
                                router.push("/admin/quizzes");
                            }
                        }}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back
                        {quiz?.course?.title && <span className="ml-1 text-xs text-slate-500 font-normal">to {quiz.course.title}</span>}
                    </Button>
                    <h1 className="text-xl font-bold text-slate-900">Quiz Editor</h1>
                </div>
                <div className="flex items-center gap-x-2">
                    <Button onClick={onSaveQuizSettings} disabled={isSaving} className="bg-slate-900">
                        {isSaving ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Settings</>}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Settings */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-500 flex items-center gap-2">
                                <Settings className="h-4 w-4" /> Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Quiz Title</Label>
                                <Input
                                    value={quiz.title}
                                    onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={quiz.description || ""}
                                    onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                                    className="resize-none h-20"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1"><Clock className="h-3 w-3" /> Time Limit (min)</Label>
                                    <Input
                                        type="number"
                                        value={quiz.timeLimit || 0}
                                        onChange={(e) => setQuiz({ ...quiz, timeLimit: parseInt(e.target.value) || null })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Pass Score</Label>
                                    <Input
                                        type="number"
                                        value={quiz.passingScore || 0}
                                        onChange={(e) => setQuiz({ ...quiz, passingScore: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between border p-3 rounded-lg">
                                <Label>Shuffle Questions</Label>
                                <Switch
                                    checked={quiz.shuffleQuestions}
                                    onCheckedChange={(c) => setQuiz({ ...quiz, shuffleQuestions: c })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Questions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Questions ({quiz.questions.length})</h2>
                        <Button onClick={openCreateDialog} variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" /> Add Question
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {quiz.questions.length === 0 && (
                            <div className="text-center py-10 border-2 border-dashed rounded-lg text-slate-400">
                                No questions added yet.
                            </div>
                        )}
                        {/* Drag and drop could be added here later */}
                        {quiz.questions.map((q: Question, idx: number) => (
                            <Card key={q.id} className="group relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-200 group-hover:bg-indigo-500 transition-colors" />
                                <CardContent className="p-4 pl-6 flex items-start gap-4">
                                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-bold text-slate-500 mt-0.5">
                                        {idx + 1}
                                    </span>
                                    <div className="flex-grow space-y-2">
                                        <div className="flex justify-between">
                                            <p className="font-medium text-slate-900 line-clamp-2">{q.text}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">{q.points} pt</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditDialog(q)}>
                                                    <Settings className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => onDeleteQuestion(q.id)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                                            {q.type.replace("_", " ")}
                                        </div>
                                        {/* Preview Options if needed */}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Create/Edit Question Dialog */}
            <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingQuestion ? "Edit Question" : "New Question"}</DialogTitle>
                        <DialogDescription>Configure question details and answers.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label>Question Text</Label>
                            <Textarea
                                value={qText}
                                onChange={(e) => setQText(e.target.value)}
                                placeholder="Enter your question here..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={qType} onValueChange={setQType}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                                        <SelectItem value="SINGLE_CHOICE">Single Choice</SelectItem>
                                        <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                                        <SelectItem value="ESSAY">Essay</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Points</Label>
                                <Input
                                    type="number"
                                    value={qPoints}
                                    onChange={(e) => setQPoints(parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                        {/* Options Logic */}
                        {qType !== "ESSAY" && (
                            <div className="space-y-3">
                                <Label>Answer Options</Label>
                                {qOptions.map((opt, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <Input
                                            value={opt.text}
                                            onChange={(e) => {
                                                const newOps = [...qOptions];
                                                newOps[idx].text = e.target.value;
                                                setQOptions(newOps);
                                            }}
                                            placeholder={`Option ${idx + 1}`}
                                        />
                                        <Button
                                            variant={opt.isCorrect ? "default" : "outline"}
                                            size="sm"
                                            className={opt.isCorrect ? "bg-green-600 hover:bg-green-700" : ""}
                                            onClick={() => {
                                                const newOps = [...qOptions];
                                                newOps[idx].isCorrect = !newOps[idx].isCorrect;
                                                // If single choice or True/False, uncheck others? logic here ideally.
                                                if ((qType === "SINGLE_CHOICE" || qType === "TRUE_FALSE") && newOps[idx].isCorrect) {
                                                    newOps.forEach((o, i) => { if (i !== idx) o.isCorrect = false });
                                                }
                                                setQOptions(newOps);
                                            }}
                                        >
                                            {opt.isCorrect ? <CheckCircle className="h-4 w-4" /> : "Correct?"}
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => {
                                            const newOps = qOptions.filter((_, i) => i !== idx);
                                            setQOptions(newOps);
                                        }}>
                                            <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                                <Button size="sm" variant="secondary" onClick={() => setQOptions([...qOptions, { text: "", isCorrect: false }])}>
                                    <Plus className="h-3 w-3 mr-2" /> Add Option
                                </Button>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsQuestionDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleQuestionSubmit} className="bg-slate-900">
                            {editingQuestion ? "Update Question" : "Create Question"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default QuizEditorPage;
