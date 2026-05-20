import { Outlet } from "react-router-dom";
import { Header_HomePage } from "../components/Header/Header_HomePage";
import { AppLayout } from "./AppLayout";

const PublicLayout = () => {
  return (
    <AppLayout workspace="public">
      <Header_HomePage />
      <Outlet />
    </AppLayout>
  );
};

export default PublicLayout;
