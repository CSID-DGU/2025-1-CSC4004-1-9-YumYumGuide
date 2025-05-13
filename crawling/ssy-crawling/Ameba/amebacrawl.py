from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
import csv
from selenium.common.exceptions import NoSuchElementException
import time
from selenium.webdriver.chrome.options import Options
import requests
import os

id = 1
def translate_text(text, retries=3):
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

def find_one_from_ameba(find, sort):
    global id
    driver_path = r"D:\webdriver\chromedriver-win64\chromedriver-win64\chromedriver.exe"
    # service = Service(driver_path)
    driver = webdriver.Chrome(options=chrome_options)
    time.sleep(3)

    with open('crawling/ssy-crawling/Ameba/ameba.csv', 'a', newline='', encoding='utf-8-sig') as csv_file:
        csv_writer = csv.writer(csv_file)
        csv_writer.writerow(['id', '키워드', '제목', '내용', '링크'])

    try:
        driver.get(f"https://search.ameba.jp/general/entry/{find}.html?p=1&sortField=1")
        page_count_element = driver.find_element(By.XPATH, f'//*[@id="page"]/main/div[3]/div[1]/section/div[2]/div[1]')
        page_count = page_count_element.text.split("件中")[0].replace(",", "")
        page_count_int = int(page_count) // 10 + 1
        print(f"전체 페이지: {page_count_int}")
    except:
        print("검색 결과 없음")
        driver.close()
        return

    # 아메바에서 101 페이지 이상 불러올 수 없음
    for page in range(1, min(page_count_int + 1, 100)):
        driver.get(f"https://search.ameba.jp/general/entry/{find}.html?p={page}&sortField={sort}")

        try:
            for p in range(1, 11):
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
                        id += 1

                        with open('crawling/ssy-crawling/Ameba/ameba.csv', 'a', newline='', encoding='utf-8-sig') as csv_file:
                            csv_writer = csv.writer(csv_file)
                            csv_writer.writerow([id, find, title, content, link])
                    
                    driver.close()
                    driver.switch_to.window(driver.window_handles[0])

                    print(f"제목: {title}")
                    print("테마 : ", len(theme))
                    print("내용: ", len(content))
                    time.sleep(3)
                
        except NoSuchElementException:
            print("PcEntryList_List 컨테이너를 찾을 수 없습니다.")


    driver.close()


def get_first_column(csv_file_path):
    """
    CSV 파일에서 첫 번째 열만 리스트로 반환하는 함수
    
    Args:
        csv_file_path (str): CSV 파일 경로
        
    Returns:
        list: 첫 번째 열의 값들이 담긴 리스트
    """
    first_column = []
    
    # 파일을 열어서 첫 번째 열만 읽기
    with open(csv_file_path, 'r', encoding='utf-8') as file:
        csv_reader = csv.reader(file)
        next(csv_reader)
        for row in csv_reader:
            if row:  # 빈 행이 아닌 경우·
                first_column.append(row[0])
    
    return first_column





csv_files_list = os.listdir("./crawling/jjy-crawling/retty/crawled_data/")
print(csv_files_list)

for file in csv_files_list:
    if file.endswith(".csv"):
        restaurant_name_list = get_first_column(f"./crawling/jjy-crawling/retty/crawled_data/{file}")
        print(restaurant_name_list)
        for query in restaurant_name_list:
            find_one_from_ameba(query, 0)
            find_one_from_ameba(query, 1)
    else:
        print("파일이 csv가 아닙니다.")

