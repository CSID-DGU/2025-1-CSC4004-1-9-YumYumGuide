from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.wait import WebDriverWait
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.action_chains import ActionChains
import pandas as pd
import numpy as np
import time
import pickle
import os
import random

from selenium.webdriver.chrome.options import Options

chrome_options = Options()
chrome_options.add_experimental_option("detach", True)
chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")


def wait():
    driver.implicitly_wait(10)

def move_next(driver):
    right = driver.find_element(By.CSS_SELECTOR, "._aaqg._aaqh").click()
    driver.implicitly_wait(3)


id = 'kdekwa'
pw = 'roller!1'
find = '건대놀거리'
target = 25

descriptions = []
hearts = []
comments = []

driver_path = r"D:\webdriver\chromedriver-win64\chromedriver-win64\chromedriver.exe"
service = Service(driver_path)
driver = webdriver.Chrome(options=chrome_options)
driver.get("https://www.instagram.com")
wait()

if os.path.exists("cookies.pkl"):
    cookies = pickle.load(open("cookies.pkl", "rb"))
    for cookie in cookies:
        driver.add_cookie(cookie)
    num = random.uniform(5, 10)
    time.sleep(num)
    driver.refresh()
else:
    num = random.uniform(5, 10)
    time.sleep(num)
    driver.find_element(By.CSS_SELECTOR, 'input[name="username"]').send_keys(id)
    num = random.uniform(5, 10)
    time.sleep(num)
    driver.find_element(By.CSS_SELECTOR, 'input[name="password"]').send_keys(pw)
    num = random.uniform(5, 10)
    time.sleep(num)
    driver.find_element(By.CSS_SELECTOR, 'input[name="password"]').send_keys(Keys.ENTER)

    time.sleep(10)
    cookies = driver.get_cookies()
    pickle.dump(cookies, open("cookies.pkl", "wb"))


driver.get(f"https://www.instagram.com/explore/search/keyword/?q={find}")

count = 0
i = 0


posts = driver.find_elements(By.CSS_SELECTOR, '._a6hd')


for p in posts:
    if i > target:
        break
    i = i + 1
    act = ActionChains(driver)
    time.sleep(3)
    act.move_to_element(p).perform()
    desc_element = driver.find_element(By.CSS_SELECTOR, '._aagv > img')
    dddd = desc_element.get_attribute('alt')
    print(f"Desc: {dddd}")
    descriptions.append(dddd)
    heart_comment_element = driver.find_elements(By.CSS_SELECTOR, "div > ul > li > span > span")
    if len(heart_comment_element) == 2:
        he = heart_comment_element[0].text
        co = heart_comment_element[1].text
        print(f"Heart: {he}")
        hearts.append(he)
        print(f"Comment: {co}")
        comments.append(co)
    else:
        hearts.append("0")
        comments.append("0")
    print(f"=============== finish {i} ==================")

    num = random.uniform(5, 10)
    time.sleep(num)

wait()

data = pd.DataFrame()
data['본문'] = descriptions
data['좋아요'] = hearts
data['댓글'] = comments

data.to_excel("abc.xlsx", index=True)