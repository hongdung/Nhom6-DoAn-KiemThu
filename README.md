# D&M Fashion & Apparel

Website bán thời trang với phong cách tối giản, gồm trang chủ, danh mục sản phẩm, chi tiết sản phẩm, giỏ hàng, thanh toán và khu vực quản trị cơ bản.

## Thông tin demo

- Link public: `https://dm-fashion-apparel.onrender.com`
- Link local: `http://localhost:3000`
- Tài khoản khách hàng: `customer@atelier.local` / `123456`
- Tài khoản quản trị: `admin@atelier.local` / `admin123`
- Môi trường demo: `Render Free Web Service`

Gợi ý nội dung ngắn để đưa vào báo cáo hoặc slide:

```text
Hệ thống demo của nhóm được triển khai tại:
https://dm-fashion-apparel.onrender.com

Ứng dụng hỗ trợ các chức năng chính: xem sản phẩm, tìm kiếm, xem chi tiết,
thêm vào giỏ hàng, thanh toán, đăng nhập và quản trị cơ bản.

Tài khoản kiểm thử:
- Customer: customer@atelier.local / 123456
- Admin: admin@atelier.local / admin123
```

## Chức năng đã hoàn thành

- Logo thương hiệu D&M đã gắn vào header và footer
- Trang chủ theo phong cách thương mại điện tử thời trang
- Danh sách sản phẩm có tìm kiếm và lọc theo danh mục
- Tìm kiếm không dấu, ví dụ gõ `ao` vẫn ra `Áo`
- Trang chi tiết sản phẩm có ảnh chính và gallery
- Ảnh thật đã thêm cho toàn bộ sản phẩm hiện có
- Giỏ hàng: thêm sản phẩm, cập nhật số lượng, xóa sản phẩm
- Thanh toán với form thông tin nhận hàng
- Đăng nhập cho khách hàng và quản trị viên
- Mục `Quản trị` chỉ hiện khi đăng nhập bằng tài khoản admin
- Trang quản trị có thống kê sản phẩm, đơn hàng và doanh thu
- Giao diện tiếng Việt đã chỉnh lại để hiển thị font ổn định

## Chức năng chính theo luồng người dùng

- Xem trang chủ
- Xem danh sách sản phẩm
- Tìm kiếm sản phẩm
- Lọc theo danh mục
- Xem chi tiết sản phẩm
- Thêm vào giỏ hàng
- Cập nhật giỏ hàng
- Xóa khỏi giỏ hàng
- Điền thông tin thanh toán
- Đăng nhập tài khoản

## Tài khoản mẫu

- Khách hàng: `customer@atelier.local` / `123456`
- Quản trị: `admin@atelier.local` / `admin123`

## Chạy local nhanh cho các thành viên

1. Cài `Node.js` bản `18+`
2. Mở thư mục project này trên máy cá nhân
3. Chạy:

```bash
npm install
npm run dev
```

4. Mở trình duyệt tại:

```text
http://localhost:3000
```

5. Nếu giao diện không cập nhật đúng sau khi pull/copy project, nhấn:

```text
Ctrl + F5
```

## Nếu muốn chạy bản ổn định không auto-reload

```bash
npm start
```

## Cấu hình an toàn khi public website

Khi deploy lên hosting miễn phí hoặc môi trường public, nên cấu hình thêm biến môi trường:

- `NODE_ENV=production`
- `SESSION_SECRET=<chuoi_bi_mat_dai_va_kho_doan>`
- `TRUST_PROXY=1`

Tùy chọn thêm nếu host cần:

- `SESSION_NAME=dm.sid`
- `SESSION_COOKIE_SAME_SITE=lax`
- `SESSION_COOKIE_SECURE=true`
- `SESSION_COOKIE_MAX_AGE=14400000`

Gợi ý:

- `SESSION_SECRET` nên dài tối thiểu 32 ký tự
- Không commit `.env` lên repository
- Khi chạy local bình thường, ứng dụng vẫn hoạt động nếu chưa khai báo các biến trên
- Với hosting miễn phí, dữ liệu trong `data/runtime.json` vẫn có thể bị reset sau khi redeploy hoặc khi máy chủ sleep

## Deploy nhanh lên Render

Project này đã có sẵn file `render.yaml` để deploy bằng Render Blueprint.

Các bước:

1. Đưa source code lên GitHub
2. Tạo tài khoản hoặc đăng nhập Render
3. Chọn `New` -> `Blueprint`
4. Kết nối repository chứa project này
5. Render sẽ tự đọc file `render.yaml`
6. Kiểm tra lại tên service và nhấn `Apply`
7. Chờ build xong rồi mở URL `.onrender.com`

Render hiện sẽ tự cấu hình sẵn:

- `buildCommand`: `npm install`
- `startCommand`: `npm start`
- `healthCheckPath`: `/api/health`
- `plan`: `free`
- `region`: `singapore`
- `SESSION_SECRET`: tự sinh ngẫu nhiên khi tạo service

Sau khi deploy, nên kiểm tra nhanh:

1. Trang chủ có mở được không
2. Ảnh sản phẩm và logo có hiển thị đúng không
3. Thêm sản phẩm vào giỏ hàng
4. Đăng nhập bằng tài khoản `customer` và `admin`
5. Mở thử `/api/health`

Lưu ý với Render free:

- Service có thể sleep sau khoảng 15 phút không có truy cập
- Lần mở đầu sau khi sleep có thể chậm
- `data/runtime.json` không phải lưu trữ bền vững, nên đơn hàng và thay đổi dữ liệu có thể bị reset sau khi redeploy hoặc restart
- Vì vậy, đây nên được xem là bản `demo/staging`, không phải môi trường production thật

Nếu muốn chạy local với biến môi trường, có thể tham khảo file `.env.example`.

## Reset dữ liệu về trạng thái ban đầu

Ứng dụng lấy dữ liệu gốc từ `data/seed.json` và ghi trạng thái chạy vào `data/runtime.json`.

Nếu muốn reset đơn hàng, giỏ hàng hoặc dữ liệu phát sinh về ban đầu:

1. Tắt server
2. Xóa file `data/runtime.json`
3. Chạy lại `npm run dev` hoặc `npm start`

Khi đó hệ thống sẽ tự tạo lại `runtime.json` từ `seed.json`.

## Cấu trúc ảnh sản phẩm

Ảnh sản phẩm được đặt theo `slug` trong `data/seed.json`.

Ví dụ:

```text
public/
  images/
    products/
      so-mi-linen-oversize/
        cover.jpg
        detail-1.jpg
        detail-2.jpg
```

Quy ước:

- `cover.*`: ảnh chính
- `detail-1.*`, `detail-2.*`, `detail-3.*`: ảnh phụ
- Đuôi file hỗ trợ: `webp`, `jpg`, `jpeg`, `png`

## Một số file quan trọng

- `src/app.js`: route chính của ứng dụng
- `src/store.js`: xử lý dữ liệu, giỏ hàng, đơn hàng
- `data/seed.json`: dữ liệu gốc
- `data/runtime.json`: dữ liệu phát sinh khi chạy
- `views/`: giao diện EJS
- `public/styles/main.css`: CSS chính
- `public/images/SOURCES.md`: nguồn ảnh mẫu đang dùng

## API hiện có

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/auth/login`
- `GET /api/cart`
- `POST /api/cart`
- `PATCH /api/cart/:productId`
- `DELETE /api/cart/:productId`
- `POST /api/orders`
- `GET /api/admin/overview`
