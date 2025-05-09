from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import csv
import time
import random

# 크롬 옵션 설정
chrome_options = Options()
chrome_options.add_argument("--headless")  # 브라우저 창 숨김
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
# 사용자 에이전트 추가 (일반 브라우저처럼 보이게)
chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36")

# 드라이버 실행
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
wait = WebDriverWait(driver, 10)
actions = ActionChains(driver)

# 타겟 URL
driver.get("https://www.japan.travel/ko/travel-directory/")

# Step 1: head.clearfix 중 4번째 클릭 (지역 필터)
head_sections = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "div.head.clearfix")))
print(f"[INFO] head 필터 개수: {len(head_sections)}")

if len(head_sections) < 4:
    raise Exception("❌ 'head.clearfix' 요소가 5개 미만입니다. 페이지 구조 확인 필요.")

# 도시 필터 열기
target_head = head_sections[3]
driver.execute_script("arguments[0].click();", target_head)
time.sleep(1)  # 애니메이션 고려

# Step 2: 도쿄 필터 클릭 (.select-option.badge 중 100번째)
badge_buttons = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "li.select-option.badge")))
print(f"[INFO] badge 옵션 개수: {len(badge_buttons)}")

if len(badge_buttons) == 0:
    raise Exception("❌ 'badge' 필터 옵션이 없습니다. 필터가 열리지 않았을 수 있습니다.")

# 도쿄 필터 찾기 (텍스트로 찾는 방법 추가)
tokyo_filter = None
for badge in badge_buttons:
    if "도쿄" in badge.text:
        tokyo_filter = badge
        break

# 도쿄 필터를 찾지 못했다면 인덱스로 시도
if tokyo_filter is None:
    print("[WARN] '도쿄' 텍스트를 가진 필터를 찾지 못했습니다. 인덱스로 시도합니다.")
    tokyo_filter = badge_buttons[100]

driver.execute_script("arguments[0].click();", tokyo_filter)
print(f"[INFO] 선택된 필터: {tokyo_filter.text}")
time.sleep(1)  # 필터링 반영 대기

# Step 3: 더보기 버튼 클릭하여 모든 데이터 로드
max_clicks = 5  # 최대 클릭 횟수 (40개씩 5번 = 약 200개)
current_clicks = 0
total_items = 0

while current_clicks < max_clicks:
    try:
        # 현재 카드 수 확인
        current_cards = driver.find_elements(By.CLASS_NAME, "mod-search-card")
        current_count = len(current_cards)
        
        # 더보기 버튼 찾기
        load_more_btn = driver.find_element(By.CLASS_NAME, "mod-search-load-more-btn")
        
        # 더보기 버튼이 표시되는지 확인
        if not load_more_btn.is_displayed():
            print("[INFO] 더 이상 표시할 항목이 없습니다.")
            break
            
        # 더보기 버튼 클릭
        driver.execute_script("arguments[0].click();", load_more_btn)
        current_clicks += 1
        
        # 새 항목이 로드될 때까지 대기
        wait.until(lambda driver: len(driver.find_elements(By.CLASS_NAME, "mod-search-card")) > current_count)
        
        # 로드 완료 대기
        time.sleep(1)
        
        # 새 카드 수 확인
        new_count = len(driver.find_elements(By.CLASS_NAME, "mod-search-card"))
        print(f"[INFO] 더보기 클릭 {current_clicks}회: {current_count} → {new_count} 항목")
        
    except Exception as e:
        print(f"[INFO] 더 이상 로드할 수 없습니다: {e}")
        break

# Step 4: 카드 수집
cards = driver.find_elements(By.CLASS_NAME, "mod-search-card")
print(f"[INFO] 도쿄 관련 카드 총 수: {len(cards)}")

# 기본 정보만 먼저 수집
base_card_data = []
for card in cards:
    try:
        category = card.find_element(By.CLASS_NAME, "card-text-subtitle").text.strip()
        title = card.find_element(By.CLASS_NAME, "card-text-title").text.strip()
        description = card.find_element(By.CLASS_NAME, "card-text-description").text.strip()
        image_element = card.find_element(By.CLASS_NAME, "sp-hide")
        image = image_element.get_attribute("src")
        # 링크 정보 가져오기
        link_element = card.find_element(By.TAG_NAME, "a")
        link = link_element.get_attribute("href")
        
        base_card_data.append({
            "category": category,
            "title": title,
            "description": description,
            "link": link,
            "address": "정보 없음", # 기본값
            "image": image
        })
    except Exception as e:
        print(f"[WARN] 카드 기본 데이터 수집 실패: {e}")
        continue

print(f"[INFO] 기본 정보 수집 완료: {len(base_card_data)}개")

# 새로운 드라이버 생성 (상세 페이지 방문용) - 다른 사용자 에이전트 설정
detail_options = Options()
detail_options.add_argument("--headless")
detail_options.add_argument("--disable-gpu")
detail_options.add_argument("--no-sandbox")
detail_options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15")

detail_driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=detail_options)
detail_wait = WebDriverWait(detail_driver, 10)

# 상세 주소 정보 수집 (진행 상황 표시 포함)
total_cards = len(base_card_data)
processed = 0

# CSV 파일 준비 (진행 중에도 데이터 저장)
csv_file = "tokyo_cards_with_address.csv"
with open(csv_file, mode="w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow(["카테고리", "명소", "설명", "주소","이미지"])

    # 각 카드의 상세 정보 수집
    for card_data in base_card_data:
        try:
            # 딜레이 추가 (3~7초 랜덤)
            delay = random.uniform(0.5, 0.7)
            time.sleep(delay)
            
            # 상세 페이지 방문
            detail_driver.get(card_data["link"])
            
            try:
                # 주소 요소 찾기
                address_element = detail_wait.until(
                    EC.presence_of_element_located((By.CLASS_NAME, "mod-keyvisual-detail__location-eng"))
                )
                card_data["address"] = address_element.text.strip()
            except Exception as detail_e:
                print(f"[WARN] 주소 정보를 가져오는데 실패했습니다 ({card_data['title']}): {detail_e}")
            
            # 진행 상황 업데이트 및 결과 저장
            processed += 1
            
            # 바로 CSV에 기록 (실패해도 기본 정보는 저장)
            writer.writerow([
                card_data["category"],
                card_data["title"],
                card_data["description"],
                card_data["address"],
                card_data["image"]
            ])
            
            # 로그 출력 (10개마다 또는 마지막)
            if processed % 10 == 0 or processed == total_cards:
                print(f"[INFO] 진행 상황: {processed}/{total_cards} ({int(processed/total_cards*100)}%)")
                
        except Exception as e:
            print(f"[WARN] 상세 데이터 수집 실패 ({card_data['title']}): {e}")
            
            # 오류가 나도 기본 정보는 저장
            writer.writerow([
                card_data["category"],
                card_data["title"],
                card_data["description"],
                "수집 실패",
                 card_data["image"]
            ])
            
            # 진행 상황 카운트
            processed += 1
            
            # 403 에러 발생 시 딜레이 더 늘리기
            if "403" in str(e):
                print("[WARN] 403 에러 발생. 딜레이 증가...")
                time.sleep(5)  # 5초 추가 대기

print(f"[✅] 총 {processed}개 카드가 '{csv_file}'에 저장되었습니다.")

# 드라이버 종료
detail_driver.quit()
driver.quit()