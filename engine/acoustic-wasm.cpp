// Acoustic — WebAssembly bench wrapper.
// Compiles the app's production DSP core (audio/src/dsp.cpp, audio/src/library.cpp)
// for the website's "listening bench". Nothing here leaves the machine that runs it;
// the page fetches engine.wasm lazily, plays it, and stores nothing.
//
// Rebuild with ./build-wasm.ps1 after emsdk activation (emscripten 3.1.74).

#include "acoustic/dsp.h"
#include "acoustic/layout.h"

#include <algorithm>
#include <array>
#include <cmath>
#include <cstdint>
#include <cstring>
#include <new>

namespace {
using namespace acoustic;

constexpr int kRate = 48000;
constexpr int kChannels = 2;
constexpr int kSeconds = 8;
constexpr int kFrames = kRate * kSeconds;

Renderer* gRenderer = nullptr;
float gOut[kFrames * kChannels];        // .bss, not the stack
float gScratch[kRate / 2 * kChannels];  // 0.5 s warm-pass scratch
double gPeak = 0;
uint64_t gRevision = 1;

struct Preset {
    double low, mid, high, rain, air, detail, width, breathing;
    std::array<double, 8> layerPowers;
};

constexpr Preset kPresets[3] = {
    { 1.2, 0.1, -0.9, 0.25, 0.55, 0.25, 0.75, 0.35, { 0.20, 0.19, 0.16, 0.13, 0.11, 0.09, 0.07, 0.05 } },
    { -0.7, 1.5, 0.3, 0.05, 0.25, 0.50, 0.60, 0.10, { 0.125, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125 } },
    { -0.8, 0.5, 1.7, 0.00, 0.30, 0.72, 0.50, 0.00, { 0.06, 0.07, 0.09, 0.11, 0.13, 0.15, 0.17, 0.22 } },
};

Parameters presetParameters(int scene) {
    Parameters p;
    const Preset& s = kPresets[scene];
    p.low = s.low; p.mid = s.mid; p.high = s.high;
    p.rain = s.rain; p.air = s.air; p.detail = s.detail;
    p.width = s.width; p.breathing = s.breathing;
    p.alpha = 0; p.music = 0;
    p.layerCount = 8;
    std::copy(s.layerPowers.begin(), s.layerPowers.end(), p.layerPowers.begin());
    return p;
}
} // namespace

extern "C" {

int acoustic_demo_render(int scene) {
    if (scene < 0 || scene >= 3) return -4;
    const Config config{};
    if (!gRenderer) {
        gRenderer = new (std::nothrow) Renderer(kRate, 42, 1, config);
        if (!gRenderer) return -1;
    }
    Parameters parameters = presetParameters(scene);
    Target target = prepare(parameters, 0.3, 1.2, kRate, ++gRevision, 1, config);
    if (!gRenderer->submit(target)) return -2;

    // Warm pass: lets the interpolation ramp settle away from a cold start.
    std::memset(gScratch, 0, sizeof gScratch);
    gRenderer->render(gScratch, kRate / 2, kChannels);

    std::memset(gOut, 0, sizeof gOut);
    gRenderer->render(gOut, kFrames, kChannels);

    gPeak = 0;
    for (int i = 0; i < kFrames * kChannels; i += 1) {
        const double a = std::abs(static_cast<double>(gOut[i]));
        if (a > gPeak) gPeak = a;
    }
    return gRenderer->faulted() ? -3 : 0;
}

void acoustic_demo_create() { /* lazy; renderer is created on first render call */ }
void acoustic_demo_destroy() { delete gRenderer; gRenderer = nullptr; }
float* acoustic_demo_out() { return gOut; }
int acoustic_demo_frames() { return kFrames; }
int acoustic_demo_channels() { return kChannels; }
int acoustic_demo_rate() { return kRate; }
double acoustic_demo_peak() { return gPeak; }
double acoustic_demo_applied(int layer) { return (gRenderer && layer >= 0 && layer < maximumBands) ? gRenderer->applied(observedPower + layer) : 0.0; }
double acoustic_demo_gain() { return gRenderer ? gRenderer->applied(4) : 0.0; }

} // extern "C"
