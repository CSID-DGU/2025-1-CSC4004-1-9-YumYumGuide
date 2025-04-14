const drawSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!inputText) return;
    
    // 서명 위치 설정 (왼쪽으로 10px 이동)
    const x = 50; // 60에서 50으로 변경 (10px 왼쪽으로)
    const y = 70;
    
    // 서명 그리기
    ctx.save();
    
    // 약간 기울이기 (서명체 느낌)
    const slant = -0.05;
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(slant);
    ctx.translate(-canvas.width/2, -canvas.height/2);
    
    // 메인 텍스트 (두껍게)
    const mainFont = `italic 48px ${getRandomFont()}`;
    ctx.font = mainFont;
    ctx.fillStyle = 'black';
    
    // 메인 텍스트 그리기
    ctx.fillText(inputText, x, y);
    
    // 테두리 효과 (얇게)
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 0.5;
    ctx.strokeText(inputText, x, y);
    
    // 그림자 효과로 입체감 추가
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillText(inputText, x + 1, y + 1);
    
    ctx.restore();
  };import React, { useState, useEffect, useRef } from 'react';

const HandwrittenSignature = () => {
  const [inputText, setInputText] = useState('');
  const [signed, setSigned] = useState(false);
  const canvasRef = useRef(null);
  
  // 서명 폰트 목록
  const signatureFonts = [
    'cursive',
    '"Brush Script MT", cursive',
    '"Dancing Script", cursive',
    '"Segoe Script", cursive',
    '"Bradley Hand", cursive',
    '"Comic Sans MS", cursive',
    '"Lucida Handwriting", cursive'
  ];
  
  // 폰트 로딩을 위한 상태
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  // 폰트 랜덤 선택
  const getRandomFont = () => {
    const randomIndex = Math.floor(Math.random() * signatureFonts.length);
    return signatureFonts[randomIndex];
  };
  
  // 폰트 로드 시도
  useEffect(() => {
    // 폰트 로딩 시뮬레이션
    const timer = setTimeout(() => {
      setFontsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // 텍스트나 서명 상태가 변경될 때마다 서명 그리기
  useEffect(() => {
    if (canvasRef.current && fontsLoaded) {
      drawSignature();
    }
  }, [inputText, signed, fontsLoaded]);

  const drawSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!inputText) return;
    
    // 서명 위치 설정
    const x = 50;
    const y = 60;
    
    // 서명 그리기
    ctx.save();
    
    // 약간 기울이기 (서명체 느낌)
    const slant = -0.05;
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(slant);
    ctx.translate(-canvas.width/2, -canvas.height/2);
    
    // 메인 텍스트 (두껍게)
    const mainFont = `italic 48px ${getRandomFont()}`;
    ctx.font = mainFont;
    ctx.fillStyle = 'black';
    
    // 손 떨림 효과를 위한 미세한 위치 변화
    const trembleX = x + (Math.random() * 2 - 1);
    const trembleY = y + (Math.random() * 2 - 1);
    
    // 메인 텍스트 그리기
    ctx.fillText(inputText, trembleX, trembleY);
    
    // 테두리 효과 (얇게)
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 0.5;
    ctx.strokeText(inputText, trembleX, trembleY);
    
    // 그림자 효과로 입체감 추가
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillText(inputText, trembleX + 1, trembleY + 1);
    
    // 텍스트 너비 측정 (밑줄용)
    const textMetrics = ctx.measureText(inputText);
    const textWidth = textMetrics.width;
    
    // 밑줄 그리기
    ctx.beginPath();
    
    // 시작점
    ctx.moveTo(x - 5, y + 10);
    
    // 구불구불한 선 (사람이 그린듯한 느낌)
    const lineSegments = 20;
    const lineLength = textWidth + 30;
    
    for (let i = 0; i <= lineSegments; i++) {
      const segX = x - 5 + (lineLength * (i / lineSegments));
      
      // 사인 웨이브로 자연스러운 굴곡 추가
      const segY = y + 10 + Math.sin(i * 0.6) * 1.2;
      
      // 첫 점은 moveTo, 나머지는 lineTo
      if (i === 0) {
        ctx.moveTo(segX, segY);
      } else {
        ctx.lineTo(segX, segY);
      }
    }
    
    // 선 스타일 및 그리기
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    
    // 시작/끝 부분 필기체 강조 (서명의 흔한 특징)
    if (inputText.length > 0) {
      // 시작 플러리시 (장식)
      ctx.beginPath();
      ctx.moveTo(x - 15, y);
      ctx.quadraticCurveTo(x - 10, y - 5, x - 5, y);
      ctx.stroke();
      
      // 끝 플러리시 (장식)
      const endX = x + textWidth;
      ctx.beginPath();
      ctx.moveTo(endX, y);
      ctx.quadraticCurveTo(endX + 10, y + 5, endX + 20, y);
      ctx.stroke();
    }
    
    ctx.restore();
  };

  const handleSign = () => {
    if (inputText.trim() !== '') {
      setSigned(true);
    }
  };
  
  // 키보드 Enter 키 처리
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSign();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-b from-blue-50 to-blue-100 p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-6">
        <h2 className="text-center text-xl font-bold mb-6 text-gray-800">
          디지털 서명
        </h2>
        
        {!signed ? (
          <div>
            <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-gray-50 mb-6">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 font-sans text-lg px-6 py-4 outline-none border-none focus:outline-none bg-transparent"
                placeholder="이름을 입력하세요"
                autoFocus
              />
              <button
                onClick={handleSign}
                className="bg-black text-white font-bold px-6 py-4 m-1 rounded-full hover:bg-gray-800 transition-colors"
              >
                SIGN
              </button>
            </div>
            
            <div className="border border-gray-100 rounded-3xl p-6 bg-gray-50">
              <div className="text-gray-400 text-sm font-light mb-4 ml-2">SIGNED BY,</div>
              <canvas
                ref={canvasRef}
                width={400}
                height={120}
                className="w-full border-b border-gray-200"
              />
            </div>
          </div>
        ) : (
          <div className="border border-gray-100 rounded-3xl p-6 bg-gray-50">
            <div className="text-gray-400 text-sm font-light mb-4 ml-2">SIGNED BY,</div>
            <canvas
              ref={canvasRef}
              width={400}
              height={120}
              className="w-full border-b border-gray-200"
            />
          </div>
        )}
      </div>
      
      {!signed && (
        <div className="mt-6 text-base text-gray-600 text-center">
          이름을 입력하면 서명이 자동으로 생성됩니다
        </div>
      )}
      
      {signed && (
        <button
          onClick={() => setSigned(false)}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          다시 서명하기
        </button>
      )}
    </div>
  );
};

export default HandwrittenSignature;