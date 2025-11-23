# Changelog

## [0.1.0] - 2024-12-19

### Added ✨
- **Invoice Scanner with OCR**: Complete invoice scanning feature with text extraction
- Camera and gallery support for capturing invoices
- Smart OCR parser optimized for Swedish invoices
- Automatic extraction of company name, amount, due date, OCR number, and Bankgiro
- Manual text input option for OCR processing
- Auto-fill bill form with scanned data
- Intelligent category detection based on company names
- Scan button in new bill form for quick access

### Technical
- Integrated react-native-image-picker for camera functionality
- Created InvoiceParser service with Swedish format support
- Added InvoiceScanner screen component
- Enhanced BillForm to accept scanned data

## [0.0.8] - 2024-11-22

### Added
- 🎯 New Swedish menu with 8 main sections:
  - 🏠 Översikt (Overview)
  - 📄 Fakturor (Invoices)
  - 🔄 Abonnemang (Subscriptions)
  - 👶 VAB & Barn (Child care)
  - 📂 Avtal & Garantier (Contracts & Warranties)
  - 📊 Statistik (Statistics)
  - 🔔 Notiser (Notifications)
  - ⚙️ Inställningar (Settings)
- Slide-out drawer menu with smooth animations
- Swedish language UI for better localization

### Changed
- Replaced bottom tab navigation with hamburger menu
- Updated dashboard to Swedish language
- Changed navigation structure for better user experience

### Fixed
- Navigation flow improvements
- UI consistency updates

## [0.0.7] - 2024-11-22

### Fixed
- Major crash fixes on app startup
- Removed incompatible libraries (React Navigation, Reanimated)
- Complete project cleanup

### Changed
- Simplified architecture with custom navigation
- Reduced app size from 64MB to 53MB
- Minimized dependencies from 30+ to only 4

## Previous Versions
- Initial development and crash fixes