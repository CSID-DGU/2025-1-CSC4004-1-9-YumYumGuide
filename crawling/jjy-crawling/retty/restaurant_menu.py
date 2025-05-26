import pandas as pd
import time
import random
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import googletrans
import csv
import os
import pickle

# Google 번역기 초기화
translator = googletrans.Translator()

# 입력 파일 경로 설정

input_file = 'backend/data/restaurant/도쿄역 주변_restaurant_details_eng_preprocessed_1501.csv'
# 출력 파일 경로 설정
output_file = 'backend/data/menu/도쿄역 주변_menu_data.csv'
>>>>>>> ff902da808c5cf78eb62d2513944bbf5ec92e6f1

# 체크포인트 파일 경로 설정
checkpoint_file = 'retty_scraper_checkpoint.pkl'

# Selenium 설정 - 처리 속도를 높이기 위한 옵션 추가
chrome_options = Options()
chrome_options.add_argument('--headless')  # 브라우저를 표시하지 않고 실행
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--disable-gpu')
chrome_options.add_argument('--disable-extensions')
chrome_options.add_argument('--disable-infobars')
chrome_options.add_argument('--disable-notifications')
chrome_options.add_argument('--blink-settings=imagesEnabled=false')  # 이미지 로딩 비활성화로 속도 향상
chrome_options.page_load_strategy = 'eager'  # 페이지가 완전히 로드되기 전에 실행 (속도 향상)
chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

# 메뉴 번역 캐시 (중복 번역 방지)
translation_cache = {}

def translate_to_korean(text):
    """일본어 텍스트를 한국어로 번역 (캐시 사용)"""
    if text in translation_cache:
        return translation_cache[text]
    
    try:
        result = translator.translate(text, src='ja', dest='ko')
        translated = result.text
        translation_cache[text] = translated  # 캐시에 저장
        return translated
    except Exception as e:
        print(f"번역 오류: {e}")
        return text  # 오류 발생 시 원본 텍스트 반환

def scrape_menu(driver, restaurant_url, restaurant_name, translated_name):
    """식당의 메뉴 정보를 크롤링"""
    # 메뉴 페이지 URL 생성
    menu_url = f"{restaurant_url}menu/#dishes"
    print(f"메뉴 페이지 접근 중: {menu_url}")
    
    try:
        driver.get(menu_url)
        
        # 페이지 로딩 대기 시간 줄임
        try:
            WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "div.menu-price-list__row"))
            )
        except TimeoutException:
            print("메뉴 항목을 찾을 수 없습니다. 다음 식당으로 넘어갑니다.")
            return []
        
        # 대기 시간 줄임
        time.sleep(random.uniform(0.5, 0.8))
        
        # 메뉴 항목 찾기
        menu_items = driver.find_elements(By.CSS_SELECTOR, "div.menu-price-list__row")
        
        # 메뉴 데이터 저장을 위한 리스트
        menu_data = []
        
        # 최대 10개의 메뉴 항목만 처리
        for i, item in enumerate(menu_items[:10]):
            try:
                # 메뉴명 추출
                menu_name_element = item.find_element(By.CSS_SELECTOR, "dt.menu-price-list__name")
                menu_name = menu_name_element.text.strip()
                
                # 메뉴명 번역
                translated_menu = translate_to_korean(menu_name)
                
                # 가격 추출 (없을 수도 있음)
                try:
                    price_element = item.find_element(By.CSS_SELECTOR, "dd.menu-price-list__price")
                    price = price_element.text.strip()
                except NoSuchElementException:
                    price = ""
                
                # 데이터 추가 (이미지 URL 제외)
                menu_data.append([restaurant_url, restaurant_name, translated_name, translated_menu, price])
                
            except Exception as e:
                print(f"메뉴 항목 처리 중 오류: {e}")
                continue
        
        # 결과 반환
        return menu_data
    
    except Exception as e:
        print(f"크롤링 오류: {e}")
        return []

def save_checkpoint(last_index):
    """현재 진행 상황을 체크포인트 파일에 저장"""
    with open(checkpoint_file, 'wb') as f:
        pickle.dump(last_index, f)
    print(f"체크포인트 저장: 인덱스 {last_index}")

