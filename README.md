cd mfa-auth-system

npm run dev

npx prisma studio

/register
→ tạo tài khoản mới

/login
→ đăng nhập lần đầu

/dashboard
→ vào dashboard bảo mật

/setup-mfa
→ tạo QR Code
→ quét bằng Google Authenticator

/verify-otp
→ nhập mã OTP 6 

/logout hoặc bấm Logout
→ đăng nhập lại
→ hệ thống bắt nhập OTP

/login
→ nhập sai mật khẩu 5 lần
→ tài khoản bị khóa

/login-logs
→ xem lịch sử đăng nhập

/security
→ xem trạng thái bảo mật

/admin/users
→ admin xem danh sách user

/settings
→ đổi mật khẩu
→ reset MFA

npx prisma studio