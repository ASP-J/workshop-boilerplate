@echo off
rem ===========================================================================
rem  Mostra o que esta acontecendo no sistema, ao vivo.
rem  E o mesmo que "make logs" no Mac. Para sair: Ctrl+C e depois S (ou Y) e Enter.
rem ===========================================================================
setlocal
cd /d "%~dp0"
title Painel do workshop - logs

docker info >nul 2>nul
if errorlevel 1 goto :docker_fechado

echo Mostrando os logs. Para sair: Ctrl+C e depois S ou Y e Enter.
echo.
docker compose logs -f --tail=100
exit /b 0

:docker_fechado
echo [ERRO] O Docker Desktop nao esta aberto.
echo Abra o Docker Desktop, espere a baleia parar e tente de novo.
pause
exit /b 1
