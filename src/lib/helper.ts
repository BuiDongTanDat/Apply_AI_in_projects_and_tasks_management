//File này chứa các hàm tiện ích dùng chung trong toàn bộ ứng dụng

// Định dạng tiền tệ VNĐ
export const formatCurrency = (amount: number, suffix: string = "VNĐ"): string =>
  `${new Intl.NumberFormat("vi-VN").format(amount)} ${suffix}`;

//Hàm định dạng ngày
export const formatDate = (dateString: string | Date): string => {
  return new Date(dateString).toLocaleDateString('vi-VN');
};

//Hàm định dạng ngày giờ
export const formatDateTime = (dateString: string | Date): string => {
  return new Date(dateString).toLocaleString('vi-VN');
};

//Định dạng ngày và giờ riêng biệt
export const formatDateTimeSeparate = (dateString: string | Date): { date: string, time: string } => {
  const dateObj = new Date(dateString);
  const date = dateObj.toLocaleDateString('vi-VN');
  const time = dateObj.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return { date, time };
};

//Hàm tạo tên viết tắt từ tên đầy đủ
export const getInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

//Hàm kiểm tra email hợp lệ
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Hàm kiểm tra số điện thoại hợp lệ
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(0[3-9])+([0-9]{8})$/;
  return phoneRegex.test(phone);
};

//Hàm tính %
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Hàm định dạng số điện thoại cho hiển thị
export const formatPhoneDisplay = (phone: string): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  return phone;
};
