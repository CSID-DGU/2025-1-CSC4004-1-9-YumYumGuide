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
import os
from urllib.parse import urljoin

def translate_to_korean(text):
    """일본어를 한국어로 번역"""
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
    except Exception as e:
        print(f"번역 오류: {e}")
        return "번역 오류"

def setup_driver():
    """Selenium 웹드라이버 설정"""
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # 브라우저 창 숨기기 (선택사항)
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-blink-features=AutomationControlled")
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36")
    
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    driver.set_page_load_timeout(10)
    return driver

def get_category_links(driver):
    """메인 페이지에서 카테고리 링크 추출 (12~33번째)"""
    base_url = "https://www.family.co.jp"
    driver.get(f"{base_url}/goods.html")
    
    print("카테고리 링크 추출 중...")
    time.sleep(3)  # 페이지 로딩 대기
    
    # 카테고리 목록 찾기
    category_items = driver.find_elements(By.CSS_SELECTOR, 'li.ly-mod-layout-clm')
    
    # 12~33번째 카테고리 선택 (인덱스는 0부터 시작하므로 11~32)
    selected_categories = []
    
    # 카테고리가 충분히 있는지 확인
    if len(category_items) >= 33:
        for i in range(11, 33):  # 12~33번째 항목 (인덱스 11~32)
            category = category_items[i]
            try:
                a_tag = category.find_element(By.TAG_NAME, 'a')
                link = a_tag.get_attribute('href')
                category_name = a_tag.text.strip()
                
                selected_categories.append({
                    'name': category_name,
                    'link': link
                })
                print(f"카테고리 발견: {category_name} - {link}")
            except Exception as e:
                print(f"카테고리 링크 추출 중 오류: {e}")
    else:
        print(f"충분한 카테고리가 없습니다. 발견된 카테고리 수: {len(category_items)}")
    
    return selected_categories

def scrape_category_products(driver, category):
    """특정 카테고리의 상품 정보 크롤링"""
    category_name = category['name']
    category_link = category['link']
    
    print(f"\n{category_name} 카테고리 크롤링 중...")
    driver.get(category_link)
    time.sleep(5)  # 페이지 로딩 대기
    
    products = []
    
    # 상품 목록 찾기
    product_items = driver.find_elements(By.CSS_SELECTOR, 'div.js-imgbox-size-rel')
    print(f"{len(product_items)}개 상품 발견")
    
    for idx, product in enumerate(product_items):
        try:
            # 상품명 추출
            name_element = product.find_element(By.CSS_SELECTOR, 'p.ly-mod-infoset3-name')
            name_ja = name_element.text.strip()
            
            # 가격 추출
            try:
                price_element = product.find_element(By.CSS_SELECTOR, 'p.ly-mod-infoset3-price')
                price = price_element.text.strip()
            except:
                price = "가격 정보 없음"
            
            # 이미지 URL 추출
            try:
                img_element = product.find_element(By.CSS_SELECTOR, 'div.ly-wrp-mod-infoset3-img > p.ly-mod-infoset3-img > img')
                img_url = img_element.get_attribute('src')
                
                # 이미지 URL이 상대 경로인 경우 절대 경로로 변환
                if img_url and not img_url.startswith('http'):
                    img_url = urljoin("https://www.family.co.jp", img_url)
            except:
                img_url = "이미지 URL 없음"
            
            # 번역
            name_ko = translate_to_korean(name_ja)
            time.sleep(0.5)  # 과도한 요청 방지
            
            products.append([img_url, name_ja, name_ko, price, category_name])
            
            if idx % 5 == 0:
                print(f"{idx+1}/{len(product_items)} 상품 처리 중...")
                
        except Exception as e:
            print(f"상품 정보 추출 중 오류: {e}")
    
    return products

def main():
    """메인 실행 함수"""
    # Selenium 드라이버 설정
    driver = setup_driver()
    
    try:
        # 카테고리 링크 가져오기
        categories = get_category_links(driver)
        
        if not categories:
            print("크롤링할 카테고리가 없습니다.")
            return
        
        # CSV 파일 준비
        with open("familymart_products.csv", "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.writer(f)
            writer.writerow(["이미지URL", "상품명", "번역된 상품명", "가격", "카테고리"])
            
            # 카테고리별 상품 크롤링
            all_products_count = 0
            for category in categories:
                products = scrape_category_products(driver, category)
                writer.writerows(products)
                all_products_count += len(products)
                print(f"{category['name']} 카테고리에서 {len(products)}개 상품 크롤링 완료")
        
        print(f"\n크롤링 완료! 총 {all_products_count}개 상품이 familymart_products.csv 파일에 저장되었습니다.")
    
    except Exception as e:
        print(f"크롤링 중 오류 발생: {e}")
    
    finally:
        # 브라우저 종료
        driver.quit()

if __name__ == "__main__":
    main()