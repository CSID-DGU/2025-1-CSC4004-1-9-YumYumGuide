from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
import csv
from selenium.common.exceptions import NoSuchElementException
import time
from selenium.webdriver.chrome.options import Options
# from googletrans import Translator


chrome_options = Options()
chrome_options.add_experimental_option("detach", True)
chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
# translator = Translator()

find = "東京"

driver_path = r"D:\webdriver\chromedriver-win64\chromedriver-win64\chromedriver.exe"
service = Service(driver_path)
driver = webdriver.Chrome(options=chrome_options)
driver.get(f"https://search.ameba.jp/general/{find}.html")

time.sleep(3)

with open('ameba.csv', 'w', newline='', encoding='utf-8-sig') as csv_file:
    csv_writer = csv.writer(csv_file)
    csv_writer.writerow(['제목', '내용', '글 요약', '링크'])

try:
    driver.find_element(By.XPATH, '//*[@id="page"]/main/div[3]/div[1]/section[2]/div[3]/a').click()
except Exception as e:
    print(f"Login failed: {e}")
# for page in range(1, 101):


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
        
            # 링크 추출 (일반적으로 <a> 태그 안에 href 속성이 있음)
            try:
                link_element = item.find_element(By.CLASS_NAME, 'PcEntryListItem_Link')
                link = link_element.get_attribute('href')

                if link:
                    driver.execute_script("window.open('', '_blank');")
                    driver.switch_to.window(driver.window_handles[1])
                    driver.get(link)
                    time.sleep(3)

                theme = driver.find_element(By.XPATH, '//*[@id="main"]/div[1]/article/div/div[1]/div[2]/dl').text
                content = driver.find_element(By.XPATH, '//*[@id="entryBody"]').text

                print(theme)
                print(content)

                time.sleep(3)
                
            except NoSuchElementException:
                link = ''
        
            with open('ameba.csv', 'a', newline='', encoding='utf-8-sig') as csv_file:
                csv_writer = csv.writer(csv_file)
                csv_writer.writerow([title, theme, content])

            driver.close()
            driver.switch_to.window(driver.window_handles[0])
            time.sleep(1)
            break
        
except NoSuchElementException:
    print("PcEntryList_List 컨테이너를 찾을 수 없습니다.")

