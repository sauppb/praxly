"""Unit tests for Praxly.

This script uses Selenium to drive the web browser.
https://www.selenium.dev/documentation/webdriver/
"""

import csv
import time
from selenium import webdriver
from selenium.webdriver.common.by import By


# Timeout, in seconds, to find DOM elements.
WAIT = 10

# How long to sleep before performing actions.
PAUSE = 1

# URL to test (localhost or production)
URL = "https://praxly.github.io/"


print("\nOpening browser window")
driver = webdriver.Chrome()
driver.implicitly_wait(WAIT)
driver.get(URL)

aceCode = driver.find_element(By.ID, "aceCode")
runButton = driver.find_element(By.ID, "runButton")
stdout = driver.find_element(By.CLASS_NAME, "stdout")
driver.execute_script('textEditor = ace.edit("aceCode");')


with open('tests.csv', newline='') as csvfile:
    csvfile.readline()  # skip header
    for row in csv.reader(csvfile):
        name, code, expect_out, expect_err = row
        time.sleep(PAUSE)

        print("\nRunning", name)
        driver.execute_script(f'textEditor.setValue(`{code}`);')
        aceCode.click()
        runButton.click()

        actual = stdout.get_attribute("textContent")
        if actual == expect_out:
            print("PASS")
        else:
            print("FAIL")
            print(f"  Expect: {expect_out}")
            print(f"  Actual: {actual}")


input("\nPress Enter to quit...")
