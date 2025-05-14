import time
import os
import random
import pandas as pd
import argparse
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import concurrent.futures
import requests
import json
import pickle
from urllib.parse import quote
from tqdm import tqdm  # 진행률 표시용

class RettyRestaurantCrawler:
    def __init__(self, delay_min=0.03, delay_max=0.05, max_retries=2, headless=True, batch_translate=True):
        """
        retty.me 웹사이트의 식당 정보를 크롤링하는 클래스
        
        Args:
            delay_min (int): 요청 간 최소 대기 시간(초)
            delay_max (int): 요청 간 최대 대기 시간(초)
            max_retries (int): 오류 발생 시 최대 재시도 횟수
            headless (bool): 헤드리스 모드 사용 여부
            batch_translate (bool): 일괄 번역 사용 여부
        """
        self.delay_min = delay_min
        self.delay_max = delay_max
        self.max_retries = max_retries
        self.batch_translate = batch_translate
        self.translation_cache = {}  # 번역 캐시
        
        # 지역 정보 맵핑
        self.area_info = {
            
            "시부야": {
                "url": "https://retty.me/area/PRE13/ARE8/",
                "selection_url": "https://retty.me/selection/area/are8/"
             },
             "신주쿠": {
                "url": "https://retty.me/area/PRE13/ARE1/",
                "selection_url": "https://retty.me/selection/area/are1/"
            },
            # ,
            # "우에노" : {
            #      "selection_url" : "https://retty.me/selection/area/sub901/"
            #  },
            #  "아사쿠사": {
            #     "selection_url": "https://retty.me/selection/area/sub902/"
            # },
            #  "이케부코로" : {
            #      "selection_url" : "https://retty.me/selection/area/are662/"
            #  }
             

        }
        
        # 이미 수집한 식당 URL 추적 (지역별)
        self.visited_restaurants = self._load_visited_restaurants()
        
        # Selenium 설정
        chrome_options = Options()
        if headless:
            chrome_options.add_argument("--headless=new")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1280,720")  # 작은 해상도로 변경하여 리소스 사용 감소
        chrome_options.add_argument("--disable-notifications")
        chrome_options.add_argument("--disable-popup-blocking")
        chrome_options.add_argument("--disable-extensions")  # 확장 프로그램 비활성화
        
        # 성능 향상을 위한 추가 설정
        prefs = {
            "profile.default_content_setting_values.notifications": 2,
            "profile.managed_default_content_settings.images": 2,
            "profile.default_content_setting_values.cookies": 2,
            "profile.default_content_setting_values.plugins": 2,
            "profile.default_content_setting_values.geolocation": 2,
            "profile.default_content_setting_values.media_stream": 2,
        }
        chrome_options.add_experimental_option("prefs", prefs)
        
        # User-Agent 설정
        #user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
        #chrome_options.add_argument(f'user-agent={user_agent}')
        
        user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        chrome_options.add_argument(f'user-agent={user_agent}')


        # WebDriver 초기화
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.set_page_load_timeout(4)  # 페이지 로드 타임아웃 설정
        self.driver.implicitly_wait(0.3)  # 암시적 대기 시간 감소
        
        # 번역 풀 생성
        self.executor = concurrent.futures.ThreadPoolExecutor(max_workers=5)
        self.translation_futures = {}

    def _load_visited_restaurants(self):
        """이미 방문한 식당 URL 목록 로드"""
        visited = {}
        data_dir = "crawled_data"
        visited_file = os.path.join(data_dir, "visited_restaurants.pkl")
        
        # 디렉토리 확인 및 생성
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
        
        # 파일이 존재하면 로드
        if os.path.exists(visited_file):
            try:
                with open(visited_file, 'rb') as f:
                    visited = pickle.load(f)
                print(f"방문 기록 로드 완료: {sum(len(urls) for urls in visited.values())}개의 식당 URL")
            except Exception as e:
                print(f"방문 기록 로드 실패: {e}")
                visited = {}
        
        # 모든 지역에 대한 기본 항목 생성
        for area in self.area_info.keys():
            if area not in visited:
                visited[area] = set()
        
        return visited

    def _save_visited_restaurants(self):
        """방문한 식당 URL 목록 저장"""
        data_dir = "crawled_data"
        visited_file = os.path.join(data_dir, "visited_restaurants.pkl")
        
        try:
            with open(visited_file, 'wb') as f:
                pickle.dump(self.visited_restaurants, f)
            print(f"방문 기록 저장 완료: {sum(len(urls) for urls in self.visited_restaurants.values())}개의 식당 URL")
        except Exception as e:
            print(f"방문 기록 저장 실패: {e}")

    def __del__(self):
        """소멸자: WebDriver 종료 및 실행기 정리"""
        try:
            if hasattr(self, 'executor'):
                self.executor.shutdown(wait=False)
            if hasattr(self, 'driver'):
                self.driver.quit()
            # 저장되지 않은 방문 기록이 있으면 저장
            if hasattr(self, 'visited_restaurants'):
                self._save_visited_restaurants()
        except:
            pass

    def _random_delay(self, use_minimum=False):
        """요청 간 랜덤한 시간 지연을 추가하여 크롤링 탐지 방지"""
        if use_minimum:
            delay = self.delay_min
        else:
            delay = random.uniform(self.delay_min, self.delay_max)
        time.sleep(delay)

    def get_restaurant_links(self, area_name, selection_url, max_restaurants=300, start_page=1):
        """지역 URL에서 식당 링크 목록 가져오기"""
        restaurant_links = []
        restaurant_names = []
        visited_urls = self.visited_restaurants.get(area_name, set())
        
        # 최대 수집할 식당 수가 0이면 빈 목록 반환
        if max_restaurants <= 0:
            return []
        
        # 페이지 번호 초기화
        page = start_page
        max_pages = 100  # 안전장치: 최대 페이지 수 제한
        new_found = 0
        
        print(f"{area_name} 지역에서 {max_restaurants}개의 새로운 식당 찾는 중...")
        
        # 진행 표시기 초기화
        pbar = tqdm(total=max_restaurants, desc=f"새로운 식당 링크 수집 중")
        
        while len(restaurant_links) < max_restaurants and page <= max_pages:
            if page > 1:
                current_url = f"{selection_url}?page={page}"
            else:
                current_url = f"{selection_url}"
                
            print(f"페이지 {page} 크롤링 중: {current_url}")
            
            try:
                self.driver.get(current_url)
                self._random_delay(use_minimum=True)
                
                # 페이지가 로드될 때까지 짧은 시간 대기
                try:
                    WebDriverWait(self.driver, 4).until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, 'a.selection-restaurant__restaurant-link'))
                    )
                except TimeoutException:
                    print("페이지 로드 지연, 계속 진행합니다.")
                
                # 식당 링크 추출
                restaurant_elements = self.driver.find_elements(By.CSS_SELECTOR, 'a.selection-restaurant__restaurant-link')
                
                if not restaurant_elements:
                    print(f"더 이상 식당이 없거나 마지막 페이지에 도달했습니다.")
                    break
                
                page_new_found = 0
                
                # 모든 요소를 한 번에 처리
                for element in restaurant_elements:
                    link = element.get_attribute('href')
                    
                    # 이미 방문한 URL인지 확인
                    if link in visited_urls:
                        continue
                    
                    # 식당 이름 추출
                    try:
                        name_element = element.find_element(By.CSS_SELECTOR, '.selection-restaurant-name__text')
                        name = name_element.text.strip()
                    except NoSuchElementException:
                        name = "이름 없음"
                    
                    restaurant_links.append(link)
                    restaurant_names.append(name)
                    page_new_found += 1
                    
                    # 목표 수량에 도달하면 중단
                    if len(restaurant_links) >= max_restaurants:
                        break
                
                # 새로운 식당을 찾지 못했으면 다음 페이지로 이동
                if page_new_found == 0:
                    print(f"페이지 {page}에서 새로운 식당을 찾지 못했습니다.")
                else:
                    new_found += page_new_found
                    print(f"페이지 {page}에서 {page_new_found}개의 새로운 식당을 찾았습니다.")
                    
                # 진행 표시기 업데이트
                pbar.update(page_new_found)
                
                # 다음 페이지로 이동
                page += 1
                    
            except TimeoutException:
                print(f"페이지 로딩 시간 초과: {current_url}")
                page += 1  # 다음 페이지로 이동
            except Exception as e:
                print(f"페이지 처리 중 오류 발생: {e}")
                page += 1  # 다음 페이지로 이동
        
        # 진행 표시기 닫기
        pbar.close()
        
        print(f"{area_name} 지역에서 총 {new_found}개의 새로운 식당 링크 수집 완료")
        
        # 수집된 링크와 이름 반환
        return list(zip(restaurant_names, restaurant_links))

    def get_restaurant_details(self, restaurant_url):
        """식당 URL에서 세부 정보 가져오기 (최적화 버전)"""
        details = {}
        
        try:
            self.driver.get(restaurant_url)
            self._random_delay(use_minimum=True)
            
            # 한 번에 모든 테이블 행 요소 가져오기
            try:
                WebDriverWait(self.driver, 4).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, '.images__image'))
                )
            except TimeoutException:
                pass
                
            # title 요소와 body 요소를 한 번에 모두 가져오기
            title_elements = self.driver.find_elements(By.CSS_SELECTOR, 'th.restaurant-info-table__title')
            body_elements = self.driver.find_elements(By.CSS_SELECTOR, 'td.restaurant-info-table__body')
            image_elements = self.driver.find_elements(By.CSS_SELECTOR, 'img.images__image')


            # 텍스트 정보 추출
            for i, title_element in enumerate(title_elements):
                if i < len(body_elements):
                    try:
                        title_text = title_element.text.strip()
                        value_text = body_elements[i].text.strip()
                        details[title_text] = value_text if value_text else "null"
                    except Exception:
                        continue

            # 이미지 URL 추가
            # 이미지 URL 처리 부분
            try:
                if image_elements:
                    image_url = image_elements[0].get_attribute("src")
                    
                    # URL이 S3 또는 다른 CDN을 사용하는지 체크
                    if "s3.amazonaws.com" in image_url or "cloudfront.net" in image_url:
                        # CDN URL인 경우, 유효성 검증
                        import requests
                        from requests.exceptions import RequestException
                        
                        try:
                            # HEAD 요청으로 빠르게 확인 (최소한의 데이터만 전송)
                            headers = {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
                                'Referer': restaurant_url
                            }
                            # 짧은 타임아웃으로 빠른 확인
                            response = requests.head(image_url, headers=headers, timeout=2)
                            
                            if response.status_code == 200:
                                details["image"] = image_url
                            else:
                                # 원본 이미지 URL 패턴 수정 시도
                                # 예: URL에서 특정 파라미터 제거 또는 변경
                                modified_url = image_url.split('?')[0]  # 쿼리 파라미터 제거
                                details["image"] = modified_url
                                print(f"원본 URL 대신 수정된 URL 사용: {modified_url}")
                        except RequestException:
                            # 요청 실패 시 원본 URL 그대로 사용
                            details["image"] = image_url
                            print(f"URL 검증 실패, 원본 URL 사용: {image_url}")
                    else:
                        # 일반 URL인 경우 그대로 사용
                        details["image"] = image_url
                else:
                    print('이미지 없음')
                    details["image"] = "null"
            except Exception as e:
                print(f'이미지 처리 오류: {e}')
                details["image"] = "null"

            return details

            
        except Exception as e:
            print(f"세부 정보 가져오기 실패: {e}")
            return {}

    def translate_text(self, text, retries=3):
        """안정적인 번역 API를 사용하여 일본어를 한국어로 번역"""
        if not text or text == "null":
            return text
            
        # 캐시 확인
        if text in self.translation_cache:
            return self.translation_cache[text]
        
        # LibreTranslate API 사용 (무료 API)
        for i in range(retries):
            try:
                # 무료 번역 API 서비스 URL (예시)
                url = "https://translate.googleapis.com/translate_a/single"
                params = {
                    "client": "gtx",
                    "sl": "ja",
                    "tl": "ko",
                    "dt": "t",
                    "q": text
                }
                
                response = requests.get(url, params=params)
                
                if response.status_code == 200:
                    # Google Translate API 응답 파싱
                    result = response.json()
                    translated_text = ''.join([sentence[0] for sentence in result[0]])
                    
                    # 결과 캐싱
                    self.translation_cache[text] = translated_text
                    return translated_text
                    
                time.sleep(0.5)  # 재시도 전 짧은 대기
                
            except Exception as e:
                print(f"번역 시도 {i+1}/{retries} 실패: {str(e)}")
                time.sleep(1)  # 오류 후 대기
        
        # 모든 시도 실패 시 원본 반환
        print(f"번역 실패, 원본 텍스트 반환: {text[:20]}...")
        return text

    def submit_translation_jobs(self, texts_to_translate):
        """번역 작업을 병렬로 제출"""
        translation_jobs = {}
        
        for key, text in texts_to_translate.items():
            if not text or text == "null":
                translation_jobs[key] = text
                continue
                
            # 캐시 확인
            if text in self.translation_cache:
                translation_jobs[key] = self.translation_cache[text]
                continue
                
            # 번역 작업 제출
            future = self.executor.submit(self.translate_text, text)
            self.translation_futures[key] = future
            
        return translation_jobs

    def collect_translations(self, translation_jobs):
        """제출된 번역 작업 결과 수집"""
        results = dict(translation_jobs)  # 이미 완료된 번역으로 시작
        
        # 진행 중인 번역 작업 결과 수집
        for key, future in self.translation_futures.items():
            try:
                results[key] = future.result(timeout=10)  # 10초 타임아웃
            except Exception as e:
                print(f"번역 작업 완료 실패: {str(e)[:100]}")
                # 원본 텍스트를 가져올 수 없으므로 키를 값으로 사용
                results[key] = key
                
        # 사용된 작업 정리
        self.translation_futures = {}
        
        return results

    def _get_total_restaurant_count(self, area_name):
        """특정 지역에서 이미 수집한 식당 수 확인"""
        # 기존 파일에서 식당 수 확인
        data_dir = "crawled_data"
        existing_count = 0
        
        # 디렉토리가 없으면 0 반환
        if not os.path.exists(data_dir):
            return 0
            
        # 지역별 파일 검색
        for file in os.listdir(data_dir):
            if file.startswith(f"{area_name}_restaurant_details_") and file.endswith(".csv"):
                try:
                    count_str = file.replace(f"{area_name}_restaurant_details_", "").replace(".csv", "")
                    count = int(count_str)
                    existing_count = max(existing_count, count)
                except ValueError:
                    continue
        
        return existing_count

    def crawl_area(self, area_name, max_restaurants=300):
        """지역 이름을 기준으로 식당 정보 크롤링 (증분 크롤링 지원)"""
        if area_name not in self.area_info:
            raise ValueError(f"지원하지 않는 지역: {area_name}")
            
        area_info = self.area_info[area_name]
        
        # 이미 수집한 식당 수 확인
        existing_count = self._get_total_restaurant_count(area_name)
        new_count = existing_count + max_restaurants
        
        print(f"{area_name} 지역에서 이미 {existing_count}개의 식당 정보가 수집되어 있습니다.")
        print(f"이번 크롤링에서 {max_restaurants}개를 추가로 수집하여 총 {new_count}개를 목표로 합니다.")
        
        # 식당 링크 수집 (이미 방문한 URL 제외)
        restaurants = self.get_restaurant_links(area_name, area_info["selection_url"], max_restaurants)
        
        if not restaurants:
            print(f"{area_name} 지역에서 새로운 식당을 찾지 못했습니다.")
            return pd.DataFrame()
            
        results = []
        batch_size = 10  # 한 번에 처리할 식당 수
        
        print(f"{len(restaurants)}개의 새로운 식당에서 정보 수집 중...")
        
        # 진행 표시기 초기화
        pbar = tqdm(total=len(restaurants), desc="식당 정보 수집")
        
        # 배치 처리
        for batch_start in range(0, len(restaurants), batch_size):
            batch_end = min(batch_start + batch_size, len(restaurants))
            batch = restaurants[batch_start:batch_end]
            
            all_texts_to_translate = {}  # 전체 번역 대상 텍스트
            batch_data = []  # 배치 내 식당 데이터
            
            # 1단계: 각 식당의 데이터 수집
            for i, (restaurant_name, restaurant_url) in enumerate(batch):
                restaurant_idx = batch_start + i + 1
                
                try:
                    # 세부 정보 가져오기
                    details = self.get_restaurant_details(restaurant_url)
                    
                    # 방문한 URL 목록에 추가
                    self.visited_restaurants.setdefault(area_name, set()).add(restaurant_url)
                    
                    # 번역 대상 텍스트 수집
                    texts_to_translate = {
                        f"name_{restaurant_idx}": restaurant_name
                    }
                    
                    # 세부 정보 번역 대상 추가
                    for key, value in details.items():
                        texts_to_translate[f"key_{restaurant_idx}_{key}"] = key
                        texts_to_translate[f"value_{restaurant_idx}_{key}"] = value
                    
                    # 전체 번역 목록에 추가
                    all_texts_to_translate.update(texts_to_translate)
                    
                    # 원본 데이터 저장
                    restaurant_data = {
                        'restaurant_idx': restaurant_idx,
                        'name': restaurant_name,
                        'details': details,
                        'url': restaurant_url  # URL도 저장
                    }
                    batch_data.append(restaurant_data)
                    
                except Exception as e:
                    print(f"식당 '{restaurant_name}' 처리 중 오류 발생: {e}")
                    continue
                
                # 진행 표시기 업데이트
                pbar.update(1)
            
            # 2단계: 일괄 번역 작업 시작
            if self.batch_translate and all_texts_to_translate:
                print(f"배치 번역 작업 시작 ({len(all_texts_to_translate)}개 항목)...")
                translation_jobs = self.submit_translation_jobs(all_texts_to_translate)
                translations = self.collect_translations(translation_jobs)
                print("배치 번역 작업 완료")
                
                # 3단계: 번역 결과를 식당 데이터에 적용
                for restaurant_data in batch_data:
                    idx = restaurant_data['restaurant_idx']
                    
                    # 기본 정보 번역
                    translated_name = translations.get(f"name_{idx}", restaurant_data['name'])
                    
                    # 최종 데이터 구성 - 식당 이름은 원본과 번역 모두 저장, 나머지는 번역만 저장
                    final_data = {
                        '식당 이름': restaurant_data['name'],
                        '번역된 식당 이름': translated_name,
                        'URL': restaurant_data['url']  # URL 추가
                    }
                    
                    # 세부 정보는 번역된 키와 값만 저장
                    for key, value in restaurant_data['details'].items():
                        translated_key = translations.get(f"key_{idx}_{key}", key)
                        translated_value = translations.get(f"value_{idx}_{key}", value)
                        
                        # 번역된 키를 컬럼명으로 사용
                        final_data[translated_key] = translated_value
                    
                    results.append(final_data)
            else:
                # 배치 번역을 사용하지 않는 경우 각각 처리
                for restaurant_data in batch_data:
                    try:
                        # 기본 정보 번역
                        translated_name = self.translate_text(restaurant_data['name'])
                        
                        # 최종 데이터 구성
                        final_data = {
                            '식당 이름': restaurant_data['name'],
                            '번역된 식당 이름': translated_name,
                            'URL': restaurant_data['url']  # URL 추가
                        }
                        
                        # 세부 정보는 번역된 키와 값만 저장
                        for key, value in restaurant_data['details'].items():
                            translated_key = self.translate_text(key)
                            translated_value = self.translate_text(value)
                            
                            # 번역된 키를 컬럼명으로 사용
                            final_data[translated_key] = translated_value
                        
                        results.append(final_data)
                    except Exception as e:
                        print(f"데이터 처리 중 오류 발생: {e}")
                        continue
        
        # 방문 기록 저장
        self._save_visited_restaurants()
        
        # 진행 표시기 닫기
        pbar.close()
        
        return pd.DataFrame(results)

    def save_to_csv(self, df, area_name, output_dir='crawled_data'):
        """DataFrame을 증분 CSV 파일로 저장"""
        if df.empty:
            print(f"저장할 데이터가 없습니다: {area_name}")
            return None
        
        # 디렉토리 확인 및 생성
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        # 기존 데이터 확인 및 병합
        existing_count = self._get_total_restaurant_count(area_name)
        new_count = existing_count + len(df)
        
        # 이전 데이터와 병합할 데이터 프레임 준비
        all_data = []
        
        # 이전 최대 개수의 CSV 찾기
        if existing_count > 0:
            previous_file = os.path.join(output_dir, f"{area_name}_restaurant_details_{existing_count}.csv")
            if os.path.exists(previous_file):
                try:
                    previous_df = pd.read_csv(previous_file, encoding='utf-8-sig')
                    all_data.append(previous_df)
                    print(f"기존 데이터 {len(previous_df)}개 로드 완료")
                except Exception as e:
                    print(f"기존 데이터 로드 실패: {e}")
        
        # 새 데이터 추가
        all_data.append(df)
        
        # 모든 데이터 병합
        if all_data:
            merged_df = pd.concat(all_data, ignore_index=True)
            
            # 파일명에 총 식당 수 포함
            filename = os.path.join(output_dir, f"{area_name}_restaurant_details_{new_count}.csv")
            
            # CSV 저장
            merged_df.to_csv(filename, index=False, encoding='utf-8-sig')
            print(f"파일 저장 완료: {filename} (기존 {existing_count}개 + 새로운 {len(df)}개 = 총 {new_count}개 행)")
            
            return merged_df
        else:
            print("저장할 데이터가 없습니다.")
            return None

    def crawl_all_areas(self, max_restaurants=300, output_dir='crawled_data'):
        """모든 지역 크롤링 및 증분 CSV 파일 저장"""
        # 출력 디렉토리 생성
        os.makedirs(output_dir, exist_ok=True)
        
        all_area_data = {}
        all_new_data = []
        
        for area_name in self.area_info.keys():
            try:
                print(f"\n===== {area_name} 지역 크롤링 시작 =====")
                df = self.crawl_area(area_name, max_restaurants)
                
                if not df.empty:
                    # 지역별 증분 CSV 파일 저장
                    merged_df = self.save_to_csv(df, area_name, output_dir)
                    if merged_df is not None:
                        all_area_data[area_name] = merged_df
                    
                    # 새로 수집한 데이터에 지역 정보 추가
                    df['지역'] = area_name
                    all_new_data.append(df)
                else:
                    print(f"{area_name} 지역에서 수집된 새로운 데이터가 없습니다.")
                
                print(f"===== {area_name} 지역 크롤링 완료 =====\n")
                
            except Exception as e:
                print(f"{area_name} 지역 크롤링 중 오류 발생: {e}")
                continue
        
        # 이번에 새로 수집한 모든 지역 데이터 통합
        if all_new_data:
            all_new_df = pd.concat(all_new_data, ignore_index=True)
            new_count = len(all_new_df)
            
            # 모든 지역의 모든 데이터를 통합
            all_areas_df = []
            for merged_df in all_area_data.values():
                if merged_df is not None:
                    all_areas_df.append(merged_df)
            
            if all_areas_df:
                # 모든 지역 데이터 통합
                final_all_all_new_df = pd.concat(all_new_data, ignore_index=True)
            new_count = len(all_new_df)
            
            # 모든 지역의 모든 데이터를 통합
            timestamp = time.strftime("%Y%m%d_%H%M%S")
            all_new_filename = os.path.join(output_dir, f"all_new_restaurants_{timestamp}_{new_count}.csv")
            all_new_df.to_csv(all_new_filename, index=False, encoding='utf-8-sig')
            print(f"새로 수집한 모든 지역 데이터 저장 완료: {all_new_filename} ({new_count}개 행)")
            
            return all_area_data
        else:
            print("모든 지역에서 새로 수집된 데이터가 없습니다.")
            return {}

