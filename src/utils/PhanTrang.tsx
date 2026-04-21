type Props = {
  tongSoTrang: number;
  trangHienTai: number;
  xuLyTrang: (page: number) => void;
};

export const PhanTrang = ({ tongSoTrang, trangHienTai, xuLyTrang }: Props) => {
  const dsTrang: number[] = [];

  const start = Math.max(1, trangHienTai - 2);
  const end = Math.min(tongSoTrang, trangHienTai + 2);

  for (let i = start; i <= end; i++) {
    dsTrang.push(i);
  }

  return (
    <div className="flex justify-center mt-6">
      <nav className="inline-flex items-center gap-1">
        {/* Prev */}
        <button
          disabled={trangHienTai === 1}
          onClick={() => xuLyTrang(trangHienTai - 1)}
          className="px-3 py-2 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        {/* Page numbers */}
        {dsTrang.map((trang) => (
          <button
            key={trang}
            onClick={() => xuLyTrang(trang)}
            className={`px-4 py-2 border rounded ${
              trang === trangHienTai
                ? "bg-indigo-600 text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {trang}
          </button>
        ))}

        {/* Next */}
        <button
          disabled={trangHienTai === tongSoTrang}
          onClick={() => xuLyTrang(trangHienTai + 1)}
          className="px-3 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </nav>
    </div>
  );
};
