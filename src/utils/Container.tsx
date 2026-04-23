type Props = {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
};

export const Container = ({ children, size = "lg" }: Props) => {
  const sizeMap = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
  };

  return (
    <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${sizeMap[size]}`}>
      {children}
    </div>
  );
};
