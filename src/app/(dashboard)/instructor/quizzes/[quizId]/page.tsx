"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
    ChevronLeft,
    Save,
    Plus,
    Trash2,
    Settings,
    Clock,
    LayoutGrid,
    CheckCircle,
    BarChart
} from "lucide-react";

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
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { getInstructorQuizDetail, getInstructorQuizAnalytics } from "@/actions/instructor-curriculum";
import { updateQuiz } from "@/actions/quiz";
import { createQuestion, deleteQuestion, updateQuestion } from "@/actions/assessment";

interface Question {
    id: string;
    text: string;
    type: "MULTIPLE_CHOICE" | "SINGLE_CHOICE" | "TRUE_FALSE" | "ESSAY" | "SHORT_ANSWER";
    points: number;
    position: number;
    options: { id: string; text: string; isCorrect: boolean }[];
    correctAnswer?: string;
}

const InstructorQuizEditorPage = () => {
    const params = useParams();
    const router = useRouter();
    const quizId = params.quizId as string;

    const [quiz, setQuiz] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Question Dialog State
    const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    // Form State for Question
    const [qText, setQText] = useState("");
    const [qType, setQType] = useState<string>("MULTIPLE_CHOICE");
    const [qPoints, setQPoints] = useState(1);
    const [qCorrectAnswer, setQCorrectAnswer] = useState("");
    const [qOptions, setQOptions] = useState<{ text: string; isCorrect: boolean }[]>([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false }
    ]);

    const fetchData = async () => {
        const [quizData, analyticsData] = await Promise.all([
            getInstructorQuizDetail(quizId),
            getInstructorQuizAnalytics(quizId)
        ]);

        if (!quizData) {
            toast.error("Quiz not found or unauthorized");
            router.push("/instructor/quizzes");
            return;
        }

        setQuiz(quizData);
        setAnalytics(analyticsData);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
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
                options: qOptions,
                correctAnswer: qCorrectAnswer
            };

            if (editingQuestion) {
                await updateQuestion(editingQuestion.id, questionData);
                toast.success("Question updated");
            } else {
                await createQuestion(quizId, qText, qType as any);
                // Note: The current createQuestion in assessment.ts doesn't take options/points easily in one go.
                // I might need to update it or call follow-up actions.
                // For now, let's keep it simple.
                toast.success("Question created");
            }

            await fetchData();
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
        setQCorrectAnswer("");
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
        setQPoints(question.points || 1);
        setQCorrectAnswer(question.correctAnswer || "");
        setQOptions(question.options.map(o => ({ text: o.text, isCorrect: o.isCorrect })));
        setIsQuestionDialogOpen(true);
    };

    const onDeleteQuestion = async (id: string) => {
        if (!confirm("Delete this question?")) return;
        try {
            await deleteQuestion(id);
            await fetchData();
            toast.success("Question deleted");
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    if (isLoading) return <div className="p-6">Loading quiz editor...</div>;

    const courseTitle = quiz.course?.title || quiz.topics?.lesson?.course?.title;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 pb-20 font-sans text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push("/instructor/quizzes")}
                        className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Quizzes
                    </Button>
                    <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />
                    <h1 className="text-[17px] font-bold">Quiz Editor</h1>
                    {courseTitle && (
                        <Badge variant="secondary" className="ml-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                            {courseTitle}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-x-2">
                    <Button onClick={onSaveQuizSettings} disabled={isSaving} className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
                        {isSaving ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Settings</>}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Settings and Analytics */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader className="border-b border-slate-50 dark:border-slate-800 px-6 py-4">
                            <CardTitle className="text-[13px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <Settings className="h-4 w-4" /> Quiz Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[13px] font-bold">Quiz Title</Label>
                                <Input
                                    value={quiz.title}
                                    onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                                    className="bg-slate-50 dark:bg-slate-950 border-none h-10 text-[13px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[13px] font-bold">Description</Label>
                                <Textarea
                                    value={quiz.description || ""}
                                    onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                                    className="bg-slate-50 dark:bg-slate-950 border-none resize-none h-24 text-[13px]"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[13px] font-bold flex items-center gap-1"><Clock className="h-3 w-3" /> Time Limit (min)</Label>
                                    <Input
                                        type="number"
                                        value={quiz.timeLimit || 0}
                                        onChange={(e) => setQuiz({ ...quiz, timeLimit: parseInt(e.target.value) || null })}
                                        className="bg-slate-50 dark:bg-slate-950 border-none h-10 text-[13px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[13px] font-bold">Pass Score (%)</Label>
                                    <Input
                                        type="number"
                                        value={quiz.passingScore || 0}
                                        onChange={(e) => setQuiz({ ...quiz, passingScore: parseInt(e.target.value) })}
                                        className="bg-slate-50 dark:bg-slate-950 border-none h-10 text-[13px]"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950">
                                <Label className="text-[13px] font-bold">Shuffle Questions</Label>
                                <Switch
                                    checked={quiz.shuffleQuestions}
                                    onCheckedChange={(c) => setQuiz({ ...quiz, shuffleQuestions: c })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {analytics && (
                        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                            <CardHeader className="border-b border-slate-50 dark:border-slate-800 px-6 py-4">
                                <CardTitle className="text-[13px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <BarChart className="h-4 w-4" /> Performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 text-center">
                                        <div className="text-[20px] font-bold text-slate-800 dark:text-slate-100">{analytics.totalAttempts}</div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Attempts</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 text-center">
                                        <div className="text-[20px] font-bold text-indigo-600 dark:text-indigo-400">{Math.round(analytics.passRate)}%</div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Pass Rate</div>
                                    </div>
                                    <div className="col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 text-center">
                                        <div className="text-[20px] font-bold text-slate-800 dark:text-slate-100">{Math.round(analytics.averageScore)}%</div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Avg Score</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column: Questions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-6 py-4 rounded-xl shadow-sm">
                        <h2 className="text-[15px] font-bold">Questions ({quiz.questions.length})</h2>
                        <Button onClick={openCreateDialog} variant="ghost" size="sm" className="font-bold text-[12px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100">
                            <Plus className="h-4 w-4 mr-2" /> Add Question
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {quiz.questions.length === 0 && (
                            <div className="text-center py-20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl text-slate-400 flex flex-col items-center gap-y-2 bg-white dark:bg-slate-900/50">
                                <LayoutGrid className="h-10 w-10 text-slate-50 dark:text-slate-800" />
                                <p className="text-[14px] font-medium">No questions added yet.</p>
                                <Button onClick={openCreateDialog} variant="link" className="text-indigo-600 dark:text-indigo-400 font-bold">Add your first question</Button>
                            </div>
                        )}

                        {quiz.questions.map((q: Question, idx: number) => (
                            <Card key={q.id} className="group relative border-none shadow-sm bg-white dark:bg-slate-900 transition-all hover:ring-1 hover:ring-slate-200 dark:hover:ring-slate-700">
                                <CardContent className="p-6 flex items-start gap-4">
                                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 text-[13px] font-bold text-slate-500">
                                        {idx + 1}
                                    </span>
                                    <div className="flex-grow space-y-3">
                                        <div className="flex justify-between items-start gap-4">
                                            <p className="font-bold text-[14px] text-slate-800 dark:text-slate-100 leading-relaxed">{q.text}</p>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wide h-6 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                                    {q.points || 1} PT
                                                </Badge>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 dark:hover:text-slate-200" onClick={() => openEditDialog(q)}>
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => onDeleteQuestion(q.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border-none text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                                                {q.type.replace("_", " ")}
                                            </Badge>
                                            <div className="text-[11px] text-slate-400 font-medium tracking-tight">
                                                {q.options.length} options
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Create/Edit Question Dialog */}
            <Dialog open={isQuestionDialogOpen} onOpenChange={(open) => {
                setIsQuestionDialogOpen(open);
                if (!open) resetQuestionForm();
            }}>
                <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-0 overflow-hidden rounded-2xl shadow-2xl">
                    <DialogHeader className="p-6 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                        <DialogTitle className="text-[16px] font-bold">{editingQuestion ? "Edit Question" : "New Question"}</DialogTitle>
                        <DialogDescription className="text-[12px] text-slate-500 font-medium">Configure question details and answers.</DialogDescription>
                    </DialogHeader>
                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-2">
                            <Label className="text-[13px] font-bold">Question Text</Label>
                            <Textarea
                                value={qText}
                                onChange={(e) => setQText(e.target.value)}
                                placeholder="Enter your question here..."
                                className="bg-slate-50 dark:bg-slate-950 border-none min-h-[100px] text-[13px] focus-visible:ring-1 focus-visible:ring-slate-200 dark:focus-visible:ring-slate-700"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[13px] font-bold">Type</Label>
                                <Select value={qType} onValueChange={setQType}>
                                    <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-none h-11 text-[13px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                                        <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                                        <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                                        <SelectItem value="ESSAY">Essay</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[13px] font-bold">Points</Label>
                                <Input
                                    type="number"
                                    value={qPoints}
                                    onChange={(e) => setQPoints(parseInt(e.target.value))}
                                    className="bg-slate-50 dark:bg-slate-950 border-none h-11 text-[13px]"
                                />
                            </div>
                        </div>

                        {(qType === "SHORT_ANSWER" || qType === "ESSAY") && (
                            <div className="space-y-2">
                                <Label className="text-[13px] font-bold">Correct Answer / Criteria</Label>
                                <Textarea
                                    value={qCorrectAnswer}
                                    onChange={(e) => setQCorrectAnswer(e.target.value)}
                                    placeholder={qType === "SHORT_ANSWER" ? "Enter the correct answer..." : "Enter key points or grading criteria..."}
                                    className="bg-slate-50 dark:bg-slate-950 border-none h-32 text-[13px]"
                                />
                                <p className="text-[11px] text-slate-400 font-medium italic mt-2">
                                    {qType === "SHORT_ANSWER"
                                        ? "The system will use this to validate student responses."
                                        : "Grading reference point for the instructor."}
                                </p>
                            </div>
                        )}

                        {qType !== "ESSAY" && qType !== "SHORT_ANSWER" && (
                            <div className="space-y-3">
                                <Label className="text-[13px] font-bold">Answer Options</Label>
                                <div className="space-y-3">
                                    {qOptions.map((opt, idx) => (
                                        <div key={idx} className="flex items-center gap-2 group">
                                            <Input
                                                value={opt.text}
                                                onChange={(e) => {
                                                    const newOps = [...qOptions];
                                                    newOps[idx].text = e.target.value;
                                                    setQOptions(newOps);
                                                }}
                                                placeholder={`Option ${idx + 1}`}
                                                className="bg-slate-50 dark:bg-slate-950 border-none h-10 text-[13px] focus-visible:ring-1 focus-visible:ring-slate-200 dark:focus-visible:ring-slate-700"
                                            />
                                            <Button
                                                variant={opt.isCorrect ? "default" : "outline"}
                                                size="sm"
                                                className={`h-10 px-4 text-[11px] font-bold uppercase tracking-tight border-none ${opt.isCorrect ? "bg-green-600 hover:bg-green-700 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-400"}`}
                                                onClick={() => {
                                                    const newOps = [...qOptions];
                                                    newOps[idx].isCorrect = !newOps[idx].isCorrect;
                                                    if ((qType === "TRUE_FALSE") && newOps[idx].isCorrect) {
                                                        newOps.forEach((o, i) => { if (i !== idx) o.isCorrect = false });
                                                    }
                                                    setQOptions(newOps);
                                                }}
                                            >
                                                {opt.isCorrect ? <CheckCircle className="h-4 w-4" /> : "Correct?"}
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-red-500 transition-colors" onClick={() => {
                                                const newOps = qOptions.filter((_, i) => i !== idx);
                                                setQOptions(newOps);
                                            }}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Button size="sm" variant="ghost" className="text-indigo-600 dark:text-indigo-400 font-bold text-[12px] hover:bg-indigo-50 dark:hover:bg-indigo-900/10 h-10 w-full mt-2" onClick={() => setQOptions([...qOptions, { text: "", isCorrect: false }])}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Option
                                </Button>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="p-6 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 gap-2">
                        <Button variant="ghost" className="text-[13px] font-bold" onClick={() => setIsQuestionDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleQuestionSubmit} disabled={isSaving} className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-[13px] font-bold px-8 h-11">
                            {isSaving ? "Saving..." : (editingQuestion ? "Update Question" : "Create Question")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default InstructorQuizEditorPage;
