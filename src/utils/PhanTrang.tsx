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
      for (let i = 1; i <= tongSoTrang; i += 1) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(tongSoTrang - 1, currentPage + 1);

    if (start > 2) pages.push("...");

    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }

    if (end < tongSoTrang - 1) pages.push("...");

    pages.push(tongSoTrang);

    return pages;
  };

  return (
    <div className="mt-6 flex justify-center">
      <nav className="inline-flex flex-wrap items-center gap-1">
        <PageButton disabled={currentPage === 1} onClick={() => xuLyTrang(1)}>
          Đầu
        </PageButton>

        <PageButton
          disabled={currentPage === 1}
          onClick={() => xuLyTrang(currentPage - 1)}
        >
          Trước
        </PageButton>

        {taoDanhSachTrang().map((item, index) =>
          item === "..." ? (
            <span
              key={`dots-${index}`}
              className="select-none px-3 py-2 text-gray-500"
            >
              ...
            </span>
          ) : (
            <button
              type="button"
              key={item}
              onClick={() => xuLyTrang(item)}
              aria-current={item === currentPage ? "page" : undefined}
              className={`rounded border px-4 py-2 text-sm font-semibold transition ${
                item === currentPage
                  ? "border-[#008C2F] bg-[#008C2F] text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-[#f5f3ef]"
              }`}
            >
              {item}
            </button>
          ),
        )}

        <PageButton
          disabled={currentPage === tongSoTrang}
          onClick={() => xuLyTrang(currentPage + 1)}
        >
          Sau
        </PageButton>

        <PageButton
          disabled={currentPage === tongSoTrang}
          onClick={() => xuLyTrang(tongSoTrang)}
        >
          Cuối
        </PageButton>
      </nav>
    </div>
  );
};

function PageButton({
  children,
  disabled,
  onClick,
}: {
  children: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-[#f5f3ef] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}
