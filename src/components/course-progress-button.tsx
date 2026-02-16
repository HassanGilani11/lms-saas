"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, ArrowRight, Loader2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { toggleTopicCompletion } from "@/actions/progress";

interface CourseProgressButtonProps {
    courseId: string;
    topicId: string;
    nextTopicId?: string;
    isCompleted?: boolean;
}

export const CourseProgressButton = ({
    courseId,
    topicId,
    nextTopicId,
    isCompleted
}: CourseProgressButtonProps) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const onClick = async () => {
        try {
            // If not completed, mark as completed
            if (!isCompleted) {
                await toggleTopicCompletion(topicId, true);
                toast.success("Topic completed!");
            }

            startTransition(() => {
                // Navigate to next topic or course page
                if (nextTopicId) {
                    router.push(`/courses/${courseId}/topics/${nextTopicId}`);
                } else {
                    toast.success("Course finished! Well done.", { icon: "🎉" });
                    router.push(`/courses/${courseId}`);
                }

                router.refresh();
            });
        } catch {
            toast.error("Something went wrong");
        }
    };

    const isLoading = isPending;

    const Icon = isCompleted ? ArrowRight : CheckCircle;

    return (
        <Button
            onClick={onClick}
            disabled={isLoading}
            type="button"
            className="w-full md:w-auto h-14 px-8 text-lg font-bold rounded-2xl bg-indigo-600 hover:bg-slate-900 shadow-xl shadow-indigo-500/20 transition-all group flex items-center gap-3"
        >
            {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
                <>
                    {!isCompleted && <Sparkles className="h-5 w-5 text-indigo-300 group-hover:rotate-12 transition-transform" />}
                    {isCompleted ? "Next Topic" : nextTopicId ? "Complete & Continue" : "Complete Course"}
                    <Icon className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
            )}
        </Button>
    );
};
