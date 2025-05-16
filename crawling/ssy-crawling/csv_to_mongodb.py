import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB = os.getenv("MONGODB_DB")
MONGODB_COLLECTION = os.getenv("MONGODB_COLLECTION")

# CSV 파일 읽기
df = pd.read_csv('crawling/ssy-crawling/Ameba/ameba.csv')

# MongoDB 연결
client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB]
collection = db[MONGODB_COLLECTION]

# DataFrame을 딕셔너리 리스트로 변환
data = df.to_dict(orient='records')

# MongoDB에 데이터 삽입
collection.insert_many(data)

print("데이터가 성공적으로 MongoDB에 저장되었습니다.")
