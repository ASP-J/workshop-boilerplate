@echo off
rem ===========================================================================
rem  Desliga o sistema. As planilhas salvas no banco CONTINUAM guardadas.
rem  E o mesmo que "make down" no Mac.
rem ===========================================================================
setlocal
cd /d "%~dp0"
title Painel do workshop - desligando
set "PAUSAR=1"
if /i "%~1"=="/q" set "PAUSAR=0"

docker info >nul 2>nul
if errorlevel 1 goto :docker_fechado

docker compose down
if errorlevel 1 goto :falhou
echo.
echo Sistema desligado. As planilhas salvas continuam guardadas.
echo Para ligar de novo: clique duas vezes em iniciar.bat
goto :fim

:docker_fechado
echo O Docker Desktop nao esta aberto, entao o sistema ja esta desligado.
goto :fim

:falhou
echo [ERRO] Nao consegui desligar. Copie a mensagem acima e cole no Claude Code.
if "%PAUSAR%"=="1" pause
exit /b 1

:fim
if "%PAUSAR%"=="1" pause
exit /b 0
