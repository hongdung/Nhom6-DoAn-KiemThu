# Hướng dẫn Chạy Kiểm thử Tự động (Automation Testing)

Thư mục `tests` chứa toàn bộ kịch bản kiểm thử tự động trực tiếp trên nền tảng **DM Fashion & Apparel**. Bộ kiểm thử chia thành 2 phần chính: **Kiểm thử Giao diện (UI Testing với Selenium)** và **Kiểm thử API (API Testing với Postman)**.

---

## 🛠 Yêu cầu Hệ thống (Prerequisites)

Để chạy được toàn bộ các kịch bản kiểm thử, máy tính của bạn cần cài đặt:
1. **Python 3.9+** (Khuyến nghị 3.10 trở lên)
2. Trình duyệt **Google Chrome** và **ChromeDriver** tương thích.
3. **Node.js** (Phiên bản v16 hoặc cao hơn) để cài đặt công cụ chạy API - `newman`.

---

## 💻 Cài đặt Môi trường (Setup)

### 1. Cài đặt thư viện Python (dành cho UI Test)
Hãy mở Terminal (hoặc Command Prompt, PowerShell) tại thư mục gốc của dự án `Nhom6-DoAn-KiemThu` và chạy:
```bash
python -m pip install --upgrade pip
pip install selenium openpyxl
```

### 2. Cài đặt Newman (dành cho API Test)
Newman là công cụ dòng lệnh (CLI) của Postman, giúp bạn chạy các Collection tự động mà không cần mở giao diện App Postman. Mở Terminal và chạy:
```bash
npm install -g newman
```

---

## 🚀 Hướng dẫn Chạy Kiểm thử (Execution)

### 1. Chạy UI Tests (Quy trình E2E, Giỏ hàng, Đăng nhập, Phân quyền)
Bạn có thể chạy toàn bộ kịch bản Selenium bằng cách sử dụng Runner tích hợp sẵn `unittest` của Python.
> **Lưu ý:** Script sẽ tự động bật Chrome lên. Không thao tác chuột trên Chrome lúc script đang chạy để tránh làm sai kết quả Test!

**Lệnh chạy tất cả các UI tests cùng lúc:**
```bash
python -m unittest discover -s tests/ui_tests/tests -p "test_*.py" -v
```

**Lệnh chạy từng mô-đun riêng lẻ:**
```bash
# Kiểm thử chức năng Đăng Nhập
python -m unittest tests/ui_tests/tests/test_login.py -v

# Kiểm thử chức năng Sau Đăng Nhập (Checkout rỗng, Admin access)
python -m unittest tests/ui_tests/tests/test_post_login.py -v

# Kiểm thử luồng E2E, Tìm kiếm, Đăng xuất
python -m unittest tests/ui_tests/tests/test_e2e_features.py -v

# Kiểm thử Biên Giỏ hàng (Edge Cases/BVA)
python -m unittest tests/ui_tests/tests/test_cart_boundaries.py -v
```

Sau khi hoàn tất, hệ thống sẽ báo log trên Terminal là `PASS` hoặc `FAIL`, kèm theo thông báo và tự động xuất/ghi đè các file báo cáo sang định dạng Excel (nằm ở thư mục `tests/ui_tests/test_*.xlsx`).

### 2. Chạy API Tests (Testing RESTful Endpoints)
Trong thư mục `api_tests/` chứa sẵn các file cấu hình `.json` của Postman. Hệ thống sẽ kết nối tới Live URL (`https://dm-fashion-apparel.onrender.com`).

**Cách 1: Chạy bằng cửa sổ Terminal (với Newman)**
Bạn chạy lần lượt các kịch bản bằng 4 lệnh sau:
```bash
newman run tests/api_tests/auth_login_collection.json
newman run tests/api_tests/cart_collection.json
newman run tests/api_tests/products_collection.json
newman run tests/api_tests/post_login_collection.json
```
Newman sẽ trực tiếp hiển thị bảng kết quả xanh/đỏ (Pass/Fail) phân tích Response Time, Status Code và Body JSON.

**Cách 2: Chạy trực tiếp trong Postman (Dành riêng cho máy không cài Node)**
1. Mở phần mềm Postman Desktop.
2. Ấn nút **Import** ở góc trên bên trái màn hình.
3. Chọn tất cả các file JSON trong `tests/api_tests` và import.
4. Mở Collection, ấn biểu tượng `...` (Three Dots) > Chọn **Run collection**, Postman sẽ tự động chạy toàn bộ các Endpoints với Scripts đi kèm.

---

## 📊 Báo cáo và Đánh giá kết quả (Reporting)
Các script UI Automation được thiết kế để kết xuất dữ liệu kết quả trực tiếp ra Excel bằng thư viện `openpyxl`. Bạn có thể tìm thấy các tệp kết quả trong `tests/ui_tests/`:
- `test_report.xlsx` (Kết quả Đăng nhập).
- `test_e2e_report.xlsx` (Kết quả E2E Checkout, Search, Logout).
- `post_login_report.xlsx` (Kết quả phân quyền và check session ẩn).
- `test_cart_bva_report.xlsx` (Kết quả kiểm thử Giá trị biên của Giỏ hàng).
Các file Excel này được ghi đè và làm mới lại mỗi lần chạy lệnh Python. Thích hợp để đính kèm vào báo cáo Đồ án!

---
*Automation Suite developed for Nhóm 6 - Đồ án Kiểm thử.*
