import unittest
import sys
import os
import openpyxl
import time
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from pages.login_page import LoginPage
from selenium.webdriver.common.by import By

class PostLoginTest(unittest.TestCase):
    results = []

    @classmethod
    def tearDownClass(cls):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Post Login Results"
        ws.append(["Test ID", "Kết quả", "Chi tiết lỗi", "Thời gian"])
        for r in cls.results:
            ws.append(r)
        
        report_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "post_login_report.xlsx"))
        wb.save(report_path)
        print(f"\n[OK] Da xuat bao cao Excel cac case Post-Login tai: {report_path}")

    def setUp(self):
        self.test_success = False
        options = Options()
        # options.add_argument('--headless')
        self.driver = webdriver.Chrome(options=options)
        self.driver.maximize_window()
        self.driver.implicitly_wait(5)
        self.login_page = LoginPage(self.driver)

    def test_admin_access_as_customer(self):
        """TC_UI_05: Customer truy cập Admin -> Bị từ chối"""
        self.login_page.load()
        self.login_page.login("customer@atelier.local", "123456")
        time.sleep(2)
        
        self.driver.get("https://dm-fashion-apparel.onrender.com/admin")
        
        error_msg = self.driver.find_element(By.CSS_SELECTOR, "h1").text
        self.assertIn("chỉ dành cho quản trị viên", error_msg.lower())
        self.test_success = True

    def test_admin_access_success(self):
        """TC_UI_06: Admin truy cập Dashboard"""
        self.login_page.load()
        self.login_page.login("admin@atelier.local", "admin123")
        time.sleep(2)
        
        self.driver.get("https://dm-fashion-apparel.onrender.com/admin")
        
        # Xác minh đã vào admin (Hiển thị Tổng quan cửa hàng)
        header_text = self.driver.find_element(By.CSS_SELECTOR, "h1").text
        self.assertIn("tổng quan", header_text.lower())
        self.test_success = True

    def test_empty_cart_checkout_protection(self):
        """TC_UI_07: Không cho Checkout khi giỏ hàng trống"""
        self.login_page.load()
        self.login_page.login("customer@atelier.local", "123456")
        time.sleep(2)
        
        # Truy cập checkout mà không có sản phẩm
        self.driver.get("https://dm-fashion-apparel.onrender.com/checkout")
        
        # Bị chuyển hướng ngược về /products
        self.assertIn("/products", self.driver.current_url)
        # Có thông báo giỏ hàng trống
        error_flash = self.driver.find_element(By.CSS_SELECTOR, ".flash.flash-error").text
        self.assertIn("đang trống", error_flash.lower())
        
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
