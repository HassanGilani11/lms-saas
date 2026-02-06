"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
    CheckCircle,
    AlertCircle,
    Clock,
    ChevronRight,
    ChevronLeft,
    Flag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

import { startAttempt, submitAnswer, finishAttempt } from "@/actions/attempt";
import { getQuizForStudent } from "@/actions/quiz";

interface QuizPlayerProps {
    quizId: string;
    userId: string;
}

export const QuizPlayer = ({ quizId, userId }: QuizPlayerProps) => {
    const router = useRouter();
    const [quiz, setQuiz] = useState<any>(null);
    const [attempt, setAttempt] = useState<any>(null);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({}); // questionId -> answer
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const quizData = await getQuizForStudent(quizId);
                if (!quizData) {
                    toast.error("Quiz not found");
                    return;
                }
                setQuiz(quizData);

                // Check for existing active attempt? (Not implemented in backend strictly, but we start new for now)
                // Ideally backend startAttempt handles "resume" if IN_PROGRESS exists.
                // My startAttempt implementation creates NEW always. I should fix that if I want resume.
                // For now, let's assume we start fresh.
            } catch (error) {
                toast.error("Failed to load quiz");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [quizId]);

    // Timer Logic
    useEffect(() => {
        if (!attempt || !quiz?.timeLimit || isFinished) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const start = new Date(attempt.startedAt).getTime();
            const elapsed = (now - start) / 1000 / 60; // minutes
            const remaining = quiz.timeLimit - elapsed;

            if (remaining <= 0) {
                // Auto submit
                handleFinish();
                clearInterval(interval);
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [attempt, quiz, isFinished]);


    const handleStart = async () => {
        setSubmitting(true);
        try {
            const newAttempt = await startAttempt(quizId);
            if (!newAttempt) {
                toast.error("Failed to start or max attempts reached");
                return;
            }
            setAttempt(newAttempt);
        } catch (error) {
            toast.error("Error starting quiz");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePrevious = () => {
        setCurrentQIndex((prev) => Math.max(0, prev - 1));
    };

    const handleNext = async () => {
        // Auto-save current answer
        const currentQ = quiz.questions[currentQIndex];
        const currentAns = answers[currentQ.id];

        if (currentAns) {
            await submitAnswer(attempt.id, currentQ.id, currentAns);
        }

        if (currentQIndex < quiz.questions.length - 1) {
            setCurrentQIndex((prev) => prev + 1);
        } else {
            // Last question, maybe prompt finish?
        }
    };

    const handleAnswerChange = (val: string) => {
        const currentQ = quiz.questions[currentQIndex];
        setAnswers(prev => ({ ...prev, [currentQ.id]: val }));
    };

    const handleFinish = async () => {
        if (!confirm("Are you sure you want to submit?")) return;

        setSubmitting(true);
        try {
            // Submit last answer if exists
            const currentQ = quiz.questions[currentQIndex];
            const currentAns = answers[currentQ.id];
            if (currentAns) await submitAnswer(attempt.id, currentQ.id, currentAns);

            const result = await finishAttempt(attempt.id);
            setAttempt(result);
            setIsFinished(true);
            toast.success("Quiz submitted!");
        } catch (error) {
            toast.error("Failed to submit");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading quiz...</div>;
    if (!quiz) return <div>Quiz not found</div>;

    // Start Screen
    if (!attempt) {
        return (
            <Card className="max-w-3xl mx-auto my-10">
                <CardHeader>
                    <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-slate-600">{quiz.description}</p>
                    <div className="flex gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {quiz.timeLimit ? `${quiz.timeLimit} Minutes` : "No Time Limit"}
                        </div>
                        <div className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            Pass Score: {quiz.passingScore}%
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleStart} disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-700">
                        {submitting ? "Starting..." : "Start Quiz"}
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    // Results Screen
    if (isFinished || attempt.status === "COMPLETED" || attempt.status === "GRADED") {
        const isPassed = attempt.score >= (quiz?.passingScore || 70);

        return (
            <Card className="max-w-3xl mx-auto my-10 border-t-4 border-t-indigo-500">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl mb-2">Quiz Completed</CardTitle>
                    <p className="text-slate-500">Here are your results</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-center py-6">
                        <div className={`p-6 rounded-full border-4 ${isPassed ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700"} w-40 h-40 flex flex-col items-center justify-center`}>
                            <span className="text-4xl font-bold">{attempt.score}</span>
                            <span className="text-sm font-semibold uppercase">{isPassed ? "Passed" : "Failed"}</span>
                        </div>
                    </div>

                    {attempt.status === "PENDING" && <p className="text-center text-amber-600">Some answers require manual grading.</p>}

                    <div className="text-center">
                        <Button variant="outline" onClick={() => router.push(`/courses/${quiz.courseId}`)}>
                            Return to Course
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Active Quiz Interface
    const question = quiz.questions[currentQIndex];
    const progress = ((currentQIndex + 1) / quiz.questions.length) * 100;

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
                <div>
                    <h2 className="font-semibold text-slate-800">{quiz.title}</h2>
                    <p className="text-xs text-slate-500">Question {currentQIndex + 1} of {quiz.questions.length}</p>
                </div>
                {timeLeft !== null && (
                    <div className={`font-mono text-lg font-bold ${timeLeft < 5 ? "text-red-500 animate-pulse" : "text-slate-700"}`}>
                        {Math.floor(timeLeft)}:{(Math.floor((timeLeft % 1) * 60)).toString().padStart(2, '0')}
                    </div>
                )}
            </div>

            <Progress value={progress} className="h-2" />

            {/* Question Card */}
            <Card className="min-h-[400px] flex flex-col">
                <CardContent className="flex-grow pt-6">
                    <div className="mb-6">
                        <h3 className="text-xl font-medium text-slate-900 leading-relaxed">
                            {question.text}
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {(question.type === "MULTIPLE_CHOICE" || question.type === "SINGLE_CHOICE" || question.type === "TRUE_FALSE") && (
                            <RadioGroup
                                value={answers[question.id] || ""}
                                onValueChange={handleAnswerChange}
                                className="space-y-3"
                            >
                                {question.options.map((opt: any) => (
                                    <div key={opt.id} className={`flex items-center space-x-2 border p-4 rounded-lg hover:bg-slate-50 transition-colors ${answers[question.id] === opt.id ? "border-indigo-500 bg-indigo-50 hover:bg-indigo-50" : "border-slate-200"}`}>
                                        <RadioGroupItem value={opt.id} id={opt.id} />
                                        <Label htmlFor={opt.id} className="flex-grow cursor-pointer font-normal text-base">
                                            {opt.text}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}

                        {question.type === "ESSAY" && (
                            <Textarea
                                value={answers[question.id] || ""}
                                onChange={(e) => handleAnswerChange(e.target.value)}
                                placeholder="Type your answer here..."
                                className="h-40 text-base"
                            />
                        )}
                    </div>
                </CardContent>
                <CardFooter className="bg-slate-50 p-4 border-t flex justify-between">
                    <Button
                        variant="ghost"
                        onClick={handlePrevious}
                        disabled={currentQIndex === 0}
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                    </Button>

                    {currentQIndex === quiz.questions.length - 1 ? (
                        <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-700">
                            Submit Quiz <CheckCircle className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleNext} className="bg-slate-900">
                            Next <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
};
