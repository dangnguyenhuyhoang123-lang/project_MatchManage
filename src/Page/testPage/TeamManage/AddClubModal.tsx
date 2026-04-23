import React, { useState } from "react";

// --- Types ---
interface ClubFormData {
  name: string;
  foundedYear: string;
  city: string;
  stadium: string;
  owner: string;
  description: string;
}

interface Props {
  onClose: () => void;
}

const AddClubModal: React.FC<Props> = ({ onClose }) => {
  const [formData, setFormData] = useState<ClubFormData>({
    name: "",
    foundedYear: "2024",
    city: "Hà Nội",
    stadium: "",
    owner: "",
    description: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dữ liệu CLB:", formData);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-6xl mx-4">
        <div className="w-full max-h-[90vh] overflow-y-auto bg-[#fbf9f5] rounded-3xl shadow-2xl">
          <main className="flex-1">
            <div className="p-10 max-w-5xl mx-auto">
              {/* Title */}
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-zinc-100"
                  >
                    ←
                  </button>

                  <span className="text-blue-500 text-xs uppercase font-bold">
                    Hệ Thống Quản Lý CLB
                  </span>
                </div>

                <h1 className="text-4xl font-black mb-2">
                  Thêm Câu Lạc Bộ Mới
                </h1>

                <p className="text-zinc-500">
                  Khởi tạo hồ sơ câu lạc bộ chuyên nghiệp.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-12 gap-6">
                  {/* Logo */}
                  <div className="col-span-12 md:col-span-4 bg-white p-8 rounded-2xl border flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center mb-4">
                      📷
                    </div>
                    <h3 className="font-bold">Biểu trưng CLB</h3>
                  </div>

                  {/* Info */}
                  <div className="col-span-12 md:col-span-8 bg-white p-8 rounded-2xl border">
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Tên CLB"
                      className="w-full mb-4 p-3 rounded bg-gray-100"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        name="foundedYear"
                        value={formData.foundedYear}
                        onChange={handleInputChange}
                        className="p-3 rounded bg-gray-100"
                      />

                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="p-3 rounded bg-gray-100"
                      >
                        <option>Hà Nội</option>
                        <option>TP.HCM</option>
                      </select>
                    </div>
                  </div>

                  {/* Stadium */}
                  <div className="col-span-12 md:col-span-7 bg-gray-100 p-8 rounded-2xl">
                    <input
                      name="stadium"
                      value={formData.stadium}
                      onChange={handleInputChange}
                      placeholder="Sân vận động"
                      className="w-full mb-4 p-3 rounded"
                    />

                    <input
                      name="owner"
                      value={formData.owner}
                      onChange={handleInputChange}
                      placeholder="Chủ sở hữu"
                      className="w-full p-3 rounded"
                    />
                  </div>

                  {/* Description */}
                  <div className="col-span-12 md:col-span-5 bg-blue-500 text-white p-8 rounded-2xl">
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded bg-white/10"
                      placeholder="Mô tả..."
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                  <button type="button" onClick={onClose}>
                    Hủy
                  </button>

                  <button className="bg-green-600 text-white px-6 py-2 rounded">
                    Lưu
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AddClubModal;
