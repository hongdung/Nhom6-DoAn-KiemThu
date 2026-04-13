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

class ProductsCatalogTest(unittest.TestCase):
    results = []

    @classmethod
    def tearDownClass(cls):
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Products Catalog Test"
        ws.append(["Test ID", "Kết quả", "Chi tiết lỗi", "Thời gian"])
        for r in cls.results:
            ws.append(r)
        
        report_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "test_products_catalog_report.xlsx"))
        wb.save(report_path)

    def setUp(self):
        self.test_success = False
        options = Options()
        self.driver = webdriver.Chrome(options=options)
        self.driver.maximize_window()
        self.driver.implicitly_wait(5)
        self.base_url = "https://dm-fashion-apparel.onrender.com"

    def test_sp01_xem_danh_sach(self):
        """SP01: Xem danh sách sản phẩm"""
        self.driver.get(f"{self.base_url}/products")
        title = self.driver.find_element(By.CSS_SELECTOR, "h1").text
        self.assertIn("danh sách sản phẩm", title.lower())
        
        # Click category phụ kiện
        self.driver.get(f"{self.base_url}/products?category=Ph%E1%BB%A5+ki%E1%BB%87n")
        time.sleep(1)
        # Verify
        cat_select = self.driver.find_element(By.NAME, "category")
        self.assertIn("phụ kiện", cat_select.get_attribute("value").lower())
        self.test_success = True

    def test_sp02_sp03_xem_chi_tiet_va_anh(self):
        """SP02, SP03: Chi tiết và ảnh Gallery"""
        self.driver.get(f"{self.base_url}/products/tui-mini-crossbody")
        
        # Kiểm tra H1 title
        title = self.driver.find_element(By.CSS_SELECTOR, "h1").text
        self.assertIn("túi mini crossbody", title.lower())
        
        # Kiểm tra ảnh (tìm selector img trong class product-gallery hoặc tương tự)
        images = self.driver.find_elements(By.TAG_NAME, "img")
        self.assertTrue(len(images) > 0, "Không tìm thấy ảnh sản phẩm")
        self.test_success = True

    def test_sp04_sp05_tim_kiem_tu_khoa(self):
        """SP04, SP05: Tìm kiếm có dấu và không dấu"""
        self.driver.get(f"{self.base_url}/products")
        search_box = self.driver.find_element(By.NAME, "q")
        search_box.send_keys("Túi Mini Crossbody")
        search_box.submit()
        time.sleep(1)
        
        cards = self.driver.find_elements(By.CSS_SELECTOR, ".product-card")
        self.assertTrue(len(cards) >= 1)
        
        # Khong dau (ao)
        self.driver.get(f"{self.base_url}/products")
        search_box2 = self.driver.find_element(By.NAME, "q")
        search_box2.send_keys("ao")
        search_box2.submit()
        time.sleep(1)
        cards2 = self.driver.find_elements(By.CSS_SELECTOR, ".product-card")
        self.assertTrue(len(cards2) > 0)
        self.test_success = True

    def test_sp06_tu_khoa_khong_ton_tai(self):
        """SP06: Từ khóa không tồn tại"""
        self.driver.get(f"{self.base_url}/products?q=xyz123")
        time.sleep(1)
        # Check text thong bao empty state
        body_text = self.driver.find_element(By.TAG_NAME, "body").text
        self.assertIn("chưa có sản phẩm phù hợp", body_text.lower())
        self.test_success = True

    def test_sp07_sp08_loc_va_ket_hop_tim_kiem(self):
        """SP07, SP08: Lọc danh mục và kết hợp keyword"""
        self.driver.get(f"{self.base_url}/products?category=Nam&q=quan")
        time.sleep(1)
        # Phải lọc ra các sp chứa "quan" và thuộc "Nam" (ví dụ: quần short relaxed)
        # Assert url matches
        self.assertIn("category=Nam", self.driver.current_url)
        self.assertIn("q=quan", self.driver.current_url)
        cards = self.driver.find_elements(By.CSS_SELECTOR, ".product-card")
        self.assertTrue(len(cards) >= 1)
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
