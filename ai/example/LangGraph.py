# 필요한 라이브러리 불러오기
import os
from typing import TypedDict, Annotated, Sequence
from langchain_openai import ChatOpenAI  # OpenAI 모델을 사용하기 위한 클래스
from langchain_core.messages import AIMessage, HumanMessage  # 메시지 타입 정의
from langchain_core.prompts import ChatPromptTemplate  # 프롬프트 템플릿을 만들기 위한 클래스
from langgraph.graph import StateGraph, END  # LangGraph의 핵심 구성요소

# OpenAI API 키 설정 - 실제 사용 시 자신의 API 키로 교체해야 함
os.environ["OPENAI_API_KEY"] = "your-api-key-here"

# ----- 1. 상태 정의 -----
# TypedDict를 사용해 상태의 구조를 명확하게 정의
# 이 상태는 그래프의 각 노드 사이에 전달되는 데이터를 담고 있음
class AgentState(TypedDict):
    question: str       # 사용자가 입력한 질문
    thoughts: list[str] # 에이전트가 생성한 생각들의 목록
    answer: str         # 최종 생성될 답변

# ----- 2. 노드 함수 정의 -----
# 각 노드는 상태를 입력받아 처리하고 업데이트된 상태를 반환하는 함수로 구현됨

def think(state: AgentState) -> AgentState:
    """질문에 대해 생각하는 단계를 담당하는 함수
    
    이 함수는 현재까지의 생각을 바탕으로 다음 생각을 생성하고 상태에 추가함
    """
    # ChatOpenAI 모델 초기화 (GPT-3.5-turbo 사용)
    model = ChatOpenAI(model="gpt-3.5-turbo")
    
    # 프롬프트 템플릿 생성
    # 시스템 메시지: AI에게 역할 부여
    # 휴먼 메시지: 질문과 현재까지의 생각을 포함
    prompt = ChatPromptTemplate.from_messages([
        ("system", "당신은 질문에 대해 단계적으로 생각하는 도우미입니다. 주어진 질문에 대한 생각을 한 단계 더 발전시키세요."),
        ("human", "질문: {question}\n\n현재까지 생각: {thoughts_str}\n\n다음 생각은 무엇인가요?")
    ])
    
    # 현재까지의 생각들을 문자열로 변환
    # 생각이 있으면 번호를 붙여 정리하고, 없으면 "아직 생각이 없습니다" 표시
    thoughts_str = "\n".join([f"{i+1}. {t}" for i, t in enumerate(state["thoughts"])]) if state["thoughts"] else "아직 생각이 없습니다."
    
    # 프롬프트에 변수를 채우고 모델에 전송하여 응답 받기
    response = model.invoke(prompt.format(question=state["question"], thoughts_str=thoughts_str))
    
    # 응답 내용을 생각 목록에 추가
    state["thoughts"].append(response.content)
    
    # 업데이트된 상태 반환
    return state

def generate_answer(state: AgentState) -> AgentState:
    """최종 답변을 생성하는 단계를 담당하는 함수
    
    이 함수는 지금까지 모은 모든 생각을 바탕으로 최종 답변을 생성함
    """
    # ChatOpenAI 모델 초기화
    model = ChatOpenAI(model="gpt-3.5-turbo")
    
    # 프롬프트 템플릿 생성
    prompt = ChatPromptTemplate.from_messages([
        ("system", "당신은 주어진 생각들을 바탕으로 최종 답변을 제공하는 도우미입니다."),
        ("human", "질문: {question}\n\n생각 과정:\n{thoughts_str}\n\n위 생각들을 바탕으로 최종 답변을 제공해주세요.")
    ])
    
    # 모든 생각을 번호와 함께 문자열로 변환
    thoughts_str = "\n".join([f"{i+1}. {t}" for i, t in enumerate(state["thoughts"])])
    
    # 프롬프트에 변수를 채우고 모델에 전송하여 응답 받기
    response = model.invoke(prompt.format(question=state["question"], thoughts_str=thoughts_str))
    
    # 응답 내용을 answer 필드에 저장
    state["answer"] = response.content
    
    # 업데이트된 상태 반환
    return state

# ----- 3. 라우터 함수 정의 -----
def should_continue_thinking(state: AgentState) -> str:
    """다음에 어떤 노드로 진행할지 결정하는 함수
    
    이 함수는 생각의 수를 검사하여 더 생각할지 아니면 답변 생성으로 넘어갈지 결정함
    """
    # 생각이 3개 이상 모였으면 generate_answer 노드로 진행
    if len(state["thoughts"]) >= 3:
        return "generate_answer"
    # 아직 3개 미만이면 think 노드로 다시 돌아가 생각 계속하기
    return "think"

