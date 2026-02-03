# 🧪 Manuelle Explorative Tests - Impostor Webanwendung

Dieses Dokument beschreibt die manuellen explorativen Tests, die durchgeführt werden sollten, um die Qualität und Benutzerfreundlichkeit der Impostor-Webanwendung sicherzustellen.

## 📋 Testvorbereitung

### Benötigte Geräte/Browser:
- **Mobile Geräte**: iOS Safari, Android Chrome
- **Desktop**: Chrome, Firefox, Safari
- **Tablets**: iPad Safari, Android Chrome

### Test-Szenarien:
1. **Einzelgerät-Tests**: Ein Gerät mit mehreren Tabs/Fenstern
2. **Multi-Gerät-Tests**: Verschiedene Geräte im selben Netzwerk
3. **Cross-Browser-Tests**: Verschiedene Browser auf demselben Gerät

## 🎮 Explorative Testbereiche

### 1. UI/UX Testing (Fokus auf Design-Anforderungen)

#### 1.1 Mobile-First Experience
**Ziel**: Sicherstellen, dass die Anwendung auf mobilen Geräten optimal funktioniert

**Tests**:
- [ ] Öffne Anwendung auf Smartphone
- [ ] Prüfe Lesbarkeit der Texte ohne Zoom
- [ ] Teste Button-Größen und Abstände
- [ ] Überprüfe One-Hand-Usability
- [ ] Teste in Hoch- und Querformat

**Erwartete Ergebnisse**:
- Alle Elemente ohne Pinch-to-Zoom lesbar
- Buttons mindestens 44px groß für Touch
- Navigation mit einer Hand möglich
- Kein horizontaler Scroll nötig

#### 1.2 Design-Konsistenz
**Ziel**: Überprüfen, ob das Design den Spezifikationen entspricht

**Tests**:
- [ ] Prüfe Farbwelt (weiß, dunkelgrau, weiche Farben)
- [ ] Überprüfe Typografie (Inter Font, korrekte Größen)
- [ ] Teste Animationen und Übergänge
- [ ] Kontrolliere visuelle Hierarchie

**Erwartete Ergebnisse**:
- Farben korrespondieren mit Design-Guide
- Schriftgrößen folgen der Hierarchie (28pt, 22pt, 16pt, etc.)
- Animationen sind sanft und nicht ablenkend
- Wichtige Elemente sind visuell hervorgehoben

### 2. Edge Case Testing

#### 2.1 Netzwerk-Störungen
**Ziel**: Robustheit bei Verbindungsproblemen

**Tests**:
- [ ] Starte Spiel und unterbreche Internetverbindung
- [ ] Tritt bei Raum bei und verliere Verbindung
- [ ] Teste mit langsamer Verbindung (3G-Simulation)
- [ ] Wechsel zwischen Wi-Fi und Mobile Data

**Erwartete Ergebnisse**:
- Anwendung friert nicht ein
- Informative Fehlermeldungen
- Möglichkeit zum Neuladen/Rejoin
- Kein Datenverlust bei Reconnect

#### 2.2 Browser-Kompatibilität
**Ziel**: Funktion über verschiedene Browser hinweg

**Tests**:
- [ ] Teste mit älteren Browser-Versionen
- [ ] Deaktiviere JavaScript
- [ ] Teste mit verschiedenen Bildschirmauflösungen
- [ ] Prüfe mit eingeschränkten Systemressourcen

**Erwartete Ergebnisse**:
- Graceful Degradation ohne JS
- Responsive Layout bei allen Auflösungen
- Keine Abstürze bei Limits

### 3. Sicherheits-Tests

#### 3.1 Manipulationsversuche
**Ziel**: Serverseitige Validierung sicherstellen

**Tests**:
- [ ] Versuche, Spiel als Gast zu starten (DevTools)
- [ ] Manipuliere Spiel-Code in der URL
- [ ] Versuche, doppelte Namen zu verwenden
- [ ] Teste XSS-Versuche in Namensfeldern

**Erwartete Ergebnisse**:
- Server lehnt unauthorisierte Aktionen ab
- Keine Möglichkeit zur Manipulation des Spielstands
- Eingabe-Sanitierung funktioniert

#### 3.2 Privatsphäre-Tests
**Ziel**: Sicherstellen, dass private Informationen geschützt sind

**Tests**:
- [ ] Prüfe, ob Rollen anderer Spieler sichtbar sind
- [ ] Überprüfe, ob Wörter durchsickern
- [ ] Teste, ob Chat/Logs sensitive Daten enthalten
- [ ] Kontrolliere localStorage auf sensitive Daten

**Erwartete Ergebnisse**:
- Rollen sind strikt privat
- Keine Informationslecks
- Sensitive Daten nicht persistiert

### 4. Performance-Tests

#### 4.1 Ladezeiten
**Ziel**: Schnelle Ladezeiten auch bei schlechten Verbindungen

