import React, { useMemo, useState } from "react";
import type { StadiumDraft } from "./RegisterFormMatch";

type Props = {
  setStep: (step: number) => void;
  stadium: StadiumDraft;
  onStadiumChange: (stadium: StadiumDraft) => void;
};

type GrassType = "Standard" | "Synthetic" | "Premium";

const clubOptions = [
  "Becamex Bình Dương",
  "Elite FC",
  "Phoenix FC",
  "Dragons United",
];

const grassOptions: Array<{
  value: GrassType;
  label: string;
  hint: string;
}> = [
  { value: "Standard", label: "Tự nhiên", hint: "Standard" },
  { value: "Synthetic", label: "Nhân tạo", hint: "Synthetic" },
  { value: "Premium", label: "Hybrid", hint: "Premium" },
];

const defaultStadiumImage =
  "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=1600&auto=format&fit=crop";

const mapImage =
  "https://images.unsplash.com/photo-1569336415962-a4bd9f69c07b?q=80&w=900&auto=format&fit=crop";

const StadiumRegistration: React.FC<Props> = ({
  setStep,
  stadium,
  onStadiumChange,
}) => {
  const [stadiumName, setStadiumName] = useState(stadium.name);
  const [clubName, setClubName] = useState(stadium.clubName || clubOptions[0]);
  const [address, setAddress] = useState(stadium.address);
  const [capacity, setCapacity] = useState(stadium.capacity);
  const [grassType, setGrassType] = useState<GrassType>(stadium.grass);
  const [stadiumImage, setStadiumImage] = useState(
    stadium.image || defaultStadiumImage,
  );
  const [country, setCountry] = useState(stadium.country || "Việt Nam");
  const [fifaStarRating, setFifaStarRating] = useState(
    Math.max(stadium.fifaStarRating ?? 2, 2),
  );
  const [certificateUrl, setCertificateUrl] = useState(
    stadium.certificateUrl || "",
  );
  const fifaPercent = useMemo(() => {
    return Math.min(Math.round((capacity / 86000) * 100), 100);
  }, [capacity]);

  const saveDraft = () => {
    onStadiumChange({
      name: stadiumName,
      clubName,
      address,
      capacity,
      grass: grassType,
      image: stadiumImage,
      country,
      fifaStarRating,
      certificateUrl: certificateUrl.trim() || undefined,
    });
  };

  const handleNext = () => {
    saveDraft();
    setStep(5);
  };

  const handleResetImage = () => {
    setStadiumImage(defaultStadiumImage);
  };

  return (
    <main className="pb-24">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-10">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2 font-['Be_Vietnam_Pro']">
            Chi tiết Sân vận động
          </h2>
          <p className="text-gray-500 max-w-md text-sm leading-relaxed">
            Cập nhật thông tin hạ tầng kỹ thuật và quản lý cho địa điểm thi đấu
            chính thức của câu lạc bộ.
          </p>
        </div>

        <span className="rounded-full bg-green-50 px-4 py-2 text-xs font-black text-green-700 uppercase">
          Bước 4 / 5
        </span>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <section className="bg-white rounded-[2rem] overflow-hidden relative group shadow-sm border border-gray-100">
            <div className="h-[300px] md:h-[400px] w-full relative">
              <img
                className="w-full h-full object-cover"
                src={stadiumImage || defaultStadiumImage}
                alt={stadiumName || "Stadium"}
              />

              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

              <div className="absolute bottom-5 right-5 flex gap-3">
                <label className="bg-white/90 backdrop-blur text-gray-900 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-xl active:scale-95 transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-sm">
                    photo_camera
                  </span>
                  Thay đổi ảnh đại diện
                  <input
                    type="url"
                    value={stadiumImage}
                    onChange={(event) => setStadiumImage(event.target.value)}
                    className="sr-only"
                    aria-label="URL ảnh sân vận động"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleResetImage}
                  className="bg-white/90 backdrop-blur text-red-500 px-3 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-xl active:scale-95 transition-all"
                  aria-label="Khôi phục ảnh mặc định"
                >
                  <span className="material-symbols-outlined text-sm">
                    delete
                  </span>
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-700">
                <span className="material-symbols-outlined">edit_note</span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 font-['Be_Vietnam_Pro']">
                Thông tin cơ bản
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <InputGroup label="Tên sân vận động">
                <input
                  className="w-full bg-[#f5f3ef] border-none rounded-2xl p-4 focus:ring-2 focus:ring-green-700/20 transition-all text-gray-900 font-medium placeholder:text-gray-400 outline-none"
                  type="text"
                  value={stadiumName}
                  onChange={(event) => setStadiumName(event.target.value)}
                />
              </InputGroup>

              <InputGroup label="Câu lạc bộ chủ quản">
                <div className="relative">
                  <select
                    className="w-full bg-[#f5f3ef] border-none rounded-2xl p-4 pr-10 focus:ring-2 focus:ring-green-700/20 transition-all text-gray-900 font-medium outline-none appearance-none"
                    value={clubName}
                    onChange={(event) => setClubName(event.target.value)}
                  >
                    {clubOptions.map((club) => (
                      <option key={club} value={club}>
                        {club}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </InputGroup>

              <div className="col-span-2 flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                  Địa chỉ / Vị trí
                </label>

                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    location_on
                  </span>

                  <input
                    className="w-full bg-[#f5f3ef] border-none rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-green-700/20 transition-all text-gray-900 font-medium outline-none"
                    type="text"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                  />
                </div>
              </div>

              <InputGroup label="Quốc gia sân">
                <input
                  className="w-full bg-[#f5f3ef] border-none rounded-2xl p-4 focus:ring-2 focus:ring-green-700/20 transition-all text-gray-900 font-medium outline-none"
                  type="text"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                />
              </InputGroup>

              <InputGroup label="Chuẩn sao sân">
                <input
                  className="w-full bg-[#f5f3ef] border-none rounded-2xl p-4 focus:ring-2 focus:ring-green-700/20 transition-all text-gray-900 font-medium outline-none"
                  type="number"
                  min={2}
                  max={5}
                  value={fifaStarRating}
                  onChange={(event) =>
                    setFifaStarRating(Number(event.target.value))
                  }
                />
              </InputGroup>

              <div className="col-span-2 flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                  URL chứng nhận sân
                </label>
                <input
                  className="w-full bg-[#f5f3ef] border-none rounded-2xl p-4 focus:ring-2 focus:ring-green-700/20 transition-all text-gray-900 font-medium outline-none"
                  type="url"
                  value={certificateUrl}
                  onChange={(event) => setCertificateUrl(event.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <span className="material-symbols-outlined">groups</span>
              </div>

              <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full uppercase">
                Kỹ thuật
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 font-['Be_Vietnam_Pro'] mb-4">
              Sức chứa
            </h3>

            <div className="flex items-end gap-3 mb-6">
              <input
                className="text-5xl font-black text-green-700 bg-transparent border-none p-0 w-full focus:ring-0 outline-none"
                type="number"
                min={0}
                value={capacity}
                onChange={(event) => setCapacity(Number(event.target.value))}
              />

              <span className="text-gray-400 font-bold mb-2">Người</span>
            </div>

            <div className="w-full bg-[#f5f3ef] h-2 rounded-full overflow-hidden">
              <div
                className="bg-green-700 h-full rounded-full transition-all"
                style={{ width: `${fifaPercent}%` }}
              />
            </div>

            <p className="text-xs text-gray-400 mt-3">
              Đã đạt {fifaPercent}% tiêu chuẩn FIFA Elite.
            </p>
          </section>

          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                <span className="material-symbols-outlined">grass</span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 font-['Be_Vietnam_Pro']">
                Loại mặt cỏ
              </h3>
            </div>

            <div className="space-y-3">
              {grassOptions.map((option) => {
                const isActive = grassType === option.value;

                return (
                  <label
                    key={option.value}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all bg-[#f5f3ef] ${
                      isActive
                        ? "border-green-700/30"
                        : "border-transparent hover:border-green-700/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isActive ? "border-green-700" : "border-gray-400"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full bg-green-700 ${
                            isActive ? "opacity-100" : "opacity-0"
                          }`}
                        />
                      </div>

                      <span
                        className={`text-sm ${
                          isActive
                            ? "font-bold text-gray-900"
                            : "font-medium text-gray-700"
                        }`}
                      >
                        {option.label}
                      </span>
                    </div>

                    <span className="text-[10px] text-gray-400 font-bold">
                      {option.hint}
                    </span>

                    <input
                      checked={isActive}
                      className="hidden"
                      name="grass"
                      type="radio"
                      onChange={() => setGrassType(option.value)}
                    />
                  </label>
                );
              })}
            </div>
          </section>

          <section className="bg-[#f5f3ef] rounded-[2rem] overflow-hidden shadow-sm aspect-square relative border border-gray-100">
            <img
              className="w-full h-full object-cover grayscale opacity-50"
              src={mapImage}
              alt="Bản đồ vị trí sân vận động"
            />

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 bg-green-700 rounded-full flex items-center justify-center text-white shadow-2xl animate-pulse">
                <span className="material-symbols-outlined">location_on</span>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur p-3 rounded-xl flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-900">
                GPS: 10.7626° N, 106.6602° E
              </span>

              <button
                type="button"
                className="text-green-700 text-xs font-black uppercase"
              >
                Mở bản đồ
              </button>
            </div>
          </section>
        </div>
      </div>

      <div className="fixed bottom-10 left-64 right-0 flex justify-center px-10 pointer-events-none z-40">
        <div className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-full p-4 flex items-center justify-between shadow-2xl w-full max-w-4xl pointer-events-auto">
          <div className="flex items-center gap-4 pl-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-700">
                stadium
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {stadiumName || "Chưa nhập tên sân"}
              </p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Thông tin sân vận động
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                saveDraft();
                setStep(3);
              }}
              className="px-8 py-3 rounded-full text-gray-500 hover:bg-gray-50 font-bold text-sm transition-all"
            >
              Quay lại
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={
                !stadiumName.trim() ||
                !address.trim() ||
                !country.trim() ||
                capacity < 10000 ||
                fifaStarRating < 2
              }
              className="px-10 py-3 rounded-full bg-green-700 text-white font-bold shadow-lg shadow-green-700/20 hover:scale-105 active:scale-95 transition-all text-sm disabled:opacity-50"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

type InputGroupProps = {
  label: string;
  children: React.ReactNode;
};

const InputGroup = ({ label, children }: InputGroupProps) => (
  <div className="col-span-2 md:col-span-1 flex flex-col gap-2">
    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
      {label}
    </label>
    {children}
  </div>
);

export default StadiumRegistration;
