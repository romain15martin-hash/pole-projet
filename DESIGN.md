# DESIGN.md – Design System & Visual Language (Impeccable Standard)

## 1. Palette & Surface Tokens
Le système visuel est inspiré des identités de prestige universitaire et de l'énergie festive du campus Paris-Saclay.

### Surface Hierarchy (Dark Mode First, High Contrast)
- **Background (`--bg`):** Deep obsidian navy `#070B19` (avec subtil dégradé radial d'ambiance teinté CentraleSupélec `#D6226B0d` et indigo `#4F46E50c`).
- **Elevated Surfaces (`--surface`):** `#0E162E`, bordure fine `#1E2B52`.
- **Hover/Soft Surfaces (`--surface-hover`):** `#162348`.
- **Active Surface / Cards (`--surface-raised`):** `#141F3E`.

### Brand Signals & Theme Palette
- **CentraleSupélec Framboise (`--primary`):** `#D6226B` (vibrant, énergique, signature institutionnelle).
- **Primary Hover:** `#E8317D`.
- **Text Ink High:** `#F1F5F9` (98% luminance, contrast > 10:1 sur fond sombre).
- **Text Ink Muted:** `#94A3B8` (contrast > 4.5:1 sur surfaces).

### Category Semantics
Chaque thème d'évènement possède son identité chromatique unique, jamais arbitraire :
- **Soirées :** Rose néon `#F43F5E` (énergie nocturne, fêtes, soirées d'inté).
- **Culture :** Ambre or `#F59E0B` (débats, projections, conférences, symposium).
- **Art :** Violet électrique `#8B5CF6` (musique, théâtre, photo, scènes ouvertes, Commus).
- **Sports :** Émeraude vive `#10B981` (tournois, BDS, raid, voile, cheerleading).

### CoinCS Accent
- **Or / Trophée :** `#F59E0B` et gradient chaud `#FF6B4A` pour le jeu mythique de coincoin.

## 2. Typography
- **Headings & Brand:** `Space Grotesk` (géométrique, moderne, caractère affirmé, tracking -0.02em).
- **Body & Controls:** `Plus Jakarta Sans` (haute lisibilité, modernité sans la fadeur d'Inter, humaniste).
- **Numbers / Dates / Scores:** Chiffres tabulaires (`font-variant-numeric: tabular-nums`) pour aligner parfaitement les horaires, scores Elo, dates.

## 3. Motion & Micro-interactions
- **Principle:** Mouvements courts, physiques et ciblés. Pas de transitions lentes qui font attendre l'utilisateur.
- **Feedback:** Rétroactions haptiques visuelles : micro-clic, pulsation subtile de la journée active, confettis lors des victoires de CoinCS ou de la publication d'un évènement.
- **Modales & Drawers:** Ouverture avec backdrop-blur (`backdrop-blur-md`) et animation douce `scale-95 to scale-100`.

## 4. Anti-Patterns Explicitement Bannis (Règles Impeccable)
- Pas de gris neutre fade (#888888) sur fond coloré : toujours teinté de bleu/ardoise.
- Pas de bordures épaisses ou criardes : bordures ultra-fines semi-transparentes (`border-white/10` ou `border-slate-800`).
- Pas de "cards dans des cards" répétitives.
- Pas d'Inter par défaut : typographie choisie avec intention (`Space Grotesk` + `Plus Jakarta Sans`).
- Pas d'iframe vieillotte pour CoinCS : intégration native moderne en composants Vue réactifs.