def load_checkpoint():
    """체크포인트 파일에서 마지막 처리한 인덱스 로드"""
    if os.path.exists(checkpoint_file):
        with open(checkpoint_file, 'rb') as f:
            return pickle.load(f)
    return 0  # 체크포인트 파일이 없으면 0부터 시작

def main():
    # CSV 파일에서 식당 정보 읽기
    try:
        df = pd.read_csv(input_file)
        print(f"총 {len(df)}개의 식당이 로드되었습니다.")
    except Exception as e:
        print(f"CSV 파일 로드 중 오류: {e}")
        return
    
    # 체크포인트에서 마지막으로 처리한 인덱스 로드
    start_index = load_checkpoint()
    print(f"체크포인트에서 불러온 시작 인덱스: {start_index}")
    
    # 출력 CSV 파일 초기화 또는 준비
    if start_index == 0:
        # 새로 시작하는 경우, 파일 초기화
        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['식당 url', 'restaurant_name', 'translated_restaurant_name', 'menu', 'price', 'img_url'])
        print("새 CSV 파일이 생성되었습니다.")
    else:
        # 이어서 진행하는 경우, 파일이 존재하는지 확인
        if not os.path.exists(output_file):
            with open(output_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(['식당 url', 'restaurant_name', 'translated_restaurant_name', 'menu', 'price', 'img_url'])
            print("CSV 파일이 존재하지 않아 새로 생성했습니다.")
    
    # 웹드라이버 초기화
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        # 처리할 식당 선택 (시작 인덱스부터)
        restaurants_to_process = df.iloc[start_index:]
        
        # 임시 데이터 저장용 리스트
        all_menu_data = []
        
        # 각 식당에 대해 크롤링 수행
        for i, (index, row) in enumerate(restaurants_to_process.iterrows()):
            current_index = start_index + i
            restaurant_url = row['url']
            restaurant_name = row['restaurant_name']
            translated_name = row['translated_restaurant_name']
            
            print(f"\n처리 중: {current_index+1}/{len(df)} - {translated_name}")
            
            # 메뉴 크롤링
            menu_data = scrape_menu(driver, restaurant_url, restaurant_name, translated_name)
            
            # 결과를 임시 저장
            if menu_data:
                all_menu_data.extend(menu_data)
                print(f"{len(menu_data)}개의 메뉴 항목이 수집되었습니다.")
            else:
                print("메뉴 데이터를 가져오지 못했습니다.")
            
            # 100개의 식당을 처리할 때마다 또는 마지막 식당일 때 CSV에 저장하고 체크포인트 갱신
            if (i + 1) % 100 == 0 or current_index == len(df) - 1:
                # 결과를 CSV에 추가
                with open(output_file, 'a', newline='', encoding='utf-8') as f:
                    writer = csv.writer(f)
                    writer.writerows(all_menu_data)
                
                print(f"{len(all_menu_data)}개의 메뉴 항목이 CSV 파일에 저장되었습니다.")
                all_menu_data = []  # 임시 저장소 비우기
                
                # 체크포인트 저장
                save_checkpoint(current_index + 1)
            
            # 차단 방지를 위한 랜덤 대기 시간 (1~3초로 줄임)
            wait_time = random.uniform(0.5, 1)
            print(f"{wait_time:.1f}초 대기 중...")
            time.sleep(wait_time)
            
            # 진행 상황 표시
            print(f"진행률: {(current_index+1)/len(df)*100:.1f}%")
            
    except KeyboardInterrupt:
        print("\n사용자에 의해 중단되었습니다.")
        # 중단 시점까지의 데이터 저장
        if all_menu_data:
            with open(output_file, 'a', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerows(all_menu_data)
            print(f"{len(all_menu_data)}개의 메뉴 항목이 CSV 파일에 저장되었습니다.")
        
        # 현재 인덱스 저장
        save_checkpoint(start_index + i)
        
    except Exception as e:
        print(f"실행 중 오류: {e}")
        # 오류 발생 시점까지의 데이터 저장
        if all_menu_data:
            with open(output_file, 'a', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerows(all_menu_data)
            print(f"{len(all_menu_data)}개의 메뉴 항목이 CSV 파일에 저장되었습니다.")
        
        # 현재 인덱스 저장
        save_checkpoint(start_index + i)
        
    finally:
        # 웹드라이버 종료
        driver.quit()
        print("크롤링 완료 또는 중단됨")

if __name__ == "__main__":
    main()