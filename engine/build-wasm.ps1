# Rebuild the listening-bench engine (assets/engine.js + assets/engine.wasm).
# Uses the production DSP core from the Acoustic repository; nothing else is compiled in.
# Prerequisite: emscripten 3.1.74 (matches Reports/dependencies policy):
#   git clone https://github.com/emscripten-core/emsdk
#   cd emsdk; .\emsdk.bat install 3.1.74; .\emsdk.bat activate 3.1.74
# Run from the repository root: powershell -File engine/build-wasm.ps1 -AcousticRepo C:\path\to\Acoustic
param(
  [Parameter(Mandatory = $true)] [string]$AcousticRepo
)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$acoustic = (Resolve-Path $AcousticRepo).Path

if (-not (Test-Path "$acoustic\audio\src\dsp.cpp")) { throw "Acoustic repo not found at $acoustic" }
if (-not (Get-Command em++ -ErrorAction SilentlyContinue)) { throw "em++ not on PATH - activate emsdk first" }

$src = @(
  "$root\engine\acoustic-wasm.cpp",
  "$acoustic\audio\src\dsp.cpp",
  "$acoustic\audio\src\library.cpp"
)

$flags = @(
  '-std=c++17', '-O3', '-fexceptions',
  "-I$acoustic\audio\include",
  '-sMODULARIZE=1', '-sEXPORT_ES6=1', '-sEXPORT_NAME=createAcousticEngine', '-sENVIRONMENT=web',
  '-sEXPORTED_FUNCTIONS=_acoustic_demo_create,_acoustic_demo_destroy,_acoustic_demo_render,_acoustic_demo_out,_acoustic_demo_frames,_acoustic_demo_channels,_acoustic_demo_rate,_acoustic_demo_peak,_acoustic_demo_applied,_acoustic_demo_gain',
  '-sEXPORTED_RUNTIME_METHODS=HEAPF32',
  '-sINITIAL_MEMORY=50331648',
  '-sALLOW_MEMORY_GROWTH=0',
  '-sFILESYSTEM=0', '-sDISABLE_EXCEPTION_CATCHING=0',
  "-o$root\assets\engine.js"
)

& em++ @src @flags
if ($LASTEXITCODE -ne 0) { throw "em++ failed with $LASTEXITCODE" }
Get-Item "$root\assets\engine.wasm" | ForEach-Object { "engine.wasm: $([math]::Round($_.Length / 1KB, 1)) KB" }
