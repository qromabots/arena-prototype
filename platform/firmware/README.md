# LilyGO display firmware

Minimal hello-world sketches for two LilyGO boards used in the [arena hardware track](https://github.com/qromabots/arena-prototype/blob/main/docs/TODOs.md). Each project can be built with **PlatformIO** or **Arduino IDE**.

| Board | Folder | Display |
|-------|--------|---------|
| LilyGO T5 2.13" | [`lilygo-t5-v213/`](./lilygo-t5-v213/) | 2.13" e-paper (GxEPD2) + microSD |
| LilyGO T-Display S3 | [`T-Display S3/`](./T-Display%20S3/) | 1.9" ST7789 color LCD (Arduino GFX) |

See the README in each folder for board-specific setup, libraries, and upload steps.

## WebSerial text updates

Both boards share a newline-delimited serial protocol at **115200 baud**:

| Direction | Line | Meaning |
|-----------|------|---------|
| Board → host | `HELLO T-DISPLAY-S3` or `HELLO T5-2.13` | Sent on boot |
| Host → board | `SET <text>` | Update on-screen text (max 80 chars) |
| Board → host | `OK` | Text rendered |
| Board → host | `ERR <reason>` | `unknown`, `empty`, or `toolong` |

Use the web UI at [`/lilygo`](https://qromabots.github.io/arena-prototype/lilygo) (Chrome or Edge) to connect via WebSerial and push text live.
