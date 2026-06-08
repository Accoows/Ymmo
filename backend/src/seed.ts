import "dotenv/config";
import bcrypt from "bcryptjs";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Pool de photos Unsplash (10 visuels luxe immobilier) ───────────────────
const P = {
  villaExt:    "https://images.unsplash.com/photo-1622015663381-d2e05ae91b72?w=1080&q=80",
  pool:        "https://images.unsplash.com/photo-1759256243437-9c8f7238c42b?w=1080&q=80",
  living:      "https://images.unsplash.com/photo-1738168279272-c08d6dd22002?w=1080&q=80",
  kitchen:     "https://images.unsplash.com/photo-1658280911730-467b4764c09c?w=1080&q=80",
  bedroom:     "https://images.unsplash.com/photo-1702411200201-3061d0eea802?w=1080&q=80",
  bathroom:    "https://images.unsplash.com/photo-1760564019103-81cd3c225cd1?w=1080&q=80",
  penthouse:   "https://images.unsplash.com/photo-1585311746214-764246524f52?w=1080&q=80",
  dining:      "https://images.unsplash.com/photo-1771888703720-6a55f70dcbed?w=1080&q=80",
  houseArch:   "https://images.unsplash.com/photo-1627141234469-24711efb373c?w=1080&q=80",
  townhouse:   "https://images.unsplash.com/photo-1763725639193-d96de34ec7b1?w=1080&q=80",
};

// Retourne un sous-ensemble de photos du pool selon un offset (rotation).
function photos(offset: number, count = 4): string[] {
  const all = Object.values(P);
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(all[(offset + i) % all.length]);
  }
  return result;
}

// ─── Agences & affectation géographique ─────────────────────────────────────
type AgencyKey = "COTE_AZUR" | "PROVENCE" | "PARIS" | "SUD_OUEST" | "ALPES" | "OUEST" | "EST";

const AGENCY_INFO: Record<AgencyKey, { name: string; city: string; email: string; phone: string }> = {
  COTE_AZUR: { name: "Ymmo Côte d'Azur", city: "Nice", email: "cote-azur@ymmo.fr", phone: "+33 4 93 00 00 01" },
  PROVENCE:  { name: "Ymmo Provence", city: "Aix-en-Provence", email: "provence@ymmo.fr", phone: "+33 4 42 00 00 02" },
  PARIS:     { name: "Ymmo Paris", city: "Paris", email: "paris@ymmo.fr", phone: "+33 1 42 00 00 03" },
  SUD_OUEST: { name: "Ymmo Sud-Ouest", city: "Bordeaux", email: "sud-ouest@ymmo.fr", phone: "+33 5 56 00 00 04" },
  ALPES:     { name: "Ymmo Alpes", city: "Annecy", email: "alpes@ymmo.fr", phone: "+33 4 50 00 00 05" },
  OUEST:     { name: "Ymmo Grand Ouest", city: "Nantes", email: "grand-ouest@ymmo.fr", phone: "+33 2 40 00 00 06" },
  EST:       { name: "Ymmo Est", city: "Strasbourg", email: "est@ymmo.fr", phone: "+33 3 88 00 00 07" },
};

const AGENCY_BY_CITY: Record<string, AgencyKey> = {
  // Côte d'Azur (Alpes-Maritimes, Monaco)
  Nice: "COTE_AZUR", Cannes: "COTE_AZUR", Antibes: "COTE_AZUR", "Cap d'Antibes": "COTE_AZUR",
  "Èze": "COTE_AZUR", "Beaulieu-sur-Mer": "COTE_AZUR", "Villefranche-sur-Mer": "COTE_AZUR",
  Menton: "COTE_AZUR", Mougins: "COTE_AZUR", Valbonne: "COTE_AZUR", Grasse: "COTE_AZUR", Monaco: "COTE_AZUR",
  // Provence (Var, Bouches-du-Rhône, Vaucluse, Gard, Corse)
  "Saint-Tropez": "PROVENCE", Ramatuelle: "PROVENCE", "Sainte-Maxime": "PROVENCE",
  "La Croix-Valmer": "PROVENCE", "Cavalaire-sur-Mer": "PROVENCE", Gassin: "PROVENCE", Giens: "PROVENCE",
  Bandol: "PROVENCE", "Sanary-sur-Mer": "PROVENCE", Cassis: "PROVENCE", Marseille: "PROVENCE",
  "Aix-en-Provence": "PROVENCE", "Saint-Rémy-de-Provence": "PROVENCE", "Les Baux-de-Provence": "PROVENCE",
  Gordes: "PROVENCE", "Ménerbes": "PROVENCE", Lourmarin: "PROVENCE", Bonnieux: "PROVENCE",
  Roussillon: "PROVENCE", "Séguret": "PROVENCE", "Aigues-Mortes": "PROVENCE",
  "Saintes-Maries-de-la-Mer": "PROVENCE", "Uzès": "PROVENCE", "Saint-Jean-du-Gard": "PROVENCE", Bastia: "PROVENCE",
  // Sud-Ouest (Nouvelle-Aquitaine, Occitanie ouest)
  Bordeaux: "SUD_OUEST", Biarritz: "SUD_OUEST", "Saint-Jean-de-Luz": "SUD_OUEST", Ciboure: "SUD_OUEST",
  Espelette: "SUD_OUEST", Pauillac: "SUD_OUEST", Arcachon: "SUD_OUEST", "Gujan-Mestras": "SUD_OUEST",
  Cognac: "SUD_OUEST", "Tarascon-sur-Ariège": "SUD_OUEST", "Argelès-Gazost": "SUD_OUEST", Toulouse: "SUD_OUEST",
  "Sarlat-la-Canéda": "SUD_OUEST", Montignac: "SUD_OUEST", "Saint-Pierre-d'Oléron": "SUD_OUEST",
  "Saint-Martin-de-Ré": "SUD_OUEST", Montpellier: "SUD_OUEST", "Pézenas": "SUD_OUEST",
  // Alpes (Savoie, Haute-Savoie, Isère)
  "Megève": "ALPES", "Courchevel 1850": "ALPES", Annecy: "ALPES", Grenoble: "ALPES",
  // Grand Ouest (Bretagne, Normandie, Pays de la Loire, Val de Loire)
  Nantes: "OUEST", "La Baule": "OUEST", "Noirmoutier-en-l'Île": "OUEST", "Saint-Malo": "OUEST",
  "Saint-Briac-sur-Mer": "OUEST", Dinard: "OUEST", Crozon: "OUEST", Deauville: "OUEST",
  Honfleur: "OUEST", Vouvray: "OUEST",
  // Est & Nord (Alsace, Lorraine, Champagne, Hauts-de-France, Bourgogne, Rhône)
  Strasbourg: "EST", Obernai: "EST", Kaysersberg: "EST", Metz: "EST", "Épernay": "EST",
  Lille: "EST", "Le Touquet": "EST", "Nuits-Saint-Georges": "EST", "Villefranche-sur-Saône": "EST", Lyon: "EST",
};

function agencyKeyOf(localisation: string): AgencyKey {
  const primary = localisation.split(",")[0].trim();
  if (primary.startsWith("Paris")) return "PARIS";
  return AGENCY_BY_CITY[primary] ?? "PROVENCE";
}

