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

# 크롬 옵션 설정
chrome_options = Options()
chrome_options.add_argument("--headless")  # 브라우저 창 숨김
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")

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
time.sleep(2)  # 필터링 반영 대기

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
        time.sleep(2)
        
        # 새 카드 수 확인
        new_count = len(driver.find_elements(By.CLASS_NAME, "mod-search-card"))
        print(f"[INFO] 더보기 클릭 {current_clicks}회: {current_count} → {new_count} 항목")
        
    except Exception as e:
        print(f"[INFO] 더 이상 로드할 수 없습니다: {e}")
        break

# Step 4: 카드 수집
cards = driver.find_elements(By.CLASS_NAME, "mod-search-card")
print(f"[INFO] 도쿄 관련 카드 총 수: {len(cards)}")

card_data = []

for card in cards:
    try:
        category = card.find_element(By.CLASS_NAME, "card-text-subtitle").text.strip()
        title = card.find_element(By.CLASS_NAME, "card-text-title").text.strip()
        description = card.find_element(By.CLASS_NAME, "card-text-description").text.strip()
        
        
        card_data.append([category, title, description])
    except Exception as e:
        print(f"[WARN] 카드 데이터 수집 실패: {e}")
        continue

# Step 5: CSV 저장
csv_file = "tokyo_cards.csv"
with open(csv_file, mode="w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow(["카테고리", "명소", "설명"])
    writer.writerows(card_data)

print(f"[✅] 총 {len(card_data)}개 카드가 '{csv_file}'에 저장되었습니다.")

# 종료
driver.quit()