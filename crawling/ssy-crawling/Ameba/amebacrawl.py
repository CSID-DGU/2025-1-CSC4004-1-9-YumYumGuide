import os
import csv
import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import NoSuchElementException

checkpoint_path = 'crawling/ssy-crawling/Ameba/checkpoint.txt'
csv_path = 'crawling/ssy-crawling/Ameba/ameba.csv'
os.makedirs(os.path.dirname(csv_path), exist_ok=True)

# 초기 id 설정 (checkpoint.txt 없을 경우 0부터 시작)
def load_checkpoint():
    if os.path.exists(checkpoint_path):
        with open(checkpoint_path, 'r', encoding='utf-8') as f:
            page, p, saved_id = map(int, f.read().strip().split(','))
            return page, p, saved_id
    return 1, 1, 0


def save_checkpoint(page, p, current_id):
    with open(checkpoint_path, 'w', encoding='utf-8') as f:
        f.write(f'{page},{p},{current_id}')


def translate_text(text):
    """안정적인 번역 API를 사용하여 일본어를 한국어로 번역"""
    translated_text = ""
    if not text or text == "null":
        return text
    text_epoches = len(text)//2000
    print(f"text_epoches: {text_epoches}")

    try:
        for epoch in range(0, text_epoches + 1):
            partial_text = text[epoch*2000:(epoch+1)*2000]
        
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
chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")

def find_one_from_ameba(find):
    count = 0
    driver = webdriver.Chrome(options=chrome_options)
    time.sleep(3)

    start_page, start_p, current_id = load_checkpoint()
    print(f'start_page : {start_page}')
    print(f'start_p : {start_p}')
    print(f'current_id : {current_id}')

    # CSV 파일이 없다면 헤더 작성
    if not os.path.exists(csv_path):
        with open(csv_path, 'w', newline='', encoding='utf-8-sig') as csv_file:
            csv_writer = csv.writer(csv_file)
            csv_writer.writerow(['id', '키워드', '제목', '내용', '링크'])

    driver.get(f"https://search.ameba.jp/general/entry/{find}.html?p=1&sortField=1")
    page_count_element = driver.find_element(By.XPATH, f'//*[@id="page"]/main/div[3]/div[1]/section/div[2]/div[1]')
    page_count = page_count_element.text.replace("件中 1-10件を表示", "").replace(",", "")
    page_count_int = int(page_count) // 10
    print(f"전체 페이지: {page_count_int}")

    for page in range(1, page_count_int + 1):
        driver.get(f"https://search.ameba.jp/general/entry/{find}.html?p={page}&sortField=1")
        time.sleep(1)

        try:
            for p in range(1, 11):
                # 체크포인트보다 이전이라면 스킵
                if page == start_page and p < start_p:
                    continue
                # 한 가게에서 두 개의 리뷰를 찾으면 스킵
                if count == 2:
                    break
                post = driver.find_elements(By.XPATH, f'//*[@id="page"]/main/div[3]/div[1]/section/ul/li[{p}]')
                print(f"page: {page}, p: {p}")
                for item in post:
                    # 요소 가져오기
                    title = ''
                    theme = ''
                    content = ''
                    link = None
                    try:
                        title_element = item.find_element(By.CLASS_NAME, 'PcEntryListItem_EntryTitle')
                        title = title_element.text.strip()
                    except NoSuchElementException:
                        print("NoSuchElementException: Title")
                        title = ''
                
                    # 링크 가져오기 시도
                    try:
                        link_element = item.find_element(By.CLASS_NAME, 'PcEntryListItem_Link')
                        link = link_element.get_attribute('href')

                    except NoSuchElementException:
                        print("NoSuchElementException: Link")
                        link = ''
                        theme = ""
                        content = ''

                    # 새 탭을 열어 링크로 들어감
                    if link:
                        driver.execute_script("window.open('', '_blank');")
                        driver.switch_to.window(driver.window_handles[1])
                        driver.get(link)
                        time.sleep(3)
                        
                        try:
                            # 전체 내용 가져오기 시도
                            # theme = driver.find_element(By.XPATH, '//*[@id="main"]/div[1]/article/div/div[1]/div[2]/dl').text.strip()
                            content = driver.find_element(By.XPATH, '//*[@id="entryBody"]').text.strip()
                        except NoSuchElementException:
                            print("NoSuchElementException: Theme & Content")
                            theme = ''
                            content = ''
                        
                        content = translate_text(content)
                        title = translate_text(title)
                        current_id += 1

                        with open('crawling/ssy-crawling/Ameba/ameba.csv', 'a', newline='', encoding='utf-8-sig') as csv_file:
                            csv_writer = csv.writer(csv_file)
                            csv_writer.writerow([current_id, find, title, content, link])
                    
                    save_checkpoint(page, p, current_id)
                    driver.close()
                    driver.switch_to.window(driver.window_handles[0])

                    print(f"제목: {title}")
                    print("테마 : ", len(theme))
                    print("내용: ", content)
                    time.sleep(3)
                    count+=1
                
        except NoSuchElementException:
            print("PcEntryList_List 컨테이너를 찾을 수 없습니다.")


    driver.close()


queries = ["東京 グルメ", "東京 美味しいお店", "東京 穴場 グルメ"]

for query in queries:
    find_one_from_ameba(query)