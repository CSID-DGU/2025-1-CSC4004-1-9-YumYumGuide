import os
import csv
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import NoSuchElementException
# 수정 필요!!!!!!!
chrome_options = Options()
chrome_options.add_experimental_option("detach", True)
chrome_options.add_argument(
    "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")

# GPU 관련 문제 해결 옵션 추가
chrome_options.add_argument('--disable-gpu')
chrome_options.add_argument('--disable-software-rasterizer')

checkpoint_text = 'crawling/ssy-crawling/Tistory/checkpoint.txt'
csv_path = 'crawling/ssy-crawling/Tistory/tistorycrawl.csv'
os.makedirs(os.path.dirname(csv_path), exist_ok=True)

def load_checkpoint():
    if os.path.exists(checkpoint_text):
        with open(checkpoint_text, 'r', encoding='utf-8') as f:
            data = f.read().strip().split(',')
            file_index = int(data[0])
            query_index = int(data[1])
            p = int(data[2])
            return file_index, query_index, p
    else:
        # 새로운 체크포인트 파일 저장 (첫 번째 파일, 첫 번째 쿼리부터 시작)
        save_checkpoint(0, 0, 1)
        return 0, 0, 1

def save_checkpoint(file_index, query_index, p):
    with open(checkpoint_text, 'w', encoding='utf-8') as f:
        f.write(f'{file_index},{query_index},{p}')

chrome_options = Options()
chrome_options.add_experimental_option("detach", True)
chrome_options.add_argument(
    "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")


def find_from_tistory(find):
    driver = webdriver.Chrome(options=chrome_options)
    time.sleep(3)

    file_index, query_index, start_p = load_checkpoint()
    print(f'>> 체크포인트 - 인덱스: {start_p}')

    if not os.path.exists(csv_path):
        with open(csv_path, 'w', newline='', encoding='utf-8-sig') as f:
            csv.writer(f).writerow(['restaurant', 'title', 'content', 'link'])
    
    count = 0
    for page in range(1, 5):
        driver.get(f"https://www.tistory.com/search?keyword={find}&type=post&sort=ACCURACY&page={page}")
        time.sleep(1)

        for p in range(start_p, 31):
            if count >= 2:
                driver.quit()
                return

            print(f">> p: {p}")
            post = driver.find_elements(By.CLASS_NAME, f'item_group')            
            
            for item in post:
                try:
                    title_element = item.find_element(By.CLASS_NAME, 'tit_cont')
                    title = title_element.text.strip()
                    link_element = item.find_element(By.CLASS_NAME, 'link_cont')
                    link = link_element.get_attribute('href')
                except NoSuchElementException:
                    driver.close()
                    driver.switch_to.window(driver.window_handles[0])
                    continue
                    
                if link:
                    driver.execute_script("window.open('', '_blank');")
                    driver.switch_to.window(driver.window_handles[1])
                    driver.get(link)
                    time.sleep(3)

                    try:
                        content = driver.find_element(By.CLASS_NAME, 'contents_style').text.strip()
                    except NoSuchElementException:
                        content = ''

                    if not "일본" in content:
                        driver.close()
                        driver.switch_to.window(driver.window_handles[0])
                        continue
                    if not "식당" in content:
                        driver.close()
                        driver.switch_to.window(driver.window_handles[0])
                        continue

                    count += 1

                    with open(csv_path, 'a', newline='', encoding='utf-8-sig') as f:
                        csv.writer(f).writerow([find, title, content, link])

                    save_checkpoint(file_index, query_index, p)
                    driver.close()
                    driver.switch_to.window(driver.window_handles[0])
                    print(f"[post-{p}] 제목: {title}")
                    print("내용:", content[:30])
                    time.sleep(1)

    driver.quit()



# 2열 키워드 가져올 CSV 파일 목록
# csv_files = [
#     'crawling/jjy-crawling/retty/crawled_data/시부야_restaurant_details_110.csv',
#     'crawling/jjy-crawling/retty/crawled_data/시부야_restaurant_details_1722.csv',
#     'crawling/jjy-crawling/retty/crawled_data/신주쿠_restaurant_details_120.csv',
#     'crawling/jjy-crawling/retty/crawled_data/신주쿠_restaurant_details_1998.csv',
#     'crawling/jjy-crawling/retty/crawled_data/아사쿠사_restaurant_details_1777.csv',
#     'crawling/jjy-crawling/retty/crawled_data/우에노_restaurant_details_1800.csv',
#     'crawling/jjy-crawling/retty/crawled_data/이케부코로_restaurant_details_1900.csv',
# ]

file_list = os.listdir('crawling/jjy-crawling/retty/crawled_data/')
csv_files = [os.path.join('crawling/jjy-crawling/retty/crawled_data/', file) for file in file_list if file.endswith('.csv')]

file_index, query_index, start_p = load_checkpoint()
print(f">> 체크포인트 - 파일 인덱스: {file_index}, 쿼리 인덱스: {query_index}, 페이지: {start_p}")

queries = []

for i in range(file_index, len(csv_files)):
    file_path = csv_files[i]
    if not os.path.exists(file_path):
        print(f"파일 없음: {file_path}")
        continue

    with open(file_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        next(reader, None)  # 헤더 스킵
        rows = list(reader)

    start_idx = query_index if i == file_index else 0

    for j in range(start_idx, len(rows)):
        if rows[j] and rows[j][1].strip():  # 빈 셀 제외
            query = rows[j][1].strip()
            print(f">> 처리 중: 파일 {i+1}/{len(csv_files)}, 쿼리 {j+1}/{len(rows)} - {query}")

            save_checkpoint(i, j, start_p)
            find_from_tistory(query)

            start_p = 1