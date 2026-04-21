import { Outlet } from "react-router-dom";
import { NavItem } from "./NavItem";
import "./AdminLayout.css";

export const AdminLayout = () => {
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-layout-sidebar">
        <h3>Management</h3>

        <nav>
          <NavItem to="/admin/manage/matches" label="Matches" />
          <NavItem to="/admin/manage/teams" label="Teams" />
          <NavItem to="/admin/manage/players" label="Players" />
          <NavItem to="/admin/manage/coaches" label="Coaches" />
        </nav>
      </div>

      {/* Content */}
      <div className="admin-layout-content">
        <Outlet />
      </div>
    </div>
  );
};
