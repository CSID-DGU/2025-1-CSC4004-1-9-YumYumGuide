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

checkpoint_dir = 'crawling/ssy-crawling/Blog/checkpoints'
csv_path = 'crawling/ssy-crawling/Blog/blogcrawl.csv'
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

chrome_options = Options()
chrome_options.add_experimental_option("detach", True)
chrome_options.add_argument(
    "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")


def find_one_from_blog(find):
    driver = webdriver.Chrome(options=chrome_options)
    time.sleep(3)

    start_page, start_p, current_id, count = load_checkpoint(find)
    print(f'>> 체크포인트 - 페이지: {start_page}, 인덱스: {start_p}, ID: {current_id}, 수집 개수: {count}')

    if not os.path.exists(csv_path):
        with open(csv_path, 'w', newline='', encoding='utf-8-sig') as f:
            csv.writer(f).writerow(['id', '키워드', '제목', '내용', '링크'])

    driver.get(f"https://section.blog.naver.com/Search/Post.naver?pageNo=1&rangeType=ALL&orderBy=sim&keyword={find}")
    page_count_element = driver.find_element(By.XPATH, f'//*[@id="content"]/section/div[1]/div[2]/span/span/em')
    page_count = page_count_element.text.replace("건", "").replace(",", "")
    page_count_int = int(page_count) // 7
    print(f"전체 페이지: {page_count_int}")
    for page in range(1, page_count_int + 1):
        driver.get(f"https://section.blog.naver.com/Search/Post.naver?pageNo={page}&rangeType=ALL&orderBy=sim&keyword={find}")
        
        if count >= 2:
            break
        time.sleep(1)

        for p in range(1, 8):
            if page == start_page and p < start_p:
                continue
            if count >= 2:
                break

            print(f">> page: {page}, p: {p}")
            post = driver.find_elements(By.XPATH, f'//*[@id="content"]/section/div[2]/div[{p}]')
            
            for item in post:
                title = ''
                content = ''
                link = None
                try:
                    title_element = item.find_element(By.CLASS_NAME, 'title_post')
                    title = title_element.text.strip()
                    link_element = item.find_element(By.CLASS_NAME, 'desc_inner')
                    link = link_element.get_attribute('href')
                except NoSuchElementException:
                    continue
                
                if link:
                    driver.execute_script("window.open('', '_blank');")
                    driver.switch_to.window(driver.window_handles[1])
                    driver.get(link)
                    time.sleep(3)

                    try:
                        content = driver.find_element(By.XPATH, '//*[@id="post-view223842009530"]/div/div[3]').text.strip()
                    except NoSuchElementException:
                        content = ''

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



# 2열 키워드 가져올 CSV 파일 목록
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
        print(f"파일 없음: {file_path}")
        continue

    with open(file_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        next(reader, None)  # 헤더 스킵
        for row in reader:
            if row and row[1].strip():  # 빈 셀 제외
                queries.append(row[1].strip())

print(f">> 총 {len(queries)}개의 쿼리 수집 완료.")


for query in queries:
    find_one_from_blog(query)