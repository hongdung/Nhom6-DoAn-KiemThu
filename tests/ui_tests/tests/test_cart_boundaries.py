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

class CartBoundariesTest(unittest.TestCase):
    results = []

    @classmethod
    def tearDownClass(cls):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "BVA Test Results"
        ws.append(["Test ID", "Kết quả", "Chi tiết lỗi", "Thời gian"])
        for r in cls.results:
            ws.append(r)
        
        report_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "test_cart_bva_report.xlsx"))
        wb.save(report_path)
        print(f"\n[OK] Da xuat bao cao Excel cac case BVA tai: {report_path}")

    def setUp(self):
        self.test_success = False
        options = Options()
        # options.add_argument('--headless')
        self.driver = webdriver.Chrome(options=options)
        self.driver.maximize_window()
        self.driver.implicitly_wait(7)
        self.login_page = LoginPage(self.driver)

        # Pre-condition: Login and add an item to cart
        self.login_page.load()
        self.login_page.login("customer@atelier.local", "123456")
        time.sleep(2)
        self.driver.get("https://dm-fashion-apparel.onrender.com/products/so-mi-linen-oversize")
        try:
            self.driver.find_element(By.CSS_SELECTOR, "form.detail-form button[type='submit']").click()
            time.sleep(2)
        except Exception:
            pass

    def test_bva_quantity_under_min(self):
        """TC_UI_11: Cố tình đặt số lượng = 0 (Dưới biên) qua injection JS"""
        self.driver.get("https://dm-fashion-apparel.onrender.com/cart")
        
        try:
            # Inject JS remove 'min' attribute and set value to 0, then submit
            self.driver.execute_script('''
                var inputs = document.querySelectorAll('input[name="quantity"]');
                if(inputs.length > 0) {
                    inputs[0].removeAttribute("min");
                    inputs[0].value = "0";
                    inputs[0].closest('form').submit();
                }
            ''')
            time.sleep(1)
            
            # Trả về phải bị chặn bởi Server, và reload lại giá trị = 1 (do server quy định = 1)
            new_qty = self.driver.find_element(By.NAME, "quantity").get_attribute("value")
            self.assertEqual("1", new_qty, "Bug: Server chấp nhận quantity = 0 hoặc xoá giỏ hàng không chủ ý!")
        except Exception as e:
            self.fail(f"Test lỗi: {e}")
            
        self.test_success = True

    def test_bva_quantity_above_max(self):
        """TC_UI_12: Cố tình đặt số lượng = 11 (Trên biên)"""
        self.driver.get("https://dm-fashion-apparel.onrender.com/cart")
        
        try:
            # Tương tự tháo validation của Max HTML5 field đi để test API form truyền số thật qua HTTP
            self.driver.execute_script('''
                var inputs = document.querySelectorAll('input[name="quantity"]');
                if(inputs.length > 0) {
                    inputs[0].removeAttribute("max");
                    inputs[0].value = "11";
                    inputs[0].closest('form').submit();
                }
            ''')
            time.sleep(1)
            
            new_qty = self.driver.find_element(By.NAME, "quantity").get_attribute("value")
            self.assertEqual("10", new_qty, "Bug: Server không ghim số lượng lại Max=10!")
        except Exception as e:
            self.fail(f"Test lỗi: {e}")
            
        self.test_success = True
        
    def test_cart_remove_action(self):
        """TC_UI_13: Xoá giỏ hàng"""
        self.driver.get("https://dm-fashion-apparel.onrender.com/cart")
        
        try:
            # Action button is either "Xóa", form action="/cart/remove"
            remove_forms = self.driver.find_elements(By.XPATH, "//form[contains(@action, '/remove')]")
            if len(remove_forms) > 0:
                remove_forms[0].find_element(By.TAG_NAME, "button").click()
                time.sleep(2)
                
            # Expect empty cart
            flash = self.driver.find_element(By.CSS_SELECTOR, ".flash.flash-success").text
            self.assertIn("đã được xóa", flash.lower())
        except Exception as e:
            self.fail(f"Remove failed: {e}")
            
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
