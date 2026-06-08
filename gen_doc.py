# -*- coding: utf-8 -*-
"""Génère la documentation fonctionnelle & technique d'Ymmo en .docx."""
from docx import Document
from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

# ── Palette ───────────────────────────────────────────────────────────────────
INK   = RGBColor(0x1A, 0x22, 0x30)   # charcoal navy (titres)
GRAY  = RGBColor(0x55, 0x55, 0x55)
GOLDD = RGBColor(0x8A, 0x6D, 0x3B)   # or sombre (accents texte)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
HEADER_FILL  = "1A2230"
ZEBRA_FILL   = "F4F4F2"
CALLOUT_FILL = "FAF6EE"
RULE_COLOR   = "E0DAC9"
BORDER_COLOR = "D9D9D9"
FONT = "Calibri"

doc = Document()

# ── Helpers bas niveau ────────────────────────────────────────────────────────
def set_fonts(rpr, name):
    rf = rpr.find(qn('w:rFonts'))
    if rf is None:
        rf = OxmlElement('w:rFonts'); rpr.append(rf)
    for a in ('w:ascii', 'w:hAnsi', 'w:cs'):
        rf.set(qn(a), name)

def style_font(style, name=FONT, size=None, bold=None, color=None):
    style.font.name = name
    if size is not None: style.font.size = size
    if bold is not None: style.font.bold = bold
    if color is not None: style.font.color.rgb = color
    set_fonts(style.element.get_or_add_rPr(), name)

def para_border_bottom(p, color, sz="6", space="6"):
    pPr = p._p.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    b = OxmlElement('w:bottom')
    b.set(qn('w:val'), 'single'); b.set(qn('w:sz'), sz)
    b.set(qn('w:space'), space); b.set(qn('w:color'), color)
    pBdr.append(b); pPr.append(pBdr)

def style_border_bottom(style, color, sz="6", space="6"):
    pPr = style.element.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    b = OxmlElement('w:bottom')
    b.set(qn('w:val'), 'single'); b.set(qn('w:sz'), sz)
    b.set(qn('w:space'), space); b.set(qn('w:color'), color)
    pBdr.append(b); pPr.append(pBdr)

def cell_bg(cell, hexc):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), hexc)
    tcPr.append(shd)

def table_borders(table, color=BORDER_COLOR, sz="4"):
    tblPr = table._tbl.tblPr
    b = OxmlElement('w:tblBorders')
    for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        e = OxmlElement(f'w:{edge}')
        e.set(qn('w:val'), 'single'); e.set(qn('w:sz'), sz)
        e.set(qn('w:space'), '0'); e.set(qn('w:color'), color)
        b.append(e)
    tblPr.append(b)
    mar = OxmlElement('w:tblCellMar')
    for edge, w in (('top', 40), ('bottom', 40), ('left', 110), ('right', 110)):
        m = OxmlElement(f'w:{edge}')
        m.set(qn('w:w'), str(w)); m.set(qn('w:type'), 'dxa')
        mar.append(m)
    tblPr.append(mar)

def set_widths(table, widths_cm):
    table.autofit = False
    table.allow_autofit = False
    for row in table.rows:
        for i, w in enumerate(widths_cm):
            row.cells[i].width = Cm(w)

def add_field(paragraph, instr):
    r = paragraph.add_run()
    f1 = OxmlElement('w:fldChar'); f1.set(qn('w:fldCharType'), 'begin')
    it = OxmlElement('w:instrText'); it.set(qn('xml:space'), 'preserve'); it.text = instr
    f2 = OxmlElement('w:fldChar'); f2.set(qn('w:fldCharType'), 'separate')
    t  = OxmlElement('w:t'); t.text = ""
    f3 = OxmlElement('w:fldChar'); f3.set(qn('w:fldCharType'), 'end')
    for el in (f1, it, f2, t, f3):
        r._r.append(el)
    return r

# ── Styles natifs ─────────────────────────────────────────────────────────────
style_font(doc.styles['Normal'], size=Pt(11), color=RGBColor(0x22, 0x22, 0x22))
npf = doc.styles['Normal'].paragraph_format
npf.line_spacing = 1.15
npf.space_before = Pt(0)
npf.space_after = Pt(8)
npf.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

