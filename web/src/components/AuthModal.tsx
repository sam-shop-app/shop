import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
  Button,
  Tabs,
  Tab,
  Divider,
  Link,
  Checkbox,
  addToast,
} from "@heroui/react";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth";
import {
  isValidPhone,
  isValidEmail,
  isValidUsername,
} from "@/utils/validation";

type LoginMethod = "password" | "verification";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "register";
}

interface RegisterFormData {
  username: string;
  phone_number: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormErrors {
  username?: string;
  phone_number?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function AuthModal({ isOpen, onClose, mode }: AuthModalProps) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password");

  // 登录表单
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [recipient, setRecipient] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 注册表单
  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    username: "",
    phone_number: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [registerErrors, setRegisterErrors] = useState<RegisterFormErrors>({});
  const [agreed, setAgreed] = useState(false);

  const [loading, setLoading] = useState(false);

  // 重置表单
  const resetForms = () => {
    setAccount("");
    setPassword("");
    setRecipient("");
    setVerificationCode("");
    setRegisterForm({
      username: "",
      phone_number: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setRegisterErrors({});
    setCodeSent(false);
    setCountdown(0);
    setAgreed(false);
  };

  // 获取输入框的占位符文本
  const getPlaceholder = (value: string) => {
    if (!value) return "用户名/手机号/邮箱";
    if (isValidPhone(value)) return "手机号";
    if (isValidEmail(value)) return "邮箱";
    return "用户名";
  };

  const getCodePlaceholder = (value: string) => {
    if (!value) return "手机号/邮箱";
    if (isValidPhone(value)) return "手机号";
    if (isValidEmail(value)) return "邮箱";
    return "请输入有效的手机号或邮箱";
  };

  // 倒计时处理
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 发送验证码
  const handleSendCode = async () => {
    if (!recipient.trim()) {
      addToast({
        title: "输入错误",
        description: "请输入手机号或邮箱",
        color: "warning",
        timeout: 3000,
      });
      return;
    }

    if (!isValidPhone(recipient) && !isValidEmail(recipient)) {
      addToast({
        title: "格式错误",
        description: "请输入有效的手机号或邮箱",
        color: "warning",
        timeout: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      await authService.sendVerificationCode({
        recipient,
        purpose: "login",
      });
      setCodeSent(true);
      startCountdown();

      addToast({
        title: "发送成功",
        description: "验证码已发送，请注意查收",
        color: "success",
        timeout: 3000,
      });
    } catch (err: any) {
      addToast({
        title: "发送失败",
        description: err.response?.data?.error || "发送验证码失败",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // 密码登录
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account || !password) {
      addToast({
        title: "输入错误",
        description: "请输入账号和密码",
        color: "warning",
        timeout: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login({
        username: account,
        password,
      });

      login(
        {
          id: response.user.id.toString(),
          name: response.user.full_name || response.user.username,
          email: response.user.email,
          avatar: response.user.avatar_url,
        },
        response.token,
      );

      addToast({
        title: "登录成功",
        description: "欢迎回来！",
        color: "success",
        timeout: 2000,
      });

      onClose();
      resetForms();
    } catch (err: any) {
      addToast({
        title: "登录失败",
        description: err.response?.data?.error || "登录失败",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // 验证码登录
  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipient || !verificationCode) {
      addToast({
        title: "输入错误",
        description: "请输入手机号/邮箱和验证码",
        color: "warning",
        timeout: 3000,
      });
      return;
    }

    if (!isValidPhone(recipient) && !isValidEmail(recipient)) {
      addToast({
        title: "格式错误",
        description: "请输入有效的手机号或邮箱",
        color: "warning",
        timeout: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await authService.loginWithCode({
        recipient,
        code: verificationCode,
      });

      login(
        {
          id: response.user.id.toString(),
          name: response.user.full_name || response.user.username,
          email: response.user.email,
          avatar: response.user.avatar_url,
        },
        response.token,
      );

      addToast({
        title: "登录成功",
        description: "欢迎回来！",
        color: "success",
        timeout: 2000,
      });

      onClose();
      resetForms();
    } catch (err: any) {
      addToast({
        title: "登录失败",
        description: err.response?.data?.error || "登录失败",
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // 单个字段校验
  const validateField = (
    field: keyof RegisterFormData,
    value: string,
  ): string | undefined => {
    switch (field) {
      case "username":
        if (!value.trim()) return "用户名是必填项";
        if (!isValidUsername(value))
          return "用户名只能包含字母、数字和下划线，长度4-16位";
        break;
      case "phone_number":
        if (!value.trim()) return "手机号是必填项";
        if (!isValidPhone(value)) return "请输入有效的手机号码";
        break;
      case "email":
        if (!value.trim()) return "邮箱是必填项";
        if (!isValidEmail(value)) return "请输入有效的邮箱地址";
        break;
      case "password":
        if (value.length < 6) return "密码至少需要6个字符";
        break;
      case "confirmPassword":
        if (value !== registerForm.password) return "两次输入的密码不一致";
        break;
    }
    return undefined;
  };

  // 检查表单是否有效
  const isFormValid = (): boolean => {
    const hasErrors = Object.values(registerErrors).some((error) => error);
    const hasEmptyFields = Object.values(registerForm).some(
      (value) => !value.trim(),
    );
    return !hasErrors && !hasEmptyFields && agreed;
  };

  // 注册
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      addToast({
        title: "输入错误",
        description: "请检查表单输入并同意服务条款",
        color: "warning",
        timeout: 3000,
      });
      return;
    }

    try {
      setLoading(true);

      const response = await authService.register({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
        phone_number: registerForm.phone_number,
      });

      if (response.token) {
        // 直接使用注册返回的用户信息进行登录，无需额外调用 getProfile
        login(
          {
            id: response.user.id.toString(),
            name: registerForm.username, // 使用用户名作为显示名称
            email: registerForm.email,
            avatar: undefined,
          },
          response.token,
        );
        addToast({
          title: "注册成功",
          description: "欢迎加入山姆闪购！",
          color: "success",
          timeout: 2000,
        });

        onClose();

        resetForms();
      } else {
      }
    } catch (error: any) {
      let errorMessage = error.response?.data?.error || "注册失败，请稍后重试";
      addToast({
        title: "注册失败",
        description: errorMessage,
        color: "danger",
        timeout: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChange = (
    field: keyof RegisterFormData,
    value: string,
  ) => {
    // 更新表单值
    setRegisterForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 实时校验
    const error = validateField(field, value);
    setRegisterErrors((prev) => ({
      ...prev,
      [field]: error,
    }));

    // 如果是密码更新，同时校验确认密码
    if (field === "password" && registerForm.confirmPassword) {
      const confirmError = validateField(
        "confirmPassword",
        registerForm.confirmPassword,
      );
      setRegisterErrors((prev) => ({
        ...prev,
        confirmPassword: confirmError,
      }));
    }
  };

  const handleModalClose = () => {
    onClose();
    resetForms();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      size="md"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 items-center">
          <h2 className="text-xl font-bold">
            {mode === "login" ? "登录山姆闪购" : "注册山姆闪购"}
          </h2>
          <p className="text-sm text-default-500">
            {mode === "login" ? "选择您的登录方式" : "创建账号开始购物体验"}
          </p>
        </ModalHeader>

        <ModalBody className="gap-4">
          {mode === "login" ? (
            <Tabs
              selectedKey={loginMethod}
              onSelectionChange={(key) => setLoginMethod(key as LoginMethod)}
              fullWidth
              color="primary"
            >
              <Tab key="password" title="密码登录">
                <form
                  onSubmit={handlePasswordLogin}
                  className="flex flex-col gap-4 mt-4"
                >
                  <Input
                    label="账号"
                    placeholder={getPlaceholder(account)}
                    value={account}
                    onValueChange={setAccount}
                    variant="bordered"
                    isRequired
                    autoComplete="username"
                    description="支持用户名、手机号或邮箱登录"
                  />

                  <Input
                    label="密码"
                    placeholder="请输入密码"
                    type="password"
                    value={password}
                    onValueChange={setPassword}
                    variant="bordered"
                    isRequired
                    autoComplete="current-password"
                  />

                  <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    isLoading={loading}
                    className="w-full"
                  >
                    登录
                  </Button>
                </form>
              </Tab>

              <Tab key="verification" title="验证码登录">
                <form
                  onSubmit={handleCodeLogin}
                  className="flex flex-col gap-4 mt-4"
                >
                  <Input
                    label="手机号/邮箱"
                    placeholder={getCodePlaceholder(recipient)}
                    value={recipient}
                    onValueChange={setRecipient}
                    variant="bordered"
                    isRequired
                    type={
                      isValidPhone(recipient)
                        ? "tel"
                        : isValidEmail(recipient)
                          ? "email"
                          : "text"
                    }
                    autoComplete={
                      isValidPhone(recipient)
                        ? "tel"
                        : isValidEmail(recipient)
                          ? "email"
                          : "off"
                    }
                    description="系统将自动识别并发送验证码"
                  />

                  <div className="flex gap-2">
                    <Input
                      label="验证码"
                      placeholder="请输入验证码"
                      value={verificationCode}
                      onValueChange={setVerificationCode}
                      variant="bordered"
                      isRequired
                      autoComplete="one-time-code"
                      className="flex-1"
                    />
                    <Button
                      color="primary"
                      variant="flat"
                      size="lg"
                      onClick={handleSendCode}
                      isDisabled={
                        loading ||
                        countdown > 0 ||
                        (!isValidPhone(recipient) && !isValidEmail(recipient))
                      }
                      className="h-auto min-w-[100px]"
                    >
                      {countdown > 0 ? `${countdown}s` : "发送"}
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    color="primary"
                    size="lg"
                    isLoading={loading}
                    isDisabled={!codeSent}
                    className="w-full"
                  >
                    登录
                  </Button>
                </form>
              </Tab>
            </Tabs>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <Input
                label="用户名"
                placeholder="4-16位字母、数字或下划线"
                value={registerForm.username}
                onValueChange={(value) =>
                  handleRegisterChange("username", value)
                }
                variant="bordered"
                isRequired
                autoComplete="username"
                description="用于登录的唯一标识"
                isInvalid={!!registerErrors.username}
                errorMessage={registerErrors.username}
              />

              <Input
                label="手机号"
                placeholder="请输入手机号"
                value={registerForm.phone_number}
                onValueChange={(value) =>
                  handleRegisterChange("phone_number", value)
                }
                variant="bordered"
                isRequired
                type="tel"
                autoComplete="tel"
                isInvalid={!!registerErrors.phone_number}
                errorMessage={registerErrors.phone_number}
              />

              <Input
                label="邮箱"
                placeholder="请输入邮箱地址"
                value={registerForm.email}
                onValueChange={(value) => handleRegisterChange("email", value)}
                variant="bordered"
                isRequired
                type="email"
                autoComplete="email"
                isInvalid={!!registerErrors.email}
                errorMessage={registerErrors.email}
              />

              <Divider />

              <Input
                label="密码"
                placeholder="至少6个字符"
                value={registerForm.password}
                onValueChange={(value) =>
                  handleRegisterChange("password", value)
                }
                variant="bordered"
                isRequired
                type="password"
                autoComplete="new-password"
                isInvalid={!!registerErrors.password}
                errorMessage={registerErrors.password}
              />

              <Input
                label="确认密码"
                placeholder="请再次输入密码"
                value={registerForm.confirmPassword}
                onValueChange={(value) =>
                  handleRegisterChange("confirmPassword", value)
                }
                variant="bordered"
                isRequired
                type="password"
                autoComplete="new-password"
                isInvalid={!!registerErrors.confirmPassword}
                errorMessage={registerErrors.confirmPassword}
              />

              <Checkbox
                isSelected={agreed}
                onValueChange={setAgreed}
                size="sm"
                classNames={{
                  label: "text-sm",
                }}
              >
                我已阅读并同意
                <Link as="a" href="#" size="sm" className="ml-1">
                  服务条款
                </Link>
                和
                <Link as="a" href="#" size="sm" className="ml-1">
                  隐私政策
                </Link>
              </Checkbox>

              <Button
                type="submit"
                color="primary"
                size="lg"
                isLoading={loading}
                isDisabled={!isFormValid()}
                className="w-full"
              >
                注册
              </Button>
            </form>
          )}

          <Divider className="my-2" />

          <div className="space-y-3">
            <p className="text-center text-sm text-default-500">其他登录方式</p>
            <Button
              variant="bordered"
              size="md"
              isDisabled
              className="w-full"
              startContent={
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#07C160"
                    d="M20.39 10.11c-.01-.47-.03-.93-.07-1.37-.17-1.56-.81-2.88-1.86-3.92C17.1 3.46 15.26 2.78 13.3 2.78c-.33 0-.66.02-.99.06-1.1.11-2.13.45-3.04.97-.81.47-1.51 1.1-2.08 1.84-.29.37-.54.77-.75 1.19-.51 1.03-.78 2.19-.78 3.43v.1c0 .71.09 1.39.27 2.04.31 1.15.86 2.16 1.59 2.97l.01.01c.73.8 1.62 1.42 2.61 1.8.01 0 .01 0 .02.01.54.21 1.11.36 1.71.43h.01c.21.03.42.04.63.04.17 0 .34-.01.51-.02 1.25-.09 2.41-.5 3.39-1.17l.01-.01c.82-.56 1.52-1.31 2.04-2.17v-.01c.19-.31.35-.64.48-.98.08-.2.15-.41.21-.62.13-.42.22-.86.27-1.31v-.03c.03-.29.05-.59.05-.9 0-.31-.01-.62-.04-.93zm-4.12 4.26c-.58.67-1.38 1.1-2.28 1.2h-.01c-.14.02-.29.03-.44.03-.13 0-.25-.01-.38-.02h-.01c-.4-.04-.78-.14-1.14-.29-.01 0-.01 0-.02-.01-.64-.26-1.19-.7-1.58-1.25v-.01c-.39-.54-.65-1.2-.73-1.91-.01-.01-.01-.02-.01-.03-.03-.21-.04-.43-.04-.65v-.06c0-.61.14-1.18.39-1.69v-.01c.11-.21.24-.41.39-.59.29-.36.65-.66 1.04-.88.44-.24.93-.4 1.45-.45h.01c.16-.02.32-.03.49-.03.94 0 1.81.34 2.47 1 .54.53.89 1.23.99 2.03v.01c.02.21.04.43.04.66 0 .81-.28 1.56-.75 2.15z"
                  />
                </svg>
              }
            >
              微信登录（即将开放）
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
