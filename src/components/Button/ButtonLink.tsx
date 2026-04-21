import { Link } from "react-router-dom";

type ButtonLinkProps = {
  label: string;
  to: string;
  className?: string;
};

const ButtonLink = ({ label, to, className = "" }: ButtonLinkProps) => {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center rounded-xl px-8 py-3 font-semibold transition hover:shadow-lg ${className}`.trim()}
    >
      {label}
    </Link>
  );
};

export default ButtonLink;
