import { ReactNode } from "react";
import { Sidebar } from "../utils/SideBar";
import { Header1 } from "./Header/Header1";
import { Container } from "../utils/Container";
interface ContainerProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: ContainerProps) => {
  return (
    <div className="min-h-screen bg-[#fbf9f5] flex justify-center">
      <link
        href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@700;900&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />{" "}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0"
        rel="stylesheet"
      />
      <div className="w-full max-w-[1500px] flex gap-4 px-3 sm:px-4 lg:px-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Khu vực Header riêng biệt */}

          {/* Khu vực Nội dung chính */}
          <div className="w-full max-w-[1400px] space-y-8">
            <main className="flex-1 py-6">
              <Container>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase mb-1">
                  <span>Trang chủ</span> <span>›</span>{" "}
                  <span className="text-green-700">Báo cáo</span>
                </div>
                {children}
              </Container>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};
