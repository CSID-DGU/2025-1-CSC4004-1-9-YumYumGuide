import os
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage

def test_langchain_openai():
    # OpenAI API 키 설정 - 환경 변수로 설정하거나 직접 입력
    # 보안을 위해 환경 변수 사용을 권장합니다
    os.environ["OPENAI_API_KEY"] = "your-api-key-here"  # 실제 API 키로 교체하세요
    
    # ChatOpenAI 모델 초기화
    model = ChatOpenAI(model="gpt-3.5-turbo")
    
    try:
        # 간단한 메시지 전송
        messages = [HumanMessage(content="안녕하세요! LangChain과 OpenAI 테스트 중입니다.")]
        response = model.invoke(messages)
        
        print("=== 테스트 성공 ===")
        print(f"응답: {response.content}")
        print("LangChain과 OpenAI가 정상적으로 작동합니다.")
        
    except Exception as e:
        print("=== 테스트 실패 ===")
        print(f"오류 발생: {e}")
        
if __name__ == "__main__":
    test_langchain_openai()
    
# LangChain을 사용하는 주요 이유

# AI 모델 통합 간소화: 다양한 AI 모델(OpenAI, Anthropic, Cohere 등)을 일관된 인터페이스로 쉽게 통합할 수 있습니다. 모델을 바꾸더라도 코드 전체를 수정할 필요가 없습니다.
# 복잡한 AI 워크플로우 구축: 단순 질의응답을 넘어 추론 체인, 에이전트, RAG(Retrieval-Augmented Generation) 시스템 등 복잡한 AI 애플리케이션을 모듈식으로 구축할 수 있습니다.
# 메모리 및 상태 관리: 대화 기록 유지, 컨텍스트 관리 등 상태 추적 기능을 쉽게 구현할 수 있습니다.
# 데이터 연결: 다양한 데이터 소스(문서, 데이터베이스, API 등)를 AI 모델에 연결하는 작업을 단순화합니다.
# 프롬프트 관리: 프롬프트 템플릿, 프롬프트 체이닝, 프롬프트 최적화 등을 체계적으로 관리할 수 있습니다.
# 재사용 가능한 컴포넌트: 미리 만들어진 다양한 컴포넌트(문서 로더, 벡터 저장소, 임베딩 등)를 활용해 개발 시간을 단축할 수 있습니다.

# 요약하자면, LangChain은 AI 모델을 단순히 호출하는 것을 넘어 복잡한 AI 애플리케이션을 더 쉽고 체계적으로 구축할 수 있게 해주는 프레임워크입니다. 특히 RAG 시스템 구축이나 에이전트 개발 같은 복잡한 작업을 할 때 많은 도움이 됩니다.