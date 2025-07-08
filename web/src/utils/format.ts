/**
 * 价格格式化工具函数
 */

// 格式化金额为人民币格式
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

// 格式化日期时间
export const formatDateTime = (date: Date | string | number): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(d);
};

// 格式化日期
export const formatDate = (date: Date | string | number): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
};

// 格式化时间
export const formatTime = (date: Date | string | number): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(d);
};

// 格式化数量（添加千位分隔符）
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('zh-CN').format(num);
};

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// 格式化手机号码（隐藏中间4位）
export const formatPhoneNumber = (phone: string): string => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

// 格式化银行卡号（每4位添加空格）
export const formatBankCard = (cardNumber: string): string => {
  return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
};

// 格式化身份证号（隐藏中间8位）
export const formatIdCard = (idCard: string): string => {
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2');
};

// 格式化邮箱（隐藏@前的部分内容）
export const formatEmail = (email: string): string => {
  const [username, domain] = email.split('@');
  const hiddenUsername = username.charAt(0) + '***' + username.charAt(username.length - 1);
  return `${hiddenUsername}@${domain}`;
};

// 格式化地址（保留省市区，隐藏详细地址）
export const formatAddress = (address: string): string => {
  // 假设地址格式为：省市区详细地址
  const match = address.match(/^([^省]+省[^市]+市[^区]+区)(.+)$/);
  if (match) {
    return `${match[1]}****`;
  }
  return address;
};
