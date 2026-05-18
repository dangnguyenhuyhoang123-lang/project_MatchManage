type Props = {
  tongSoTrang: number;
  trangHienTai: number;
  xuLyTrang: (page: number) => void;
};

export const PhanTrang = ({ tongSoTrang, trangHienTai, xuLyTrang }: Props) => {
  if (tongSoTrang <= 1) return null;

  const currentPage = Math.min(Math.max(trangHienTai, 1), tongSoTrang);

  const taoDanhSachTrang = (): Array<number | "..."> => {
    const pages: Array<number | "..."> = [];

    if (tongSoTrang <= 7) {
      for (let i = 1; i <= tongSoTrang; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(tongSoTrang - 1, currentPage + 1);

    if (start > 2) {
      pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < tongSoTrang - 1) {
      pages.push("...");
    }

    pages.push(tongSoTrang);

    return pages;
  };

  const dsTrang = taoDanhSachTrang();

  return (
    <div className="flex justify-center mt-6">
      <nav className="inline-flex items-center gap-1 flex-wrap">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => xuLyTrang(1)}
          className="px-3 py-2 border rounded disabled:opacity-50"
        >
          Đầu
        </button>

        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => xuLyTrang(currentPage - 1)}
          className="px-3 py-2 border rounded disabled:opacity-50"
        >
          Trước
        </button>

        {dsTrang.map((item, index) =>
          item === "..." ? (
            <span
              key={`dots-${index}`}
              className="px-3 py-2 text-gray-500 select-none"
            >
              ...
            </span>
          ) : (
            <button
              type="button"
              key={item}
              onClick={() => xuLyTrang(Number(item))}
              aria-current={item === currentPage ? "page" : undefined}
              className={`px-4 py-2 border rounded ${
                item === currentPage
                  ? "bg-indigo-600 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={currentPage === tongSoTrang}
          onClick={() => xuLyTrang(currentPage + 1)}
          className="px-3 py-2 border rounded disabled:opacity-50"
        >
          Sau
        </button>

        <button
          type="button"
          disabled={currentPage === tongSoTrang}
          onClick={() => xuLyTrang(tongSoTrang)}
          className="px-3 py-2 border rounded disabled:opacity-50"
        >
          Cuối
        </button>
      </nav>
    </div>
  );
};
