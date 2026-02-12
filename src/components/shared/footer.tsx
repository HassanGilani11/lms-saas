import Link from "next/link";
import { getSettings } from "@/actions/settings";
import Image from "next/image";

export const Footer = async () => {
    const settings = await getSettings();

    return (
        <footer className="bg-white border-t border-slate-200 pt-20 pb-10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
                    <div className="col-span-2 lg:col-span-2 space-y-6">
                        <Link href="/" className="flex items-center gap-x-2">
                            {settings?.siteLogo ? (
                                <div className="relative h-8 w-8">
                                    <Image
                                        src={settings.siteLogo}
                                        alt="Logo"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">
                                        {settings?.siteName?.[0] || "L"}
                                    </span>
                                </div>
                            )}
                            <span className="font-bold text-xl tracking-tight text-slate-900">
                                {settings?.siteName || "LMS SaaS"}
                            </span>
                        </Link>
                        <p className="text-slate-500 max-w-xs leading-relaxed">
                            Empowering creators to build world-class learning experiences for their communities.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h5 className="font-bold text-slate-900">Product</h5>
                        <ul className="space-y-4 text-slate-500">
                            <li><Link href="#features" className="hover:text-slate-900 transition-colors">Features</Link></li>
                            <li><Link href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</Link></li>
                            <li><Link href="/courses" className="hover:text-slate-900 transition-colors">Courses</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h5 className="font-bold text-slate-900">Company</h5>
                        <ul className="space-y-4 text-slate-500">
                            <li><Link href="#about" className="hover:text-slate-900 transition-colors">About Us</Link></li>
                            <li><Link href="#" className="hover:text-slate-900 transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-slate-900 transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h5 className="font-bold text-slate-900">Legal</h5>
                        <ul className="space-y-4 text-slate-500">
                            <li><Link href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-slate-900 transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-slate-100 gap-6">
                    <p className="text-slate-500 text-sm">
                        © 2026 {settings?.siteName || "LMS SaaS"}. All rights reserved. Built with ❤️ for educational excellence.
                    </p>
                    <div className="flex items-center gap-x-6 grayscale opacity-60">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-5" />
                    </div>
                </div>
            </div>
        </footer>
    );
};
