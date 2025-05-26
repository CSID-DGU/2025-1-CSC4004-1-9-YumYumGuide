@echo off
:loop
echo %date% %time% - 크롤링 시작
python restaurant_details.py
echo %date% %time% - 크롤링 완료
timeout /t 7 >nul
goto loop
