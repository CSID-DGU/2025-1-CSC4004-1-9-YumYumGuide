import csv
import time
import requests
import re
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

def get_google_translate(text, target_language='ko'):
    """Google Translate API를 이용해 텍스트 번역"""
    url = "https://translate.googleapis.com/translate_a/single"
    params = {
        "client": "gtx",
        "sl": "ja",
        "tl": target_language,
        "dt": "t",
        "q": text
    }
    
    response = requests.get(url, params=params)
    if response.status_code == 200:
        try:
            translated_text = ''
            for segment in response.json()[0]:
                if segment[0]:
                    translated_text += segment[0]
            return translated_text
        except Exception as e:
            print(f"번역 과정에서 오류 발생: {e}")
            return text
    else:
        print(f"번역 API 오류: {response.status_code}")
        return text

def extract_tax_included_price(price_text):
    """가격 텍스트에서 세금 포함 가격만 추출"""
    # 숫자와 ¥, 쉼표, 소수점만 남기고 제거
    price_clean = re.sub(r'[^\d¥,.]', '', price_text)
    
    # 숫자만 추출
    numbers = re.findall(r'\d+', price_clean)
    if not numbers:
        return "가격 정보 없음"
    
    # 하나의 숫자 문자열로 합침
    combined_numbers = ''.join(numbers)
    
    # 길이에 따라 세금 포함 가격 추출
    length = len(combined_numbers)
    if length <= 3:  # 1000원 미만
        return price_clean  # 그대로 반환
    elif length <= 6:  # 100~999 -> 뒤에서 3자리
        tax_included = combined_numbers[-3:]
        return f"¥{tax_included}"
    elif length <= 8:  # 1000~9999 -> 뒤에서 4자리
        tax_included = combined_numbers[-4:]
        return f"¥{tax_included}"
    elif length <= 10:  # 10000~99999 -> 뒤에서 5자리
        tax_included = combined_numbers[-5:]
        return f"¥{tax_included}"
    else:  # 100000 이상 -> 뒤에서 절반
        tax_included = combined_numbers[length//2:]
        return f"¥{tax_included}"

def crawl_family_mart():
    # 크롬 드라이버 설정
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    # 웹드라이버 초기화
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    
    # 페이지 로드
    url = "https://www.family.co.jp/goods/newgoods.html"
    driver.get(url)
    print("패밀리마트 신제품 페이지 로딩 중...")
    
    # 페이지 로딩 대기
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "div.js-imgbox-size-rel"))
    )
    
    # 상품 요소 추출
    products = driver.find_elements(By.CSS_SELECTOR, "div.js-imgbox-size-rel")
    print(f"{len(products)}개의 신제품을 찾았습니다.")
    
    result = []
    
    for idx, product in enumerate(products):
        try:
            # 상품명 추출
            product_name = product.find_element(By.CSS_SELECTOR, "a > h3").text.strip()
            
            # 가격 추출 및 세금 포함 가격만 추출
            try:
                price_text = product.find_element(By.CSS_SELECTOR, "a > p.ly-mod-infoset3-txt").text.strip()
                price = extract_tax_included_price(price_text)
            except:
                price = "가격 정보 없음"
            
            # 이미지 URL 추출
            try:
                img_element = product.find_element(By.CSS_SELECTOR, "a > div > p > img")
                img_url = img_element.get_attribute("src")
            except:
                img_url = "이미지 URL 없음"
            
            # 상품명 번역
            translated_name = get_google_translate(product_name)
            
            # 결과 저장
            result.append({
                "product_name": product_name,
                "translated_name": translated_name,
                "price": price,
                "img_url": img_url
            })
            
            print(f"상품 {idx+1} 처리 완료: {product_name} -> {translated_name}, 세금포함가격: {price}")
            
            # 요청 간격 조절 (번역 API 제한 방지)
            time.sleep(0.5)
            
        except Exception as e:
            print(f"상품 {idx+1} 처리 중 오류 발생: {e}")
    
    # 웹드라이버 종료
    driver.quit()
    
    return result

def save_to_csv(products, filename="family_mart_new_products.csv"):
    """결과를 CSV 파일로 저장"""
    with open(filename, 'w', newline='', encoding='utf-8-sig') as csvfile:
        fieldnames = ['product_name', 'translated_name', 'price', 'img_url']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for product in products:
            writer.writerow(product)
    
    print(f"{filename} 파일에 {len(products)}개의 상품 정보가 저장되었습니다.")

if __name__ == "__main__":
    print("패밀리마트 신제품 크롤링을 시작합니다...")
    products = crawl_family_mart()
    save_to_csv(products)
    print("크롤링이 완료되었습니다.")