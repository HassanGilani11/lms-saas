import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { RouteVisibilityContainer } from "@/components/shared/route-visibility-container";

const PublicLayout = ({
    children
}: {
    children: React.ReactNode;
}) => {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
            <RouteVisibilityContainer hideOnPatterns={["/topics/"]}>
                <Footer />
            </RouteVisibilityContainer>
        </div>
    );
}

export default PublicLayout;
