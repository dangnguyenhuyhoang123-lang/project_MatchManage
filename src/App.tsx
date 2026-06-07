import "./App.css";

import AppRoutes from "./AppRoutes";

import { AuthProvider } from "./utils/AuthContext";
import { Toaster } from "sonner";
// Hiển thị App.
function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}

export default App;
