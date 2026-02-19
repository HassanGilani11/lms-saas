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
        <div className="min-h-screen bg-slate-50/50 relative overflow-hidden flex flex-col items-center pt-32 pb-20 px-6">
            {/* Background Decorative Circles */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-3xl -z-10" />

            <div className="max-w-4xl w-full space-y-10 relative z-10 flex flex-col items-center">
                <div className="text-center space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-bold uppercase tracking-wider mb-2">
                        Official Verification
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                        Certificate Verification
                    </h1>
                    <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                        This document confirms that <span className="font-bold text-slate-800 underline decoration-indigo-200 decoration-2 underline-offset-4">{recipientName}</span> has successfully fulfilled the requirements for the course <span className="text-slate-800 font-medium italic">"{courseTitle}"</span> on {issueDate}.
                    </p>
                </div>

                <div className="w-full transform transition-all duration-500 hover:scale-[1.01]">
                    <CertificateTemplate
                        recipientName={recipientName}
                        courseName={courseTitle}
                        issueDate={issueDate}
                        certificateCode={code}
                        className="shadow-[0_20px_50px_rgba(8,_112,_184,_0.15)] rounded-2xl"
                    />
                </div>

                <div className="text-center space-y-4 pt-8 border-t border-slate-200 w-full max-w-md">
                    <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">
                        Validated by Lumina LMS
                    </p>
                    <p className="text-xs text-slate-400 leading-normal">
                        This digital certificate is a permanent record of achievement. For any inquiries regarding the authenticity of this document, please contact our support team.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CertificateVerificationPage;
