// Géocodage léger ville -> [latitude, longitude] (sans dépendance ni appel réseau).
// Couvre toutes les localisations du seed + grandes villes françaises pour les
// biens créés via l'admin. Approximation au niveau de la commune (suffisant pour
// une carte). Clé = ville telle qu'écrite avant la première virgule.

const CITY_COORDS: Record<string, [number, number]> = {
  // ─── Côte d'Azur / Provence ───────────────────────────────────────────────
  "Saint-Tropez": [43.2727, 6.6406],
  "Cannes": [43.5528, 7.0174],
  "Nice": [43.7102, 7.262],
  "Cap d'Antibes": [43.551, 7.123],
  "Antibes": [43.5808, 7.1251],
  "Èze": [43.7276, 7.3618],
  "Beaulieu-sur-Mer": [43.7064, 7.332],
  "Villefranche-sur-Mer": [43.7042, 7.311],
  "Menton": [43.7765, 7.5],
  "Mougins": [43.6005, 7.0],
  "Valbonne": [43.6411, 7.0103],
  "Grasse": [43.6584, 6.9225],
  "Monaco": [43.7384, 7.4246],
  "Ramatuelle": [43.2158, 6.6139],
  "Sainte-Maxime": [43.309, 6.638],
  "La Croix-Valmer": [43.207, 6.569],
  "Cavalaire-sur-Mer": [43.174, 6.53],
  "Gassin": [43.229, 6.586],
  "Giens": [43.038, 6.128],
  "Bandol": [43.1357, 5.753],
  "Sanary-sur-Mer": [43.119, 5.801],
  "Cassis": [43.2148, 5.5388],
  "Marseille": [43.2965, 5.3698],
  "Aix-en-Provence": [43.5297, 5.4474],
  "Saint-Rémy-de-Provence": [43.788, 4.832],
  "Les Baux-de-Provence": [43.744, 4.795],
  "Gordes": [43.9111, 5.2],
  "Ménerbes": [43.83, 5.205],
  "Lourmarin": [43.764, 5.362],
  "Bonnieux": [43.823, 5.305],
  "Roussillon": [43.902, 5.292],
  "Séguret": [44.193, 5.003],
  "Aigues-Mortes": [43.567, 4.192],
  "Saintes-Maries-de-la-Mer": [43.452, 4.428],
  "Uzès": [44.012, 4.419],
  "Saint-Jean-du-Gard": [44.105, 3.883],
  "Nîmes": [43.8367, 4.3601],
  "Avignon": [43.9493, 4.8055],
  "Toulon": [43.1242, 5.928],

  // ─── Alpes / Savoie ───────────────────────────────────────────────────────
  "Megève": [45.8569, 6.6177],
  "Courchevel 1850": [45.415, 6.6347],
  "Courchevel": [45.415, 6.6347],
  "Annecy": [45.8992, 6.1294],
  "Grenoble": [45.1885, 5.7245],
  "Chamonix": [45.9237, 6.8694],

  // ─── Sud-Ouest / Pyrénées / Atlantique ───────────────────────────────────
  "Biarritz": [43.4832, -1.5586],
  "Saint-Jean-de-Luz": [43.388, -1.662],
  "Ciboure": [43.384, -1.677],
  "Espelette": [43.343, -1.445],
  "Bordeaux": [44.8378, -0.5792],
  "Pauillac": [45.198, -0.748],
  "Arcachon": [44.658, -1.168],
  "Gujan-Mestras": [44.636, -1.067],
  "Cognac": [45.6959, -0.329],
  "Tarascon-sur-Ariège": [42.845, 1.604],
  "Argelès-Gazost": [43.009, -0.096],
  "Pézenas": [43.46, 3.423],
  "Montpellier": [43.6108, 3.8767],
  "Toulouse": [43.6047, 1.4442],
  "Perpignan": [42.6887, 2.8948],
  "Saint-Pierre-d'Oléron": [45.946, -1.311],
  "Saint-Martin-de-Ré": [46.201, -1.366],

  // ─── Dordogne / Centre / Bourgogne / Beaujolais ───────────────────────────
  "Sarlat-la-Canéda": [44.889, 1.217],
  "Montignac": [45.066, 1.161],
  "Vouvray": [47.411, 0.796],
  "Tours": [47.3941, 0.6848],
  "Nuits-Saint-Georges": [47.137, 4.949],
  "Villefranche-sur-Saône": [45.987, 4.726],
  "Lyon": [45.764, 4.8357],
  "Dijon": [47.322, 5.0415],

  // ─── Est / Nord ───────────────────────────────────────────────────────────
  "Strasbourg": [48.5734, 7.7521],
  "Obernai": [48.462, 7.481],
  "Kaysersberg": [48.139, 7.264],
  "Metz": [49.1193, 6.1757],
  "Épernay": [49.044, 3.959],
  "Reims": [49.2583, 4.0317],
  "Lille": [50.6292, 3.0573],
  "Le Touquet": [50.524, 1.586],

  // ─── Ouest / Bretagne / Normandie ─────────────────────────────────────────
  "Nantes": [47.2184, -1.5536],
  "La Baule": [47.286, -2.391],
  "Noirmoutier-en-l'Île": [46.998, -2.258],
  "Saint-Malo": [48.6493, -2.0257],
  "Saint-Briac-sur-Mer": [48.621, -2.137],
  "Dinard": [48.636, -2.061],
  "Crozon": [48.247, -4.489],
  "Brest": [48.3904, -4.4861],
  "Rennes": [48.1173, -1.6778],
  "Deauville": [49.3597, 0.075],
  "Honfleur": [49.419, 0.233],
  "Caen": [49.1829, -0.3707],
  "Rouen": [49.4432, 1.0993],

  // ─── Corse ────────────────────────────────────────────────────────────────
  "Bastia": [42.7028, 9.4503],
  "Ajaccio": [41.9192, 8.7386],

  // ─── Paris (par arrondissement) ───────────────────────────────────────────
  "Paris": [48.8566, 2.3522],
  "Paris 1er": [48.8624, 2.3361],
  "Paris 4ème": [48.855, 2.3589],
  "Paris 6ème": [48.849, 2.3335],
  "Paris 7ème": [48.857, 2.312],
  "Paris 8ème": [48.872, 2.312],
  "Paris 16ème": [48.8637, 2.2769],
  "Paris 17ème": [48.887, 2.307],
};

export function geocode(localisation: string | null | undefined): { lat: number; lng: number } | null {
  if (!localisation) return null;

  const primary = localisation.split(",")[0].trim();

  const direct = CITY_COORDS[primary] ?? CITY_COORDS[localisation.trim()];
  if (direct) return { lat: direct[0], lng: direct[1] };

  // Arrondissement parisien non listé -> centre de Paris.
  if (/^Paris\b/i.test(primary)) {
    const paris = CITY_COORDS["Paris"];
    return { lat: paris[0], lng: paris[1] };
  }

  // Dernier recours : une ville connue contenue dans la chaîne.
  for (const city in CITY_COORDS) {
    if (localisation.includes(city)) {
      return { lat: CITY_COORDS[city][0], lng: CITY_COORDS[city][1] };
    }
  }

  return null;
}
