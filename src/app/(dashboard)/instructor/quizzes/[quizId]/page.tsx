"use client";

import { useEffect, useState } from "react";
import {
    updateQuiz,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    createOption,
    updateOption,
    deleteOption
} from "@/actions/assessment";
import { db } from "@/lib/db"; // Use a server action instead
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Plus,
    Trash2,
    Check,
    X,
    ChevronDown,
    ChevronUp,
    AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Helper action to fetch quiz data
import { getQuizData } from "@/actions/admin"; // I'll add this to admin or a new quiz action file

const QuizPage = ({ params }: { params: { quizId: string } }) => {
    const [quiz, setQuiz] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchQuiz = async () => {
        setIsLoading(true);
        const data = await getQuizData(params.quizId);
        setQuiz(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchQuiz();
    }, [params.quizId]);

    const onAddQuestion = async () => {
        await createQuestion(params.quizId, "New Question", "MULTIPLE_CHOICE");
        fetchQuiz();
    };

    const onDeleteQuestion = async (id: string) => {
        if (confirm("Delete this question and all its options?")) {
            await deleteQuestion(id);
            fetchQuiz();
        }
    };

    const onAddOption = async (questionId: string) => {
        await createOption(questionId, "New Option", false);
        fetchQuiz();
    };

    const onDeleteOption = async (optionId: string) => {
        await deleteOption(optionId);
        fetchQuiz();
    };

    const onToggleCorrect = async (optionId: string, isCorrect: boolean) => {
        await updateOption(optionId, { isCorrect });
        fetchQuiz();
    };

    const onUpdateOptionText = async (optionId: string, text: string) => {
        // Debounce or just update on blur
        await updateOption(optionId, { text });
    };

    if (isLoading) return <div className="p-6">Loading quiz editor...</div>;
    if (!quiz) return <div className="p-6 text-destructive">Quiz not found.</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Quiz Editor</h1>
                    <p className="text-muted-foreground">{quiz.title}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                    {quiz.questions.length} Questions
                </Badge>
            </div>

            <div className="space-y-6">
                {quiz.questions.map((question: any, index: number) => (
                    <Card key={question.id}>
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div className="flex-1 mr-4">
                                <Label className="text-xs text-muted-foreground">Question {index + 1}</Label>
                                <Input
                                    defaultValue={question.text}
                                    className="mt-1 font-medium"
                                    onBlur={(e) => updateQuestion(question.id, { text: e.target.value })}
                                />
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDeleteQuestion(question.id)}
                                className="text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Separator />
                            <div className="space-y-3">
                                <Label className="text-xs">Options</Label>
                                {question.options.map((option: any) => (
                                    <div key={option.id} className="flex items-center gap-2 group">
                                        <Button
                                            variant={option.isCorrect ? "default" : "outline"}
                                            size="icon"
                                            className="h-8 w-8 shrink-0"
                                            onClick={() => onToggleCorrect(option.id, !option.isCorrect)}
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Input
                                            defaultValue={option.text}
                                            className="h-8 text-sm"
                                            onBlur={(e) => onUpdateOptionText(option.id, e.target.value)}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition"
                                            onClick={() => onDeleteOption(option.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full border-dashed"
                                    onClick={() => onAddOption(question.id)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Option
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <Button onClick={onAddQuestion} size="lg" className="w-full py-10 border-dashed" variant="outline">
                    <Plus className="h-6 w-6 mr-2" />
                    New Question
                </Button>
            </div>
        </div>
    );
};

export default QuizPage;
