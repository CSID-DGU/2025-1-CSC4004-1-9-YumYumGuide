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

checkpoint_dir = 'crawling/ssy-crawling/Ameba/checkpoints'
csv_path = 'crawling/ssy-crawling/Ameba/ameba.csv'
os.makedirs(os.path.dirname(csv_path), exist_ok=True)

def get_checkpoint_path(keyword):
    filename = keyword.replace(" ", "_").replace("　", "_")
    return os.path.join(checkpoint_dir, f"{filename}_checkpoint.txt")

def load_checkpoint(keyword):
    path = get_checkpoint_path(keyword)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            page, p, saved_id, collected = map(int, f.read().strip().split(','))
            return page, p, saved_id, collected
    else:
        # 체크포인트가 없으면 CSV에서 가장 마지막 id를 불러옴
        if os.path.exists(csv_path):
            with open(csv_path, 'r', encoding='utf-8-sig') as f:
                rows = list(csv.reader(f))
                if len(rows) > 1:
                    last_id = int(rows[-1][0])
                else:
                    last_id = 0
        else:
            last_id = 0

        # 새로운 체크포인트 파일 저장
        save_checkpoint(keyword, 1, 1, last_id, 0)
        return 1, 1, last_id, 0


def save_checkpoint(keyword, page, p, current_id, collected):
    path = get_checkpoint_path(keyword)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(f'{page},{p},{current_id},{collected}')


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


def find_one_from_ameba(find):
    driver = webdriver.Chrome(options=chrome_options)
    time.sleep(3)

    start_page, start_p, current_id, count = load_checkpoint(find)
    print(f'>> 체크포인트 - 페이지: {start_page}, 인덱스: {start_p}, ID: {current_id}, 수집 개수: {count}')

    if not os.path.exists(csv_path):
        with open(csv_path, 'w', newline='', encoding='utf-8-sig') as f:
            csv.writer(f).writerow(['id', '키워드', '제목', '내용', '링크'])

    driver.get(f"https://search.ameba.jp/general/entry/{find}.html?p=1&sortField=1")
    try:
        page_count_element = driver.find_element(By.XPATH, '//*[@id="page"]/main/div[3]/div[1]/section/div[2]/div[1]')
        page_count = page_count_element.text.replace("件中 1-10件を表示", "").replace(",", "")
        page_count_int = int(page_count) // 10
    except:
        print("페이지 수 추출 실패")
        driver.quit()
        return

    for page in range(start_page, page_count_int + 1):
        if count >= 2:
            break
        driver.get(f"https://search.ameba.jp/general/entry/{find}.html?p={page}&sortField=1")
        time.sleep(1)

        for p in range(1, 11):
            if page == start_page and p < start_p:
                continue
            if count >= 2:
                break

            print(f">> page: {page}, p: {p}")
            post = driver.find_elements(By.XPATH, f'//*[@id="page"]/main/div[3]/div[1]/section/ul/li[{p}]')
            for item in post:
                try:
                    title = item.find_element(By.CLASS_NAME, 'PcEntryListItem_EntryTitle').text.strip()
                    link = item.find_element(By.CLASS_NAME, 'PcEntryListItem_Link').get_attribute('href')
                except NoSuchElementException:
                    continue

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
                    current_id += 1
                    count += 1

                    with open(csv_path, 'a', newline='', encoding='utf-8-sig') as f:
                        csv.writer(f).writerow([current_id, find, title, content, link])

                    save_checkpoint(find, page, p, current_id, count)
                    driver.close()
                    driver.switch_to.window(driver.window_handles[0])
                    print(f"[{page}-{p}] 제목: {title}")
                    print("내용:", content[:30])
                    time.sleep(1)

    driver.quit()



# 1열 키워드 가져올 CSV 파일 목록
csv_files = [
    'crawling/jjy-crawling/retty/crawled_data/시부야_restaurant_details_110.csv',
    'crawling/jjy-crawling/retty/crawled_data/시부야_restaurant_details_1722.csv',
    'crawling/jjy-crawling/retty/crawled_data/신주쿠_restaurant_details_120.csv',
    'crawling/jjy-crawling/retty/crawled_data/신주쿠_restaurant_details_1998.csv',
    'crawling/jjy-crawling/retty/crawled_data/아사쿠사_restaurant_details_1777.csv',
    'crawling/jjy-crawling/retty/crawled_data/우에노_restaurant_details_1800.csv',
    'crawling/jjy-crawling/retty/crawled_data/이케부코로_restaurant_details_1900.csv',
]

queries = []

for file_path in csv_files:
    if not os.path.exists(file_path):
        print(f"[경고] 파일 없음: {file_path}")
        continue

    with open(file_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        next(reader, None)  # 헤더 스킵
        for row in reader:
            if row and row[0].strip():  # 빈 셀 제외
                queries.append(row[0].strip())

print(f">> 총 {len(queries)}개의 쿼리 수집 완료.")


for query in queries:
    find_one_from_ameba(query)