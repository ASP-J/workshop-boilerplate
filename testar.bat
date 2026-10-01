@echo off
rem ===========================================================================
rem  Roda os testes automaticos da cozinha (pytest) e da tela (vitest),
rem  dentro dos containers. E o mesmo que "make test" no Mac.
rem  O sistema precisa estar ligado (iniciar.bat).
rem ===========================================================================
setlocal
cd /d "%~dp0"
title Painel do workshop - testes
set "PAUSAR=1"
if /i "%~1"=="/q" set "PAUSAR=0"

docker info >nul 2>nul
if errorlevel 1 goto :docker_fechado

set "LIGADO="
for /f %%I in ('docker compose ps -q --status running backend 2^>nul') do set "LIGADO=1"
if not defined LIGADO goto :desligado

echo === Testes da cozinha - pytest ===
docker compose exec -T backend pytest
if errorlevel 1 goto :falhou

echo.
echo === Testes da tela - vitest ===
docker compose exec -T frontend npm test
if errorlevel 1 goto :falhou

echo.
echo Testes ok!
goto :fim

:docker_fechado
echo [ERRO] O Docker Desktop nao esta aberto.
echo Abra o Docker Desktop, espere a baleia parar e tente de novo.
goto :erro

:desligado
echo [ERRO] O sistema esta desligado. Ligue primeiro com iniciar.bat
goto :erro

:falhou
echo.
echo [ERRO] Algum teste falhou. Copie a mensagem acima e cole no Claude Code:
echo deu erro nos testes: ...
goto :erro

:erro
if "%PAUSAR%"=="1" pause
exit /b 1

:fim
if "%PAUSAR%"=="1" pause
exit /b 0
