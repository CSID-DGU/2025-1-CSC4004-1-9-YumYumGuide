import React, { useState, useEffect, useRef } from 'react';

const HandwrittenSignature = () => {
  const [inputText, setInputText] = useState('');
  const [signed, setSigned] = useState(false);
  const canvasRef = useRef(null);
  
  // 고정된 서명 폰트 
  const signatureFont = '"Lucida Handwriting", cursive';
  
  // 텍스트나 서명 상태가 변경될 때마다 서명 그리기
  useEffect(() => {
    if (canvasRef.current) {
      drawSignature();
    }
  }, [inputText, signed]);

  const drawSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 캔버스 초기화
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!inputText) return;
    
    // 서명 위치 설정
    const x = 50;
    const y = 70;
    
    // 서명 그리기
    ctx.save();
    
    // 약간 기울이기 (서명체 느낌)
    const slant = -0.05;
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(slant);
    ctx.translate(-canvas.width/2, -canvas.height/2);
    
    // 메인 텍스트 (두껍게) - 고정된 폰트 사용
    ctx.font = `italic 48px ${signatureFont}`;
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