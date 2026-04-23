import { ReactNode } from "react";
import { Sidebar } from "../utils/SideBar";

interface ContainerProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: ContainerProps) => {
  return (
    <div className="min-h-screen bg-[#fbf9f5] font-['Inter'] flex justify-center">
      <link
        href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@700;900&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />{" "}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0"
        rel="stylesheet"
      />
      <div className="w-full max-w-[1400px] flex gap-4 px-4">
        {/* Sidebar */}
        <aside className="w-64 shrink-0">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 flex flex-col">
          <div className="p-6 md:p-8 lg:p-10 max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
