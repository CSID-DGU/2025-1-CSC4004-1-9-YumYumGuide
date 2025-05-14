import pandas as pd
import re
import os

# 원본 파일 경로
input_csv_path = 'crawling/jjy-crawling/retty/crawled_data/이케부코로_restaurant_details_preprocessed_1390.csv'  

# 결과물을 저장할 폴더 이름
output_folder = 'crawling/jjy-crawling/retty/crawled_data'

# 삭제할 특정 컬럼 이름들 (한글)
columns_to_check = ['번역된 식당 이름', '예산', '주소', '흡연', '영상']

# 한글 컬럼명을 영어로 변환하기 위한 매핑 딕셔너리
column_mapping = {
    '식당 이름': 'restaurant_name',
    '번역된 식당 이름': 'translated_restaurant_name',
    'URL': 'url',
    '텔': 'tel',
    '장르': 'genre',
    '영업 시간': 'business_hours',
    '닫힌 날': 'closed_days',
    '예산': 'budget',
    '신용 카드': 'credit_card',
    'QR 코드 결제': 'qr_code_payment',
    '주소': 'address',
    '입장': 'entrance',
    '주차': 'parking',
    '좌석': 'seats',
    '카운터 좌석': 'counter_seats',
    '흡연': 'smoking',
    '개인 실': 'private_room',
    '상점 웹 사이트': 'store_website',
    '발언': 'remarks',
    '강의': 'lecture',
    '당신이 마실 수있는 모든 것': 'available_drinks',
    '요리 기능과 전문 분야': 'cooking_specialties',
    '마시는 기능과 세부 사항에 대한 관심': 'drinking_specialties',
    '사용 장면': 'usage_scenes',
    '대기': 'waiting',
    '서비스': 'service',
    '아이들이 들어 오세요': 'child_friendly',
    '애완 동물': 'pet_friendly',
    '전원 공급 장치 사용': 'power_supply_available',
    'Wi-Fi 사용': 'wifi_available',
    '전화 번호': 'phone_number',
    '외국어 지원': 'foreign_language_support',
    '영상': 'video',
    '사적인': 'private',
    '예약': 'reservation',
    '드레스 코드': 'dress_code',
    'X (트위터)': 'twitter',
    '페이스 북': 'facebook',
    '추가 장비': 'additional_equipment',
    'IC 카드 지불': 'ic_card_payment',
    '인스 타 그램': 'instagram',
    '맥주 제작자': 'beer_maker'
}

try:
    # 결과 폴더가 없으면 생성
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # CSV 파일 불러오기
    df = pd.read_csv(input_csv_path)
    original_row_count = len(df)
    
    # 원본 컬럼명 출력 (디버깅 목적)
    print("원본 컬럼명:")
    print(df.columns.tolist())
    
    # 한글 컬럼명을 영어로 변환
    renamed_columns = {}
    for col in df.columns:
        if col in column_mapping:
            renamed_columns[col] = column_mapping[col]
        else:
            # 매핑되지 않은 컬럼은 그대로 유지
            renamed_columns[col] = col
            print(f"경고: '{col}' 컬럼의 매핑 정보가 없습니다. 원래 이름을 유지합니다.")
    
    # 컬럼명 변환 적용
    df = df.rename(columns=renamed_columns)
    
    # 변환된 컬럼명 출력 (디버깅 목적)
    print("\n변환된 컬럼명:")
    print(df.columns.tolist())
    
    # 영어로 변환된 컬럼 체크 목록 업데이트
    columns_to_check_english = [column_mapping.get(col, col) for col in columns_to_check]
    
    # 특정 컬럼들의 값이 비어있는 행 삭제
    df_cleaned = df.dropna(subset=columns_to_check_english)
    cleaned_row_count = len(df_cleaned)
    rows_dropped = original_row_count - cleaned_row_count
    print(f"\n총 {rows_dropped}개의 행이 삭제되었습니다.")

    # 새로운 파일명 생성
    file_name, file_extension = os.path.splitext(os.path.basename(input_csv_path))
    # 파일 경로에서 'crawled_data/' 부분을 제거하고 파일 이름만 추출
    base_file_name = file_name.replace('crawled_data/', '')
    match = re.match(r'(.+)_(\d+)', base_file_name)
    if match:
        base_name = match.group(1)
        new_file_name = f"{base_name}_eng_preprocessed_{cleaned_row_count}{file_extension}"
    else:
        # 파일명 패턴이 일치하지 않는 경우, 기본 이름으로 저장
        new_file_name = f"{base_file_name}_eng_preprocessed_{cleaned_row_count}{file_extension}"
        print("원본 파일명이 예상된 패턴과 일치하지 않아 기본 이름으로 저장합니다.")

    # 정제된 데이터를 새로운 CSV 파일로 저장할 경로
    output_csv_path = os.path.join(output_folder, new_file_name)

    # 정제된 데이터를 새로운 CSV 파일로 저장
    df_cleaned.to_csv(output_csv_path, index=False, encoding='utf-8-sig')
    print(f"영어 컬럼명으로 변환되고 정제된 데이터가 '{output_csv_path}'로 저장되었습니다.")

except FileNotFoundError:
    print(f"경로 '{input_csv_path}'에 파일이 존재하지 않습니다. 파일 경로를 확인해주세요.")
except Exception as e:
    print(f"오류가 발생했습니다: {e}")