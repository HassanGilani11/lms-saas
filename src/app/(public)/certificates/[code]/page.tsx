import { verifyCertificate } from "@/actions/certificate";
import { CertificateTemplate } from "@/components/certificate/CertificateTemplate";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
    params: Promise<{
        code: string;
    }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { code } = await params;
    const certificate = await verifyCertificate(code);

    if (!certificate) {
        return {
            title: "Certificate Not Found",
        };
    }

    // Safely cast metadata to access properties
    const certMeta = certificate.metadata as any;
    const recipientName = certMeta?.userName || certificate.user.name;
    const courseTitle = certMeta?.courseTitle || certificate.course.title;

    return {
        title: `Certificate: ${courseTitle} - ${recipientName}`,
        description: `Verify certificate completion for ${recipientName}`,
    };
}

const CertificateVerificationPage = async ({ params }: Props) => {
    const { code } = await params;
    const certificate = await verifyCertificate(code);

    if (!certificate) {
        return notFound();
    }

    const certMeta = certificate.metadata as any;
    const recipientName = certMeta?.userName || certificate.user.name || "Student";
    const courseTitle = certMeta?.courseTitle || certificate.course.title || "Course";
    const issueDate = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
            <div className="max-w-4xl w-full space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-slate-800">
                        Certificate Verification
                    </h1>
                    <p className="text-slate-500">
                        This certificate was issued to <span className="font-semibold text-slate-700">{recipientName}</span> on {issueDate}.
                    </p>
                </div>

                <CertificateTemplate
                    recipientName={recipientName}
                    courseName={courseTitle}
                    issueDate={issueDate}
                    certificateCode={code}
                    className="shadow-xl"
                />

                <div className="text-center text-sm text-slate-400">
                    <p>Lumina Learning Management System</p>
                </div>
            </div>
        </div>
    );
};

export default CertificateVerificationPage;
