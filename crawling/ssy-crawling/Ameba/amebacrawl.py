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

find = "東京"

driver_path = r"D:\webdriver\chromedriver-win64\chromedriver-win64\chromedriver.exe"
service = Service(driver_path)
driver = webdriver.Chrome(options=chrome_options)
driver.get(f"https://search.ameba.jp/general/{find}.html")

time.sleep(3)


try:
    driver.find_element(By.XPATH, '//*[@id="page"]/main/div[3]/div[1]/section[2]/div[3]/a').click()
except Exception as e:
    print(f"Login failed: {e}")

print("클래스들")
page_classes = driver.find_elements(By.XPATH, "//*[@class]")
for element in page_classes[:5]:  # 처음 5개 요소만 확인
    print(f"Element: {element.tag_name}, Classes: {element.get_attribute('class')}")



try:
    for p in range(1, 11):
        post = driver.find_elements(By.XPATH, f'//*[@id="page"]/main/div[3]/div[1]/section/ul/li[{p}]')
        
        for item in post:
            # 제목 추출
            try:
                title_element = item.find_element(By.CLASS_NAME, 'PcEntryListItem_EntryTitle')
                title = title_element.text.strip()
            except NoSuchElementException:
                title = ''
            
            # 내용 추출
            try:
                data_element = item.find_element(By.CLASS_NAME, 'PcEntryListItem_EntryData')
                data = data_element.text.strip()
            except NoSuchElementException:
                data = ''
            
            # 글 요약 추출
            try:
                content_element = item.find_element(By.CLASS_NAME, 'PcEntryListItem_EntryContent')
                content = content_element.text.strip()
            except NoSuchElementException:
                content = ''
        
            # 링크 추출 (일반적으로 <a> 태그 안에 href 속성이 있음)
            try:
                link_element = item.find_element(By.CLASS_NAME, 'PcEntryListItem_Link')
                link = link_element.get_attribute('href')

                link_element.click()
                time.sleep(3)
                
            except NoSuchElementException:
                link = ''
                
            
            # 추출한 내용 출력
            print("제목:", title)
            print("내용:", data)
            print("글 요약:", content)
            print("링크:", link)
            print("-" * 40)

            driver.back()
            break
        
except NoSuchElementException:
    print("PcEntryList_List 컨테이너를 찾을 수 없습니다.")

driver.implicitly_wait(10)