async function main() {
  console.log("Seeding database...");

  await prisma.media.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.propertyType.deleteMany();
  await prisma.user.deleteMany();
  await prisma.agency.deleteMany();

  // ─── Agences ──────────────────────────────────────────────────────────────
  const agencyIds = {} as Record<AgencyKey, string>;
  for (const key of Object.keys(AGENCY_INFO) as AgencyKey[]) {
    const agency = await prisma.agency.create({ data: AGENCY_INFO[key] });
    agencyIds[key] = agency.id;
  }
  console.log(`  ${Object.keys(AGENCY_INFO).length} agences créées`);

  // ─── Utilisateurs ─────────────────────────────────────────────────────────
  const superPassword = await bcrypt.hash("Admin123!", 12);
  await prisma.user.create({
    data: {
      email: "admin@ymmo.fr",
      password: superPassword,
      username: "superadmin",
      firstName: "Super",
      lastName: "Admin",
      role: "Superadmin",
    },
  });
  console.log("  Superadmin créé (admin@ymmo.fr / Admin123!)");

  const headPassword = await bcrypt.hash("Agency123!", 12);
  for (const key of Object.keys(AGENCY_INFO) as AgencyKey[]) {
    const info = AGENCY_INFO[key];
    const slug = key.toLowerCase().replace(/_/g, "-");
    await prisma.user.create({
      data: {
        email: `${slug}.head@ymmo.fr`,
        password: headPassword,
        username: `head-${slug}`,
        firstName: "Responsable",
        lastName: info.name.replace("Ymmo ", ""),
        role: "AgencyHead",
        agencyId: agencyIds[key],
      },
    });
  }
  console.log(`  ${Object.keys(AGENCY_INFO).length} responsables d'agence créés (ex. cote-azur.head@ymmo.fr / Agency123!)`);

  // ─── Types de biens ───────────────────────────────────────────────────────
  const villa      = await prisma.propertyType.create({ data: { name: "villa" } });
  const appartement = await prisma.propertyType.create({ data: { name: "appartement" } });
  const maison     = await prisma.propertyType.create({ data: { name: "maison" } });
  console.log("  Property types created");

  // ─── 100 biens ────────────────────────────────────────────────────────────
  const propertiesData = [

    // ══════════════════════════════════════════════════════════════════════════
    // VILLAS (35)
    // ══════════════════════════════════════════════════════════════════════════
    {
      name: "Villa d'Exception Vue Mer",
      description: "Perchée sur les hauteurs de Saint-Tropez, cette villa de 550 m² s'ouvre sur une vue panoramique à 180° sur la Méditerranée. Terrain paysager de 2 500 m², héliport privatif et finitions d'orfèvre font de cette demeure un chef-d'œuvre absolu.",
      typeId: villa.id, localisation: "Saint-Tropez", price: 8900000, surface: 550, bedroom: 6, bathroom: 6, garage: 4,
      details: { year: 2023, features: ["Vue mer 180°", "Piscine à débordement 20 m", "Héliport privé", "Pool house", "Spa & hammam", "Domotique Bang & Olufsen", "Ascenseur intérieur", "Garage 4 voitures"] },
      photos: photos(0),
    },
    {
      name: "Villa Contemporaine Cannes",
      description: "Dans un quartier résidentiel de Cannes, cette villa contemporaine de 380 m² conjugue design minimaliste et matériaux nobles. Grandes baies vitrées, piscine à débordement chauffée et jardin de 1 200 m² paysagé par un artiste local.",
      typeId: villa.id, localisation: "Cannes, Côte d'Azur", price: 4950000, surface: 380, bedroom: 5, bathroom: 4, garage: 3,
      details: { year: 2022, features: ["Piscine chauffée", "Jardin 1 200 m²", "Domotique complète", "Cuisine Gaggenau", "Cave à vin", "Alarme & vidéosurveillance", "Terrasse vue mer", "Pergola bioclimatique"] },
      photos: photos(1),
    },
    {
      name: "Villa Domaine des Pins",
      description: "Au cœur d'un domaine privé de Nice, cette villa provençale de 420 m² est encadrée d'une pinède séculaire. Exposée plein sud, elle bénéficie d'une terrasse en pierre calcaire de 80 m² et d'une piscine à miroir.",
      typeId: villa.id, localisation: "Nice, Cimiez", price: 3800000, surface: 420, bedroom: 5, bathroom: 4, garage: 3,
      details: { year: 2019, features: ["Piscine miroir", "Terrasse 80 m²", "Pinède privée", "Cuisine d'été couverte", "Suite parentale de 60 m²", "Chauffage sol carrelé", "Double garage", "Portail automatisé"] },
      photos: photos(2),
    },
    {
      name: "Villa Cap d'Antibes",
      description: "Propriété rare sur la presqu'île du Cap d'Antibes, cette villa de 600 m² trône en bord de mer avec accès direct à une plage privée. L'architecture méridionale est rehaussée par des matériaux importés d'Italie.",
      typeId: villa.id, localisation: "Cap d'Antibes", price: 12500000, surface: 600, bedroom: 7, bathroom: 7, garage: 5,
      details: { year: 2021, features: ["Accès plage privée", "Piscine 25 m", "Embarcadère privé", "Spa 2 niveaux", "Salle de cinéma", "Cave 5 000 bouteilles", "Gardien sur place", "Système de sécurité périmétrique"] },
      photos: photos(3),
    },
    {
      name: "Villa Provençale Gordes",
      description: "Dans le Luberon classé, cette mas provençal du XVIIIe entièrement restauré offre une vue incomparable sur le village de Gordes. Pierre blonde, tuiles patinées et cyprès centenaires créent un tableau intemporel.",
      typeId: villa.id, localisation: "Gordes, Luberon", price: 2900000, surface: 350, bedroom: 5, bathroom: 4, garage: 2,
      details: { year: 2018, features: ["Mas XVIIIe restauré", "Piscine en pierre naturelle", "Truffe & lavande", "Oliviers centenaires", "Cave voûtée", "Cuisine provençale", "Cheminée d'époque", "Vue village de Gordes"] },
      photos: photos(4),
    },
    {
      name: "Villa Balnéaire Biarritz",
      description: "À deux pas des plages de la Grande Plage, cette villa basco-art-déco de 320 m² séduit par ses volumes hors normes et sa terrasse face à l'océan Atlantique. Rénovation intégrale en 2022 par un cabinet parisien renommé.",
      typeId: villa.id, localisation: "Biarritz, Côte Basque", price: 3600000, surface: 320, bedroom: 5, bathroom: 4, garage: 2,
      details: { year: 2022, features: ["Vue océan directe", "Terrasse 60 m²", "Piscine intérieure chauffée", "Sauna scandinave", "Salle de surf & sports", "Cave à vin", "Garage 2 voitures", "Système domotique KNX"] },
      photos: photos(5),
    },
    {
      name: "Chalet-Villa Megève",
      description: "Sur les hauteurs de Megève, ce chalet-villa de 480 m² conjugue esprit montagne et confort ultime. Expo plein sud, terrasse avec vue sur le Mont-Blanc, piscine couverte chauffée et spa privé.",
      typeId: villa.id, localisation: "Megève, Haute-Savoie", price: 5700000, surface: 480, bedroom: 6, bathroom: 5, garage: 4,
      details: { year: 2020, features: ["Vue Mont-Blanc", "Piscine couverte", "Jacuzzi extérieur", "Sauna & hammam", "Salle de ski équipée", "Bar à vin", "Cinéma privé", "Garage 4 voitures chauffé"] },
      photos: photos(6),
    },
    {
      name: "Villa Éze Village",
      description: "Accrochée à 400 m d'altitude sur la falaise d'Éze, cette villa de 280 m² offre la vue la plus spectaculaire de la Riviera. Architecture contemporaine, infinity pool et jardin suspendu planté d'essences méditerranéennes.",
      typeId: villa.id, localisation: "Èze, Alpes-Maritimes", price: 4100000, surface: 280, bedroom: 4, bathroom: 3, garage: 2,
      details: { year: 2021, features: ["Vue mer panoramique unique", "Infinity pool", "Jardin suspendu", "Ascenseur panoramique", "Cuisine ouverte Bulthaup", "Suite avec terrasse privée", "Accès village médiéval", "Sécurité renforcée"] },
      photos: photos(7),
    },
    {
      name: "Villa Beaulieu-sur-Mer",
      description: "Dans le quartier prisé de Beaulieu-sur-Mer, entre Monaco et Nice, cette villa Belle Époque de 500 m² a conservé tous ses ornements d'origine tout en intégrant les dernières technologies.",
      typeId: villa.id, localisation: "Beaulieu-sur-Mer", price: 6800000, surface: 500, bedroom: 6, bathroom: 5, garage: 3,
      details: { year: 2024, features: ["Villa Belle Époque restaurée", "Grand parc de 2 000 m²", "Piscine historique en carrelage", "Bibliothèque d'apparat", "Office et cuisine séparée", "Logement gardien", "Tennis privé", "Accès mer à pied"] },
      photos: photos(8),
    },
    {
      name: "Villa Mougins Design",
      description: "Dans un domaine sécurisé de Mougins, cette villa contemporaine de 460 m² a été conçue par un architecte primé. Formes épurées, béton ciré et baies coulissantes ouvrent sur un paysage verdoyant à perte de vue.",
      typeId: villa.id, localisation: "Mougins, Alpes-Maritimes", price: 3900000, surface: 460, bedroom: 5, bathroom: 5, garage: 4,
      details: { year: 2023, features: ["Architecture signée", "Béton ciré & bois massif", "Piscine 18 m naturelle", "Salle de sport pro", "Studio indépendant", "Potager & verger", "Domotique intégrale", "Portail biométrique"] },
      photos: photos(9),
    },
    {
      name: "Villa Ramatuelle Vignobles",
      description: "Nichée parmi les vignobles de Ramatuelle, à 5 minutes de Pampelonne, cette bastide de caractère de 390 m² dispose d'un domaine viticole de 3 ha produisant un rosé primé au Guide Hachette.",
      typeId: villa.id, localisation: "Ramatuelle, Var", price: 5100000, surface: 390, bedroom: 5, bathroom: 4, garage: 3,
      details: { year: 2017, features: ["Domaine viticole 3 ha", "Cave de vinification", "Piscine naturelle", "Terrasse panoramique", "Bastide en pierre", "Cuisine d'été professionnelle", "Chais rénovés", "Sentier vignes"] },
      photos: photos(0, 5),
    },
    {
      name: "Villa Sainte-Maxime Baie",
      description: "En front de baie à Sainte-Maxime, cette villa de 310 m² jouit d'un panorama exceptionnel face à Saint-Tropez. Accès direct à une plage privée de sable fin, terrasse d'été et ponton pour embarcation.",
      typeId: villa.id, localisation: "Sainte-Maxime, Var", price: 4300000, surface: 310, bedroom: 4, bathroom: 4, garage: 2,
      details: { year: 2019, features: ["Accès plage privée", "Ponton privé", "Vue Saint-Tropez", "Piscine en débordement", "Cuisine extérieure", "Salle de bain en marbre", "Cellier & cave", "Alarme & portail"] },
      photos: photos(1, 5),
    },
    {
      name: "Villa Valbonne Golf",
      description: "Adossée au golf de Valbonne, cette villa de 440 m² bénéficie d'une double exposition est-ouest et d'un jardin soigné de 2 800 m². Finitions irréprochables, piscine chauffée toute l'année et tennis privatif.",
      typeId: villa.id, localisation: "Valbonne, Alpes-Maritimes", price: 3200000, surface: 440, bedroom: 5, bathroom: 4, garage: 3,
      details: { year: 2018, features: ["Vue fairway golf", "Tennis privé éclairé", "Piscine chauffée 365 jours", "Jardin de 2 800 m²", "Garage triple", "Suite avec dressing", "Salle de jeux", "Pergola 40 m²"] },
      photos: photos(2, 5),
    },
    {
      name: "Villa Cassis Calanques",
      description: "Aux portes du Parc National des Calanques, cette villa moderne de 350 m² s'intègre dans un paysage de calcaires blancs et de pins. Accès direct aux sentiers de randonnée et vue imprenable sur la mer.",
      typeId: villa.id, localisation: "Cassis, Bouches-du-Rhône", price: 2600000, surface: 350, bedroom: 4, bathroom: 3, garage: 2,
      details: { year: 2020, features: ["Accès Calanques à pied", "Terrasse plein ciel", "Piscine naturelle", "Cuisine provençale ouverte", "Jardin en garrigue", "Panneaux solaires", "Portail automatisé", "Studio gardien"] },
      photos: photos(3, 5),
    },
    {
      name: "Villa Ménerbes Provence",
      description: "Au cœur du Luberon, cette villa en pierre du pays de 290 m² domine les vignes de l'appellation Côtes du Luberon. Entièrement rénovée en 2021 avec des matériaux régionaux, elle a su préserver l'âme provençale.",
      typeId: villa.id, localisation: "Ménerbes, Luberon", price: 1950000, surface: 290, bedroom: 4, bathroom: 3, garage: 1,
      details: { year: 2021, features: ["Pierre du pays", "Vue vignobles Luberon", "Piscine en pierre", "Lavoir restauré", "Four à pain d'époque", "Oliviers centenaires", "Terrasse dallée", "Jardin de simples"] },
      photos: photos(4, 5),
    },
    {
      name: "Villa Courchevel 1850",
      description: "Ski-in/ski-out depuis cette villa d'exception de 550 m² à Courchevel 1850. Bois de mélèze, pierre locale et vitrages triple-feuilleté composent un intérieur contemporain baigné de lumière alpine.",
      typeId: villa.id, localisation: "Courchevel 1850, Savoie", price: 9200000, surface: 550, bedroom: 7, bathroom: 6, garage: 3,
      details: { year: 2022, features: ["Ski-in ski-out", "Piscine couverte 15 m", "Spa 3 espaces", "Salle des trophées & bar", "Local à skis chauffé", "Cinéma 4K", "Cuisine professionnelle", "Vue Saulire"] },
      photos: photos(5, 5),
    },
    {
      name: "Villa Antibes Garoupe",
      description: "Sur la Garoupe, plage emblématique d'Antibes prisée des célébrités, cette villa de 430 m² offre une intimité absolue grâce à son jardin arboré de 3 000 m² et à ses hauts murs de clôture.",
      typeId: villa.id, localisation: "Antibes, Cap d'Antibes", price: 7400000, surface: 430, bedroom: 6, bathroom: 5, garage: 4,
      details: { year: 2020, features: ["Accès Garoupe à pied", "Piscine 22 m", "Terrain de pétanque", "Cuisine d'été professionnelle", "Suite maîtresse rooftop", "Appartement gardien", "Cave à cigares", "Sécurité biométrique"] },
      photos: photos(6, 5),
    },
    {
      name: "Villa Menton Frontière",
      description: "À deux pas de la frontière italienne, cette villa de style ligure de 340 m² est entourée d'un jardin fleuri de 1 800 m² aux essences méditerranéennes. Vue imprenable depuis les terrasses en surplomb de la mer.",
      typeId: villa.id, localisation: "Menton, Alpes-Maritimes", price: 2700000, surface: 340, bedroom: 4, bathroom: 3, garage: 2,
      details: { year: 2016, features: ["Style ligure d'époque", "Jardin fleuri 1 800 m²", "Piscine à débordement", "Limoniers & orangers", "Fontaine historique", "Cave voûtée", "Terrasse face Italie", "Portique couvert"] },
      photos: photos(7, 5),
    },
    {
      name: "Villa La Croix-Valmer",
      description: "Avec ses 500 m² de surface et ses 4 000 m² de terrain descendant vers la mer, cette villa est l'une des plus belles propriétés de La Croix-Valmer. Accès direct à une crique privée par sentier.",
      typeId: villa.id, localisation: "La Croix-Valmer, Var", price: 5900000, surface: 500, bedroom: 6, bathroom: 5, garage: 3,
      details: { year: 2019, features: ["Accès crique privée", "Piscine 20 m vue mer", "Terrain 4 000 m²", "Bungalow invités", "Cuisine d'été complète", "Terrasse panoramique", "Local bateau", "Garage 3 voitures"] },
      photos: photos(8, 5),
    },
    {
      name: "Villa Villefranche Corniche",
      description: "Sur la Corniche de Villefranche-sur-Mer, cette villa des années 30 entièrement rénovée de 370 m² jouit d'une situation unique à flanc de colline, entre ciel et mer. Jardin suspendu et terrasses en cascade.",
      typeId: villa.id, localisation: "Villefranche-sur-Mer", price: 4600000, surface: 370, bedroom: 5, bathroom: 4, garage: 2,
      details: { year: 2023, features: ["Vue baie de Villefranche", "Terrasses en cascade", "Piscine suspendue", "Jardin de 1 500 m²", "Rénovation complète 2023", "Cuisine ouverte Boffi", "Accès mer à pied", "Portail sécurisé"] },
      photos: photos(9, 5),
    },
    {
      name: "Villa Bandol Domaine",
      description: "Propriété viticole de 280 m² surplombant les AOC Bandol, avec 2 ha de vignes exploitées. Architecture moderne à toit plat, vastes terrasses et piscine infinity orientée vers les îles du Frioul.",
      typeId: villa.id, localisation: "Bandol, Var", price: 3100000, surface: 280, bedroom: 4, bathroom: 3, garage: 2,
      details: { year: 2018, features: ["Vignes AOC Bandol 2 ha", "Piscine infinity", "Chais de vinification", "Cave 3 000 bouteilles", "Terrasse panoramique", "Studio vigneron", "Système d'irrigation", "Portique couvert"] },
      photos: photos(0, 4),
    },
    {
      name: "Villa Aix-en-Provence Bastide",
      description: "Sur la route de Cézanne, cette bastide de 420 m² entourée de platanes centenaires évoque la Provence éternelle. Deux corps de logis rénovés autour d'une cour pavée avec fontaine classée.",
      typeId: villa.id, localisation: "Aix-en-Provence, Bouches-du-Rhône", price: 3400000, surface: 420, bedroom: 5, bathroom: 4, garage: 3,
      details: { year: 2020, features: ["Platanes centenaires", "Fontaine classée", "Piscine 18 m", "Dépendance 80 m²", "Four à pain d'origine", "Cuisine provençale", "Verger 300 m²", "Route de Cézanne"] },
      photos: photos(1, 4),
    },
    {
      name: "Villa Les Baux-de-Provence",
      description: "Aux Baux-de-Provence, village classé parmi les plus beaux de France, cette villa de 260 m² creusée dans la roche offre une architecture rupestre unique, avec piscine dans les alpilles.",
      typeId: villa.id, localisation: "Les Baux-de-Provence", price: 2100000, surface: 260, bedroom: 3, bathroom: 3, garage: 1,
      details: { year: 2015, features: ["Architecture rupestre unique", "Piscine dans les Alpilles", "Roche naturelle intégrée", "Vue plaine de la Crau", "Cuves de vin d'époque", "Terrasse 50 m²", "Citerne d'eau naturelle", "Oliveraie privée"] },
      photos: photos(2, 4),
    },
    {
      name: "Villa Sanary-sur-Mer",
      description: "Charmante villa de 330 m² à Sanary-sur-Mer, petit port de pêche devenu destination prisée entre Bandol et La Seyne. Jardin de 1 600 m² avec oliviers centenaires, piscine et accès direct au bord de mer.",
      typeId: villa.id, localisation: "Sanary-sur-Mer, Var", price: 2400000, surface: 330, bedroom: 4, bathroom: 3, garage: 2,
      details: { year: 2017, features: ["Accès mer direct", "Oliviers centenaires", "Piscine naturelle", "Jardin 1 600 m²", "Terrasse de 70 m²", "Cuisine d'été", "Garage double", "Vue port de pêche"] },
      photos: photos(3, 4),
    },
    {
      name: "Villa Grasse Parfums",
      description: "À Grasse, capitale mondiale du parfum, cette villa de 360 m² est cernée de jasmin et de roses centifolia. Jardin d'essences olfactives exceptionnel, piscine naturelle et vue sur la campagne grassoise.",
      typeId: villa.id, localisation: "Grasse, Alpes-Maritimes", price: 1800000, surface: 360, bedroom: 4, bathroom: 3, garage: 2,
      details: { year: 2016, features: ["Jardin d'essences 2 000 m²", "Roses centifolia & jasmin", "Piscine naturelle", "Laboratoire de parfumerie", "Terrasse fleurie", "Cave fraîche naturelle", "Portique provençal", "Vue campagne"] },
      photos: photos(4, 4),
    },
    {
      name: "Villa Cavalaire-sur-Mer",
      description: "Face à la baie de Cavalaire, cette villa contemporaine de 400 m² se fond dans la végétation méditerranéenne. Grandes terrasses plein sud, piscine à débordement et jardin de pins parasols de 2 200 m².",
      typeId: villa.id, localisation: "Cavalaire-sur-Mer, Var", price: 2800000, surface: 400, bedroom: 5, bathroom: 4, garage: 3,
      details: { year: 2019, features: ["Piscine débordement vue mer", "Pins parasols 2 200 m²", "Terrasses 3 niveaux", "Douche solaire", "Jacuzzi extérieur", "Garage triple", "Portail automatisé", "Alarme connectée"] },
      photos: photos(5, 4),
    },
    {
      name: "Villa Séguret Vignoble",
      description: "Au pied du Dentelles de Montmirail, ce domaine de 310 m² est entouré de 4 ha de vignes classifiées Côtes du Rhône Villages. Vue époustouflante sur le Mont Ventoux et les dentelles.",
      typeId: villa.id, localisation: "Séguret, Vaucluse", price: 1650000, surface: 310, bedroom: 4, bathroom: 3, garage: 2,
      details: { year: 2014, features: ["Vignes 4 ha CDR Villages", "Vue Mont Ventoux", "Cave de 4 000 bouteilles", "Piscine en pierre", "Chais de vinification", "Terrasse dallée", "Four à bois", "Oliviers & lavandes"] },
      photos: photos(6, 4),
    },
    {
      name: "Villa Lourmarin Mistral",
      description: "À Lourmarin, village classé du Luberon associé à Albert Camus, cette villa de 340 m² allie architecture locale et modernité discrète. Beau jardin clos de murs en pierres sèches, piscine et studio indépendant.",
      typeId: villa.id, localisation: "Lourmarin, Luberon", price: 2200000, surface: 340, bedroom: 4, bathroom: 3, garage: 2,
      details: { year: 2019, features: ["Murs en pierres sèches", "Studio invités indépendant", "Piscine 14 m", "Jardin clos 1 800 m²", "Cuisine méridionale", "Terrasse couverte", "Cheminée extérieure", "Figuiers & amandiers"] },
      photos: photos(7, 4),
    },
    {
      name: "Villa Roussillon Ocres",
      description: "Dans le village ocrier de Roussillon, inscrit au Patrimoine mondial, cette villa de 260 m² se teinte des rouges et orangés de la falaise. Jardin végétal à flanc de rocher, piscine de roche naturelle.",
      typeId: villa.id, localisation: "Roussillon, Vaucluse", price: 1350000, surface: 260, bedroom: 3, bathroom: 2, garage: 1,
      details: { year: 2013, features: ["Décor ocrier unique", "Piscine roche naturelle", "Jardin à flanc de falaise", "Terrasse panoramique", "Pierre de taille locale", "Cheminée d'époque", "Cave fraîche", "Village piéton"] },
      photos: photos(8, 4),
    },
    {
      name: "Villa Gassin Panorama",
      description: "Dominant la baie de Saint-Tropez depuis le village de Gassin, cette villa de 480 m² offre un panorama à 360° sur les Maures, la mer et le Golfe. Terrain de 4 500 m² entièrement paysagé.",
      typeId: villa.id, localisation: "Gassin, Var", price: 6200000, surface: 480, bedroom: 6, bathroom: 5, garage: 4,
      details: { year: 2022, features: ["Panorama 360°", "Terrain 4 500 m²", "Piscine 24 m chauffée", "Hélipad secondaire", "Salle de projection", "Appartement gardien 80 m²", "Terrain de pétanque", "Pergola motorisée"] },
      photos: photos(9, 4),
    },
    {
      name: "Villa Montpellier Contemporaine",
      description: "En périphérie verdoyante de Montpellier, cette villa neuve de 300 m² labellisée RE2020 associe performances énergétiques et confort moderne. Panneaux solaires, pompe à chaleur et jardin zéro-énergie.",
      typeId: villa.id, localisation: "Montpellier, Hérault", price: 1120000, surface: 300, bedroom: 4, bathroom: 3, garage: 2,
      details: { year: 2024, features: ["Label RE2020", "Panneaux solaires 9 kWc", "Pompe à chaleur air-eau", "Jardin xérophyte", "Piscine chauffée solaire", "Bornes de recharge VE", "Domotique Legrand", "Triple vitrage"] },
      photos: photos(0, 3),
    },
    {
      name: "Villa Bonnieux Côté Cour",
      description: "Village perché sur la crête entre Luberon nord et sud, Bonnieux abrite cette villa de 290 m² organisée autour d'une grande cour intérieure avec fontaine. Vue sur l'abbaye de Sénanque et les champs de lavande.",
      typeId: villa.id, localisation: "Bonnieux, Luberon", price: 1720000, surface: 290, bedroom: 4, bathroom: 3, garage: 1,
      details: { year: 2016, features: ["Cour intérieure ombragée", "Vue abbaye Sénanque", "Champs de lavande", "Piscine 12 m", "Pierre calcaire blonde", "Cuisine d'été", "Cellier voûté", "Terrasse panoramique"] },
      photos: photos(1, 3),
    },
    {
      name: "Villa Deauville Normande",
      description: "À deux pas des planches mythiques de Deauville, cette villa normande de 360 m² à colombages et briques respecte l'architecture régionale tout en proposant un confort contemporain irréprochable.",
      typeId: villa.id, localisation: "Deauville, Calvados", price: 2350000, surface: 360, bedroom: 5, bathroom: 4, garage: 2,
      details: { year: 2021, features: ["Colombages & briques rouges", "Jardin à l'anglaise 1 400 m²", "Piscine couverte chauffée", "Billard & bibliothèque", "Suite avec balnéo", "Portail bois d'époque", "Cheminée en pierres", "À 200 m des planches"] },
      photos: photos(2, 3),
    },
    {
      name: "Villa La Baule Prestige",
      description: "Dans le quartier Benoît, à La Baule, cette villa art-déco des années 1930 entièrement restaurée de 310 m² fait face à la Baie de La Baule, réputée plus belle baie d'Europe. Parc boisé de 2 000 m².",
      typeId: villa.id, localisation: "La Baule, Loire-Atlantique", price: 1900000, surface: 310, bedroom: 4, bathroom: 3, garage: 2,
      details: { year: 2022, features: ["Art-déco années 30 restauré", "Vue mer directe", "Parc boisé 2 000 m²", "Véranda originale 30 m²", "Cheminée à bûches", "Cave voûtée", "Garage bois", "À 150 m de la plage"] },
      photos: photos(3, 3),
    },

    // ══════════════════════════════════════════════════════════════════════════
    // APPARTEMENTS (35)
    // ══════════════════════════════════════════════════════════════════════════
    {
      name: "Penthouse Tour Eiffel",
      description: "Au sommet d'un immeuble haussmannien rénové du 7ème arrondissement, ce penthouse de 250 m² bénéficie d'une terrasse de 100 m² face à la Tour Eiffel. Plafonds à 3,5 m, parquet point de Hongrie et cheminées d'époque.",
      typeId: appartement.id, localisation: "Paris 7ème", price: 8500000, surface: 250, bedroom: 4, bathroom: 3, garage: 2,
      details: { year: 2021, features: ["Terrasse 100 m² vue Tour Eiffel", "Plafonds 3,5 m", "Parquet point de Hongrie", "Cheminées d'époque", "Cuisine ouverte Boffi", "Salle de sport", "Ascenseur privatif", "Cave & parking double"] },
      photos: photos(4, 4),
    },
    {
      name: "Appartement de Standing Lyon",
      description: "Au cœur de la Presqu'île lyonnaise, cet appartement bourgeois de 180 m² entièrement rénové par un architecte d'intérieur marie volumes généreux et équipements haut de gamme.",
      typeId: appartement.id, localisation: "Lyon, Presqu'île", price: 1850000, surface: 180, bedroom: 3, bathroom: 2, garage: 1,
      details: { year: 2023, features: ["Rénovation architecte", "Parquet massif chêne", "Moulures & rosaces", "Double exposition", "Cuisine Dada", "Balcon filant", "Cave & cave à vin", "Gardien et digicode"] },
      photos: photos(5, 4),
    },
    {
      name: "Loft Marais Contemporain",
      description: "En plein cœur du Marais, ce loft de 220 m² occupe l'ancien atelier d'un maître-verrier. Verrière zénithale de 40 m², hauteur sous plafond de 5 m et finitions d'artiste pour ce bien absolument unique.",
      typeId: appartement.id, localisation: "Paris 4ème, Le Marais", price: 4200000, surface: 220, bedroom: 3, bathroom: 2, garage: 1,
      details: { year: 2020, features: ["Verrière zénithale 40 m²", "Hauteur 5 m", "Ancienne hôtellerie classée", "Béton ciré & bois brut", "Cuisine îlot 10 m", "Mezzanine bibliothèque", "Climatisation centralisée", "Cave voûtée"] },
      photos: photos(6, 4),
    },
    {
      name: "Duplex Saint-Germain",
      description: "Rue Bonaparte, dans le 6ème arrondissement, ce duplex de 280 m² séduit par son caractère exceptionnel : deux niveaux habillés de boiseries XVIIIe, terrasse jardin de 50 m² et vue sur les toits de Paris.",
      typeId: appartement.id, localisation: "Paris 6ème, Saint-Germain", price: 6100000, surface: 280, bedroom: 4, bathroom: 3, garage: 1,
      details: { year: 2019, features: ["Boiseries XVIIIe originales", "Terrasse jardin 50 m²", "Vue toits Paris", "Bibliothèque sur-mesure", "Cheminée Empire", "Cuisine Varenna", "Deux niveaux distincts", "Cave voûtée à pierre"] },
      photos: photos(7, 4),
    },
    {
      name: "Appartement Avenue Foch",
      description: "Sur la plus belle avenue de Paris, à deux pas de l'Arc de Triomphe, cet appartement de 320 m² au 3ème étage noble offre un triple living face aux arbres centenaires de l'avenue Foch.",
      typeId: appartement.id, localisation: "Paris 16ème, Avenue Foch", price: 9800000, surface: 320, bedroom: 5, bathroom: 4, garage: 2,
      details: { year: 2018, features: ["Façade haussmannienne classée", "Triple living 80 m²", "Salle à manger d'apparat", "Enfilade de réception", "Cuisine Miele intégrée", "Suite parentale 50 m²", "Deux caves", "Parking double sécurisé"] },
      photos: photos(8, 4),
    },
    {
      name: "Penthouse Bordeaux Chartrons",
      description: "Dernier étage d'un immeuble de standing dans le quartier des Chartrons, ce penthouse de 210 m² dispose d'une terrasse de 80 m² avec vue sur la Garonne et les quais classés de Bordeaux.",
      typeId: appartement.id, localisation: "Bordeaux, Les Chartrons", price: 2100000, surface: 210, bedroom: 3, bathroom: 3, garage: 2,
      details: { year: 2022, features: ["Terrasse 80 m² vue Garonne", "Cuisine ouverte Siemens", "Parquet flottant chêne", "Climatisation réversible", "Cave à vin 200 bouteilles", "Deux parkings en sous-sol", "Loggia couverte", "Baignoire îlot"] },
      photos: photos(9, 4),
    },
    {
      name: "Appartement Île Saint-Louis",
      description: "Sur la plus romantique des îles de Paris, cet appartement de 160 m² au 4ème étage avec ascenseur jouit d'une vue directe sur la Seine et Notre-Dame depuis ses hautes fenêtres à petits bois.",
      typeId: appartement.id, localisation: "Paris 4ème, Île Saint-Louis", price: 3700000, surface: 160, bedroom: 3, bathroom: 2, garage: 0,
      details: { year: 2020, features: ["Vue Seine & Notre-Dame", "Fenêtres à petits bois", "Pierres apparentes", "Poutres en chêne", "Cuisine ouverte Dada", "Salle de bain marbre", "Cave privative", "Étage noble avec ascenseur"] },
      photos: photos(0, 4),
    },
    {
      name: "Grand Appartement Cannes Palais",
      description: "À deux pas du Palais des Festivals, cet appartement de 190 m² avec terrasse de 30 m² est parfaitement situé pour profiter de la vie festivalière cannoise. Rénovation complète en 2023 par un architecte DPLG.",
      typeId: appartement.id, localisation: "Cannes, La Croisette", price: 2950000, surface: 190, bedroom: 4, bathroom: 3, garage: 1,
      details: { year: 2023, features: ["À 50 m du Palais", "Terrasse 30 m²", "Vue mer depuis salon", "Cuisine Bulthaup", "Climatisation Daikin", "Parquet Versailles", "Rangements sur-mesure", "Cave & parking sécurisé"] },
      photos: photos(1, 4),
    },
    {
      name: "Appartement Nice Promenade",
      description: "En ligne directe sur la Promenade des Anglais, cet appartement de 170 m² bénéficie d'une double exposition mer/montagne depuis ses trois chambres et son grand salon.",
      typeId: appartement.id, localisation: "Nice, Promenade des Anglais", price: 1650000, surface: 170, bedroom: 3, bathroom: 2, garage: 1,
      details: { year: 2021, features: ["Vue mer directe", "Double exposition", "Loggia 20 m²", "Cuisine équipée Bosch", "Parquet massif", "Climatisation centralisée", "Cave & parking", "Gardien immeuble"] },
      photos: photos(2, 4),
    },
    {
      name: "Appartement Monaco Monte-Carlo",
      description: "Principauté de Monaco, quartier Monte-Carlo : appartement de 230 m² au 8ème étage d'une tour de standing avec vue à 180° sur la Méditerranée et le Rocher.",
      typeId: appartement.id, localisation: "Monaco, Monte-Carlo", price: 15000000, surface: 230, bedroom: 4, bathroom: 4, garage: 2,
      details: { year: 2020, features: ["Vue mer & Rocher 180°", "Terrasse panoramique 40 m²", "Concierge 24h/24", "Piscine de l'immeuble", "Salle de sport", "Double parking gardé", "Finitions Armani Casa", "SPA de l'immeuble"] },
      photos: photos(3, 4),
    },
    {
      name: "Appartement Strasbourg Grande Île",
      description: "Sur la Grande Île classée UNESCO, cet appartement de 145 m² au 2ème étage d'un immeuble à colombages entièrement rénové offre une vue directe sur les canaux de la Petite France.",
      typeId: appartement.id, localisation: "Strasbourg, Grande Île", price: 890000, surface: 145, bedroom: 3, bathroom: 2, garage: 1,
      details: { year: 2022, features: ["Vue canaux Petite France", "Colombages classés UNESCO", "Poutres apparentes", "Cuisine équipée ouverte", "Parquet ancien restauré", "Cheminée décorative", "Cave voûtée", "Parking à 100 m"] },
      photos: photos(4, 4),
    },
    {
      name: "Appartement Aix-en-Provence Quartier Mazarin",
      description: "Dans le quartier Mazarin, coeur historique d'Aix, appartement bourgeois de 200 m² avec enfilade de réception. Hauts plafonds à moulures, parquet Versailles et vue sur la cathédrale Saint-Sauveur.",
      typeId: appartement.id, localisation: "Aix-en-Provence, Quartier Mazarin", price: 1480000, surface: 200, bedroom: 4, bathroom: 2, garage: 1,
      details: { year: 2018, features: ["Enfilade de réception", "Hauts plafonds moulurés", "Parquet Versailles", "Vue cathédrale", "Boiseries XVIIIe", "Cuisine professionnelle", "Cave à vin", "Parking sécurisé"] },
      photos: photos(5, 4),
    },
    {
      name: "Loft Nantes Île de Nantes",
      description: "Sur l'Île de Nantes, territoire en renouveau urbain, ce loft de 200 m² dans une ancienne usine de tabac bénéficie de plafonds de 5 m, de verrières industrielles et d'une mezzanine architecturale.",
      typeId: appartement.id, localisation: "Nantes, Île de Nantes", price: 1100000, surface: 200, bedroom: 2, bathroom: 2, garage: 1,
      details: { year: 2021, features: ["Ancienne usine de tabac", "Plafonds 5 m", "Verrières industrielles", "Mezzanine en acier", "Béton ciré au sol", "Cuisine professionnelle", "Salle de bain XXL", "Parking privatif"] },
      photos: photos(6, 4),
    },
    {
      name: "Appartement Toulouse Capitole",
      description: "À 100 m de la Place du Capitole, au cœur de la Ville Rose, cet appartement de 155 m² entièrement rénové associe brique apparente toulousaine et design contemporain signé.",
      typeId: appartement.id, localisation: "Toulouse, Place du Capitole", price: 750000, surface: 155, bedroom: 3, bathroom: 2, garage: 1,
      details: { year: 2023, features: ["Brique rose apparente", "Vue Place du Capitole", "Cuisine ouverte Siemens", "Parquet chêne huilé", "Salle de bain italienne", "Dressing sur-mesure", "Cave privative", "Parking sécurisé"] },
      photos: photos(7, 4),
    },
    {
      name: "Duplex Annecy Vieille Ville",
      description: "Dans la vieille ville d'Annecy, au-dessus des arcades médiévales, duplex de 175 m² avec terrasse donnant directement sur le lac. Vue imprenable sur les Alpes et eaux turquoise du lac d'Annecy.",
      typeId: appartement.id, localisation: "Annecy, Vieille Ville", price: 2400000, surface: 175, bedroom: 3, bathroom: 2, garage: 1,
      details: { year: 2019, features: ["Vue lac & Alpes", "Terrasse sur arcades médiévales", "Pierres apparentes", "Cuisine Miele", "Salon double exposition", "Suite parentale lac", "Deux caves", "Parking privé sécurisé"] },
      photos: photos(8, 4),
    },
    {
      name: "Appartement Marseille Corniche",
      description: "Sur la Corniche Kennedy, face aux Îles du Frioul, cet appartement de 195 m² bénéficie d'une loggia de 25 m² plein soleil. Accès direct aux plages du Prophète et du Roucas-Blanc.",
      typeId: appartement.id, localisation: "Marseille, Corniche Kennedy", price: 1200000, surface: 195, bedroom: 4, bathroom: 2, garage: 1,
      details: { year: 2020, features: ["Vue Îles du Frioul", "Loggia 25 m²", "Accès plages à pied", "Cuisine ouverte", "Climatisation réversible", "Parquet massif", "Cave & parking", "Gardien immeuble"] },
      photos: photos(9, 4),
    },
    {
      name: "Appartement Paris 8ème Monceau",
      description: "À deux pas du Parc Monceau, appartement haussmannien de 195 m² en parfait état avec parquet point de Hongrie, moulures et cheminées d'époque préservées. Étage noble au 3ème avec ascenseur.",
      typeId: appartement.id, localisation: "Paris 8ème, Parc Monceau", price: 4500000, surface: 195, bedroom: 4, bathroom: 2, garage: 1,
      details: { year: 2017, features: ["Étage noble", "Parquet point de Hongrie", "Cheminées & moulures", "Vue Parc Monceau", "Salle à manger formelle", "Office séparé", "Cave privative", "Parking gardé loué"] },
      photos: photos(0, 3),
    },
    {
      name: "Appartement Lille Vieux-Lille",
      description: "Dans le Vieux-Lille, quartier le plus branché du Nord, cet appartement de 160 m² dans un hôtel particulier flamand du XVIIe siècle marie patrimoine et design résolument contemporain.",
      typeId: appartement.id, localisation: "Lille, Vieux-Lille", price: 720000, surface: 160, bedroom: 3, bathroom: 2, garage: 1,
      details: { year: 2022, features: ["Hôtel particulier flamand", "Poutres chêne XVIIe", "Briques apparentes", "Cuisine ouverte signée", "Parquet en chevrons", "Salle de bain marbre", "Cour intérieure", "Cave privative"] },
      photos: photos(1, 3),
    },
    {
      name: "Studio de Luxe Cannes Festival",
      description: "À 50 m du Palais des Festivals, studio premium de 55 m² parfaitement optimisé, meublé et équipé par un décorateur d'intérieur. Rendement locatif exceptionnel pendant les festivals.",
      typeId: appartement.id, localisation: "Cannes, Croisette", price: 450000, surface: 55, bedroom: 1, bathroom: 1, garage: 0,
      details: { year: 2023, features: ["Meublé & décoré", "Position festival unique", "Kitchenette Siemens", "Climatisation Daikin", "Smart TV & fibre optique", "Salle de bain italienne", "Excellent rendement locatif", "Gardien immeuble"] },
      photos: photos(2, 3),
    },
    {
      name: "Appartement Grenoble Presqu'île",
      description: "Au cœur de l'écoquartier de la Presqu'île de Grenoble, appartement neuf de 130 m² avec balcon filant vue sur le Vercors et la Chartreuse. Normes RT2020, performance énergétique A.",
      typeId: appartement.id, localisation: "Grenoble, Presqu'île", price: 580000, surface: 130, bedroom: 3, bathroom: 2, garage: 1,
      details: { year: 2024, features: ["DPE A", "Balcon filant 15 m²", "Vue massifs alpins", "Pompe à chaleur", "Triple vitrage", "Cave & vélos", "Parking sécurisé", "Fibre et interphone vidéo"] },
      photos: photos(3, 3),
    },
    {
      name: "Appartement Paris 17ème Batignolles",
      description: "Quartier des Batignolles, à proximité du parc Martin-Luther-King, bel appartement de 180 m² dans un immeuble des années 1900 aux volumes préservés. Belle hauteur sous plafond et triple exposition.",
      typeId: appartement.id, localisation: "Paris 17ème, Batignolles", price: 2600000, surface: 180, bedroom: 4, bathroom: 2, garage: 1,
      details: { year: 2020, features: ["Triple exposition lumineuse", "Hauteur 3,2 m", "Parquet chêne ciré", "Cheminée de salon", "Cuisine américaine ouverte", "Deux salles de bain", "Cave", "Digicode & gardien"] },
      photos: photos(4, 3),
    },
    {
      name: "Appartement Biarritz Front de Mer",
      description: "En front de mer à Biarritz, face à la Grande Plage, appartement de 140 m² entièrement rénové avec vue exceptionnelle sur l'océan Atlantique depuis le salon et les deux chambres côté mer.",
      typeId: appartement.id, localisation: "Biarritz, Front de Mer", price: 1950000, surface: 140, bedroom: 2, bathroom: 2, garage: 1,
      details: { year: 2022, features: ["Vue océan directe salon & chambres", "Terrasse 20 m²", "Rénovation complète 2022", "Cuisine ouverte haut de gamme", "Baignoire balnéo", "Climatisation", "Cave", "Parking sécurisé"] },
      photos: photos(5, 3),
    },
    {
      name: "Appartement Dinard Belle Époque",
      description: "Dans une villa Belle Époque de Dinard, station balnéaire bretonne la plus chic, appartement de 120 m² avec vue panoramique sur la baie de Saint-Malo et le château de Solidor.",
      typeId: appartement.id, localisation: "Dinard, Côte d'Émeraude", price: 680000, surface: 120, bedroom: 2, bathroom: 1, garage: 0,
      details: { year: 2019, features: ["Vue Saint-Malo & château", "Villa Belle Époque", "Parquet ancien restauré", "Cheminée art-nouveau", "Cuisine rénovée", "Terrasse 15 m²", "Cave privative", "À 100 m de la plage"] },
      photos: photos(6, 3),
    },
    {
      name: "Appartement Le Touquet Paris-Plage",
      description: "Dans un immeuble des années 20 du Touquet, appartement de 165 m² entièrement rénové avec terrasse jardin de 60 m² privatif. Vue sur la pinède et accès plage à pied en 5 minutes.",
      typeId: appartement.id, localisation: "Le Touquet, Pas-de-Calais", price: 890000, surface: 165, bedroom: 3, bathroom: 2, garage: 1,
      details: { year: 2021, features: ["Terrasse jardin 60 m²", "Vue pinède", "À 400 m de la plage", "Rénovation complète", "Parquet massif pin", "Cheminée salon", "Cuisine équipée", "Cave & parking"] },
      photos: photos(7, 3),
    },
    {
      name: "Loft Bordeaux Bassins à Flot",
      description: "Dans le nouveau quartier des Bassins à Flot, loft de 185 m² dans un hangar maritime réhabilité. Plafonds de 6 m, double hauteur de vie et vue sur le bassin à flots.",
      typeId: appartement.id, localisation: "Bordeaux, Bassins à Flot", price: 980000, surface: 185, bedroom: 2, bathroom: 2, garage: 1,
      details: { year: 2023, features: ["Hangar maritime réhabilité", "Plafonds 6 m", "Vue bassin à flots", "Béton & acier industriel", "Cuisine professionnelle 12 m", "Mezzanine chambre", "Terrasse roofdeck 40 m²", "Parking sous-sol"] },
      photos: photos(8, 3),
    },
    {
      name: "Appartement Arcachon Villa d'Hiver",
      description: "Dans le quartier de la Villa d'Hiver, classé au titre des monuments historiques, appartement de 150 m² dans une charmante villa en bois cerné de jardins et de pins landais.",
      typeId: appartement.id, localisation: "Arcachon, Villa d'Hiver", price: 980000, surface: 150, bedroom: 3, bathroom: 2, garage: 1,
      details: { year: 2018, features: ["Quartier classé MH", "Villa en bois d'époque", "Jardin communautaire", "Véranda panoramique", "Parquet pin des Landes", "Cheminée d'angle", "Cave privative", "À 500 m du bassin"] },
      photos: photos(9, 3),
    },
    {
      name: "Appartement Antibes Vue Remparts",
      description: "Dans le vieil Antibes, intra-muros, appartement de 110 m² au 3ème étage d'un immeuble du XVIIe siècle, avec terrasse de 25 m² surplombant les remparts Vauban et la Méditerranée.",
      typeId: appartement.id, localisation: "Antibes, Vieil Antibes", price: 1350000, surface: 110, bedroom: 2, bathroom: 2, garage: 0,
      details: { year: 2020, features: ["Vue remparts Vauban", "Terrasse 25 m²", "Pierre & bois d'époque", "Cuisine intégrée", "Salle de bain marbre", "Portique médiéval", "À pied marchés provençaux", "Cave privative"] },
      photos: photos(0, 3),
    },
    {
      name: "Appartement Metz Île du Saulcy",
      description: "Sur l'Île du Saulcy à Metz, cet appartement neuf de 105 m² est baigné de lumière grâce à ses baies coulissantes donnant sur la Moselle. Performance énergétique A, résidence sécurisée.",
      typeId: appartement.id, localisation: "Metz, Île du Saulcy", price: 420000, surface: 105, bedroom: 3, bathroom: 1, garage: 1,
      details: { year: 2024, features: ["Vue Moselle", "Baies coulissantes", "DPE A", "Terrasse 12 m²", "Cave & parking", "Résidence sécurisée", "Proche gare TGV", "Proche cathédrale"] },
      photos: photos(1, 3),
    },
    {
      name: "Appartement Saint-Malo Intra-Muros",
      description: "Derrière les remparts de Saint-Malo, appartement de 130 m² dans un hôtel particulier corsaire du XVIIIe siècle. Vue sur les toits de granite, à 2 minutes à pied des remparts mythiques.",
      typeId: appartement.id, localisation: "Saint-Malo, Intra-Muros", price: 740000, surface: 130, bedroom: 2, bathroom: 2, garage: 0,
      details: { year: 2019, features: ["Hôtel corsaire XVIIIe", "Pierre de granite apparente", "Vue toits intra-muros", "Cheminée d'époque", "Cuisine renovée", "Poutres en chêne", "Cave granite", "À 2 min des remparts"] },
      photos: photos(2, 3),
    },
    {
      name: "Appartement Honfleur Vieux Bassin",
      description: "Surplombant le Vieux Bassin de Honfleur, peint par Monet et Boudin, appartement de 95 m² dans une maison à colombages du XVIe siècle. Caractère historique exceptionnel.",
      typeId: appartement.id, localisation: "Honfleur, Calvados", price: 560000, surface: 95, bedroom: 2, bathroom: 1, garage: 0,
      details: { year: 2017, features: ["Vue Vieux Bassin", "Colombages XVIe", "Poutres en chêne massif", "Caractère historique", "Cuisine rénovée", "Parquet en chêne", "Cave", "À pied de l'Église Sainte-Catherine"] },
      photos: photos(3, 3),
    },
    {
      name: "Appartement Annecy Le Vieux",
      description: "Aux abords du Palais de l'Île et des canaux, appartement de 100 m² dans une maison savoyarde du XVe siècle. Pierres et bois d'époque, terrasse de 15 m² sur les canaux historiques.",
      typeId: appartement.id, localisation: "Annecy, Vieille Ville", price: 890000, surface: 100, bedroom: 2, bathroom: 1, garage: 0,
      details: { year: 2018, features: ["Vue canaux médiévaux", "Maison savoyarde XVe", "Terrasse 15 m² sur eau", "Pierres apparentes", "Poutres massives", "Cuisine Siemens", "Cave voutée", "À pied lac & marché"] },
      photos: photos(4, 3),
    },

    // ══════════════════════════════════════════════════════════════════════════
    // MAISONS (30)
    // ══════════════════════════════════════════════════════════════════════════
    {
      name: "Hôtel Particulier Paris 7ème",
      description: "Exceptionnel hôtel particulier du XVIIIe siècle entièrement rénové par un architecte de renom dans le 7ème arrondissement. Jardin privatif de 200 m², cave voûtée aménagée et prestations les plus modernes.",
      typeId: maison.id, localisation: "Paris 7ème", price: 13500000, surface: 600, bedroom: 7, bathroom: 6, garage: 3,
      details: { year: 2024, features: ["Jardin paysager 200 m²", "Cave voûtée aménagée", "Escalier d'époque classé", "Plafonds moulurés", "Domotique KNX", "Spa hammam", "Parking privatif", "Local technique complet"] },
      photos: photos(5, 4),
    },
    {
      name: "Maison d'Architecte Bordeaux",
      description: "Dans un quartier résidentiel prisé de Bordeaux, maison contemporaine de 320 m² signée par un cabinet international. Architecture épurée, matériaux nobles, baies vitrées et piscine miroir.",
      typeId: maison.id, localisation: "Bordeaux, Caudéran", price: 2750000, surface: 320, bedroom: 4, bathroom: 3, garage: 2,
      details: { year: 2020, features: ["Architecture contemporaine signée", "Baies vitrées jardins", "Piscine miroir", "Jardin arboré 800 m²", "Home cinéma", "Panneaux solaires", "Chauffage sol", "Garage double"] },
      photos: photos(6, 4),
    },
    {
      name: "Manoir Normand Calvados",
      description: "À 20 km de Deauville, manoir normand du XIXe siècle de 480 m² sur 8 ha de parc. Corps de logis principal, gîte de gardien, étang privé, écuries restaurées et allée de charmes centenaires.",
      typeId: maison.id, localisation: "Honfleur, Calvados", price: 3200000, surface: 480, bedroom: 7, bathroom: 5, garage: 4,
      details: { year: 2016, features: ["Parc 8 ha", "Gîte gardien 120 m²", "Étang privé & pêche", "Écuries restaurées", "Allée de charmes", "Cave voûtée XIXe", "Chapelle privée", "Court de tennis"] },
      photos: photos(7, 4),
    },
    {
      name: "Maison Basque Espelette",
      description: "À Espelette, village du piment basque classé parmi les plus beaux villages de France, cette maison laburdine du XVIIe de 290 m² a été restaurée dans le respect des traditions.",
      typeId: maison.id, localisation: "Espelette, Pays Basque", price: 1450000, surface: 290, bedroom: 4, bathroom: 3, garage: 2,
      details: { year: 2018, features: ["Maison laburdine XVIIe", "Colombages blancs & rouge basque", "Piment d'Espelette AOP", "Fronton de pelote", "Potager 400 m²", "Cave à jambon", "Piscine naturelle", "Jardin ombragé"] },
      photos: photos(8, 4),
    },
    {
      name: "Domaine Périgord Dordogne",
      description: "En Périgord Noir, vaste propriété de 500 m² comprenant un château Renaissance restauré, gîtes aménagés et domaine de 15 ha avec rivière, bois et prairies.",
      typeId: maison.id, localisation: "Sarlat-la-Canéda, Dordogne", price: 4200000, surface: 500, bedroom: 8, bathroom: 7, garage: 3,
      details: { year: 2015, features: ["Château Renaissance restauré", "Domaine 15 ha", "Rivière traversante", "3 gîtes 200 m² total", "Piscine couverte", "Salle de réception 150 m²", "Vigne & verger", "Porterie d'époque"] },
      photos: photos(9, 4),
    },
    {
      name: "Mas Provençal Alpilles",
      description: "Aux pieds des Alpilles, entre Saint-Rémy et Les Baux, mas du XVIIIe siècle de 380 m² avec piscine en pierre, verger centenaire et vue dégagée sur les Alpilles calcaires.",
      typeId: maison.id, localisation: "Saint-Rémy-de-Provence, Alpilles", price: 2600000, surface: 380, bedroom: 5, bathroom: 4, garage: 2,
      details: { year: 2017, features: ["Mas XVIIIe en pierre", "Piscine en pierres naturelles", "Verger centenaire", "Oliveraie 50 arbres", "Terrasse dallée 100 m²", "Cheminées d'époque", "Cave fraîche", "Vue Alpilles"] },
      photos: photos(0, 4),
    },
    {
      name: "Longère Bretagne Saint-Briac",
      description: "À Saint-Briac-sur-Mer, station balnéaire de la Côte d'Émeraude, longère bretonne de 260 m² entièrement rénovée avec jardin de 2 500 m² arboré et vue sur la mer.",
      typeId: maison.id, localisation: "Saint-Briac-sur-Mer, Côte d'Émeraude", price: 1350000, surface: 260, bedroom: 4, bathroom: 3, garage: 2,
      details: { year: 2020, features: ["Vue mer Côte d'Émeraude", "Jardin 2 500 m²", "Longère en granite", "Cuisine bretonne rénovée", "Piscine chauffée", "Garage double", "Portique & potager", "À 500 m plage"] },
      photos: photos(1, 4),
    },
    {
      name: "Château Médoc Viticole",
      description: "Château viticole de 420 m² avec 12 ha de vignes classifiées AOC Médoc. Grand Cru Bourgeois en conversion bio, chai d'élevage moderne et appartement de maître restauré.",
      typeId: maison.id, localisation: "Pauillac, Médoc", price: 5800000, surface: 420, bedroom: 6, bathroom: 4, garage: 3,
      details: { year: 2019, features: ["AOC Médoc 12 ha", "Chai d'élevage 1 000 m²", "Cave de vieillissement", "Appartement maître", "Logements vendangeurs", "Gîte rural 80 m²", "En conversion bio", "Portail d'époque classé"] },
      photos: photos(2, 4),
    },
    {
      name: "Maison Alsacienne Colombages",
      description: "À Obernai, cité médiévale alsacienne, magnifique maison à colombages de 280 m² du XVIe siècle. Cour intérieure fleurie de géraniums, cave à vins d'Alsace et jardin sur remparts.",
      typeId: maison.id, localisation: "Obernai, Bas-Rhin", price: 1100000, surface: 280, bedroom: 4, bathroom: 3, garage: 1,
      details: { year: 2014, features: ["Colombages XVIe", "Cour fleurie", "Cave à vins d'Alsace", "Jardin sur remparts", "Cuisine alsacienne", "Poutres d'époque", "Cheminée à bûches", "À pied village médiéval"] },
      photos: photos(3, 4),
    },
    {
      name: "Propriété Loire Touraine",
      description: "En Touraine, jardins de la France, gentilhommière du XVIIe de 350 m² avec dépendances sur 5 ha de parc à la française, potager clos de murs et vignes d'Appellation Vouvray.",
      typeId: maison.id, localisation: "Vouvray, Indre-et-Loire", price: 2100000, surface: 350, bedroom: 6, bathroom: 4, garage: 2,
      details: { year: 2018, features: ["Parc à la française 5 ha", "Vignes AOC Vouvray", "Potager clos de murs", "Dépendances 200 m²", "Piscine d'été", "Salon de musique", "Cave de tuffeau", "Porterie d'époque"] },
      photos: photos(4, 4),
    },
    {
      name: "Maison Corse Bastia",
      description: "Dans les hauteurs de Bastia, vieille ville génoise, belle maison de 270 m² avec loggia de 40 m² dominant le port de Bastia et le golfe au-delà. Rénovation soignée respectant les matériaux corses.",
      typeId: maison.id, localisation: "Bastia, Haute-Corse", price: 980000, surface: 270, bedroom: 4, bathroom: 3, garage: 1,
      details: { year: 2021, features: ["Vue port & golfe", "Loggia 40 m²", "Matériaux corses", "Granit local & cotto", "Cuisine méditerranéenne", "Cave voutée", "Terrasse plantée", "Marché Bastia à pied"] },
      photos: photos(5, 4),
    },
    {
      name: "Bastide Gard Uzège",
      description: "Aux portes du Pont du Gard, bastide du XVIIIe de 380 m² entourée de 10 ha de chênes truffiers. Piscine en pierre, mazet d'invités et production de truffes noires du Périgord.",
      typeId: maison.id, localisation: "Uzès, Gard", price: 2900000, surface: 380, bedroom: 5, bathroom: 4, garage: 2,
      details: { year: 2016, features: ["Chênes truffiers 10 ha", "Production truffes noires", "Piscine en pierre", "Mazet invités 80 m²", "Bastide XVIIIe", "Cave voutée", "Potager maraîcher", "Voisinage Pont du Gard"] },
      photos: photos(6, 4),
    },
    {
      name: "Maison Charente Cognac",
      description: "À Cognac, berceau de l'eau-de-vie du même nom, maison de maître de 310 m² dans un parc de 3 ha avec chai d'élevage classé par les Monuments Historiques.",
      typeId: maison.id, localisation: "Cognac, Charente", price: 1650000, surface: 310, bedroom: 5, bathroom: 3, garage: 2,
      details: { year: 2017, features: ["Chai classé MH", "Parc 3 ha", "Production cognac", "Alambic d'époque", "Grande salle à manger", "Bibliothèque d'acajou", "Cave millésimes", "Portique en pierre"] },
      photos: photos(7, 4),
    },
    {
      name: "Villa Pyrénées Ariège",
      description: "En Ariège, à l'entrée d'une vallée pyrénéenne préservée, ancienne ferme de montagne de 320 m² rénovée avec matériaux locaux. Vue sur les sommets enneigés, prairies et rivière à truite.",
      typeId: maison.id, localisation: "Tarascon-sur-Ariège, Ariège", price: 680000, surface: 320, bedroom: 5, bathroom: 3, garage: 2,
      details: { year: 2015, features: ["Vue Pyrénées enneigées", "Rivière à truite privée", "Pierre & bois locaux", "Grange attenante 150 m²", "Prairie 2 ha", "Piscine chauffée", "Cheminée centrale", "Ski à 20 min"] },
      photos: photos(8, 4),
    },
    {
      name: "Maison Camargue Gardian",
      description: "En Camargue, aux bords des étangs, maison de gardian entièrement rénovée de 180 m² avec cheval en liberté, piscine naturelle et biodiversité exceptionnelle du Parc Régional.",
      typeId: maison.id, localisation: "Saintes-Maries-de-la-Mer, Camargue", price: 850000, surface: 180, bedroom: 3, bathroom: 2, garage: 1,
      details: { year: 2019, features: ["Architecture camarguaise", "Cheval en pré", "Piscine naturelle", "Accès étangs flamants roses", "Roseau & enduit naturel", "Terrasse ombragée", "Citerne pluviale", "Randonnée équestre"] },
      photos: photos(9, 4),
    },
    {
      name: "Maison Bigorre Hautes-Pyrénées",
      description: "À Argelès-Gazost, porte des grands cirques pyrénéens, maison de maître de 300 m² avec jardin clos de 1 200 m² et vue sur le Pic du Midi de Bigorre.",
      typeId: maison.id, localisation: "Argelès-Gazost, Hautes-Pyrénées", price: 590000, surface: 300, bedroom: 5, bathroom: 3, garage: 2,
      details: { year: 2016, features: ["Vue Pic du Midi", "Jardin clos 1 200 m²", "Maison de maître XIXe", "Cave à vins pyrénéens", "Véranda panoramique", "Cheminée pierre taillée", "Garage double", "Accès stations ski"] },
      photos: photos(0, 3),
    },
    {
      name: "Mas Camargue Aigues-Mortes",
      description: "Dans les marais salants aux abords d'Aigues-Mortes, mas de 250 m² entièrement restauré avec piscine, potager bio et accès en barque aux étangs. Lumière unique du delta du Rhône.",
      typeId: maison.id, localisation: "Aigues-Mortes, Gard", price: 1100000, surface: 250, bedroom: 4, bathroom: 2, garage: 1,
      details: { year: 2020, features: ["Vue marais salants", "Piscine naturelle", "Potager bio 300 m²", "Barque privée & accès étangs", "Mas en pierre", "Cheminée centrale", "Terrasse plantée", "À pied remparts médiévaux"] },
      photos: photos(1, 3),
    },
    {
      name: "Maison Basque Ciboure",
      description: "À Ciboure, village natal de Maurice Ravel face à Saint-Jean-de-Luz, maison basque de 240 m² avec jardin de 900 m² et vue sur la baie et les deux phares emblématiques.",
      typeId: maison.id, localisation: "Ciboure, Pays Basque", price: 1750000, surface: 240, bedroom: 4, bathroom: 2, garage: 1,
      details: { year: 2021, features: ["Vue baie de Saint-Jean-de-Luz", "Vue phares emblématiques", "Jardin 900 m²", "Architecture basque", "Véranda couverte", "Cuisine basque", "Cave fraîche", "À pied plages & port"] },
      photos: photos(2, 3),
    },
    {
      name: "Maison Landaise Arcachon",
      description: "À 10 minutes du Bassin d'Arcachon, maison landaise traditionnelle de 270 m² dans une clairière de pins centenaires. Architecture en bois typique, grande terrasse couverte et piscine.",
      typeId: maison.id, localisation: "Gujan-Mestras, Gironde", price: 1200000, surface: 270, bedroom: 4, bathroom: 3, garage: 2,
      details: { year: 2018, features: ["Pins centenaires", "Terrasse couverte 50 m²", "Architecture pin des Landes", "Piscine 12 m chauffée", "Cuisine équipée ouverte", "Suite parentale indépendante", "Atelier artisanal", "À 10 min du bassin"] },
      photos: photos(3, 3),
    },
    {
      name: "Maison Bretagne Finistère",
      description: "En Finistère Sud, sur la Presqu'île de Crozon, maison de 230 m² avec jardin de 3 000 m² surplombant la baie de Douarnenez. Vue sur les pointes et falaises du bout du monde.",
      typeId: maison.id, localisation: "Crozon, Finistère", price: 750000, surface: 230, bedroom: 4, bathroom: 2, garage: 1,
      details: { year: 2019, features: ["Vue baie Douarnenez", "Jardin 3 000 m²", "Bout du monde breton", "Granite local", "Terrasse panoramique", "Cheminée granit", "Abri de jardin", "Accès GR34 à pied"] },
      photos: photos(4, 3),
    },
    {
      name: "Mas Languedoc Hérault",
      description: "Entre Montpellier et Béziers, mas de garrigue de 300 m² entouré de 3 ha d'oliviers et de vignes. Restauration soignée respectant les enduits à la chaux et pierres sèches centenaires.",
      typeId: maison.id, localisation: "Pézenas, Hérault", price: 1080000, surface: 300, bedroom: 4, bathroom: 3, garage: 2,
      details: { year: 2018, features: ["Oliviers & vignes 3 ha", "Enduits chaux naturelle", "Pierres sèches", "Piscine naturelle", "Cuisime d'été couverte", "Cave à huile d'olive", "Bergerie rénovée", "Sentiers garrigue"] },
      photos: photos(5, 3),
    },
    {
      name: "Maison Alsace Haut-Rhin",
      description: "À Kaysersberg, village viticole d'Alsace, maison vigneronne de 240 m² du XVIIe restaurée avec cave à vins de 1 500 bouteilles taillée dans le roc et jardin de simples.",
      typeId: maison.id, localisation: "Kaysersberg, Haut-Rhin", price: 850000, surface: 240, bedroom: 4, bathroom: 2, garage: 1,
      details: { year: 2017, features: ["Cave 1 500 bouteilles dans le roc", "Jardin de simples", "Colombages XVIIe", "Vignes Riesling 1 ha", "Pressoir d'époque", "Séchoir à tabac", "Cour intérieure pavée", "À pied route des vins"] },
      photos: photos(6, 3),
    },
    {
      name: "Moulin à Eau Dordogne",
      description: "Moulin à eau médiéval restauré de 280 m² sur la Vézère, à 5 km des grottes de Lascaux. Mécanisme original préservé, jardin en bord de rivière et dépendances aménageables.",
      typeId: maison.id, localisation: "Montignac, Dordogne", price: 1480000, surface: 280, bedroom: 4, bathroom: 3, garage: 2,
      details: { year: 2016, features: ["Moulin médiéval sur la Vézère", "Mécanisme moulin préservé", "Rivière traversante", "Pêche & baignade", "Dépendance 100 m²", "Jardin rivière 2 000 m²", "Pierre calcaire", "À 5 km Lascaux"] },
      photos: photos(7, 3),
    },
    {
      name: "Maison Basque Saint-Jean-de-Luz",
      description: "Dans la station balnéaire la plus élégante du Pays Basque, maison labourdine de 310 m² avec jardin de 1 000 m² et vue sur la baie depuis la terrasse. Rénovation complète en 2023.",
      typeId: maison.id, localisation: "Saint-Jean-de-Luz, Pyrénées-Atlantiques", price: 2100000, surface: 310, bedroom: 5, bathroom: 3, garage: 2,
      details: { year: 2023, features: ["Vue baie de Saint-Jean", "Jardin 1 000 m²", "Architecture labourdine", "Terrasse 50 m²", "Cuisine Miele ouverte", "Suite parentale avec dressing", "Piscine chauffée", "Garage double"] },
      photos: photos(8, 3),
    },
    {
      name: "Ferme Rénovée Bourgogne",
      description: "Au cœur du vignoble bourguignon entre Beaune et Dijon, ferme de 360 m² entièrement rénovée sur 4 ha avec cave à vins de 3 000 bouteilles, pigeonnier classé et grange à aménager.",
      typeId: maison.id, localisation: "Nuits-Saint-Georges, Côte-d'Or", price: 1950000, surface: 360, bedroom: 5, bathroom: 4, garage: 3,
      details: { year: 2019, features: ["Cave à vins 3 000 bouteilles", "Vignes Bourgogne 2 ha", "Pigeonnier classé", "Grange 200 m² aménageable", "Pierre de Bourgogne", "Cheminée monumentale", "Potager clos", "Route des Grands Crus"] },
      photos: photos(9, 3),
    },
    {
      name: "Maison Champagne Épernay",
      description: "À Épernay, capitale du champagne, belle propriété de 280 m² dont la cave creusée dans la craie renferme 5 000 bouteilles. Maison de vigneron rénovée sur les crayères de la Côte des Blancs.",
      typeId: maison.id, localisation: "Épernay, Marne", price: 1250000, surface: 280, bedroom: 4, bathroom: 3, garage: 2,
      details: { year: 2018, features: ["Cave crayère 5 000 bouteilles", "Vignes Côte des Blancs 1,5 ha", "Salle de dégustation", "Cuverie équipée", "Jardin à la française", "Terrasse sur pressoir", "Garage vinification", "Avenue de Champagne à pied"] },
      photos: photos(0, 3),
    },

    // ── 9 biens supplémentaires pour atteindre 100 ────────────────────────────
    {
      name: "Villa Presqu'île Giens",
      description: "Sur la presqu'île de Giens face aux îles d'Or, cette villa de 300 m² dispose d'un accès privé à une plage de sable blanc. Vue imprenable sur Porquerolles depuis chaque pièce de vie.",
      typeId: villa.id, localisation: "Giens, Var", price: 3300000, surface: 300, bedroom: 4, bathroom: 3, garage: 2,
      details: { year: 2021, features: ["Accès plage privée", "Vue Porquerolles", "Piscine à débordement", "Jardin méditerranéen", "Terrasse panoramique", "Cuisine d'été", "Garage double", "Portail sécurisé"] },
      photos: photos(0, 4),
    },
    {
      name: "Villa Île de Ré Saint-Martin",
      description: "Dans la cité corsaire de Saint-Martin-de-Ré, villa de 280 m² avec jardin de 1 000 m² à l'abri des remparts Vauban classés UNESCO. Piscine chauffée et vue sur le port des flibustiers.",
      typeId: villa.id, localisation: "Saint-Martin-de-Ré, Île de Ré", price: 2850000, surface: 280, bedroom: 4, bathroom: 3, garage: 1,
      details: { year: 2020, features: ["Remparts Vauban UNESCO", "Vue port corsaire", "Jardin clos 1 000 m²", "Piscine chauffée", "Pierres de taille", "Vélos inclus", "Cave fraîche", "À pied port & marché"] },
      photos: photos(1, 4),
    },
    {
      name: "Appartement Paris 1er Palais Royal",
      description: "Au cœur du Palais Royal, appartement de 135 m² au 2ème étage avec vue directe sur les jardins historiques classés. Pierres apparentes, poutres d'époque et rénovation sobre mais raffinée.",
      typeId: appartement.id, localisation: "Paris 1er, Palais Royal", price: 3100000, surface: 135, bedroom: 2, bathroom: 2, garage: 0,
      details: { year: 2019, features: ["Vue jardins Palais Royal", "Pierres & poutres apparentes", "Rénovation raffinée", "Cuisine Bulthaup", "Parquet Versailles", "Salle de bain marbre blanc", "Cave privative", "Gardien patrimoine"] },
      photos: photos(2, 4),
    },
    {
      name: "Appartement Megève Centre",
      description: "Au cœur du village de Megève, appartement de 120 m² dans un chalet de standing avec vue sur le Mont d'Arbois. Accès direct aux boutiques, restaurants étoilés et remontées mécaniques.",
      typeId: appartement.id, localisation: "Megève, Haute-Savoie", price: 1650000, surface: 120, bedroom: 3, bathroom: 2, garage: 1,
      details: { year: 2022, features: ["Vue Mont d'Arbois", "Accès ski à pied", "Balcon enneigé 15 m²", "Parquet bois montagne", "Cheminée pierres", "Cave à skis", "Parking sous-sol", "Résidence gardée"] },
      photos: photos(3, 4),
    },
    {
      name: "Appartement Cannes Californie",
      description: "Dans le quartier résidentiel de la Californie, appartement de 165 m² dans une résidence de standing avec piscine commune et vue panoramique sur la baie de Cannes et les îles de Lérins.",
      typeId: appartement.id, localisation: "Cannes, La Californie", price: 1450000, surface: 165, bedroom: 3, bathroom: 2, garage: 1,
      details: { year: 2020, features: ["Vue baie de Cannes", "Vue îles de Lérins", "Piscine de la résidence", "Terrasse 25 m²", "Cuisine ouverte", "Parking en sous-sol", "Gardien & sécurité", "Cave privative"] },
      photos: photos(4, 4),
    },
    {
      name: "Maison Cévennes Gard",
      description: "En plein cœur des Cévennes, classées à l'UNESCO, ancienne ferme du XVIIIe de 250 m² entièrement rénovée avec matériaux du pays. Terrain de 5 ha de châtaigneraie et ruisseau traversant.",
      typeId: maison.id, localisation: "Saint-Jean-du-Gard, Cévennes", price: 620000, surface: 250, bedroom: 4, bathroom: 2, garage: 1,
      details: { year: 2017, features: ["Châtaigneraie 5 ha", "Ruisseau traversant", "Schiste & châtaignier", "Potager en restanques", "Atelier", "Sentiers GR", "Cheminée grandiose", "Source d'eau naturelle"] },
      photos: photos(5, 4),
    },
    {
      name: "Maison Île de Noirmoutier",
      description: "À l'île de Noirmoutier, accessible par le Gois, maison de pêcheur de 190 m² entièrement rénovée avec jardin de 800 m² planté de mimosas. Vue sur le marais salant et les marées.",
      typeId: maison.id, localisation: "Noirmoutier-en-l'Île, Vendée", price: 890000, surface: 190, bedroom: 3, bathroom: 2, garage: 1,
      details: { year: 2021, features: ["Vue marais salants", "Jardin mimosas 800 m²", "Maison pêcheur rénovée", "Terrasse bois", "Cuisine ouverte", "Cheminée bois", "Vélos fournis", "À pied port & plages"] },
      photos: photos(6, 4),
    },
    {
      name: "Maison Beaujolais Vignoble",
      description: "Dans le Beaujolais, maison de vigneron de 220 m² avec cave de 2 000 bouteilles et vigne classée AOC Beaujolais Villages de 2 ha. Vue sur les collines dorées au coucher du soleil.",
      typeId: maison.id, localisation: "Villefranche-sur-Saône, Beaujolais", price: 780000, surface: 220, bedroom: 4, bathroom: 2, garage: 2,
      details: { year: 2016, features: ["Vignes AOC 2 ha", "Cave 2 000 bouteilles", "Vue collines vignes", "Cuverie équipée", "Terrasse ombragée", "Potager productif", "Garage double", "Route du Beaujolais"] },
      photos: photos(7, 4),
    },
    {
      name: "Villa Île d'Oléron",
      description: "Sur l'île d'Oléron, la plus ensoleillée de l'Atlantique, villa de 240 m² avec piscine chauffée et jardin de 1 500 m² cerné de pins. À vélo du port d'ostréiculture de La Cotinière.",
      typeId: villa.id, localisation: "Saint-Pierre-d'Oléron, Charente-Maritime", price: 1150000, surface: 240, bedroom: 4, bathroom: 2, garage: 1,
      details: { year: 2019, features: ["Piscine chauffée", "Jardin 1 500 m² pinède", "À vélo port La Cotinière", "Terrasse bois 50 m²", "Cuisine ouverte", "Garage & abri vélos", "Double vitrage", "Vue pinède"] },
      photos: photos(8, 4),
    },
  ];

  // Insertion séquentielle (respecte les contraintes FK)
  for (const { photos: photoList, ...data } of propertiesData) {
    await prisma.property.create({
      data: {
        ...data,
        agencyId: agencyIds[agencyKeyOf(data.localisation)],
        photos: { create: photoList.map((path) => ({ path })) },
      },
    });
  }
  console.log(`  ${propertiesData.length} properties created`);

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
