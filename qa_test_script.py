import time
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class LifeFlowQATest(unittest.TestCase):
    def setUp(self):
        # Initialize the Chrome driver
        # You can also use webdriver.Firefox() or webdriver.Edge() depending on your browser
        options = webdriver.ChromeOptions()
        # options.add_argument('--headless') # Uncomment this line to run the test in the background (no UI)
        self.driver = webdriver.Chrome(options=options)
        self.driver.implicitly_wait(10)
        
        # The base URL of your frontend. It uses Vite, so port 5173 is the default.
        self.base_url = "http://localhost:5173" 

    def test_home_page_loads(self):
        driver = self.driver
        driver.get(self.base_url + "/")
        # Verify the title from index.html
        self.assertIn("LifeFlow", driver.title)
        print("\n✅ Home page loaded successfully.")

    def test_navigation_to_login(self):
        driver = self.driver
        driver.get(self.base_url + "/")
        try:
            # Look for a link containing /login in the href
            login_link = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.XPATH, "//a[contains(@href, '/login')]"))
            )
            login_link.click()
            WebDriverWait(driver, 5).until(EC.url_contains("/login"))
            print("✅ Navigated to Login page successfully.")
        except Exception as e:
            self.fail(f"❌ Could not navigate to login: {e}")

    def test_navigation_to_register(self):
        driver = self.driver
        driver.get(self.base_url + "/register")
        # Just verify we can load the register page
        WebDriverWait(driver, 5).until(EC.url_contains("/register"))
        print("✅ Register page accessible.")

    def test_community_page(self):
        driver = self.driver
        driver.get(self.base_url + "/community")
        WebDriverWait(driver, 5).until(EC.url_contains("/community"))
        print("✅ Community page accessible.")

    def test_compatibility_page(self):
        driver = self.driver
        driver.get(self.base_url + "/compatibility")
        WebDriverWait(driver, 5).until(EC.url_contains("/compatibility"))
        print("✅ Compatibility page accessible.")

    def tearDown(self):
        # Close the browser after each test
        self.driver.quit()

if __name__ == "__main__":
    print("Starting QA Tests for LifeFlow...")
    unittest.main(verbosity=2)
