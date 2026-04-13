import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

options = Options()
options.add_argument('--headless')
driver = webdriver.Chrome(options=options)
driver.implicitly_wait(5)
base_url = "https://dm-fashion-apparel.onrender.com"

# 1. Check Product details
print("--- Product detail ---")
driver.get(f"{base_url}/products/so-mi-linen-oversize")
try:
    print("H1 tag:", driver.find_element(By.CSS_SELECTOR, "h1").text)
    btn = driver.find_element(By.TAG_NAME, "button")
    print("Button text:", btn.text)
    btn.click()
    time.sleep(1)
    print("Action /cart clicked. Current url:", driver.current_url)
except Exception as e:
    print(e)
    print("Body text:", driver.find_element(By.TAG_NAME, "body").text[:200])

# 2. Check cart
print("--- Cart ---")
driver.get(f"{base_url}/cart")
print("Cart Body:", driver.find_element(By.TAG_NAME, "body").text[:500])
try:
    print("Quantity element:", driver.find_element(By.NAME, "quantity").get_attribute("outerHTML"))
except Exception as e:
    print("Cart quantity err:", e)

# 3. Check admin
print("--- Admin without login ---")
driver.get(f"{base_url}/admin")
print("Admin URL:", driver.current_url)
print("Admin H1:", driver.find_element(By.CSS_SELECTOR, "h1").text)

print("--- Admin with admin login ---")
driver.get(f"{base_url}/login")
driver.find_element(By.NAME, "email").send_keys("admin@atelier.local")
driver.find_element(By.NAME, "password").send_keys("admin123")
driver.find_element(By.CSS_SELECTOR, "form button[type='submit']").click()
time.sleep(1)
driver.get(f"{base_url}/admin")
print("Admin H1:", driver.find_element(By.CSS_SELECTOR, "h1").text)

driver.quit()
