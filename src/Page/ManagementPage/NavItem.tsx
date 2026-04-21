import { NavLink } from "react-router-dom";
export const NavItem = ({ to, label }: { to: string; label: string }) => {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        padding: "10px 15px",
        textDecoration: "none",
        color: isActive ? "white" : "black",
        background: isActive ? "#007bff" : "transparent",
        fontWeight: isActive ? "bold" : "normal",
      })}
    >
      {label}
    </NavLink>
  );
};