style_font(doc.styles['Heading 1'], size=Pt(19), bold=True, color=INK)
h1pf = doc.styles['Heading 1'].paragraph_format
h1pf.space_before = Pt(0); h1pf.space_after = Pt(10)
h1pf.keep_with_next = True; h1pf.page_break_before = True
style_border_bottom(doc.styles['Heading 1'], "C9A24B", sz="8", space="6")

style_font(doc.styles['Heading 2'], size=Pt(14), bold=True, color=INK)
h2pf = doc.styles['Heading 2'].paragraph_format
h2pf.space_before = Pt(14); h2pf.space_after = Pt(6); h2pf.keep_with_next = True

style_font(doc.styles['Heading 3'], size=Pt(12), bold=True, color=GRAY)
h3pf = doc.styles['Heading 3'].paragraph_format
h3pf.space_before = Pt(10); h3pf.space_after = Pt(4); h3pf.keep_with_next = True

for s in ('List Bullet', 'List Number'):
    style_font(doc.styles[s], size=Pt(11), color=RGBColor(0x22, 0x22, 0x22))
    doc.styles[s].paragraph_format.space_after = Pt(4)
    doc.styles[s].paragraph_format.line_spacing = 1.15

# ── Marges ────────────────────────────────────────────────────────────────────
sec = doc.sections[0]
sec.top_margin = Cm(2.4); sec.bottom_margin = Cm(2.2)
sec.left_margin = Cm(2.5); sec.right_margin = Cm(2.5)

# ── Pied de page (numérotation, sauf page de garde) ───────────────────────────
sec.different_first_page_header_footer = True
fp = sec.footer.paragraphs[0]
fp.paragraph_format.tab_stops.add_tab_stop(Cm(16.0), WD_TAB_ALIGNMENT.RIGHT)
r = fp.add_run("Ymmo · Documentation fonctionnelle & technique")
r.font.size = Pt(8); r.font.color.rgb = GRAY; r.font.name = FONT
fp.add_run("\t").font.size = Pt(8)
add_field(fp, "PAGE")
para_border_bottom  # noqa (rule added below via top border)
# bordure haute discrète sur le pied
pPr = fp._p.get_or_add_pPr()
pBdr = OxmlElement('w:pBdr'); top = OxmlElement('w:top')
top.set(qn('w:val'), 'single'); top.set(qn('w:sz'), '4'); top.set(qn('w:space'), '4'); top.set(qn('w:color'), RULE_COLOR)
pBdr.append(top); pPr.append(pBdr)

# ── Helpers contenu ───────────────────────────────────────────────────────────
def para(*segments, style=None, align=None, before=None, after=None, size=None, color=None):
    p = doc.add_paragraph(style=style)
    if align is not None: p.alignment = align
    if before is not None: p.paragraph_format.space_before = before
    if after is not None: p.paragraph_format.space_after = after
    for seg in segments:
        if isinstance(seg, tuple):
            text, fmt = seg
        else:
            text, fmt = seg, ""
        run = p.add_run(text)
        if 'b' in fmt: run.bold = True
        if 'i' in fmt: run.italic = True
        if size is not None: run.font.size = size
        if color is not None: run.font.color.rgb = color
    return p

def h1(t): doc.add_heading(t, level=1)
def h2(t): doc.add_heading(t, level=2)
def h3(t): doc.add_heading(t, level=3)

def bullets(items):
    for it in items:
        p = doc.add_paragraph(style='List Bullet')
        if isinstance(it, tuple):
            run = p.add_run(it[0]); run.bold = True
            p.add_run(it[1])
        else:
            p.add_run(it)

def separator():
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(4); p.paragraph_format.space_after = Pt(4)
    para_border_bottom(p, RULE_COLOR, sz="4", space="2")

