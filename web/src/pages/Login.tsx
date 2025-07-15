import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // 重定向到首页，登录功能现在通过导航栏的弹窗实现
    navigate("/", { replace: true });
  }, [navigate]);

  return null;
}