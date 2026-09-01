# Flutter Mobile App

This is a lightweight cross-platform companion app scaffold for Android/iOS.

Run after installing Flutter dependencies:

```bash
flutter pub get
flutter run --dart-define=API_BASE_URL=http://localhost:3000
```

The first screen consumes `GET /api/events`. Build additional screens against the same REST routes documented in `docs/n8n-automations.md`.
