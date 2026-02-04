import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute top-0 right-0 -z-10 w-1/2 h-screen bg-gradient-to-l from-indigo-50/50 to-transparent blur-3xl opacity-60" />
          <div className="absolute bottom-0 left-0 -z-10 w-1/2 h-1/2 bg-gradient-to-t from-slate-50 to-transparent blur-3xl opacity-60" />

          <div className="container mx-auto px-6 text-center lg:text-left">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 animate-fade-in">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  <span className="text-xs font-semibold tracking-wide uppercase">New: Interactive Assessments</span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                  Master Your Skills with <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                    LuminaLearn
                  </span>
                </h1>

                <p className="text-lg text-slate-600 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                  The ultimate learning management system designed for modern teams and creators.
                  Deliver world-class education, track progress, and grow your community seamlessly.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <Button asChild size="lg" className="h-14 px-8 text-lg font-semibold bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all hover:-translate-y-0.5 active:translate-y-0">
                    <Link href="/auth/register">Start Learning for Free</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-semibold border-2 hover:bg-slate-50 transition-all">
                    <Link href="#features">Explore Features</Link>
                  </Button>
                </div>

                <div className="flex items-center gap-x-4 pt-4 justify-center lg:justify-start">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-500 font-medium">
                    Trusted by <span className="text-slate-900 font-bold">2,000+</span> creators worldwide
                  </p>
                </div>
              </div>

              <div className="flex-1 relative group w-full max-w-lg lg:max-w-none">
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white border border-slate-200 rounded-3xl p-4 shadow-2xl overflow-hidden animate-float">
                  <img
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"
                    alt="Dashboard Preview"
                    className="rounded-2xl w-full object-cover shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-slate-50">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-base font-bold text-indigo-600 tracking-wider uppercase mb-4">Features</h2>
              <h3 className="text-4xl font-bold text-slate-900 mb-6">Built for Modern Education</h3>
              <p className="text-lg text-slate-600">
                Everything you need to create, deliver, and manage world-class online courses in one unified platform.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Interactive Courses",
                  desc: "Create engaging learning experiences with video, text, and rich media content.",
                  icon: "🚀"
                },
                {
                  title: "Progress Tracking",
                  desc: "Monitor student growth with detailed analytics and completion metrics.",
                  icon: "📊"
                },
                {
                  title: "Assessments",
                  desc: "Build complex quizzes and assignments to evaluate learning effectiveness.",
                  icon: "📝"
                },
                {
                  title: "Secure Payments",
                  desc: "Integrated Stripe support for seamless course monetization and subscriptions.",
                  icon: "💳"
                },
                {
                  title: "Student Community",
                  desc: "Foster engagement with built-in discussion boards and collaborative tools.",
                  icon: "👥"
                },
                {
                  title: "Certifications",
                  desc: "Automatically issue beautiful certificates upon course completion.",
                  icon: "🎓"
                }
              ].map((feature, idx) => (
                <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-300 group">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-indigo-50 transition-colors">
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="bg-slate-900 rounded-[3rem] p-8 lg:p-20 relative overflow-hidden text-center text-white shadow-2xl shadow-indigo-200">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[100px] rounded-full" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full" />

              <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
                <h2 className="text-4xl lg:text-6xl font-bold tracking-tight leading-tight">
                  Ready to empower your students?
                </h2>
                <p className="text-xl text-slate-300">
                  Join thousands of instructors and organizations building the future of learning on LuminaLearn.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                  <Button asChild size="lg" className="h-14 px-10 text-lg font-semibold bg-white text-slate-900 hover:bg-slate-100 transition-all hover:scale-105 active:scale-100">
                    <Link href="/auth/register">Get Started Now</Link>
                  </Button>
                  <Button asChild size="lg" className="h-14 px-10 text-lg font-semibold border-2 border-white/20 bg-transparent hover:bg-white/10 text-white transition-all shadow-none">
                    <Link href="/search">Browse Courses</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 pt-20 pb-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
            <div className="col-span-2 lg:col-span-2 space-y-6">
              <Link href="/" className="flex items-center gap-x-2">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">L</span>
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">LuminaLearn</span>
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
                <li><Link href="/search" className="hover:text-slate-900 transition-colors">Courses</Link></li>
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
              © 2026 LuminaLearn LMS. All rights reserved. Built with ❤️ for educational excellence.
            </p>
            <div className="flex items-center gap-x-6 grayscale opacity-60">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-5" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
