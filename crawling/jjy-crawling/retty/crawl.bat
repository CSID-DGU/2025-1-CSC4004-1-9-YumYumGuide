@echo off
:loop
echo %date% %time% - ũ�Ѹ� ����
python restaurant_details.py
echo %date% %time% - ũ�Ѹ� �Ϸ�
timeout /t 7 >nul
goto loop
