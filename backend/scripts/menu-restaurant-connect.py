from pymongo import MongoClient

# 1. MongoDB 연결
client = MongoClient("mongodb+srv://jjy:1234@yumyum.ytfd9lu.mongodb.net/main?retryWrites=true&w=majority&appName=yumyum/main")  
db = client["main"]
restaurants_col = db["restaurants"]
menus_col = db["menus"]


# 2. menus 컬렉션 전체 조회
menus = menus_col.find()

updated_count = 0
null_count = 0

# 3. 메뉴마다 restaurant 이름 일치하는 레스토랑 찾아서 ID 연결
for menu in menus:
    restaurant_name = menu.get("restaurant_name")
    translated_name = menu.get("translated_restaurant_name")

    # restaurants에서 이름 일치하는 데이터 찾기
    restaurant = restaurants_col.find_one({
        "$or": [
            {"restaurant_name": restaurant_name},
            {"translated_restaurant_name": translated_name}
        ]
    })

    if restaurant:
        # restaurant_id 필드 추가
        menus_col.update_one(
            {"_id": menu["_id"]},
            {"$set": {"restaurant_id": restaurant["_id"]}}
        )
        updated_count += 1
    else:
        # 일치하는 레스토랑 없으면 restaurant_id: null 추가
        menus_col.update_one(
            {"_id": menu["_id"]},
            {"$set": {"restaurant_id": None}}
        )
        null_count += 1

print(f"✅ 연결 완료: restaurant_id 추가된 메뉴 수: {updated_count}")
print(f"⚠️ 연결 실패 (restaurant_id=null): {null_count}")
