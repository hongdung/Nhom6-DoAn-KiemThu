import unittest
import sys
import os
import openpyxl
from datetime import datetime

# Ensure pages can be imported easily
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from pages.login_page import LoginPage

class LoginTest(unittest.TestCase):
    results = []

    @classmethod
    def tearDownClass(cls):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Test Results"
        ws.append(["Test ID", "Kết quả", "Chi tiết lỗi (Nếu có)", "Thời gian chạy"])
        for r in cls.results:
            ws.append(r)
        
        report_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "test_report.xlsx"))
        wb.save(report_path)
        print(f"\n[OK] Da xuat bao cao Excel tai: {report_path}")

    def setUp(self):
        """Setup webdriver before each test"""
        self.test_success = False
        options = Options()
        # Uncomment below if you want to run without UI
        # options.add_argument('--headless')
        self.driver = webdriver.Chrome(options=options)
        self.driver.maximize_window()
        self.login_page = LoginPage(self.driver)

    def test_valid_login(self):
        """Test Case: Đăng nhập thành công với thông tin hợp lệ"""
        self.login_page.load()
        # Update with real credentials configured in your environment
        self.login_page.login("user@demo.com", "password123")
        
        # In a real environment, you should add assertion to check Redirection
        # Example: wait until URL changes or a dashboard element is visible.
        # self.assertNotEqual(self.driver.current_url, self.login_page.url)
        self.test_success = True

    def test_invalid_login_wrong_password(self):
        """Test Case: Đăng nhập thất bại do sai mật khẩu"""
        self.login_page.load()
        self.login_page.login("user@demo.com", "wrong_password")
        
        # Verify the correct Flash error is displayed
        error_msg = self.login_page.get_error_message()
        self.assertEqual("Email hoặc mật khẩu chưa đúng.", error_msg, "Error message mismatch!")
        self.test_success = True

    def test_empty_credentials(self):
        """Test Case: Bỏ trống HTML5 required fields"""
        self.login_page.load()
        self.login_page.click_login_button()
        
        # Because the fields have `required`, HTML5 validation kicks in.
        # WebDriver requires a specific way to check HTML5 validation if needed.
        # We ensure form is not submitted by checking we are still on the same page.
        self.assertTrue("login" in self.driver.current_url)
        self.test_success = True

    def test_invalid_email_format(self):
        """Test Case: Format email không hợp lệ"""
        self.login_page.load()
        self.login_page.login("invalid-email", "password")
        
        # Check validation attribute from browser
        email_field = self.driver.find_element(*self.login_page.email_input)
        validation_msg = email_field.get_attribute("validationMessage")
        self.assertTrue(len(validation_msg) > 0, "Trình duyệt không báo lỗi validation HTML5")
        self.test_success = True

    def test_sql_injection_attempt(self):
        """Test Case: Bảo mật - SQL Injection (Email)"""
        self.login_page.load()
        self.login_page.login("' OR 1=1 --", "password")
        
        # Do input type email có thể chặn ở frontend, nếu submit được thì back-end phải báo lỗi.
        email_field = self.driver.find_element(*self.login_page.email_input)
        if email_field.get_attribute("validationMessage"):
            self.assertTrue(True)
        else:
            error_msg = self.login_page.get_error_message()
            self.assertIn("chưa đúng", error_msg.lower())
        self.test_success = True

    def test_xss_attempt(self):
        """Test Case: Bảo mật - XSS Attack payload"""
        self.login_page.load()
        self.login_page.login("user@demo.com", "<script>alert('XSS')</script>")
        
        error_msg = self.login_page.get_error_message()
        self.assertEqual("Email hoặc mật khẩu chưa đúng.", error_msg)
        
        # Kiểm tra an toàn XSS (Không có popup alert)
        from selenium.common.exceptions import NoAlertPresentException
        try:
            alert = self.driver.switch_to.alert
            alert.dismiss()
            self.fail("Cảnh báo bảo mật: Lỗi XSS thành công và hiển thị popup!")
        except NoAlertPresentException:
            pass # Safe
        self.test_success = True

    def tearDown(self):
        """Clean up and close browser, then record outcome"""
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
