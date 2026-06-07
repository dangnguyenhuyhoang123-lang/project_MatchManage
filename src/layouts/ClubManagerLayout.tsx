import { Outlet } from "react-router-dom";
import { AppLayout } from "./AppLayout";

// Hiển thị ClubManagerLayout.
const ClubManagerLayout = () => {
  return (
    <AppLayout workspace="club">
      <Outlet />
    </AppLayout>
  );
};

export default ClubManagerLayout;
