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

From this folder:

```bash
pio run -e lilygo-t5-v213
pio run -e lilygo-t5-v213 -t upload
pio device monitor -b 115200
```

**Dependency:** [GxEPD2](https://github.com/ZinggJM/GxEPD2) (installed via `platformio.ini`).

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

- Change on-screen text in `src/main.cpp` (`Placeholder Text`).
- If the display shows distorted lines, change `GxEPD2_213_GDEY0213B74` to `GxEPD2_213_BN` in the driver line (see comment in source).

## Troubleshooting

- **Blank or frozen display:** Confirm the correct GxEPD2 driver class for your panel revision.
- **TF card not detected:** Card must be FAT32 formatted and fully inserted.
- **Upload fails:** Hold **BOOT**, tap **RESET**, release **BOOT**, then retry upload.
