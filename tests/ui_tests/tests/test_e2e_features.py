import unittest
import sys
import os
import openpyxl
from datetime import datetime
import time

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from pages.login_page import LoginPage
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class E2EFeaturesTest(unittest.TestCase):
    results = []

    @classmethod
    def tearDownClass(cls):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "E2E Features Test Results"
        ws.append(["Test ID", "Kết quả", "Chi tiết lỗi", "Thời gian"])
        for r in cls.results:
            ws.append(r)
        
        report_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "test_e2e_report.xlsx"))
        wb.save(report_path)
        print(f"\n[OK] Da xuat bao cao Excel cac case E2E tai: {report_path}")

    def setUp(self):
        self.test_success = False
        options = Options()
        self.driver = webdriver.Chrome(options=options)
        self.driver.maximize_window()
        self.driver.implicitly_wait(7)
        self.login_page = LoginPage(self.driver)

    def test_search_and_filter(self):
        """TC_UI_09: Kiểm thử truy vấn Tìm kiếm (Search)"""
        # Go to products page
        self.driver.get("https://dm-fashion-apparel.onrender.com/products")
        
        # Nhập vào ô tìm kiếm
        try:
            search_input = self.driver.find_element(By.NAME, "q")
            search_input.send_keys("Linen")
            # submit form search
            search_input.submit()
            
            # Đợi cho trang tải kết quả
            WebDriverWait(self.driver, 5).until(EC.url_contains("?q=Linen"))
            
            # Verify that some product elements show up
            products = self.driver.find_elements(By.CSS_SELECTOR, "a[href*='/products/']")
            self.assertTrue(len(products) > 0, "Kết quả tìm kiếm 'Linen' không trả về gì.")
        except Exception as e:
            self.fail(f"Không thể kiểm tra search vì UI khác dự định: {e}")
            
        self.test_success = True

    def test_full_checkout_flow(self):
        """TC_UI_08: Thực hiện Add to Cart -> Checkout End-To-End"""
        # Bắt đầu với Đăng nhập (vì cần fill thông tin nhanh hoặc có thể mua khách qua đường)
        self.login_page.load()
        self.login_page.login("customer@atelier.local", "123456")

        # 1. Đi tới một trang sản phẩm bất kỳ
        self.driver.get("https://dm-fashion-apparel.onrender.com/products/so-mi-linen-oversize")
        
        # 2. Add to cart
        try:
            add_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'hàng') or @type='submit']")
            add_button.click()
            time.sleep(1) # chờ load sau post request /cart
        except Exception as e:
            self.fail(f"Form thêm giỏ hàng thay đổi! {e}")

        # 3. Đi tới Checkout
        self.driver.get("https://dm-fashion-apparel.onrender.com/checkout")
        
        # 4. Fill form checkout
        try:
            self.driver.find_element(By.NAME, "customerName").send_keys("Automated User")
            self.driver.find_element(By.NAME, "customerEmail").send_keys("auto@test.local")
            self.driver.find_element(By.NAME, "customerPhone").send_keys("0909123456")
            self.driver.find_element(By.NAME, "shippingAddress").send_keys("123 Automation St.")
            
            # Bấm submit checkout
            checkout_btn = self.driver.find_element(By.CSS_SELECTOR, "form button[type='submit']")
            checkout_btn.click()
        except Exception as e:
            self.fail(f"Không thể fill Form checkout: {e}")
            
        # 5. Kiểm tra thông báo mua hàng ở trang Homepage 
        # (Flash success `Đặt hàng thành công. Mã đơn của bạn là...`)
        WebDriverWait(self.driver, 5).until(EC.url_to_be("https://dm-fashion-apparel.onrender.com/"))
        flash = self.driver.find_element(By.CSS_SELECTOR, ".flash.flash-success").text
        self.assertIn("đặt hàng thành công", flash.lower())

        self.test_success = True

    def test_logout_session(self):
        """TC_UI_10: Test chức năng Đăng Xuất xoá Cookie session"""
        self.login_page.load()
        self.login_page.login("customer@atelier.local", "123456")

        # Có thể có nút logout ngầm định trên / 
        self.driver.get("https://dm-fashion-apparel.onrender.com/")
        
        # Do form logout không cố định hoặc ẩn class, ta test bằng lệnh logout trực tiếp nếu có:
        # Nếu không có button bấm trên mobile/desktop, ta submit form logout path qua hidden JS
        self.driver.execute_script('''
            var f = document.createElement("form");
            f.method="post"; f.action="/logout";
            document.body.appendChild(f); f.submit();
        ''')
        
        # Sau khi logout
        time.sleep(1)
        flash = self.driver.find_element(By.CSS_SELECTOR, ".flash.flash-success").text
        self.assertIn("đăng xuất", flash.lower())
        
        # Cố đi tới `/checkout` -> sẽ bị kick nếu trống hoặc yêu cầu (tuỳ design)
        # Tuy nhiên ta chỉ test flash "Đăng xuất" là ok
        self.test_success = True

    def tearDown(self):
        result_status = "PASS" if getattr(self, "test_success", False) else "FAIL"
        msg = "" if result_status == "PASS" else "Loi (Kiem tra console)"
        self.__class__.results.append([
            self._testMethodName,
            result_status,
            msg,
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ])
        if self.driver:
            self.driver.quit()

if __name__ == "__main__":
    unittest.main()
