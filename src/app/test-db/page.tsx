
import { db } from "@/lib/db";
import { getLearningPaths } from "@/actions/learning-path";

export default async function TestPage() {
    let directData: any[] = [];
    let actionData: any[] = [];
    let error = null;

    try {
        directData = await db.learningPath.findMany({
            include: {
                category: true,
            },
        });
    } catch (e: any) {
        error = e.message;
    }

    try {
        actionData = await getLearningPaths();
    } catch (e) {
        // action handles error but returns []
    }

    return (
        <div className="p-10 font-mono text-sm space-y-8">
            <h1 className="text-xl font-bold">Database Debug Page</h1>

            <div className="bg-red-50 p-4 border border-red-200">
                <h2 className="font-bold">Errors</h2>
                <pre>{error || "No direct DB errors"}</pre>
            </div>

            <div className="bg-slate-100 p-4 border border-slate-200">
                <h2 className="font-bold">Direct DB Query (findMany)</h2>
                <p>Count: {directData.length}</p>
                <pre className="max-h-60 overflow-auto">{JSON.stringify(directData, null, 2)}</pre>
            </div>

            <div className="bg-blue-50 p-4 border border-blue-200">
                <h2 className="font-bold">Server Action (getLearningPaths)</h2>
                <p>Count: {actionData.length}</p>
                <pre className="max-h-60 overflow-auto">{JSON.stringify(actionData, null, 2)}</pre>
            </div>

            <div className="bg-yellow-50 p-4 border border-yellow-200">
                <h2 className="font-bold">Environment</h2>
                <p>Database URL defined: {process.env.DATABASE_URL ? "Yes" : "No"}</p>
            </div>
        </div>
    );
}
