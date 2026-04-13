from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class LoginPage:
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
        self.url = "https://dm-fashion-apparel.onrender.com/login"

        # Locators (based on the real DOM)
        self.email_input = (By.NAME, "email")
        self.password_input = (By.NAME, "password")
        self.login_button = (By.CSS_SELECTOR, "button[type='submit']")
        self.error_message_flash = (By.CSS_SELECTOR, ".flash.flash-error")
        self.success_message_flash = (By.CSS_SELECTOR, ".flash.flash-success")

    def load(self):
        self.driver.get(self.url)

    def enter_email(self, email):
        el = self.wait.until(EC.visibility_of_element_located(self.email_input))
        el.clear()
        el.send_keys(email)

    def enter_password(self, password):
        el = self.wait.until(EC.visibility_of_element_located(self.password_input))
        el.clear()
        el.send_keys(password)

    def click_login_button(self):
        el = self.wait.until(EC.element_to_be_clickable(self.login_button))
        el.click()

    def login(self, email, password):
        self.enter_email(email)
        self.enter_password(password)
        self.click_login_button()

    def get_error_message(self):
        el = self.wait.until(EC.visibility_of_element_located(self.error_message_flash))
        return el.text

    def get_success_message(self):
        el = self.wait.until(EC.visibility_of_element_located(self.success_message_flash))
        return el.text
