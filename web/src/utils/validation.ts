/**
 * 表单验证工具函数
 */

// 验证邮箱
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 验证手机号码（中国大陆）
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// 验证密码强度
export const isValidPassword = (password: string): boolean => {
  // 至少8位，包含大小写字母、数字和特殊字符
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// 获取密码强度等级（0-4）
export const getPasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.match(/[a-z]+/)) strength++;
  if (password.match(/[A-Z]+/)) strength++;
  if (password.match(/[0-9]+/)) strength++;
  if (password.match(/[@$!%*?&]+/)) strength++;
  return strength;
};

// 验证用户名
export const isValidUsername = (username: string): boolean => {
  // 4-16位，只能包含字母、数字和下划线
  const usernameRegex = /^[a-zA-Z0-9_]{4,16}$/;
  return usernameRegex.test(username);
};

// 验证中文姓名
export const isValidChineseName = (name: string): boolean => {
  const nameRegex = /^[\u4e00-\u9fa5]{2,}$/;
  return nameRegex.test(name);
};

// 验证身份证号（中国大陆）
export const isValidIdCard = (idCard: string): boolean => {
  const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return idCardRegex.test(idCard);
};

// 验证银行卡号
export const isValidBankCard = (cardNumber: string): boolean => {
  const trimmedNumber = cardNumber.replace(/\s/g, '');
  return /^\d{16,19}$/.test(trimmedNumber);
};

// 验证URL
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// 验证金额
export const isValidAmount = (amount: string): boolean => {
  const amountRegex = /^\d+(\.\d{1,2})?$/;
  return amountRegex.test(amount);
};

// 验证邮政编码（中国）
export const isValidPostalCode = (code: string): boolean => {
  const postalCodeRegex = /^[1-9]\d{5}$/;
  return postalCodeRegex.test(code);
};

// 统一的表单验证函数
interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (value: any) => boolean;
  message?: string;
}

export const validateField = (value: any, rules: ValidationRule[]): string[] => {
  const errors: string[] = [];

  for (const rule of rules) {
    // 必填验证
    if (rule.required && !value) {
      errors.push(rule.message || '此字段为必填项');
      continue;
    }

    // 如果值为空且非必填，跳过其他验证
    if (!value) continue;

    // 最小长度验证
    if (rule.min !== undefined && String(value).length < rule.min) {
      errors.push(rule.message || `长度不能小于 ${rule.min} 个字符`);
    }

    // 最大长度验证
    if (rule.max !== undefined && String(value).length > rule.max) {
      errors.push(rule.message || `长度不能大于 ${rule.max} 个字符`);
    }

    // 正则表达式验证
    if (rule.pattern && !rule.pattern.test(String(value))) {
      errors.push(rule.message || '格式不正确');
    }

    // 自定义验证函数
    if (rule.validator && !rule.validator(value)) {
      errors.push(rule.message || '验证失败');
    }
  }

  return errors;
};

// 常用验证规则集合
export const ValidationRules = {
  required: {
    required: true,
    message: '此字段为必填项',
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '请输入有效的邮箱地址',
  },
  phone: {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入有效的手机号码',
  },
  password: {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    message: '密码必须包含大小写字母、数字和特殊字符',
  },
  username: {
    pattern: /^[a-zA-Z0-9_]{4,16}$/,
    message: '用户名只能包含字母、数字和下划线，长度4-16位',
  },
};
