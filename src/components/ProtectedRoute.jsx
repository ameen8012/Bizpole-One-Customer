import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ redirectPath = "/", children }) => {
  const token = localStorage.getItem("partnerToken") || localStorage.getItem("token")// Use partner token
  if (!token) {
    return <Navigate to={redirectPath} replace />;
  }
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
