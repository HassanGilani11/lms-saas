import { auth } from "@/auth";
import { getUserAchievements } from "@/actions/achievement";
import { redirect } from "next/navigation";
import { Award, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checkAchievements } from "@/actions/achievement";

const AchievementsPage = async () => {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return redirect("/");
    }

    // Trigger a check when visiting the page (optional, ensures sync)
    await checkAchievements(userId);

    const achievements = await getUserAchievements(userId);

    // List of all possible achievements (in a real app, fetch from DB)
    // For now we will just show unlocked ones, or maybe a few hardcoded "Next Steps"?
    // Let's just show unlocked ones for MVP + maybe placeholders if desired.
    // Ideally we fetch ALL definitions and map user status.
    // For this task, let's just show what they have.

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-800">My Achievements</h1>
                <p className="text-sm text-slate-500">
                    Badges and awards you've earned through your learning journey.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {achievements.map(({ achievement, unlockedAt }) => (
                    <Card key={achievement.id} className="border-2 border-yellow-100 bg-yellow-50/30 overflow-hidden relative group hover:border-yellow-200 transition-colors">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <Award className="h-24 w-24 text-yellow-500 transform rotate-12 translate-x-4 -translate-y-4" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-500">
                                Unlocked
                            </CardTitle>
                            <Award className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center text-center pt-4 pb-2">
                                <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 border-2 border-yellow-200 shadow-sm text-yellow-600">
                                    <Award className="h-8 w-8" />
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg mb-1">{achievement.title}</h3>
                                <p className="text-xs text-slate-500 mb-4 px-2">{achievement.description}</p>
                                <div className="text-[10px] text-slate-400 font-mono bg-white px-2 py-1 rounded-full border border-slate-100">
                                    {new Date(unlockedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {achievements.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                        <Lock className="h-12 w-12 mb-4 opacity-50" />
                        <h3 className="font-medium text-lg text-slate-600">No Achievements Yet</h3>
                        <p className="text-sm max-w-sm text-center mt-2">
                            Complete courses and quizzes to earn badges. Your journey has just begun!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AchievementsPage;
