# LilyGO T-Display S3

Hello sketch for the **LilyGO T-Display S3** (ESP32-S3R8, 1.9" ST7789 color LCD, 170×320). Shows white placeholder text on a black background.

## Hardware

- **MCU:** ESP32-S3R8 (16 MB flash, 8 MB OPI PSRAM)
- **Display:** 1.9" ST7789, 8-bit parallel (170×320)
- **USB:** USB-C (CDC serial when enabled)

## Project layout

```
T-Display S3/
  platformio.ini
  boards/
  lilygo-t-display-s3/          ← open this folder in Arduino IDE
    lilygo-t-display-s3.ino
    pin_config.h
    sketch.yaml
```

## Arduino IDE (recommended)

1. Install the **esp32** board package (Espressif) via Boards Manager.
2. Install **GFX Library for Arduino** by moononournation from Library Manager.
3. **File → Open** and select the `lilygo-t-display-s3` folder (not the parent `T-Display S3` folder).
4. Upload via the board **USB-C** port.
5. After upload, open **Serial Monitor** at **115200** baud.

### Board settings

| Setting | Value |
|---------|-------|
| Board | ESP32S3 Dev Module |
| USB CDC On Boot | **Enabled** |
| Flash Size | 16 MB |
| PSRAM | OPI PSRAM |
| Upload speed | 921600 |

`sketch.yaml` in the sketch folder pre-fills these options in Arduino IDE 2.x.

### Serial monitor

`Hard resetting via RTS pin` at the end of upload is normal (esptool). It is not sketch output. Open Serial Monitor separately to see:

```
--- LilyGO T-Display S3 Setup Starting ---
Display initialized.
```

If two COM ports appear, use the **USB CDC** port for the monitor.

## PlatformIO

From the `T-Display S3` folder (parent of the sketch):

```bash
pio run -e lilygo-t-display-s3
pio run -e lilygo-t-display-s3 -t upload
pio device monitor -b 115200
```

**Dependency:** [GFX Library for Arduino](https://github.com/moononournation/Arduino_GFX) (handles the panel’s 35 px column offset).

## Customizing

Change on-screen text in `lilygo-t-display-s3.ino` (`Placeholder Text`).

## Troubleshooting

- **White screen, no text:** Reinstall **GFX Library for Arduino** and re-upload. The sketch uses `RGB565_BLACK` / `RGB565_WHITE` (not `BLACK` / `WHITE`).
- **Sketch folder error in Arduino IDE:** The folder you open must be named `lilygo-t-display-s3` and contain `lilygo-t-display-s3.ino` plus `pin_config.h` in the same directory.
- **No serial output:** Enable **USB CDC On Boot**, use the USB-C port, and select the correct COM port.
- **Upload fails:** Hold **BOOT**, tap **RESET**, release **BOOT**, then retry.
