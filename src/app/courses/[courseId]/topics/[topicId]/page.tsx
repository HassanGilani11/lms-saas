import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { QuizPlayer } from "@/components/quiz-player";
import { FileText, Video as VideoIcon } from "lucide-react";

const TopicIdPage = async ({
    params
}: {
    params: Promise<{ courseId: string; topicId: string }>;
}) => {
    // Await params before using properties
    const resolvedParams = await params;

    const session = await auth();
    // if (!session?.user) return redirect("/"); // Public for now? Or check auth?
    // Let's assume auth required for quiz taking logic in component.

    const topic = await db.topic.findUnique({
        where: { id: resolvedParams.topicId },
        include: {
            quiz: true,
        }
    });

    if (!topic) return <div>Topic not found</div>;

    if (topic.type === "QUIZ") {
        if (!topic.quizId && !topic.quiz) return <div>Quiz configuration missing</div>;

        return (
            <div className="h-full w-full bg-slate-50 overflow-y-auto">
                <div className="max-w-4xl mx-auto py-10">
                    <QuizPlayer
                        quizId={topic.quizId || topic.quiz?.id!}
                        userId={session?.user?.id || ""}
                    />
                </div>
            </div>
        );
    }

    // Basic placeholders for other types
    return (
        <div className="h-full flex flex-col items-center justify-center space-y-4 p-8 text-center text-slate-500">
            {topic.type === "VIDEO" && <VideoIcon className="h-16 w-16 text-slate-300" />}
            {topic.type === "TEXT" && <FileText className="h-16 w-16 text-slate-300" />}
            <h1 className="text-2xl font-bold text-slate-800">{topic.title}</h1>
            <p className="max-w-md">{topic.description || "No description available."}</p>
            {topic.type === "VIDEO" && topic.videoUrl && (
                <div className="w-full max-w-2xl bg-black aspect-video rounded-lg flex items-center justify-center text-white">
                    Video Player Placeholder ({topic.videoUrl})
                </div>
            )}
            {topic.type === "TEXT" && topic.content && (
                <div className="w-full max-w-2xl text-left bg-white p-6 rounded shadow border" dangerouslySetInnerHTML={{ __html: topic.content }} />
            )}
        </div>
    );
};

export default TopicIdPage;
