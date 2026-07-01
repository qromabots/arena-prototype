#include <GxEPD2_BW.h>
#include <Adafruit_GFX.h>
#include <SPI.h>
#include <SD.h>

// --- E-Paper Display Pin Configuration ---
#define EPD_CS    5
#define EPD_DC    17
#define EPD_RST   16
#define EPD_BUSY  4

// --- TF (MicroSD) Card Pin Configuration ---
#define SD_CS     13
#define SD_MOSI   15
#define SD_MISO   2
#define SD_SCLK   14

// Select your exact 2.13" E-paper driver class (SSD1680 is standard for modern T5 2.13 boards)
GxEPD2_BW<GxEPD2_213_GDEY0213B74, GxEPD2_213_GDEY0213B74::HEIGHT> display(GxEPD2_213_GDEY0213B74(EPD_CS, EPD_DC, EPD_RST, EPD_BUSY));
// Note: If your screen variant shows distorted lines, try changing 'GxEPD2_213_GDEY0213B74' to 'GxEPD2_213_BN'

SPIClass sdSPI(VSPI);

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n--- LilyGO T5 2.13 Setup Starting ---");

  // 1. Initialize TF Card via its dedicated SPI Pins
  sdSPI.begin(SD_SCLK, SD_MISO, SD_MOSI, SD_CS);
  if (!SD.begin(SD_CS, sdSPI)) {
    Serial.println("TF Card Initialization Failed! (Check if card is inserted/formatted to FAT32)");
  } else {
    Serial.println("TF Card Initialized successfully!");
  }

  // 2. Initialize the E-Paper Display
  display.init(115200); // Pass serial baud for debugging e-paper lifecycle

  // Set orientation (0 = vertical, 1 = horizontal landscape)
  display.setRotation(1);
  display.setTextColor(GxEPD_BLACK);
  display.setFont(NULL); // Uses standard built-in system font

  // 3. Draw content using Full Refresh loop (standard pattern for GxEPD2)
  display.firstPage();
  do {
    display.fillScreen(GxEPD_WHITE);
    display.setCursor(10, 20);
    display.print("T5: Placeholder Text"); // Change Text Here

    if (SD.cardType() != CARD_NONE) {
      display.setCursor(10, 60);
      display.print("TF Card detected.");
    }
  } while (display.nextPage());

  Serial.println("Display refresh complete. Going to sleep mode to conserve power.");
  display.powerOff(); // Powers down display hardware safely
}

void loop() {
  // Put repetitive tasks here, or use ESP32 Deep Sleep
}
