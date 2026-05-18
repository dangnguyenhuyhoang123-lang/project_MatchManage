import React from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  buttonText,
  onButtonClick,
}) => {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div>
        <h2 className="text-4xl font-black text-on-surface tracking-tight mb-2 font-headline">
          {title}
        </h2>
        <p className="text-on-surface-variant max-w-md">{description}</p>
      </div>

      <button
        onClick={onButtonClick}
        className="
    bg-[#008C2F]
    hover:bg-[#007728]

    text-white

    rounded-[14px]

    px-7
    py-3.5

    font-[700]
    text-[16px]

    flex
    items-center
    justify-center
    gap-2

    transition-all
    duration-200
  "
      >
        <span className="material-symbols-outlined text-[22px]">add</span>

        {buttonText}
      </button>
    </header>
  );
};
