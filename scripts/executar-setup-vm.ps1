# Dispara o setup completo NA VM a partir do seu PC (SSH).
# Homolog + Prod, Git pull, migracoes - sem apagar volumes Docker.
#
# Uso:
#   cd c:\Users\eduar\projeto1-
#   .\scripts\executar-setup-vm.ps1
#
# SSH: na primeira vez pede senha da VM (ou use chave em ~/.ssh).
$ErrorActionPreference = "Stop"

$git = "C:\Program Files\Git\bin\git.exe"
$ssh = "ssh"
$scp = "scp"

function Read-Default($prompt, $default) {
    $v = Read-Host "$prompt [$default]"
    if ([string]::IsNullOrWhiteSpace($v)) { return $default }
    return $v
}

Write-Host ""
Write-Host "=== Instalador remoto - VM Univates ===" -ForegroundColor Cyan
Write-Host "Este script conecta na VM e executa tudo la (Docker, Git, Homolog, Prod)."
Write-Host "Os dados do banco em volumes Docker sao PRESERVADOS (nao usa down -v)."
Write-Host ""

$vmHost = Read-Default "IP ou host da VM" "177.44.248.113"
$vmUser = Read-Default "Usuario SSH" "univates"
$branch = Read-Default "Branch do GitHub" "versao-organizada"
$remoteDir = Read-Default "Pasta do projeto na VM" "~/projeto1-"
$repoUrl = Read-Default "URL do repositorio" "https://github.com/PanisEduardoLuiz/projeto1-.git"

$gmailUser = Read-Host "Gmail (GMAIL_USER) - Enter para manter .env ja existente na VM"
$gmailPassPlain = ""
if ($gmailUser) {
    $sec = Read-Host "Senha de app do Gmail" -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec)
    $gmailPassPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
}

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$setupScript = Join-Path $PSScriptRoot "setup-completo-vm.sh"
if (-not (Test-Path $setupScript)) {
    throw "Arquivo nao encontrado: $setupScript"
}

$target = "${vmUser}@${vmHost}"
$remoteTmp = "/tmp/setup-completo-vm-$PID.sh"

Write-Host ""
Write-Host "Conectando em $target ... (informe a senha SSH se pedir)" -ForegroundColor Yellow

& $scp $setupScript "${target}:${remoteTmp}"
if ($LASTEXITCODE -ne 0) { throw "Falha no SCP. Verifique SSH e senha/chave." }

$envExports = @(
    "export REPO_URL='$repoUrl'",
    "export BRANCH='$branch'",
    "export REMOTE_DIR='$remoteDir'"
)
if ($gmailUser) {
    $envExports += "export GMAIL_USER='$gmailUser'"
    $envExports += "export GMAIL_APP_PASS='$gmailPassPlain'"
}
$remoteCmd = ($envExports -join "; ") + "; chmod +x $remoteTmp; bash $remoteTmp; rm -f $remoteTmp"

& $ssh $target "bash -c `"$remoteCmd`""
if ($LASTEXITCODE -ne 0) { throw "Falha no SSH remoto." }

Write-Host ""
Write-Host "Pronto. Teste no navegador:" -ForegroundColor Green
Write-Host "  Homolog:  http://${vmHost}:8081"
Write-Host "  Producao: http://${vmHost}:8082"