# ----- 4. 그래프 구성 -----
# StateGraph 객체 생성 (상태 타입 지정)
workflow = StateGraph(AgentState)

# 노드 추가 (각 노드는 이름과 실행할 함수로 구성됨)
workflow.add_node("think", think)  # 생각하는 노드
workflow.add_node("generate_answer", generate_answer)  # 답변 생성 노드

# 조건부 엣지 연결
# think 노드에서 should_continue_thinking 함수의 반환값에 따라 다음 노드 결정
workflow.add_conditional_edges(
    "think",  # 시작 노드
    should_continue_thinking,  # 라우팅 결정 함수
    {
        "think": "think",  # "think" 반환 시 다시 think 노드로 (루프)
        "generate_answer": "generate_answer"  # "generate_answer" 반환 시 generate_answer 노드로
    }
)

# generate_answer 노드에서 END로 연결 (워크플로우 종료)
workflow.add_edge("generate_answer", END)

# 그래프의 시작점 설정
workflow.set_entry_point("think")

# 그래프 컴파일 (실행 가능한 체인으로 변환)
chain = workflow.compile()

# ----- 5. 테스트 함수 -----
def test_thinking_agent():
    """LangGraph로 구현한 생각하는 에이전트를 테스트하는 함수"""
    print("=== LangGraph와 OpenAI를 활용한 생각하는 에이전트 테스트 ===")
    
    # 사용자로부터 질문 입력 받기
    question = input("질문을 입력하세요: ")
    
    try:
        # 초기 상태 설정
        initial_state = {
            "question": question,  # 입력받은 질문
            "thoughts": [],        # 빈 생각 목록으로 시작
            "answer": ""           # 빈 답변으로 시작
        }
        
        # 그래프 실행 (초기 상태 전달)
        result = chain.invoke(initial_state)
        
        # 결과 출력 - 생각 과정
        print("\n=== 생각 과정 ===")
        for i, thought in enumerate(result["thoughts"]):
            print(f"생각 {i+1}: {thought}")
        
        # 결과 출력 - 최종 답변
        print("\n=== 최종 답변 ===")
        print(result["answer"])
        
        print("\n테스트 성공: LangGraph와 OpenAI가 정상적으로 작동합니다.")
        
    except Exception as e:
        # 오류 발생 시 예외 처리
        print("\n=== 테스트 실패 ===")
        print(f"오류 발생: {e}")

# 스크립트가 직접 실행될 때만 테스트 함수 호출
if __name__ == "__main__":
    test_thinking_agent()
    
# LangGraph는 LangChain 생태계의 일부로, 복잡한 AI 애플리케이션을 구축하기 위한 프레임워크입니다. LangGraph는 특히 상태 관리와 제어 흐름을 중심으로 설계되어 더 정교한 AI 시스템을 만들 수 있게 해줍니다.
# LangGraph의 주요 특징:

# 상태 기반 워크플로우: 상태를 명시적으로 관리할 수 있는 그래프 기반 프레임워크로, 복잡한 AI 시스템의 상태를 추적하고 관리합니다.
# 사이클 및 반복 지원: 직선적인 체인이 아닌 루프와 조건부 분기가 포함된 복잡한 워크플로우를 구현할 수 있습니다.
# 멀티에이전트 시스템: 여러 AI 에이전트가 서로 상호작용하며 협업하는 시스템을 구축할 수 있습니다.
# 시각화 도구: 복잡한 워크플로우를 시각적으로 표현하여, 애플리케이션의 구조를 더 쉽게 이해하고 디버깅할 수 있습니다.
# LangChain과의 통합: LangChain의 모든 컴포넌트와 원활하게 통합됩니다.

# LangGraph의 사용 사례:

# 에이전트 워크플로우: 반복적 접근 방식으로 문제를 해결하는 AI 에이전트 구현
# 인간-AI 협업 시스템: 인간과 AI 사이의 상호작용이 포함된 시스템
# 복잡한 추론 체인: 다양한 조건과 분기가 필요한 추론 프로세스
# 다단계 의사결정 시스템: 여러 단계의 의사결정과 피드백이 필요한 애플리케이션

# LangGraph는 기본적으로 DAG(Directed Acyclic Graph) 방식에서 벗어나 상태 머신(State Machine)에 가까운 접근법을 취함으로써, 더 복잡하고 동적인 AI 애플리케이션 구축을 가능하게 합니다.