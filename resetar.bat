@echo off
rem ===========================================================================
rem  APAGA o banco local (todas as planilhas salvas) e desliga o sistema.
rem  E o mesmo que "make reset" no Mac. Depois, ligue de novo com iniciar.bat.
rem ===========================================================================
setlocal
cd /d "%~dp0"
title Painel do workshop - apagar o banco
set "PAUSAR=1"
if /i "%~1"=="/q" set "PAUSAR=0"

docker info >nul 2>nul
if errorlevel 1 goto :docker_fechado

echo ATENCAO: isto APAGA todas as planilhas salvas no banco deste computador.
echo Nao tem volta. Os arquivos do projeto NAO sao apagados.
echo.
set "RESPOSTA="
set /p "RESPOSTA=Para confirmar, digite SIM e aperte Enter: "
if /i not "%RESPOSTA%"=="SIM" goto :cancelado

docker compose down -v
if errorlevel 1 goto :falhou
echo.
echo Pronto: o banco foi apagado e o sistema desligado.
echo Para ligar de novo, com o banco vazio: clique duas vezes em iniciar.bat
goto :fim

:cancelado
echo Cancelado. Nada foi apagado.
goto :fim

:docker_fechado
echo [ERRO] O Docker Desktop nao esta aberto.
echo Abra o Docker Desktop, espere a baleia parar e tente de novo.
goto :falhou

:falhou
if "%PAUSAR%"=="1" pause
exit /b 1

:fim
if "%PAUSAR%"=="1" pause
exit /b 0
