import unittest
import sys
import os
import time
import openpyxl
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

class CheckoutValidationsTest(unittest.TestCase):
    results = []

    @classmethod
    def tearDownClass(cls):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Checkout Validations"
        ws.append(["Test ID", "Kết quả", "Chi tiết lỗi", "Thời gian"])
        for r in cls.results:
            ws.append(r)
        report_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "test_checkout_validations_report.xlsx"))
        wb.save(report_path)

    def setUp(self):
        self.test_success = False
        options = Options()
        self.driver = webdriver.Chrome(options=options)
        self.driver.maximize_window()
        self.driver.implicitly_wait(5)
        self.base_url = "https://dm-fashion-apparel.onrender.com"

        # Pre-condition: Login and Add a product to cart to enable Checkout
        self.driver.get(f"{self.base_url}/login")
        self.driver.find_element(By.NAME, "email").send_keys("customer@atelier.local")
        self.driver.find_element(By.NAME, "password").send_keys("123456")
        self.driver.find_element(By.CSS_SELECTOR, "form button[type='submit']").click()
        time.sleep(2)
        
        # Add Product
        self.driver.get(f"{self.base_url}/products/so-mi-linen-oversize")
        try:
            self.driver.find_element(By.CSS_SELECTOR, "form.detail-form button[type='submit']").click()
            time.sleep(2)
        except Exception:
            pass
            
        self.driver.get(f"{self.base_url}/checkout")

    def submit_checkout(self, name="", email="", phone="", addr=""):
        self.driver.find_element(By.NAME, "customerName").clear()
        self.driver.find_element(By.NAME, "customerEmail").clear()
        self.driver.find_element(By.NAME, "customerPhone").clear()
        self.driver.find_element(By.NAME, "shippingAddress").clear()
        
        if name: self.driver.find_element(By.NAME, "customerName").send_keys(name)
        if email: self.driver.find_element(By.NAME, "customerEmail").send_keys(email)
        if phone: self.driver.find_element(By.NAME, "customerPhone").send_keys(phone)
        if addr: self.driver.find_element(By.NAME, "shippingAddress").send_keys(addr)
        
        self.driver.find_element(By.CSS_SELECTOR, "form.auth-form button[type='submit']").click()
        time.sleep(1)

    def test_tt02_thieu_ho_ten(self):
        """TT02: Bỏ trống họ tên"""
        self.submit_checkout(name="", email="test@mail.com", phone="01234", addr="Hanoi")
        flash = self.driver.find_element(By.CSS_SELECTOR, "body").text
        self.assertIn("điền đầy đủ", flash.lower()) # check server side validation flash
        self.test_success = True

    def test_tt03_thieu_so_dt(self):
        """TT03: Bỏ trống SDT"""
        self.submit_checkout(name="ABC", email="test@mail.com", phone="", addr="Hanoi")
        flash = self.driver.find_element(By.CSS_SELECTOR, "body").text
        self.assertIn("điền đầy đủ", flash.lower())
        self.test_success = True

    def test_tt05_sai_dinh_dang_email(self):
        """TT05: Email sai định dạng"""
        # Trình duyệt thường có HTML5 Validation ngăn chặn "không có @" khi call submit
        # Ta check HTML5 custom validation message
        elem = self.driver.find_element(By.NAME, "customerEmail")
        elem.send_keys("testmail.com")
        
        is_valid = self.driver.execute_script("return arguments[0].checkValidity();", elem)
        self.assertFalse(is_valid, "Trình duyệt không bắt lỗi validation email thiếu @")
        self.test_success = True

    def test_tt07_order_summary(self):
        """TT07: Kiểm tra Order Summary có hiển thị đúng đồ trong cart"""
        boxes = self.driver.find_elements(By.CSS_SELECTOR, ".summary-card")
        self.assertTrue(len(boxes) > 0)
        self.assertIn("tổng sản phẩm", boxes[0].text.lower())
        self.test_success = True

    def tearDown(self):
        result_status = "PASS" if getattr(self, "test_success", False) else "FAIL"
        msg = "" if result_status == "PASS" else "Lỗi hiển thị / Exception"
        self.__class__.results.append([
            self._testMethodName, result_status, msg, datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ])
        if self.driver:
            self.driver.quit()

if __name__ == "__main__":
    unittest.main()
