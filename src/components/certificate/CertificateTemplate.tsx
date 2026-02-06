"use client";

import { useRef, useCallback } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface CertificateTemplateProps {
    recipientName: string;
    courseName: string;
    issueDate: string;
    certificateCode: string;
    instructorName?: string;
    className?: string;
}

export const CertificateTemplate = ({
    recipientName,
    courseName,
    issueDate,
    certificateCode,
    instructorName = "Lumina LMS Team",
    className
}: CertificateTemplateProps) => {
    const certificateRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = useCallback(async () => {
        if (!certificateRef.current) return;

        try {
            setIsGenerating(true);
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
                onclone: (clonedDoc) => {
                    // Remove stylesheets to prevent oklch crash
                    const styles = clonedDoc.getElementsByTagName("style");
                    const links = clonedDoc.getElementsByTagName("link");
                    for (let i = styles.length - 1; i >= 0; i--) {
                        styles[i].parentNode?.removeChild(styles[i]);
                    }
                    for (let i = links.length - 1; i >= 0; i--) {
                        if (links[i].rel === "stylesheet") {
                            links[i].parentNode?.removeChild(links[i]);
                        }
                    }
                }
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "px",
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
            pdf.save(`Certificate-${certificateCode}.pdf`);
        } catch (error) {
            console.error("Error generating certificate:", error);
        } finally {
            setIsGenerating(false);
        }
    }, [certificateCode]);

    const colors = {
        white: "#ffffff",
        black: "#000000",
        slate900: "#0f172a",
        slate800: "#1e293b",
        slate700: "#334155",
        slate600: "#475569",
        slate500: "#64748b",
        slate400: "#94a3b8",
        slate200: "#e2e8f0",
        blue600: "#2563eb",
        blue400: "#60a5fa",
        yellow400: "#facc15",
        yellow500: "#eab308",
        yellow50: "#fefce8",
        yellow600: "#ca8a04",
    };

    return (
        <div className={cn("flex flex-col items-center gap-6 w-full", className)}>
            <div
                ref={certificateRef}
                style={{
                    position: 'relative',
                    overflow: 'hidden',
                    width: '100%',
                    maxWidth: '800px',
                    aspectRatio: '1.414 / 1',
                    backgroundColor: colors.white,
                    color: colors.slate900,
                    border: `4px solid ${colors.slate900}`,
                    borderRadius: '8px',
                    fontFamily: 'serif',
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // shadow-2xl equivalent
                }}
            >
                {/* Decorative Elements */}
                <div
                    style={{
                        position: 'absolute', top: 0, left: 0, width: '128px', height: '128px',
                        backgroundColor: colors.yellow400, borderBottomRightRadius: '100%',
                        opacity: 0.5, zIndex: 1
                    }}
                />
                <div
                    style={{
                        position: 'absolute', bottom: 0, right: 0, width: '128px', height: '128px',
                        backgroundColor: colors.blue400, borderTopLeftRadius: '100%',
                        opacity: 0.5, zIndex: 1
                    }}
                />
                <div
                    style={{
                        position: 'absolute', top: 0, right: 0, width: '96px', height: '96px',
                        borderLeft: `4px solid ${colors.slate900}`, borderBottom: `4px solid ${colors.slate900}`,
                        borderBottomLeftRadius: '24px', zIndex: 1
                    }}
                />
                <div
                    style={{
                        position: 'absolute', bottom: 0, left: 0, width: '96px', height: '96px',
                        borderRight: `4px solid ${colors.slate900}`, borderTop: `4px solid ${colors.slate900}`,
                        borderTopRightRadius: '24px', zIndex: 1
                    }}
                />

                {/* Content */}
                <div style={{
                    position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', height: '100%', padding: '48px',
                    textAlign: 'center', boxSizing: 'border-box'
                }}>

                    <h1 style={{
                        fontSize: '36px', fontWeight: 'bold', margin: '0 0 8px 0',
                        color: colors.slate800, textTransform: 'uppercase', letterSpacing: '0.025em'
                    }}>
                        Certificate of Completion
                    </h1>

                    <p style={{
                        fontSize: '14px', color: colors.slate500, fontWeight: '500',
                        textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 32px 0'
                    }}>
                        This is to certify that
                    </p>

                    <h2 style={{
                        fontSize: '48px', fontWeight: 'bold', color: colors.blue600,
                        margin: '0 0 8px 0', paddingBottom: '16px', fontStyle: 'italic',
                        borderBottom: `2px solid ${colors.slate200}`, minWidth: '50%'
                    }}>
                        {recipientName}
                    </h2>

                    <p style={{ fontSize: '16px', color: colors.slate600, margin: '24px 0 8px 0' }}>
                        has successfully completed the course
                    </p>

                    <h3 style={{
                        fontSize: '24px', fontWeight: 'bold', color: colors.slate800,
                        margin: '0 0 32px 0', maxWidth: '80%'
                    }}>
                        "{courseName}"
                    </h3>

                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                        width: '100%', padding: '0 48px', marginTop: 'auto', boxSizing: 'border-box'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <p style={{
                                fontSize: '14px', fontWeight: 'bold', color: colors.slate700,
                                borderTop: `1px solid ${colors.slate800}`, padding: '8px 16px 0 16px',
                                margin: 0, minWidth: '150px'
                            }}>
                                {issueDate}
                            </p>
                            <p style={{
                                fontSize: '12px', color: colors.slate500, textTransform: 'uppercase',
                                letterSpacing: '0.05em', marginTop: '4px'
                            }}>
                                Date
                            </p>
                        </div>

                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            border: `4px solid ${colors.yellow500}`, backgroundColor: colors.yellow50,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 'bold', color: colors.yellow600,
                            textAlign: 'center', lineHeight: '1.2', marginBottom: '8px'
                        }}>
                            OFFICIAL<br />SEAL
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <p style={{
                                fontSize: '14px', fontWeight: 'bold', color: colors.slate700,
                                borderTop: `1px solid ${colors.slate800}`, padding: '8px 16px 0 16px',
                                margin: 0, minWidth: '150px', fontStyle: 'italic'
                            }}>
                                {instructorName}
                            </p>
                            <p style={{
                                fontSize: '12px', color: colors.slate500, textTransform: 'uppercase',
                                letterSpacing: '0.05em', marginTop: '4px'
                            }}>
                                Instructor
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{
                    position: 'absolute', bottom: '16px', left: 0, width: '100%',
                    textAlign: 'center', zIndex: 10
                }}>
                    <p style={{ fontSize: '10px', color: colors.slate400, fontFamily: 'monospace', margin: 0 }}>
                        Verification Code: {certificateCode}
                    </p>
                </div>
            </div>

            <Button
                onClick={generatePDF}
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[200px]"
                disabled={isGenerating}
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating PDF...
                    </>
                ) : (
                    <>
                        <Download className="mr-2 h-4 w-4" />
                        Download Certificate
                    </>
                )}
            </Button>
        </div>
    );
};