def table(headers, rows, widths=None):
    t = doc.add_table(rows=1, cols=len(headers))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_borders(t)
    for i, htext in enumerate(headers):
        c = t.rows[0].cells[i]; cell_bg(c, HEADER_FILL)
        pp = c.paragraphs[0]; pp.paragraph_format.space_after = Pt(2); pp.paragraph_format.space_before = Pt(2)
        run = pp.add_run(htext); run.bold = True; run.font.color.rgb = WHITE; run.font.size = Pt(10)
    for ridx, row in enumerate(rows):
        cells = t.add_row().cells
        fill = "FFFFFF" if ridx % 2 == 0 else ZEBRA_FILL
        for i, val in enumerate(row):
            c = cells[i]; cell_bg(c, fill)
            pp = c.paragraphs[0]; pp.paragraph_format.space_after = Pt(2); pp.paragraph_format.space_before = Pt(2)
            segs = val if isinstance(val, list) else [val]
            for seg in segs:
                text, fmt = (seg if isinstance(seg, tuple) else (seg, ""))
                run = pp.add_run(text); run.font.size = Pt(10)
                if 'b' in fmt: run.bold = True
    if widths: set_widths(t, widths)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return t

def callout(label, *segments, fill=CALLOUT_FILL, accent="C9A24B"):
    t = doc.add_table(rows=1, cols=1)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_widths(t, [16.0])
    c = t.cell(0, 0); cell_bg(c, fill)
    tcPr = c._tc.get_or_add_tcPr()
    bd = OxmlElement('w:tcBorders')
    specs = {'left': (accent, '24'), 'top': (BORDER_COLOR, '4'),
             'bottom': (BORDER_COLOR, '4'), 'right': (BORDER_COLOR, '4')}
    for edge, (col, sz) in specs.items():
        e = OxmlElement(f'w:{edge}')
        e.set(qn('w:val'), 'single'); e.set(qn('w:sz'), sz); e.set(qn('w:space'), '0'); e.set(qn('w:color'), col)
        bd.append(e)
    tcPr.append(bd)
    mar = OxmlElement('w:tcMar')
    for edge, w in (('top', 90), ('bottom', 90), ('left', 200), ('right', 160)):
        m = OxmlElement(f'w:{edge}'); m.set(qn('w:w'), str(w)); m.set(qn('w:type'), 'dxa'); mar.append(m)
    tcPr.append(mar)
    pp = c.paragraphs[0]; pp.paragraph_format.space_after = Pt(0); pp.alignment = WD_ALIGN_PARAGRAPH.LEFT
    lab = pp.add_run(label + "   "); lab.bold = True; lab.font.color.rgb = GOLDD; lab.font.size = Pt(10.5)
    for seg in segments:
        text, fmt = (seg if isinstance(seg, tuple) else (seg, ""))
        run = pp.add_run(text); run.font.size = Pt(10.5)
        if 'b' in fmt: run.bold = True
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return t

# ══════════════════════════════════════════════════════════════════════════════
# PAGE DE GARDE
# ══════════════════════════════════════════════════════════════════════════════
top_rule = doc.add_paragraph(); top_rule.alignment = WD_ALIGN_PARAGRAPH.CENTER
rr = top_rule.add_run("PLATEFORME IMMOBILIÈRE DE PRESTIGE")
rr.font.size = Pt(11); rr.font.color.rgb = GOLDD; rr.font.bold = True
rr._r.get_or_add_rPr().append(OxmlElement('w:spacing'))
rr._r.rPr.find(qn('w:spacing')).set(qn('w:val'), '60')

for _ in range(5):
    doc.add_paragraph()

title = doc.add_paragraph(); title.alignment = WD_ALIGN_PARAGRAPH.CENTER
tr = title.add_run("Ymmo")
tr.font.size = Pt(54); tr.font.bold = True; tr.font.color.rgb = INK; tr.font.name = FONT
tr._r.get_or_add_rPr().append(OxmlElement('w:spacing'))
tr._r.rPr.find(qn('w:spacing')).set(qn('w:val'), '40')

sub = doc.add_paragraph(); sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
sr = sub.add_run("Documentation fonctionnelle & technique")
sr.font.size = Pt(18); sr.font.color.rgb = GRAY; sr.italic = True

rule = doc.add_paragraph(); rule.alignment = WD_ALIGN_PARAGRAPH.CENTER
rule.paragraph_format.space_before = Pt(10); rule.paragraph_format.space_after = Pt(6)
rl = rule.add_run("— ⁂ —"); rl.font.color.rgb = GOLDD; rl.font.size = Pt(14)

