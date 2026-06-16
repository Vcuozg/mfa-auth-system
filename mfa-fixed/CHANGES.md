# Security Fixes

## Danh sách lỗ hổng đã vá

| # | Lỗ hổng | File | Mức độ |
|---|---------|------|--------|
| 1 | Không validate độ mạnh mật khẩu | `register/route.js`, `change-password/route.js` | Medium |
| 2 | User Enumeration Attack | `login/route.js` | Medium |
| 3 | JWT lưu trong localStorage (dễ bị XSS) | `login/route.js`, tất cả pages | High |
| 4 | `mfa_secret` lưu plaintext trong DB | `setup-mfa/route.js`, `verify-otp/route.js` | Critical |
| 5 | Setup MFA không yêu cầu xác thực | `setup-mfa/route.js` | High |
| 6 | TOTP window=2 + không chặn replay attack | `verify-otp/route.js` | Medium |
| 7 | Không rate limit OTP sai | `verify-otp/route.js` | High |
| 8 | API `/api/login-logs` hoàn toàn public | `login-logs/route.js` | Critical |
| 9 | Middleware không verify chữ ký JWT | `middleware.js` | High |

## Cách tạo environment keys

```bash
# JWT_SECRET (64 bytes)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# MFA_ENCRYPTION_KEY (32 bytes = AES-256)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