**Tests**:
- [ ] Messung des ersten sinnvollen Paints
- [ ] Zeit bis zur Interaktivität
- [ ] Ladezeit bei Cold Cache
- [ ] Performance bei vielen Spielern

**Erwartete Ergebnisse**:
- < 3 Sekunden bis zum vollständigen Laden
- Keine Blockierungen durch große Ressourcen
- Flüssige Animationen bei 60fps

#### 4.2 Speichernutzung
**Ziel**: Effiziente Ressourcennutzung

**Tests**:
- [ ] Überwache Speichernutzung während des Spiels
- [ ] Teste Memory Leaks bei langen Sessions
- [ ] Prüfe CPU-Auslastung während Animationen

**Erwartete Ergebnisse**:
- Kein übermäßiger Speicherverbrauch
- Stabile Performance über Zeit
- Geringe CPU-Auslastung

### 5. Accessibility-Tests

#### 5.1 Screenreader-Kompatibilität
**Ziel**: Barrierefreiheit für blinde/sehbehinderte Nutzer

**Tests**:
- [ ] Teste mit VoiceOver (iOS) und TalkBack (Android)
- [ ] Überprüfe ARIA-Labels und -Attribute
- [ ] Kontrolliere Tastaturnavigation
- [ ] Prüfe Farbkontrast mit Kontrast-Tools

**Erwartete Ergebnisse**:
- Alle Elemente screenreader-freundlich
- Vollständige Tastatur-Navigation möglich
- Farbkontrast ≥ 4.5:1

#### 5.2 Motorische Fähigkeiten
**Ziel**: Bedienung für Menschen mit motorischen Einschränkungen

**Tests**:
- [ ] Teste mit vergrößerten Systemeinstellungen
- [ ] Überprüfe Erreichbarkeit aller interaktiven Elemente
- [ ] Prüfe Alternative Input-Methoden

**Erwartete Ergebnisse**:
- Skalierung funktioniert korrekt
- Große Touch-Ziele für alle Elemente
- Alternative Bedienung möglich

## 📝 Testprotokoll

### Durchführung der Tests
1. **Vorbereitung**: Öffne Test-Checkliste
2. **Durchführung**: Gehe jeden Testpunkt durch
3. **Dokumentation**: Markiere Erfolge/Fehler
4. **Bewertung**: Schweregrad der Probleme einstufen
5. **Nachverfolgung**: Erstelle Tickets für gefundene Issues

### Schweregrad-Klassifikation
- **Blocker**: Verhindert Kernfunktionalität
- **Critical**: Beeinträchtigt Nutzererfahrung stark
- **Major**: Funktioniert aber mit Einschränkungen
- **Minor**: Kosmetische oder kleine UX-Probleme
- **Trivial**: Kaum bemerkbare Probleme

### Test-Dashboard
Für jeden Test sollte dokumentiert werden:
- Gerät/Browser
- Datum/Uhrzeit
- Tester
- Ergebnis (✅/❌)
- Probleme/Beobachtungen
- Screenshots/Videos bei Problemen
- Reproduktionsschritte

## 🔍 Explorative Test-Sessions

### Session 1: Neue User Experience
**Ziel**: Erfahrung eines völlig neuen Nutzers simulieren
- [ ] Erste Nutzung ohne Anleitung
- [ ] Verstehen des Spielablaufs
- [ ] Intuitivität der Bedienung
- [ ] Klarheit der Anweisungen

### Session 2: Power User Testing
**Ziel**: Erfahrene Nutzer unter Stressbedingungen testen
- [ ] Schnelle Navigation durch Screens
- [ ] Multitasking während des Spiels
- [ ] Tastaturkürzel und Shortcuts
- [ ] Effizienz der Workflows

### Session 3: Fehler-Handling
**Ziel**: Robustheit bei unerwarteten Situationen
- [ ] Absichtliche Fehleingaben
- [ ] Systematische Fehlerprovokation
- [ ] Grenzwert-Tests
- [ ] DDoC (Denial of Coffee) Tests

## 📊 Ergebnisse und Metriken

### Zu messende Metriken
- **Task Success Rate**: % der erfolgreich abgeschlossenen Aufgaben
- **Time on Task**: Durchschnittliche Zeit pro Aufgabe
- **Error Rate**: Häufigkeit von Fehlern
- **Satisfaction Score**: Nutzerzufriedenheit
- **Accessibility Score**: WCAG-Konformität

### Berichtsvorlage
```
Test Session: [Datum]
Tester: [Name]
Geräte: [Liste]
Ergebnisse:
- Erfolgreiche Tests: X/Y
- Kritische Fehler: X
- Verbesserungspotenzial: X/5

Top Issues:
1. [Beschreibung] - [Schweregrad]
2. [Beschreibung] - [Schweregrad]
3. [Beschreibung] - [Schweregrad]

Empfehlungen:
- [Immediate Actions]
- [Short-term Improvements]  
- [Long-term Strategy]
```

Diese explorativen Tests sollten regelmäßig durchgeführt werden, besonders vor neuen Releases, um kontinuierliche Qualität sicherzustellen.