import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="h-full w-full flex items-center justify-center bg-void">
        <span className="label text-quiet">Authenticating</span>
      </div>
    );
  }

  if (status === "anon") {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