desc = doc.add_paragraph(); desc.alignment = WD_ALIGN_PARAGRAPH.CENTER
dr = desc.add_run("Vitrine de biens d'exception et espace de gestion pour l'agence")
dr.font.size = Pt(11.5); dr.font.color.rgb = GRAY

for _ in range(8):
    doc.add_paragraph()

meta = doc.add_paragraph(); meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
m1 = meta.add_run("7 juin 2026"); m1.font.size = Pt(11); m1.bold = True; m1.font.color.rgb = INK
meta.add_run("\n")
m2 = meta.add_run("Rédigé par Takido"); m2.font.size = Pt(11); m2.font.color.rgb = GRAY
meta.add_run("\n")
m3 = meta.add_run("Document interne — diffusion restreinte"); m3.font.size = Pt(9); m3.italic = True; m3.font.color.rgb = GRAY

doc.add_page_break()

# ══════════════════════════════════════════════════════════════════════════════
# TABLE DES MATIÈRES
# ══════════════════════════════════════════════════════════════════════════════
toc_title = doc.add_paragraph()
tt = toc_title.add_run("Table des matières")
tt.font.size = Pt(20); tt.bold = True; tt.font.color.rgb = INK
toc_title.paragraph_format.space_after = Pt(10)
para_border_bottom(toc_title, "C9A24B", sz="8", space="6")

toc_p = doc.add_paragraph()
add_field(toc_p, 'TOC \\o "1-3" \\h \\z \\u')

# ══════════════════════════════════════════════════════════════════════════════
# 1. PROJET
# ══════════════════════════════════════════════════════════════════════════════
h1("Ymmo, une vitrine pensée pour le haut de gamme")

para("Ymmo est une plateforme web dédiée à la présentation et à la "
     "commercialisation de biens immobiliers d'exception. Elle réunit, dans une "
     "même expérience, une vitrine éditoriale soignée à destination des "
     "acquéreurs et un espace de gestion complet pour les équipes de l'agence.")

para("Le parti pris est assumé : sobriété, typographie travaillée et photographie "
     "mise en avant. L'objectif n'est pas d'empiler les fonctionnalités, mais de "
     "donner à chaque bien la présentation qu'il mérite.")

callout("En bref",
        "Un catalogue de 100 biens de démonstration, une recherche multicritère, "
        "une messagerie intégrée et une cartographie interactive, le tout adossé "
        "à une API REST sécurisée.")

h2("À qui s'adresse la plateforme")
para("Deux publics cohabitent. D'un côté, ", ("le visiteur", "b"),
     " — acquéreur potentiel — qui explore le catalogue, affine sa recherche et "
     "prend contact. De l'autre, ", ("les équipes de l'agence", "b"),
     " qui publient les annonces, suivent les demandes et pilotent le contenu "
     "depuis un espace réservé.")

h2("Ce que couvre ce document")
para("Cette documentation s'adresse autant aux décideurs qu'aux équipes "
     "techniques. La première moitié décrit ce que fait la plateforme ; la "
     "seconde, comment elle est construite, déployée et sécurisée. Les deux "
     "lectures sont indépendantes.")

# ══════════════════════════════════════════════════════════════════════════════
# 2. VISITEUR
# ══════════════════════════════════════════════════════════════════════════════
h1("Le parcours du visiteur, de la découverte au contact")

h2("Une page d'accueil qui pose le ton")
para("Dès l'arrivée, un bien est mis en avant — le plus prestigieux du catalogue "
     "— accompagné d'une présentation de l'agence. L'intention est claire : "
     "installer immédiatement un univers, plutôt que de noyer le visiteur sous "
     "les options.")

h2("Un catalogue qui se laisse filtrer finement")
para("Le catalogue présente l'ensemble des biens, paginés pour rester fluides. "
     "La recherche multicritère permet de cibler précisément un besoin, et les "
     "résultats se rafraîchissent sans rechargement de page.")

table(
    ["Critère", "Ce qu'il permet"],
    [
        ["Recherche libre", "Cible le nom, la localisation et la description"],
        ["Type de bien", "Villa, appartement ou maison"],
        ["Fourchette de prix", "Montant minimum et maximum"],
        ["Surface", "De… à… en mètres carrés"],
        ["Chambres", "Nombre minimum souhaité"],
        ["Salles de bain", "Nombre minimum souhaité"],
        ["Stationnement", "Nombre de places minimum"],
        ["Tri", "Plus récent, prix ou surface"],
    ],
    widths=[5.0, 11.0],
)

