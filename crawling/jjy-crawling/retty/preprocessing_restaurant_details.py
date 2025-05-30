import pandas as pd
import re
import os

# 원본 파일 경로
input_csv_path = 'crawling/jjy-crawling/retty/crawled_data/아사쿠사_restaurant_details_1777.csv'  

# 결과물을 저장할 폴더 이름
output_folder = 'crawling/jjy-crawling/retty/crawled_data'

# 삭제할 특정 컬럼 이름들
columns_to_check = ['번역된 식당 이름', '예산', '주소', '흡연', '영상']

try:
    # 결과 폴더가 없으면 생성 (이미 있으므로 이 부분은 실제로 실행되지 않을 가능성이 높음)
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # CSV 파일 불러오기
    df = pd.read_csv(input_csv_path)
    original_row_count = len(df)

    # 특정 컬럼들의 값이 비어있는 행 삭제
    df_cleaned = df.dropna(subset=columns_to_check)
    cleaned_row_count = len(df_cleaned)
    rows_dropped = original_row_count - cleaned_row_count
    print(f"총 {rows_dropped}개의 행이 삭제되었습니다.")

    # 새로운 파일명 생성
    file_name, file_extension = os.path.splitext(os.path.basename(input_csv_path))
    # 파일 경로에서 'crawled_data/' 부분을 제거하고 파일 이름만 추출
    base_file_name = file_name.replace('crawled_data/', '')
    match = re.match(r'(.+)_(\d+)', base_file_name)
    if match:
        base_name = match.group(1)
        new_file_name = f"{base_name}_preprocessed_{cleaned_row_count}{file_extension}"
    else:
        # 파일명 패턴이 일치하지 않는 경우, 기본 이름으로 저장
        new_file_name = f"{base_file_name}_preprocessed_{cleaned_row_count}{file_extension}"
        print("원본 파일명이 예상된 패턴과 일치하지 않아 기본 이름으로 저장합니다.")

    # 정제된 데이터를 새로운 CSV 파일로 저장할 경로
    output_csv_path = os.path.join(output_folder, new_file_name)

    # 정제된 데이터를 새로운 CSV 파일로 저장
    df_cleaned.to_csv(output_csv_path, index=False, encoding='utf-8-sig')
    print(f"정제된 데이터가 '{output_csv_path}'로 저장되었습니다.")

except FileNotFoundError:
    print(f"경로 '{input_csv_path}'에 파일이 존재하지 않습니다. 파일 경로를 확인해주세요.")
except Exception as e:
    print(f"오류가 발생했습니다: {e}")