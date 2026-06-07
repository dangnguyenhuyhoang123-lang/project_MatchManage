import { Outlet } from "react-router-dom";
import { AppLayout } from "./AppLayout";

// Hiển thị AdminLayout.
const AdminLayout = () => {
  return (
    <AppLayout workspace="admin">
      <Outlet />
    </AppLayout>
  );
};

export default AdminLayout;
