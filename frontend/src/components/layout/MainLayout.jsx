import { Footer, Sidebar, Navbar } from "./index";



const MainLayout = ({ children }) => {
    return (
        <div className="d-flex">

            <Sidebar />

            <div className="flex-grow-1 d-flex flex-column min-vh-100">

                <Navbar />

                <main className="flex-grow-1 p-4 bg-light">
                    {children}
                </main>

                <Footer />

            </div>

        </div>
    );
};

export default MainLayout;