🔐 MFA Authentication System

Giới thiệu

MFA Authentication System là hệ thống xác thực đa nhân tố (Multi-Factor Authentication) được xây dựng nhằm tăng cường bảo mật cho tài khoản người dùng.

Hệ thống kết hợp hai lớp xác thực:

* Email và mật khẩu
* Mã OTP từ Google Authenticator

Bên cạnh đó, hệ thống còn cung cấp các chức năng quản lý người dùng, ghi nhận lịch sử đăng nhập, phân quyền tài khoản và giám sát hoạt động bảo mật.

⸻

Mục tiêu dự án

Mục tiêu của dự án là xây dựng một hệ thống xác thực an toàn giúp giảm thiểu nguy cơ bị đánh cắp tài khoản khi mật khẩu bị lộ.

Thông qua việc áp dụng xác thực đa nhân tố (MFA), hệ thống yêu cầu người dùng phải xác minh danh tính bằng mã OTP được tạo trên thiết bị cá nhân trước khi được cấp quyền truy cập.

⸻

Công nghệ sử dụng

Frontend

* Next.js 16
* React
* Tailwind CSS

Backend

* Next.js API Routes
* JWT Authentication

Database

* Prisma ORM
* SQLite

Thư viện bảo mật

* bcrypt
* jsonwebtoken
* speakeasy
* qrcode

MFA

* Google Authenticator
* TOTP (Time-based One-Time Password)

⸻

Chức năng hệ thống

1. Đăng ký tài khoản

Người dùng có thể tạo tài khoản bằng email và mật khẩu.

Hệ thống yêu cầu mật khẩu đáp ứng các tiêu chí:

* Tối thiểu 8 ký tự
* Có ít nhất một chữ hoa
* Có ít nhất một chữ số
* Có ít nhất một ký tự đặc biệt

⸻

2. Đăng nhập

Người dùng đăng nhập bằng email và mật khẩu.

Sau khi xác thực thành công:

* Nếu chưa bật MFA → truy cập trực tiếp vào hệ thống
* Nếu đã bật MFA → chuyển sang bước xác thực OTP

⸻

3. Xác thực OTP

Người dùng nhập mã OTP gồm 6 chữ số được sinh bởi Google Authenticator.

Mã OTP thay đổi định kỳ theo thời gian và chỉ có hiệu lực trong khoảng thời gian ngắn.

⸻

4. Thiết lập MFA

Người dùng có thể kích hoạt xác thực hai lớp bằng cách:

1. Tạo mã QR
2. Quét QR bằng Google Authenticator
3. Nhập OTP để xác nhận kích hoạt

Sau khi kích hoạt, mọi lần đăng nhập đều yêu cầu OTP.

⸻

5. Dashboard

Trang tổng quan hiển thị:

* Thông tin tài khoản
* Trạng thái MFA
* Hoạt động đăng nhập gần đây
* Thông tin bảo mật

⸻

6. Lịch sử đăng nhập

Hệ thống lưu lại toàn bộ hoạt động xác thực.

Thông tin được ghi nhận:

* Email
* Địa chỉ IP
* Trình duyệt sử dụng
* Thời gian đăng nhập
* Trạng thái xác thực

Các trạng thái gồm:

* LOGIN_SUCCESS
* OTP_SUCCESS
* PASSWORD_SUCCESS_MFA_REQUIRED
* FAILED_PASSWORD
* FAILED_OTP
* ACCOUNT_LOCKED

⸻

7. Quản lý người dùng

Chức năng dành cho quản trị viên.

Cho phép:

* Xem danh sách người dùng
* Kiểm tra trạng thái MFA
* Xem số lần đăng nhập sai
* Theo dõi trạng thái hoạt động

⸻

8. Cài đặt tài khoản

Người dùng có thể:

* Đổi mật khẩu
* Hiện/ẩn mật khẩu
* Tắt xác thực hai lớp
* Đăng xuất

⸻

Kiến trúc hệ thống

Người dùng thực hiện đăng nhập thông qua giao diện Next.js.

Thông tin đăng nhập được gửi đến API Backend để xác thực.

Sau khi xác thực thành công:

* JWT được tạo để quản lý phiên đăng nhập
* Nếu MFA được bật, hệ thống yêu cầu OTP
* Nếu OTP hợp lệ, người dùng được cấp quyền truy cập

Dữ liệu được lưu trữ trong SQLite thông qua Prisma ORM.

⸻

Cơ sở dữ liệu

Bảng User

Trường Mô tả
id Mã người dùng
email Địa chỉ email
password_hash Mật khẩu đã mã hóa
role USER hoặc ADMIN
mfa_enabled Trạng thái MFA
mfa_secret Khóa bí mật MFA
failed_attempts Số lần đăng nhập sai
locked_until Thời gian khóa tài khoản
created_at Ngày tạo

⸻

Bảng LoginLog

Trường Mô tả
id Mã bản ghi
user_id Người dùng
status Trạng thái đăng nhập
ip_address Địa chỉ IP
user_agent Thông tin trình duyệt
login_time Thời gian đăng nhập

⸻

Bảo mật hệ thống

Mã hóa mật khẩu

Mật khẩu không được lưu trực tiếp trong cơ sở dữ liệu.

Hệ thống sử dụng bcrypt để mã hóa mật khẩu trước khi lưu trữ.

⸻

JWT Authentication

Sau khi đăng nhập thành công, JWT Token được tạo để quản lý phiên làm việc.

Token được lưu dưới dạng Cookie nhằm tăng cường bảo mật.

⸻

MFA Authentication

Hệ thống sử dụng chuẩn TOTP tương thích với Google Authenticator.

Điều này giúp tăng cường bảo mật ngay cả khi mật khẩu bị lộ.

⸻

Login Logs

Mọi hoạt động đăng nhập đều được ghi lại để phục vụ việc giám sát và phát hiện các hành vi bất thường.

⸻

Account Lock

Tài khoản có thể bị khóa tạm thời khi người dùng nhập sai mật khẩu quá nhiều lần nhằm chống lại các cuộc tấn công Brute Force.

⸻

Hướng dẫn cài đặt

Clone dự án

git clone https://github.com/Vcuozg/mfa-auth-system.git
cd mfa-auth-system

Cài đặt thư viện

npm install

Khởi tạo Prisma

npx prisma generate
npx prisma db push

Chạy ứng dụng

npm run dev

Truy cập:

http://localhost:3000

Prisma Studio

npx prisma studio

Truy cập:

http://localhost:5555

⸻

Phân quyền người dùng

USER

* Đăng nhập
* Đăng ký
* Bật/Tắt MFA
* Đổi mật khẩu
* Xem lịch sử đăng nhập của chính mình

ADMIN

* Toàn bộ quyền của USER
* Xem danh sách người dùng
* Xem lịch sử đăng nhập của tất cả người dùng

⸻

Hướng phát triển

Trong tương lai hệ thống có thể được mở rộng với các tính năng:

* Backup Codes
* Email OTP
* SMS OTP
* Quản lý phiên đăng nhập
* Phát hiện đăng nhập bất thường
* Face ID / Fingerprint Authentication
* Quản lý thiết bị tin cậy

⸻

Kết luận

MFA Authentication System là một hệ thống xác thực hai lớp giúp nâng cao mức độ bảo mật tài khoản người dùng. Bằng việc kết hợp mật khẩu và mã OTP từ Google Authenticator, hệ thống giảm đáng kể nguy cơ truy cập trái phép và tạo nền tảng cho các ứng dụng yêu cầu mức độ bảo mật cao trong thực tế.
