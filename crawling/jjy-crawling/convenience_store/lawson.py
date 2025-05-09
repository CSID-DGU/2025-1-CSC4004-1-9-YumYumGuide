import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import os
from googletrans import Translator
from urllib.parse import urljoin

# 번역기 초기화
translator = Translator()

# 기본 URL
base_url = "https://www.lawson.co.jp"
start_url = "https://www.lawson.co.jp/recommend/index.html"

# 결과를 저장할 리스트
products_data = []

# 요청 헤더 설정
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

# 시작 페이지 요청
response = requests.get(start_url, headers=headers)
response.encoding = 'utf-8'  # 인코딩 설정

# HTML 파싱
soup = BeautifulSoup(response.text, 'html.parser')

# 카테고리 추출 (li.ttl[7] > ul > li > a)
try:
    category_container = soup.select('li.ttl')[6]
    category_list = category_container.select('ul > li > a')
    
    # 17개 카테고리까지만 처리
    category_count = min(17, len(category_list))
    
    print(f"총 {category_count}개 카테고리를 크롤링합니다.")
    
    for i, category_link in enumerate(category_list[:category_count]):
        category_name = category_link.text.strip()
        category_url = urljoin(base_url, category_link['href'])
        
        print(f"카테고리 {i+1}/{category_count}: {category_name} - {category_url}")
        
        # 카테고리 페이지 요청
        category_response = requests.get(category_url, headers=headers)
        category_response.encoding = 'utf-8'
        category_soup = BeautifulSoup(category_response.text, 'html.parser')
        
        # 상품 목록 추출 (ul.col-4 > li)
        product_items = category_soup.select('ul.col-4 > li')
        
        print(f"  - {len(product_items)}개의 상품을 찾았습니다.")
        
        for product in product_items:
            try:
                # 이미지 URL
                img_tag = product.select_one('p.img > a > img')
                img_url = urljoin(base_url, img_tag['src']) if img_tag and 'src' in img_tag.attrs else None
                
                # 상품명
                product_name_tag = product.select_one('p.ttl')
                product_name_jp = product_name_tag.text.strip() if product_name_tag else "상품명 없음"
                
                # 상품명 번역 (일본어 -> 한국어)
                try:
                    product_name_kr = translator.translate(product_name_jp, src='ja', dest='ko').text
                except Exception as e:
                    print(f"번역 오류: {e}")
                    product_name_kr = product_name_jp  # 오류 시 원본 유지
                
                # 가격
                price_tag = product.select_one('p.price')
                price = price_tag.select('span')[0].text.strip() if price_tag and price_tag.select('span') else "가격 정보 없음"
                
                # 데이터 저장
                products_data.append({
                    '카테고리리': category_name,
                    '상품명': product_name_jp,
                    '번역된 상품명': product_name_kr,
                    '가격': price,
                    'image_url': img_url
                })
                
            except Exception as e:
                print(f"상품 처리 중 오류 발생: {e}")
        
        # 서버 부하 방지를 위한 대기
        time.sleep(1)
        
    # 결과를 DataFrame으로 변환
    df = pd.DataFrame(products_data)
    
    # CSV 파일로 저장
    output_file = 'lawson_products.csv'
    df.to_csv(output_file, index=False, encoding='utf-8-sig')  # utf-8-sig는 Excel에서 한글 깨짐 방지
    
    print(f"\n크롤링 완료! 총 {len(products_data)}개의 상품 데이터를 '{output_file}'에 저장했습니다.")
    
except Exception as e:
    print(f"크롤링 중 오류 발생: {e}")