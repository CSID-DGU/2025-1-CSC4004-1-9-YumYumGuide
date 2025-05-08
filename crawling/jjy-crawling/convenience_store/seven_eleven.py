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
import re

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
    chrome_options.add_argument("--headless")  # 브라우저 창 숨기기
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    # 이미지 로딩을 기다리기 위한 설정
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36")
    
    # 웹드라이버 설정
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    
    # 페이지 로드 타임아웃 설정
    driver.set_page_load_timeout(30)
    return driver

def get_categories(driver):
    # 세븐일레븐 상품 메인 페이지 접속
    url = "https://www.sej.co.jp/products/"
    driver.get(url)
    time.sleep(3)
    
    categories = []
    
    # ul.col5-01 내의 li 요소들 찾기
    category_elements = driver.find_elements(By.CSS_SELECTOR, "ul.col5-01 > li")
    
    # 마지막 카테고리 제외하고 18개 카테고리 추출
    for i, element in enumerate(category_elements):
        if i >= 18:  # 18개까지만 수집
            break
            
        try:
            a_tag = element.find_element(By.TAG_NAME, "a")
            category_url = a_tag.get_attribute("href")
            category_name = a_tag.text.strip()
            
            # 카테고리 URL이 /products/a/ 로 시작하는지 확인
            if "/products/a/" in category_url:
                # 카테고리 식별자 추출 (URL에서 마지막 부분)
                category_id = category_url.rstrip('/').split('/')[-1]
                
                categories.append({
                    'id': category_id,
                    'name': category_name,
                    'url': category_url
                })
                
                print(f"카테고리 발견: {category_name} ({category_url})")
        except Exception as e:
            print(f"카테고리 추출 중 오류: {e}")
    
    return categories

def scrape_category_products(driver, category):
    # 카테고리의 간토 지역 URL 생성
    kanto_url = f"{category['url']}kanto/"
    print(f"\n{category['name']} 카테고리 간토 지역 상품 크롤링 중...")
    print(f"URL: {kanto_url}")
    
    driver.get(kanto_url)
    time.sleep(5)  # 페이지 로딩 대기
    
    products = []
    
    # 상품 목록 찾기
    try:
        items = driver.find_elements(By.CSS_SELECTOR, 'div.list_inner')
        print(f"{len(items)}개 상품 발견")
        
        for item in items:
            try:
                # 상품명과 가격 먼저 가져오기
                name_tag = item.find_element(By.CSS_SELECTOR, 'div.item_ttl > p > a')
                name_ja = name_tag.text.strip()
                
                price_tag = item.find_element(By.CSS_SELECTOR, 'div.item_price > p')
                price = price_tag.text.strip()
                
                # 이미지 URL 가져오기
                img_url = ""
                try:
                    img_tag = item.find_element(By.CSS_SELECTOR, 'figure img')
                    img_url = img_tag.get_attribute('src')
                    
                    # 로딩 GIF인지 확인
                    loading_gif = "giphy.gif"
                    attempt = 0
                    max_attempts = 3
                    
                    # 로딩 GIF라면 실제 이미지가 로드될 때까지 대기
                    while loading_gif in img_url and attempt < max_attempts:
                        time.sleep(2)
                        img_url = img_tag.get_attribute('src')
                        attempt += 1
                    
                    # 여전히 로딩 GIF라면 data-original 속성 확인
                    if loading_gif in img_url:
                        data_original = img_tag.get_attribute('data-original')
                        if data_original and loading_gif not in data_original:
                            img_url = data_original
                except:
                    img_url = "이미지 없음"
                
                # 번역
                name_ko = translate_to_korean(name_ja)
                time.sleep(0.5)  # 과도한 요청 방지
                
                # 상품 정보 저장
                products.append({
                    'category_id': category['id'],
                    'category_name': category['name'],
                    'name_ja': name_ja,
                    'name_ko': name_ko,
                    'price': price,
                    'img_url': img_url
                })
                
                print(f"상품 추가: {name_ja}")
            except Exception as e:
                print(f"상품 정보 추출 중 오류: {e}")
    except Exception as e:
        print(f"카테고리 페이지 크롤링 중 오류: {e}")
    
    return products

def main():
    # Selenium 드라이버 설정
    driver = setup_driver()
    
    try:
        # 모든 카테고리 가져오기
        categories = get_categories(driver)
        print(f"총 {len(categories)}개 카테고리를 찾았습니다.")
        
        # 모든 상품 데이터를 저장할 리스트
        all_products = []
        
        # 카테고리별로 상품 크롤링
        for category in categories:
            category_products = scrape_category_products(driver, category)
            all_products.extend(category_products)
            time.sleep(1)  # 다음 카테고리로 넘어가기 전 잠시 대기
        
        # CSV 파일로 저장
        with open("seven_eleven_products.csv", "w", newline="", encoding="utf-8-sig") as f:
            fieldnames = ['category_id', 'category_name', 'name_ja', 'name_ko', 'price', 'img_url']
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(all_products)
        
        print(f"\n총 {len(all_products)}개 상품 정보를 CSV 파일로 저장했습니다.")
        print("CSV 저장 완료: seven_eleven_products.csv")
    
    finally:
        # 브라우저 종료
        driver.quit()

if __name__ == "__main__":
    main()