import React, { useState } from "react";

import RegistrationPortal from "./RegistrationPortal";
import PlayerRegistration from "./PlayerRegistration";
import FinalConfirmation from "./FinalConfirmation";
import { AppLayout } from "../../../components/AppLayout";
import { Container } from "../../../utils/Container";

// --- Main Page Component ---

const RegisterFormMatch: React.FC = () => {
  const [step, setStep] = useState(1);
  const steps = [
    { step: 1, label: "Chọn CLB" },
    { step: 2, label: "Danh sách Cầu thủ" },
    { step: 3, label: "Kiểm tra & Xác nhận" },
  ];

  return (
    <AppLayout>
      <Container>
        {/* Breadcrumb */}
        {/* <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8 font-semibold uppercase tracking-wider">
                  <a href="#" className="hover:text-green-700">
                    Trang chủ
                  </a>
                  <span className="material-symbols-outlined text-[10px]">
                    chevron_right
                  </span>
                  <span className="text-gray-900">Chọn Câu lạc bộ</span>
                </nav> */}

        {/* <div className="mb-12">
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3 font-['Be_Vietnam_Pro']">
                    Đăng ký thi đấu - Bước 1
                  </h1>
                  <p className="text-gray-500 max-w-2xl leading-relaxed">
                    Vui lòng lựa chọn câu lạc bộ bạn muốn đại diện trong mùa giải
                    2024/25. Sau khi chọn, bạn sẽ tiếp tục đến bước lập danh sách thi
                    đấu.
                  </p>
                </div> */}
        <header className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2 font-['Be_Vietnam_Pro']">
              Hồ sơ Đăng ký Giải đấu
            </h2>
            <p className="text-gray-500 text-sm">
              Đăng ký danh sách cho giải{" "}
              <span className="font-bold text-[#0d631b]">
                Vietnam Premier Cup 2024
              </span>
              .
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-600 font-bold hover:bg-white transition-all text-sm">
              Lưu nháp
            </button>
            {/* <button className="px-8 py-2.5 rounded-full bg-[#0d631b] text-white font-bold shadow-lg shadow-green-900/20 hover:bg-green-800 transition-all text-sm">
                Gửi đơn đăng ký
              </button> */}
          </div>
        </header>

        {/* Stepper Custom */}
        {/* <div className="mb-16 flex items-center justify-between max-w-3xl mx-auto relative">
                  <div className="absolute top-6 left-0 w-full h-[2px] bg-gray-200 -z-10"></div>
                  {[
                    { step: 1, label: "Chọn CLB", active: true },
                    { step: 2, label: "Danh sách cầu thủ", active: false },
                    { step: 3, label: "Kiểm tra & Xác nhận", active: false },
                  ].map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ring-8 ring-[#fbf9f5] ${s.active ? "bg-green-700 text-white shadow-xl shadow-green-700/20" : "bg-gray-200 text-gray-400"}`}
                      >
                        {s.step}
                      </div>
                      <span
                        className={`text-xs font-bold ${s.active ? "text-green-700" : "text-gray-400"}`}
                      >
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div> */}
        <div className="flex items-center justify-between bg-[#f5f3ef] p-6 rounded-2xl mb-8 border border-gray-200">
          {steps.map((s, i) => {
            const isActive = step === s.step;
            const isDone = step > s.step;

            return (
              <React.Fragment key={s.step}>
                <button
                  type="button"
                  onClick={() => setStep(s.step)}
                  className="flex items-center gap-4 flex-1 text-left"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      isDone || isActive
                        ? "bg-[#0d631b] text-white shadow-lg"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {s.step}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-none">
                      {s.label}
                    </p>
                    <p
                      className={`text-[11px] mt-1 font-bold ${
                        isActive
                          ? "text-[#0d631b]"
                          : isDone
                            ? "text-green-600"
                            : "text-gray-400"
                      }`}
                    >
                      {isActive
                        ? "Đang thực hiện"
                        : isDone
                          ? "Hoàn thành"
                          : "Chưa bắt đầu"}
                    </p>
                  </div>
                </button>

                {i < steps.length - 1 && (
                  <div className="h-px bg-gray-300 flex-1 mx-4" />
                )}
              </React.Fragment>
            );
          })}
        </div>
        {step === 1 && <RegistrationPortal setStep={setStep} />}
        {step === 2 && <PlayerRegistration setStep={setStep} />}
        {step === 3 && <FinalConfirmation setStep={setStep} />}
      </Container>
    </AppLayout>
  );
};

export default RegisterFormMatch;
