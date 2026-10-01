@echo off
rem ===========================================================================
rem  Liga o sistema inteiro (banco + cozinha + tela) no Windows.
rem  Clique duas vezes neste arquivo. E o mesmo que "make up" no Mac.
rem  (Sem acentos de proposito: o cmd do Windows embaralha acentos.)
rem ===========================================================================
setlocal
cd /d "%~dp0"
title Painel do workshop - ligando
set "PAUSAR=1"
if /i "%~1"=="/q" set "PAUSAR=0"

if not exist "docker-compose.yml" (
  echo [ERRO] Nao achei o docker-compose.yml nesta pasta.
  echo Coloque este arquivo dentro da pasta do projeto e tente de novo.
  goto :falhou
)

where docker >nul 2>nul
if errorlevel 1 goto :sem_docker

docker info >nul 2>nul
if errorlevel 1 goto :docker_fechado

docker compose version >nul 2>nul
if errorlevel 1 goto :compose_velho

if exist ".env" goto :env_ok
copy ".env.example" ".env" >nul
if errorlevel 1 goto :sem_env
echo Criei o arquivo .env a partir do .env.example.
echo Para usar a Twygo, abra o .env com: notepad .env
echo e cole o token depois de TWYGO_API_TOKEN=  - nunca cole o token no chat.
echo.
:env_ok

call :porta FRONTEND_PORT 5193
call :porta BACKEND_PORT 5194

echo Ligando o sistema. Na primeira vez demora alguns minutos - o Docker baixa as pecas.
echo.
docker compose up -d --build -V
if errorlevel 1 goto :up_falhou

echo.
echo Esperando a cozinha - o servidor local - responder...
where curl.exe >nul 2>nul
if errorlevel 1 goto :sem_curl

set /a TENTATIVA=0
:esperar_cozinha
curl.exe -s -f -o nul "http://127.0.0.1:%BACKEND_PORT%/health"
if not errorlevel 1 goto :cozinha_ok
set /a TENTATIVA+=1
if %TENTATIVA% GEQ 90 goto :demorou
rem "ping" serve de relogio: espera ~2 segundos e funciona ate sem teclado.
ping -n 3 127.0.0.1 >nul
goto :esperar_cozinha
:cozinha_ok

set /a TENTATIVA=0
:esperar_tela
curl.exe -s -f -o nul "http://127.0.0.1:%FRONTEND_PORT%/"
if not errorlevel 1 goto :pronto
set /a TENTATIVA+=1
if %TENTATIVA% GEQ 60 goto :demorou
ping -n 3 127.0.0.1 >nul
goto :esperar_tela

:sem_curl
rem Windows antigo sem curl.exe: so espera um pouco.
ping -n 21 127.0.0.1 >nul

:pronto
echo.
echo ==================================================================
echo  Pronto! Abra no navegador:  http://localhost:%FRONTEND_PORT%
echo  Documentacao da cozinha:    http://localhost:%BACKEND_PORT%/docs
echo  Para desligar: clique duas vezes em parar.bat
echo ==================================================================
start "" "http://localhost:%FRONTEND_PORT%"
goto :fim

:sem_docker
echo [ERRO] O Docker nao esta instalado neste computador.
echo Instale o Docker Desktop: https://docs.docker.com/desktop/setup/install/windows-install/
echo Depois abra o Docker Desktop, espere a baleia parar e tente de novo.
goto :falhou

:docker_fechado
echo [ERRO] O Docker Desktop nao esta aberto - ou ainda esta iniciando.
echo Abra o Docker Desktop e espere a baleia parar de se mexer.
echo Depois clique duas vezes em iniciar.bat de novo.
goto :falhou

:compose_velho
echo [ERRO] Este Docker Desktop e antigo e nao tem o "docker compose".
echo Atualize o Docker Desktop e tente de novo.
goto :falhou

:sem_env
echo [ERRO] Nao consegui criar o .env a partir do .env.example.
echo Confira se o arquivo .env.example existe nesta pasta.
goto :falhou

:up_falhou
echo.
echo [ERRO] O Docker nao conseguiu ligar o sistema. Leia a mensagem acima.
echo - "port is already allocated": a porta %FRONTEND_PORT% ou %BACKEND_PORT% ja esta em uso.
echo   Feche o outro programa ou a outra copia do sistema e tente de novo.
echo - Outro erro: copie a mensagem e cole no Claude Code assim: deu erro: ...
goto :falhou

:demorou
echo.
echo [AVISO] O sistema demorou demais para responder.
echo Veja o que aconteceu com logs.bat, ou peca ao Claude: "deu erro, o sistema nao subiu".
goto :falhou

:falhou
if "%PAUSAR%"=="1" pause
exit /b 1

:fim
if "%PAUSAR%"=="1" pause
exit /b 0

rem ---------------------------------------------------------------------------
rem  :porta NOME PADRAO  - usa a variavel do ambiente; senao a do .env; senao o padrao.
rem  (Le so a linha da porta. O token do .env nunca e lido nem mostrado.)
rem ---------------------------------------------------------------------------
:porta
if defined %~1 goto :eof
set "%~1=%~2"
if not exist ".env" goto :eof
for /f "usebackq eol=# tokens=1,* delims== " %%A in (".env") do if /i "%%A"=="%~1" set "%~1=%%B"
goto :eof
