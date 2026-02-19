import { redirect } from "next/navigation";

const CourseIdPage = async ({
    params
}: {
    params: { courseId: string }
}) => {
    const { courseId } = await params;
    return redirect(`/instructor/courses/${courseId}/detail`);
}

export default CourseIdPage;
