import os
import csv
import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import NoSuchElementException

chrome_options = Options()
chrome_options.add_experimental_option("detach", True)
chrome_options.add_argument(
    "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")

# GPU 관련 문제 해결 옵션 추가
chrome_options.add_argument('--disable-gpu')
chrome_options.add_argument('--disable-software-rasterizer')

checkpoint_text = 'crawling/ssy-crawling/Ameba/checkpoint.txt'
csv_path = 'crawling/ssy-crawling/Ameba/ameba.csv'

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


def translate_text(text):
    """안정적인 번역 API를 사용하여 일본어를 한국어로 번역"""
    translated_text = ""
    if not text or text == "null":
        return text
    text_epoches = len(text) // 2000
    print(f"text_epoches: {text_epoches}")

    try:
        for epoch in range(0, text_epoches + 1):
            partial_text = text[epoch * 2000:(epoch + 1) * 2000]

            # 무료 번역 API 서비스 URL
            url = "https://translate.googleapis.com/translate_a/single"
            params = {
                "client": "gtx",
                "sl": "ja",
                "tl": "ko",
                "dt": "t",
                "q": partial_text
            }
            response = requests.get(url, params=params)

            try:
                if response.status_code == 200:
                    # Google Translate API 응답 파싱
                    result = response.json()
                    if (translated_text != ''.join([sentence[0] for sentence in result[0]])):
                        translated_text += ''.join([sentence[0] for sentence in result[0]])

                time.sleep(0.5)  # 재시도 전 짧은 대기

            except Exception as e:
                print(f"번역 실패: {str(e)}")
                time.sleep(1)  # 오류 후 대기
                return text

        return translated_text

    except:
        # 모든 시도 실패 시 원본 반환
        print(f"번역 실패, 원본 텍스트 반환: {text[:20]}...")
        return text


chrome_options = Options()
chrome_options.add_experimental_option("detach", True)
chrome_options.add_argument(
    "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")


def find_from_ameba(find):
    driver = webdriver.Chrome(options=chrome_options)
    time.sleep(3)

    file_index, query_index, start_p = load_checkpoint()
    print(f'>> 체크포인트 - 인덱스: {start_p}')

    if not os.path.exists(csv_path):
        with open(csv_path, 'w', newline='', encoding='utf-8-sig') as f:
            csv.writer(f).writerow(['restaurants', 'title', 'content', 'link'])

    driver.get(f"https://search.ameba.jp/general/entry/{find}.html?p=1&sortField=1")
    time.sleep(1)

    count = 0
    for p in range(start_p, 11):
        if count >= 2:
            return
        print(f">> p: {p}")
        post = driver.find_elements(By.XPATH, f'//*[@id="page"]/main/div[3]/div[1]/section/ul/li[{p}]')
        for item in post:
            try:
                title = item.find_element(By.CLASS_NAME, 'PcEntryListItem_EntryTitle').text.strip()
                link = item.find_element(By.CLASS_NAME, 'PcEntryListItem_Link').get_attribute('href')
            except NoSuchElementException:
                return

            if link:
                driver.execute_script("window.open('', '_blank');")
                driver.switch_to.window(driver.window_handles[1])
                driver.get(link)
                time.sleep(3)

                try:
                    content = driver.find_element(By.XPATH, '//*[@id="entryBody"]').text.strip()
                except NoSuchElementException:
                    content = ''

                title = translate_text(title)
                content = translate_text(content)
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



# 1열 키워드 가져올 CSV 파일 목록
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

    # for row in reader:
    #     if row and row[0].strip():  # 빈 셀 제외
    #             queries.append(row[0].strip())

    for j in range(start_idx, len(rows)):
        if rows[j] and rows[j][0].strip():  # 빈 셀 제외
            query = rows[j][0].strip()
            print(f">> 처리 중: 파일 {i+1}/{len(csv_files)}, 쿼리 {j+1}/{len(rows)} - {query}")

            save_checkpoint(i, j, start_p)
            find_from_ameba(query)

            start_p = 1