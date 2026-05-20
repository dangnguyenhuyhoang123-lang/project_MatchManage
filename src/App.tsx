import "./App.css";

import AppRoutes from "./AppRoutes";

import { AuthProvider } from "./utils/AuthContext";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
