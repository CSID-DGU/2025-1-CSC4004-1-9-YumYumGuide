from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import NoSuchElementException
import time
import csv
from selenium.webdriver.chrome.options import Options

id = 0
chrome_options = Options()
chrome_options.add_experimental_option("detach", True)
chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")

def find_one_from_tistory(find): 
    global id

    driver_path = r"D:\webdriver\chromedriver-win64\chromedriver-win64\chromedriver.exe"
    # service = Service(driver_path)
    driver = webdriver.Chrome(options=chrome_options)

    time.sleep(3)

    with open('tistory.csv', 'w', newline='', encoding='utf-8-sig') as csv_file:
        csv_writer = csv.writer(csv_file)
        csv_writer.writerow(['id', '키워드', '제목', '내용', '링크'])


    driver.get(f"https://www.tistory.com/search?keyword={find}&type=post&sort=ACCURACY&page=1")

    time.sleep(5)

    page_count_element = driver.find_element(By.XPATH, f'//*[@id="mArticle"]/div/div[2]/ul/li[1]/a/em')
    page_count = page_count_element.text.replace("건", "").replace(",", "")
    page_count_int = int(page_count) // 30
    print(f"전체 페이지: {page_count_int}")
    for page in range(1, page_count_int + 1):
        driver.get(f"https://www.tistory.com/search?keyword={find}&type=post&sort=ACCURACY&page={page}")
        time.sleep(5)

        try:
            post = driver.find_elements(By.CLASS_NAME, f'item_group')
            for item in post:
                # 요소 가져오기
                title = ''
                content = ''
                link = None
                try:
                    title_element = item.find_element(By.CLASS_NAME, 'tit_cont')
                    title = title_element.text.strip()
                except NoSuchElementException:
                    print("NoSuchElementException: Title")
                    title = ''
            
                # 링크 가져오기 시도
                try:
                    link_element = item.find_element(By.CLASS_NAME, 'link_cont')
                    link = link_element.get_attribute('href')

                except NoSuchElementException:
                    print("NoSuchElementException: Link")
                    link = ''
                    content = ''

                # 새 탭을 열어 링크로 들어감
                if link:
                    driver.execute_script("window.open('', '_blank');")
                    driver.switch_to.window(driver.window_handles[1])
                    driver.get(link)
                    time.sleep(3)
                    
                    try:
                        # 전체 내용 가져오기 시도
                        content = driver.find_element(By.CLASS_NAME, 'contents_style').text.strip()
                    except NoSuchElementException:
                        print("NoSuchElementException: Content")
                        content = ''

                    id += 1
                    with open('tistory.csv', 'a', newline='', encoding='utf-8-sig') as csv_file:
                        csv_writer = csv.writer(csv_file)
                        csv_writer.writerow([id, find, title, content, link])
                
                driver.close()
                driver.switch_to.window(driver.window_handles[0])

                print(f"id: {id}")
                print(f"제목: {title}")
                print("내용: ", content)
                time.sleep(3)
                
        except NoSuchElementException:
            print("PcEntryList_List 컨테이너를 찾을 수 없습니다.")


    driver.close()


queries = ["도쿄", "도쿄 맛집", "도쿄 데이트", "도쿄 식당", "도쿄 가볼만한", "도쿄 여행"]

for query in queries:
    find_one_from_tistory(query)