para("Cette granularité distingue Ymmo d'un simple listing : le visiteur "
     "construit sa propre sélection plutôt que de subir un défilement.")

separator()

h2("La fiche d'un bien, complète et rassurante")
para("Chaque bien dispose d'une page dédiée : galerie photographique, "
     "caractéristiques clés (chambres, salles de bain, surface, stationnement), "
     "description détaillée et prestations. Une carte situe précisément le bien, "
     "et un formulaire de contact — pré-rempli avec la référence — facilite la "
     "prise de contact immédiate.")

h2("Une prise de contact sans friction")
para("Qu'il parte d'une fiche ou de la page de contact générale, chaque message "
     "est transmis à l'agence avec son contexte. Le visiteur n'a jamais à "
     "recopier les informations du bien : elles voyagent avec sa demande.")

# ══════════════════════════════════════════════════════════════════════════════
# 3. ADMIN
# ══════════════════════════════════════════════════════════════════════════════
h1("L'espace d'administration, cœur opérationnel de l'agence")

para("Réservé aux équipes autorisées, l'espace d'administration s'organise en "
     "deux volets : la gestion des biens et la messagerie client.")

h2("Publier et tenir à jour les biens")
para("La création d'une annonce se fait depuis un formulaire unique qui regroupe "
     "les informations essentielles, le téléversement des photographies et le "
     "choix de l'emplacement sur une carte. La modification et la suppression "
     "suivent la même logique, avec une confirmation avant tout retrait "
     "définitif.")

para("Le choix de la localisation mérite une mention : plutôt que de saisir des "
     "coordonnées, l'administrateur ", ("clique directement sur la carte", "b"),
     " pour placer le bien, puis ajuste le marqueur si besoin.")

h2("Traiter les demandes depuis une messagerie intégrée")
para("Toutes les demandes reçues sont consultables au même endroit, avec "
     "l'intégralité des informations : nom, email, téléphone, sujet et message "
     "complet. Lorsqu'une demande concerne un bien précis, celui-ci est "
     "directement cliquable. Un bouton permet de répondre par email, un autre de "
     "supprimer le message après traitement.")

h2("Visualiser le patrimoine sur une carte")
para("Un aperçu cartographique rassemble l'ensemble des biens sur une carte de "
     "France. Chaque point ouvre une bulle d'information renvoyant vers la fiche "
     "correspondante — un coup d'œil suffit pour saisir la répartition "
     "géographique du portefeuille.")

callout("Accès réservé",
        "L'espace d'administration n'est accessible qu'aux rôles disposant des "
        "droits de gestion. Un visiteur ou un compte standard n'en voit jamais "
        "l'entrée.")

# ══════════════════════════════════════════════════════════════════════════════
# 4. ROLES & SECURITE
# ══════════════════════════════════════════════════════════════════════════════
h1("Rôles, droits d'accès et sécurité")

h2("Quatre niveaux de responsabilité")
para("Les permissions suivent une logique progressive : chaque rôle hérite des "
     "possibilités du précédent et y ajoute les siennes.")

table(
    ["Rôle", "Périmètre d'action"],
    [
        ["Utilisateur", "Consultation du catalogue et envoi de messages"],
        ["Responsable d'agence", "Création et modification des biens, lecture des messages"],
        ["Administrateur", "Suppression des biens et des messages"],
        ["Super-administrateur", "Contrôle total de la plateforme"],
    ],
    widths=[5.5, 10.5],
)

h2("Des protections à chaque étage")
para("La sécurité ne repose pas sur une mesure unique mais sur une série de "
     "garde-fous complémentaires.")
bullets([
    ("En-têtes HTTP durcis", " via Helmet, pour limiter les vecteurs d'attaque courants."),
    ("Limitation de débit", " sur l'API, avec un seuil plus strict sur l'authentification."),
    ("Mots de passe hachés", " avec bcrypt (12 itérations) — jamais stockés en clair."),
    ("Validation systématique", " des entrées via Zod, avant toute opération en base."),
    ("Jetons JWT signés", " pour authentifier chaque requête protégée."),
])

