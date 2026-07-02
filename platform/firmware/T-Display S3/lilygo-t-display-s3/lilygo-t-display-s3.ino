// LilyGO T-Display S3 — 1.9" ST7789 LCD hello sketch
//
// Arduino IDE: open the lilygo-t-display-s3 folder via File → Open.
//   1. Install "esp32" board package (Espressif)
//   2. Install "GFX Library for Arduino" by moononournation (Library Manager)
//   3. Board: ESP32S3 Dev Module — USB CDC On Boot: Enabled, 16MB flash, OPI PSRAM
//   4. Upload via USB-C, then open Serial Monitor at 115200 baud
//      ("Hard resetting via RTS pin" at end of upload is normal — not serial output)

#include <Arduino.h>
#include <Arduino_GFX_Library.h>
#include "pin_config.h"

#define GFX_BL PIN_LCD_BL
#define MAX_TEXT_LEN 80
#define SET_PREFIX "SET "

Arduino_DataBus *bus = new Arduino_ESP32PAR8Q(
    PIN_LCD_DC, PIN_LCD_CS, PIN_LCD_WR, PIN_LCD_RD,
    PIN_LCD_D0, PIN_LCD_D1, PIN_LCD_D2, PIN_LCD_D3,
    PIN_LCD_D4, PIN_LCD_D5, PIN_LCD_D6, PIN_LCD_D7);

// 35px column offset required for this 170x320 panel (see LilyGO Arduino_GFXDemo)
Arduino_GFX *gfx = new Arduino_ST7789(
    bus, PIN_LCD_RES, 1 /* rotation */, true /* IPS */,
    170, 320, 35, 0, 35, 0);

String displayText = "S3: Placeholder Text";
String lineBuffer;

void renderDisplay() {
  gfx->fillScreen(RGB565_BLACK);
  gfx->setTextSize(2);
  gfx->setTextColor(RGB565_WHITE);
  gfx->setCursor(10, 20);
  gfx->println(displayText);
}

void processLine(const String &line) {
  if (!line.startsWith(SET_PREFIX)) {
    Serial.println("ERR unknown");
    return;
  }

  const String nextText = line.substring(strlen(SET_PREFIX));
  if (nextText.length() == 0) {
    Serial.println("ERR empty");
    return;
  }
  if (nextText.length() > MAX_TEXT_LEN) {
    Serial.println("ERR toolong");
    return;
  }

  displayText = nextText;
  renderDisplay();
  Serial.println("OK");
}

void setup() {
  pinMode(PIN_POWER_ON, OUTPUT);
  digitalWrite(PIN_POWER_ON, HIGH);

  pinMode(PIN_LCD_RD, OUTPUT);
  digitalWrite(PIN_LCD_RD, HIGH);

  pinMode(GFX_BL, OUTPUT);
  digitalWrite(GFX_BL, HIGH);

  Serial.begin(115200);
  while (!Serial && millis() < 5000) {
    delay(10);
  }
  delay(500);
  Serial.println("\n--- LilyGO T-Display S3 Setup Starting ---");
  Serial.println("HELLO T-DISPLAY-S3");

  if (!gfx->begin()) {
    Serial.println("Display init failed!");
    return;
  }

  renderDisplay();
  Serial.println("Display initialized. Waiting for WebSerial commands.");
}

void loop() {
  while (Serial.available()) {
    const char c = Serial.read();
    if (c == '\n' || c == '\r') {
      if (lineBuffer.length() > 0) {
        processLine(lineBuffer);
        lineBuffer = "";
      }
      continue;
    }

    lineBuffer += c;
    if (lineBuffer.length() > MAX_TEXT_LEN + strlen(SET_PREFIX)) {
      lineBuffer = "";
      Serial.println("ERR toolong");
    }
  }
}
