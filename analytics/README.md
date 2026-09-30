# Thống kê HEO

Cloudflare Workers + D1, chọn gói Free. Trang web vẫn ở GitHub Pages.

## Triển khai

Chạy từ thư mục `analytics`:

1. `npx wrangler@4 login`
2. `npx wrangler@4 d1 create heo-analytics`
3. Điền database_id vào wrangler.jsonc.
4. `npx wrangler@4 d1 execute heo-analytics --remote --file schema.sql`
5. `npx wrangler@4 secret put ADMIN_PASSWORD` — nhập mật khẩu dài, riêng cho thống kê; không commit mật khẩu.
6. `npx wrangler@4 deploy`
7. Điền URL HTTPS Worker vào endpoint trong assets/analytics.js. Thêm chính xác origin Worker vào connect-src của CSP các trang HTML, rồi commit/push GitHub Pages.

Mở URL Worker, đăng nhập tên `admin` với mật khẩu vừa đặt. Có báo cáo 7/30/90 ngày, theo giờ Việt Nam. Không bật gói Paid tự động.

## Cách đo và giới hạn

- Một lượt mỗi lần tải trang có hiển thị. Không đếm số người hoặc phiên. Tải lại trang tính thêm lượt; quay lại bằng bộ nhớ trình duyệt không nhất thiết tạo lượt mới.
- Không lưu cookie, IP, mã người dùng, query string hoặc referrer vào D1. Nhà cung cấp mạng vẫn xử lý thông tin kết nối theo chính sách của họ.
- Tôn trọng Do Not Track và Global Privacy Control. Bỏ qua bot có User-Agent phổ biến, nhưng không bảo đảm lọc hết bot hoặc lượt giả. CORS không phải biện pháp chống giả mạo.
- D1 chỉ lưu tổng theo ngày/trang; không có dữ liệu lịch sử trước khi triển khai. Hạn mức Free hết thì việc ghi có thể thất bại; không làm gián đoạn website.
- paths.json là danh sách trang cho phép. Thêm đường dẫn vào đây khi tạo trang mới.
- Chưa có kiểm thử tự động trong thay đổi này. Trước khi công bố hoạt động, cần kiểm tra truy cập không mật khẩu bị từ chối, mở một trang làm tăng đúng một lượt và tải được dashboard.
