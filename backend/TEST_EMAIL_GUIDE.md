# HƯỚNG DẪN TEST EMAIL NOTIFICATION - SAFEFACE

## Bước 1: Cấu hình Email SMTP

### 1.1 Tạo file .env trong thư mục backend/
```bash
cd backend/
cp .env.example .env
```

### 1.2 Chỉnh sửa file .env với thông tin email của bạn:
```bash
# SMTP Email Settings (Gmail)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_USE_TLS=true
```

### 1.3 Cách tạo App Password cho Gmail:
1. Đăng nhập Gmail → Quản lý tài khoản Google
2. Bảo mật → Xác minh 2 bước (bật nếu chưa có)
3. Bảo mật → Mật khẩu ứng dụng
4. Chọn ứng dụng "Mail" và thiết bị "Other"
5. Nhập tên: "SafeFace"
6. Copy mật khẩu 16 ký tự và dán vào SMTP_PASSWORD

## Bước 2: Test Email cơ bản

### 2.1 Chạy script test trực tiếp:
```bash
cd backend/
python test_email_notification.py
```

### 2.2 Kết quả mong đợi:
```
🚀 SafeFace Email Notification Test
==================================================
🧪 Testing basic email functionality...
📧 SMTP Server: smtp.gmail.com:587
📧 SMTP Username: your_email@gmail.com
📧 SMTP Password: ****************
✅ Basic email test successful! Email sent to your_email@gmail.com

🚨 Testing stranger alert email...
✅ Stranger alert email test successful! Email sent to your_email@gmail.com

🎉 All email tests passed!
📧 Your email notification system is working correctly!
```

## Bước 3: Test qua API (Frontend/Postman)

### 3.1 Start server:
```bash
cd backend/
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3.2 Test endpoints:

#### A. Test email configuration:
```bash
POST http://localhost:8000/api/notifications/test-email
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

#### B. Test stranger alert email:
```bash
POST http://localhost:8000/api/notifications/test-stranger-alert
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN",
  "Content-Type": "application/json"
}
```

#### C. Get notification settings:
```bash
GET http://localhost:8000/api/notifications/settings
Headers: {
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

## Bước 4: Test thực tế với camera

### 4.1 Đảm bảo hệ thống đang chạy:
- Backend server chạy
- Camera đã được thêm và hoạt động
- Stream detection đang bật

### 4.2 Trigger email notification:
1. Đảm bảo không có "known person" nào trong database
2. Đứng trước camera để được phát hiện là "stranger"
3. Hệ thống sẽ tự động gửi email sau 5 giây

### 4.3 Kiểm tra log:
```bash
# Kiểm tra log trong terminal backend
🚨 EMAIL ALERT CONDITION MET: Only strangers detected in frame!
   - Strangers: 1
   - Known persons: 0
📧 Image attachment added to email (25486 bytes)
[SUCCESS] Email with image sent to your_email@gmail.com
[SUCCESS] Stranger-only email alert sent for user 64f7b2e1...
```

## Bước 5: Troubleshooting

### 5.1 Lỗi thường gặp:

#### A. "SMTP credentials not configured"
- Kiểm tra file .env có tồn tại
- Kiểm tra SMTP_USERNAME và SMTP_PASSWORD có đúng

#### B. "Authentication failed"
- Kiểm tra App Password Gmail (không phải password thường)
- Đảm bảo 2-factor authentication đã bật

#### C. "Connection timeout"
- Kiểm tra firewall/antivirus
- Thử SMTP_PORT=465 với SSL thay vì TLS

#### D. Email không đến hộp thư
- Kiểm tra thư mục Spam/Junk
- Kiểm tra địa chỉ email SMTP_USERNAME

### 5.2 Debug chi tiết:
```bash
# Xem log chi tiết
cd backend/
python -c "
import asyncio
from app.services.notification_service import notification_service
print('Testing email config...')
asyncio.run(notification_service.test_email_configuration('test_user'))
"
```

## Bước 6: Cấu hình Production

### 6.1 Bảo mật:
- Không commit file .env vào git
- Sử dụng environment variables trên server
- Rotate App Password định kỳ

### 6.2 Performance:
- Cấu hình ALERT_COOLDOWN_MINUTES=5 để tránh spam
- Giới hạn MAX_ALERTS_PER_HOUR=20

### 6.3 Monitoring:
- Theo dõi log email sending
- Setup alerts nếu email fails
- Backup SMTP credentials

## Kết quả mong đợi

Khi test thành công, bạn sẽ nhận được email với:
- ✅ Subject: "🚨 Cảnh báo an ninh - ⚠️ NGƯỜI LẠ PHÁT HIỆN"
- ✅ HTML format đẹp với thông tin chi tiết
- ✅ Ảnh đính kèm (nếu có)
- ✅ Thống kê hệ thống 24h
- ✅ Thông tin camera và detection

Email chỉ được gửi khi:
- ❗ Phát hiện người lạ (stranger)
- ❗ KHÔNG có người quen (known person) trong khung hình
- ❗ Cooldown 5 phút đã hết (tránh spam)