def main():
    parser = argparse.ArgumentParser(description='Retty.me 식당 정보 크롤러')
    parser.add_argument('--area', type=str, default='all',
                      help='크롤링할 지역 이름 (신주쿠, 시부야, all)')
    parser.add_argument('--max', type=int, default=250,
                      help='각 지역당 수집할 최대 식당 수')
    parser.add_argument('--headless', action='store_true', default=True,
                      help='헤드리스 모드 사용 여부')
    parser.add_argument('--output', type=str, default='crawled_data',
                      help='출력 디렉토리 경로')
    args = parser.parse_args()
    
    # 크롤러 초기화
    crawler = RettyRestaurantCrawler(
        delay_min=0.01,
        delay_max=0.03,
        max_retries=2,
        headless=args.headless,
        batch_translate=True
    )
    
    try:
        if args.area.lower() == 'all':
            # 모든 지역 크롤링
            crawler.crawl_all_areas(args.max, args.output)
        else:
            # 특정 지역 크롤링
            if args.area in crawler.area_info:
                df = crawler.crawl_area(args.area, args.max)
                if not df.empty:
                    crawler.save_to_csv(df, args.area, args.output)
                else:
                    print(f"{args.area} 지역에서 수집된 새로운 데이터가 없습니다.")
            else:
                print(f"지원하지 않는 지역입니다: {args.area}")
                print(f"지원하는 지역: {list(crawler.area_info.keys())}")
    except Exception as e:
        print(f"크롤링 중 오류 발생: {e}")
    finally:
        # 크롤러 종료 및 자원 해제
        del crawler

if __name__ == "__main__":
    main()