callout("Point de vigilance",
        ("Le secret de signature des jetons (JWT_SECRET) est obligatoire : le "
         "serveur refuse de démarrer sans lui. "), ("Aucune valeur par défaut "
        "n'est tolérée en clair.", "b"))

# ══════════════════════════════════════════════════════════════════════════════
# 5. ARCHITECTURE
# ══════════════════════════════════════════════════════════════════════════════
h1("L'architecture technique en un coup d'œil")

h2("Une séparation nette entre vitrine et services")
para("Le frontend est une application monopage (SPA) qui dialogue avec une API "
     "REST. Cette dernière concentre la logique métier et la persistance, "
     "assurée par une base PostgreSQL pilotée via Prisma. Les deux mondes "
     "communiquent uniquement par des appels HTTP, ce qui les rend évolutifs "
     "indépendamment.")

table(
    ["Couche", "Technologies principales"],
    [
        ["Interface", "React, Vite, TypeScript, TailwindCSS"],
        ["État & données", "TanStack Query, Axios, React Router"],
        ["Cartographie", "Leaflet, OpenStreetMap"],
        ["API", "Node.js, Express, TypeScript"],
        ["Données", "Prisma, PostgreSQL"],
        ["Sécurité", "JWT, bcrypt, Helmet, Zod"],
    ],
    widths=[4.5, 11.5],
)

h2("Une organisation de code lisible")
para("Le dépôt sépare clairement ", ("backend", "b"), " et ", ("frontend", "b"),
     ". Côté serveur, les responsabilités sont éclatées en routes, contrôleurs, "
     "schémas de validation et middlewares. Côté client, le code s'articule "
     "autour de pages, de composants réutilisables et de hooks d'accès aux "
     "données.")

h2("Le cheminement d'une requête")
para("Une requête entrante traverse d'abord la limitation de débit, puis la "
     "validation des données. Le contrôleur exécute alors la logique métier et "
     "interroge la base via Prisma. En cas d'anomalie, un gestionnaire d'erreurs "
     "centralisé renvoie une réponse cohérente — jamais une fuite technique.")

# ══════════════════════════════════════════════════════════════════════════════
# 6. DONNEES
# ══════════════════════════════════════════════════════════════════════════════
h1("Le modèle de données")

para("Cinq entités structurent l'application. Leur découpage reste volontairement "
     "simple, au service de la lisibilité.")

table(
    ["Entité", "Rôle", "Champs notables"],
    [
        ["Bien", "Annonce immobilière", "prix, surface, pièces, localisation, détails"],
        ["Média", "Photo rattachée à un bien", "chemin du fichier"],
        ["Type de bien", "Catégorie", "nom (villa, appartement, maison)"],
        ["Message", "Demande d'un visiteur", "coordonnées, sujet, contenu"],
        ["Utilisateur", "Compte de gestion", "rôle, identifiants, mot de passe haché"],
    ],
    widths=[3.2, 5.0, 7.8],
)

h2("Les relations qui structurent le catalogue")
para("Un bien appartient à un type et porte plusieurs photos — celles-ci sont "
     "supprimées avec lui. Un message peut référencer un bien précis sans pour "
     "autant créer de dépendance forte, ce qui autorise des demandes générales.")

callout("Choix d'implémentation",
        "Les coordonnées géographiques choisies à la carte sont stockées dans le "
        "champ « détails » du bien. Ce choix évite une migration de schéma tout "
        "en gardant la donnée en base.")

# ══════════════════════════════════════════════════════════════════════════════
# 7. API
# ══════════════════════════════════════════════════════════════════════════════
h1("L'API REST, contrat entre la vitrine et les services")

para("L'ensemble des échanges passe par une API préfixée par « /api ». Les "
     "routes publiques alimentent la vitrine ; les routes protégées exigent un "
     "jeton valide et un rôle suffisant.")

