import requests
from bs4 import BeautifulSoup
import csv
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

def translate_to_korean(text):
    url = "https://translate.googleapis.com/translate_a/single"
    params = {
        "client": "gtx",
        "sl": "ja",
        "tl": "ko",
        "dt": "t",
        "q": text,
    }
    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            result = response.json()
            return result[0][0][0]
        else:
            return "번역 실패"
    except:
        return "번역 오류"

def setup_driver():
    # 브라우저 옵션 설정
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # 브라우저 창 숨기기 (선택사항)
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    # 이미지 로딩을 기다리기 위한 설정
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36")
    
    # 웹드라이버 설정
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    
    # 페이지 로드 타임아웃 설정 - 이미지가 로드될 시간 확보
    driver.set_page_load_timeout(30)
    return driver

def scrape_page(page_num, driver):
    url = f"https://www.sej.co.jp/products/a/thisweek/area/kanto/{page_num}/l15/"
    driver.get(url)
    
    # 페이지가 완전히 로드될 때까지 대기
    time.sleep(5)  # 로딩 시간 증가
    
    products = []

    # Selenium으로 상품 목록 찾기
    items = driver.find_elements(By.CSS_SELECTOR, 'div.list_inner')
    
    for item in items:
        try:
            # 상품명과 가격 먼저 가져오기
            name_tag = item.find_element(By.CSS_SELECTOR, 'div.item_ttl > p > a')
            name_ja = name_tag.text.strip()
            
            price_tag = item.find_element(By.CSS_SELECTOR, 'div.item_price > p')
            price = price_tag.text.strip()
            
            # 이미지 URL 가져오기 - 로딩 GIF 필터링
            img_tag = item.find_element(By.CSS_SELECTOR, 'figure img')
            img_url = img_tag.get_attribute('src')
            
            # 로딩 GIF인지 확인
            loading_gif = "giphy.gif"
            attempt = 0
            max_attempts = 3  # 최대 시도 횟수
            
            # 로딩 GIF라면 실제 이미지가 로드될 때까지 대기
            while loading_gif in img_url and attempt < max_attempts:
                time.sleep(2)  # 2초 대기
                img_url = img_tag.get_attribute('src')  # src 다시 가져오기
                attempt += 1
                
            # 여전히 로딩 GIF라면 data-original 속성 확인
            if loading_gif in img_url:
                data_original = img_tag.get_attribute('data-original')
                if data_original and not loading_gif in data_original:
                    img_url = data_original
            
            # 번역
            name_ko = translate_to_korean(name_ja)
            time.sleep(0.5)  # 과도한 요청 방지 (필수)
            
            products.append([name_ja, name_ko, price, img_url])
        except Exception as e:
            print(f"상품 정보 추출 중 오류 발생: {e}")
    
    return products

# 메인 실행 코드
def main():
    # Selenium 드라이버 설정
    driver = setup_driver()
    
    try:
        # 전체 크롤링 실행
        all_data = []
        for page in range(1, 7):
            print(f"{page}페이지 크롤링 중...")
            page_data = scrape_page(page, driver)
            all_data.extend(page_data)
        
        # CSV 저장
        with open("seven_eleven_new_products.csv", "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.writer(f)
            writer.writerow(["상품명", "번역된 상품명", "가격", "이미지 URL"])
            writer.writerows(all_data)
        
        print("CSV 저장 완료: seven_eleven_new_products.csv")
    
    finally:
        # 브라우저 종료
        driver.quit()

if __name__ == "__main__":
    main()