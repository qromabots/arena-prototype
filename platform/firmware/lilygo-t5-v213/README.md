# LilyGO T5 2.13" e-paper

Hello sketch for the **LilyGO T5 2.13"** board (ESP32, 2.13" e-paper, microSD). Shows placeholder text on the display and reports whether a TF card is present.

## Hardware

- **MCU:** ESP32
- **Display:** 2.13" e-paper (SSD1680 / GDEY0213B74)
- **Storage:** microSD (TF) on dedicated SPI pins

## Project layout

```
lilygo-t5-v213/
  platformio.ini
  src/main.cpp
```

## PlatformIO

### Install (Python venv)

Install the `pio` CLI into a local virtualenv (`.venv-platformio/` at the repo root) so it stays off the system Python. From the repo root:

```bash
python3 -m venv .venv-platformio
source .venv-platformio/bin/activate
pip install --upgrade pip
pip install platformio
pio --version
```

Re-activate with `source .venv-platformio/bin/activate` in each new shell; `deactivate` to leave. The venv auto-writes its own `.gitignore` so it isn't committed. Toolchains, the esp32 platform, and libraries download to `~/.platformio/` (shared, independent of the venv).

### Build, upload, monitor

From this folder (with the venv active):

```bash
pio run -e lilygo-t5-v213
pio run -e lilygo-t5-v213 -t upload
pio device monitor -b 115200
```

**Dependency:** [GxEPD2](https://github.com/ZinggJM/GxEPD2) (installed via `platformio.ini`).

### Serial port

Unlike the ESP32-S3 (native USB, shows as `/dev/cu.usbmodem*`), the T5's classic ESP32 talks through an external USB-to-UART bridge, so it appears as **`/dev/cu.usbserial-*`** (macOS) — reported as "USB Single Serial" (WCH CH343/CH9102). PlatformIO auto-detects it when it's the only such port; otherwise append `--upload-port /dev/cu.usbserial-XXXX` to the upload command.

**Use a data-capable USB cable.** A charge-only cable powers the board (power LED lights) but never enumerates a serial port — no `usbserial` device appears at all. If no port shows up, swap the cable and plug directly into the machine (bypass hubs) before suspecting drivers.

## Arduino IDE

1. Install the **esp32** board package (Espressif) via Boards Manager.
2. Install **GxEPD2** from Library Manager.
3. Copy `src/main.cpp` into a new sketch folder named `lilygo-t5-v213` and rename the file to `lilygo-t5-v213.ino`.
4. **Board:** ESP32 Dev Module
5. Upload speed: 921600 (optional)
6. Upload via USB.

## Board settings (Arduino IDE)

| Setting | Value |
|---------|-------|
| Board | ESP32 Dev Module |
| Upload speed | 921600 |

## Customizing

- Change on-screen text in `src/main.cpp` (the `display.print("T5: ...")` line). The `T5:` prefix distinguishes it from the T-Display S3 sketch (`S3:`).
- If the display shows distorted lines, change `GxEPD2_213_GDEY0213B74` to `GxEPD2_213_BN` in the driver line (see comment in source).

## Troubleshooting

- **Blank or frozen display:** Confirm the correct GxEPD2 driver class for your panel revision.
- **TF card not detected:** Card must be FAT32 formatted and fully inserted.
- **Upload fails:** Hold **BOOT**, tap **RESET**, release **BOOT**, then retry upload.