table(
    ["Méthode", "Route", "Accès"],
    [
        ["POST", "/api/auth/login", "Public"],
        ["GET", "/api/auth/me", "Authentifié"],
        ["GET", "/api/properties", "Public"],
        ["GET", "/api/properties/locations", "Public"],
        ["GET", "/api/properties/:id", "Public"],
        ["POST", "/api/properties", "Gestion"],
        ["PUT", "/api/properties/:id", "Gestion"],
        ["DELETE", "/api/properties/:id", "Admin"],
        ["GET", "/api/property-types", "Public"],
        ["POST", "/api/contact", "Public"],
        ["GET", "/api/contact", "Gestion"],
        ["POST", "/api/uploads", "Gestion"],
    ],
    widths=[2.6, 8.4, 5.0],
)

para("La liste des biens renvoie également la pagination (page courante, total, "
     "nombre de pages), ce qui permet à l'interface d'afficher une navigation "
     "fiable sans calcul côté client.")

# ══════════════════════════════════════════════════════════════════════════════
# 8. MEDIAS & CARTO
# ══════════════════════════════════════════════════════════════════════════════
h1("Médias et cartographie")

h2("Des photos hébergées par le serveur")
para("Les photographies ne sont plus de simples liens externes : elles sont "
     "téléversées, stockées sur le serveur et servies par lui. À l'envoi, seuls "
     "les formats image sont acceptés, dans une limite raisonnable de taille et "
     "de nombre. Les anciennes URLs externes restent toutefois prises en charge, "
     "pour ne pas casser les données de démonstration.")

h2("Une cartographie sans clé d'API")
para("La carte repose sur Leaflet et les fonds OpenStreetMap, sans dépendance à "
     "un service payant. Lorsque l'administrateur ne place pas manuellement un "
     "bien, sa position est déduite d'un dictionnaire interne couvrant la "
     "quasi-totalité des communes du catalogue.")

callout("Sans coût caché",
        "Aucune clé d'API tierce n'est requise pour la cartographie : ni Google "
        "Maps, ni service de géocodage facturé.")

# ══════════════════════════════════════════════════════════════════════════════
# 9. INSTALLATION
# ══════════════════════════════════════════════════════════════════════════════
h1("Installation et exploitation")

h2("Prérequis")
table(
    ["Outil", "Version conseillée"],
    [
        ["Node.js", "20 LTS"],
        ["PostgreSQL", "15"],
        ["Git", "Récente"],
    ],
    widths=[8.0, 8.0],
)

h2("Mettre en route en local")
para("La séquence reste classique : récupérer le dépôt, préparer la base, "
     "renseigner les variables d'environnement, installer les dépendances des "
     "deux projets, appliquer les migrations puis injecter le jeu de "
     "démonstration. Deux terminaux suffisent ensuite — l'un pour l'API, l'autre "
     "pour l'interface.")

h2("Le compte de démonstration")
callout("Accès de test",
        ("admin@prestige-immobilier.fr", "b"),
        ("  /  Admin123!", "b"))

h2("Résoudre les incidents fréquents")
table(
    ["Symptôme", "Cause probable", "Solution"],
    [
        ["« JWT_SECRET doit être défini »", "Fichier .env absent", "Créer backend/.env avec la variable"],
        ["« Can't reach database server »", "PostgreSQL arrêté", "Démarrer le service de base de données"],
        ["Port déjà utilisé", "Processus concurrent", "Libérer le port ou en changer"],
    ],
    widths=[4.8, 4.6, 6.6],
)

# ══════════════════════════════════════════════════════════════════════════════
# 10. EVOLUTIONS
# ══════════════════════════════════════════════════════════════════════════════
h1("Perspectives d'évolution")

para("La plateforme est volontairement sobre, ce qui laisse de la place pour des "
     "améliorations ciblées plutôt que pour une fuite en avant fonctionnelle. "
     "Plusieurs pistes se dégagent naturellement.")

bullets([
    ("Authentification par cookie sécurisé", " (httpOnly), pour renforcer la protection du jeton."),
    ("Colonnes géographiques dédiées", " si le besoin de requêtes spatiales apparaît."),
    ("Regroupement des marqueurs", " sur les zones denses, comme la Côte d'Azur."),
    ("Recherche plein-texte indexée", " pour accélérer les gros volumes."),
])

para("Aucune de ces évolutions n'est bloquante aujourd'hui : ce sont des "
     "optimisations, à prioriser selon l'usage réel et les retours du terrain.")

doc.save("Ymmo - Documentation fonctionnelle et technique.docx")
print("DOCX généré.")
