import "dotenv/config";
import bcrypt from "bcryptjs";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  await prisma.media.deleteMany();
  await prisma.property.deleteMany();
  await prisma.propertyType.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("Admin123!", 12);
  await prisma.user.create({
    data: {
      email: "admin@ymmo.fr",
      password: adminPassword,
      username: "admin",
      firstName: "Admin",
      lastName: "Ymmo",
      role: "Admin",
    },
  });
  console.log("  Admin user created (admin@ymmo.fr / Admin123!)");

  const villa = await prisma.propertyType.create({ data: { name: "villa" } });
  const appartement = await prisma.propertyType.create({ data: { name: "appartement" } });
  const maison = await prisma.propertyType.create({ data: { name: "maison" } });
  console.log("  Property types created");

  const propertiesData = [
    {
      name: "Villa d'Exception Vue Mer",
      description: "Villa d'exception située sur les hauteurs de Saint-Tropez, offrant une vue panoramique à 180° sur la mer Méditerranée. Cette propriété unique de 550m² sur un terrain paysager de 2500m² incarne le summum du luxe et du raffinement à la française.",
      typeId: villa.id,
      localisation: "Saint-Tropez",
      price: 8900000,
      surface: 550,
      bedroom: 6,
      bathroom: 6,
      garage: 4,
      details: {
        features: [
          "Vue mer panoramique 180°",
          "Piscine à débordement 20m",
          "Pool house avec cuisine d'été",
          "Héliport privé",
          "Spa et salle de sport",
          "Système domotique Bang & Olufsen",
          "Ascenseur intérieur",
          "Garage 4 voitures",
        ],
        year: 2023,
      },
      photos: [
        "https://images.unsplash.com/photo-1622015663381-d2e05ae91b72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjB2aWxsYSUyMGV4dGVyaW9yfGVufDF8fHx8MTc3MzczNTAyOXww&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1759256243437-9c8f7238c42b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtYW5zaW9uJTIwcG9vbCUyMHN1bnNldHxlbnwxfHx8fDE3NzM3NjM2NDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1738168279272-c08d6dd22002?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBpbnRlcmlvciUyMGxpdmluZyUyMHJvb218ZW58MXx8fHwxNzczNzU2Nzg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1658280911730-467b4764c09c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwbWFyYmxlfGVufDF8fHx8MTc3Mzc0MjM3MHww&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1702411200201-3061d0eea802?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiZWRyb29tJTIwc3VpdGV8ZW58MXx8fHwxNzczNzY0MDM1fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1760564019103-81cd3c225cd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiYXRocm9vbSUyMHNwYXxlbnwxfHx8fDE3NzM3MTI0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      ],
    },
    {
      name: "Villa Contemporaine avec Piscine",
      description: "Magnifique villa contemporaine située dans un quartier privilégié de Cannes, offrant une vue panoramique sur la mer Méditerranée. Cette propriété d'exception allie design moderne et confort absolu, avec des finitions haut de gamme et des espaces de vie généreux baignés de lumière naturelle.",
      typeId: villa.id,
      localisation: "Cannes, Côte d'Azur",
      price: 4950000,
      surface: 380,
      bedroom: 5,
      bathroom: 4,
      garage: 3,
      details: {
        features: [
          "Piscine à débordement chauffée",
          "Jardin paysager de 1200m²",
          "Système domotique complet",
          "Cuisine équipée Gaggenau",
          "Climatisation réversible",
          "Alarme et vidéosurveillance",
          "Cave à vin climatisée",
          "Terrasse avec vue mer",
        ],
        year: 2022,
      },
      photos: [
        "https://images.unsplash.com/photo-1759256243437-9c8f7238c42b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtYW5zaW9uJTIwcG9vbCUyMHN1bnNldHxlbnwxfHx8fDE3NzM3NjM2NDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1738168279272-c08d6dd22002?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBpbnRlcmlvciUyMGxpdmluZyUyMHJvb218ZW58MXx8fHwxNzczNzU2Nzg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1658280911730-467b4764c09c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwbWFyYmxlfGVufDF8fHx8MTc3Mzc0MjM3MHww&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1702411200201-3061d0eea802?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiZWRyb29tJTIwc3VpdGV8ZW58MXx8fHwxNzczNzY0MDM1fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1760564019103-81cd3c225cd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiYXRocm9vbSUyMHNwYXxlbnwxfHx8fDE3NzM3MTI0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      ],
    },
    {
      name: "Penthouse Vue Panoramique",
      description: "Somptueux penthouse situé au dernier étage d'un immeuble haussmannien rénové, offrant une vue imprenable sur la Tour Eiffel et les toits de Paris. Cet appartement d'exception bénéficie d'une terrasse exceptionnelle de 100m² et de prestations luxueuses.",
      typeId: appartement.id,
      localisation: "Paris 16ème",
      price: 3200000,
      surface: 250,
      bedroom: 4,
      bathroom: 3,
      garage: 2,
      details: {
        features: [
          "Terrasse de 100m² avec vue Tour Eiffel",
          "Plafonds de 3.5m de hauteur",
          "Parquet point de Hongrie",
          "Cheminées d'époque",
          "Cuisine ouverte Boffi",
          "Salle de sport privée",
          "Ascenseur privatif",
          "Cave et parking double",
        ],
        year: 2021,
      },
      photos: [
        "https://images.unsplash.com/photo-1585311746214-764246524f52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBwZW50aG91c2UlMjBiYWxjb255JTIwdmlld3xlbnwxfHx8fDE3NzM3NDQ4NDh8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1771888703720-6a55f70dcbed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwZGluaW5nJTIwcm9vbXxlbnwxfHx8fDE3NzM3NDYxNTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1658280911730-467b4764c09c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwbWFyYmxlfGVufDF8fHx8MTc3Mzc0MjM3MHww&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1702411200201-3061d0eea802?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiZWRyb29tJTIwc3VpdGV8ZW58MXx8fHwxNzczNzY0MDM1fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1760564019103-81cd3c225cd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiYXRocm9vbSUyMHNwYXxlbnwxfHx8fDE3NzM3MTI0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      ],
    },
    {
      name: "Appartement de Standing",
      description: "Superbe appartement bourgeois entièrement rénové dans le quartier prestigieux de la Presqu'île. Volumes généreux, luminosité exceptionnelle et prestations haut de gamme pour ce bien d'exception au cœur de Lyon.",
      typeId: appartement.id,
      localisation: "Lyon, Presqu'île",
      price: 1850000,
      surface: 180,
      bedroom: 3,
      bathroom: 2,
      garage: 1,
      details: {
        features: [
          "Rénovation architecte 2023",
          "Parquet massif chêne",
          "Moulures et rosaces",
          "Double exposition",
          "Cuisine Dada",
          "Buanderie équipée",
          "Balcon filant",
          "Gardien et digicode",
        ],
        year: 2023,
      },
      photos: [
        "https://images.unsplash.com/photo-1738168279272-c08d6dd22002?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBpbnRlcmlvciUyMGxpdmluZyUyMHJvb218ZW58MXx8fHwxNzczNzU2Nzg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1658280911730-467b4764c09c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwbWFyYmxlfGVufDF8fHx8MTc3Mzc0MjM3MHww&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1771888703720-6a55f70dcbed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwZGluaW5nJTIwcm9vbXxlbnwxfHx8fDE3NzM3NDYxNTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1702411200201-3061d0eea802?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiZWRyb29tJTIwc3VpdGV8ZW58MXx8fHwxNzczNzY0MDM1fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1760564019103-81cd3c225cd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiYXRocm9vbSUyMHNwYXxlbnwxfHx8fDE3NzM3MTI0NDl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      ],
    },
    {
      name: "Maison d'Architecte",
      description: "Maison d'architecte contemporaine située dans un quartier résidentiel prisé de Bordeaux. Architecture épurée, matériaux nobles et volumes baignés de lumière pour cette réalisation d'exception signée par un cabinet renommé.",
      typeId: maison.id,
      localisation: "Bordeaux",
      price: 2750000,
      surface: 320,
      bedroom: 4,
      bathroom: 3,
      garage: 2,
      details: {
        features: [
          "Architecture contemporaine",
          "Baies vitrées sur jardin",
          "Piscine miroir",
          "Jardin arboré 800m²",
          "Home cinéma",
          "Panneaux solaires",
          "Chauffage au sol",
          "Garage double",
        ],
        year: 2020,
      },
      photos: [
        "https://images.unsplash.com/photo-1627141234469-24711efb373c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBob3VzZSUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NzM3MzEwOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1738168279272-c08d6dd22002?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBpbnRlcmlvciUyMGxpdmluZyUyMHJvb218ZW58MXx8fHwxNzczNzU2Nzg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1771888703720-6a55f70dcbed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwZGluaW5nJTIwcm9vbXxlbnwxfHx8fDE3NzM3NDYxNTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1658280911730-467b4764c09c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwbWFyYmxlfGVufDF8fHx8MTc3Mzc0MjM3MHww&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1702411200201-3061d0eea802?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiZWRyb29tJTIwc3VpdGV8ZW58MXx8fHwxNzczNzY0MDM1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      ],
    },
    {
      name: "Hôtel Particulier Rénové",
      description: "Exceptionnel hôtel particulier du XVIIIe siècle entièrement rénové par un architecte de renom. Situé dans le 7ème arrondissement, ce bien unique allie le charme de l'ancien aux prestations les plus modernes, avec jardin privatif et prestations luxueuses.",
      typeId: maison.id,
      localisation: "Paris 7ème",
      price: 6500000,
      surface: 450,
      bedroom: 6,
      bathroom: 5,
      garage: 2,
      details: {
        features: [
          "Jardin paysager 200m²",
          "Cave voûtée aménagée",
          "Escalier d'époque classé",
          "Plafonds moulurés",
          "Rénovation haut de gamme",
          "Système domotique KNX",
          "Spa avec hammam",
          "Parking privatif",
        ],
        year: 2024,
      },
      photos: [
        "https://images.unsplash.com/photo-1763725639193-d96de34ec7b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwdG93bmhvdXNlJTIwZmFjYWRlfGVufDF8fHx8MTc3MzY3NTcyNnww&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1738168279272-c08d6dd22002?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBhcGFydG1lbnQlMjBpbnRlcmlvciUyMGxpdmluZyUyMHJvb218ZW58MXx8fHwxNzczNzU2Nzg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1771888703720-6a55f70dcbed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwZGluaW5nJTIwcm9vbXxlbnwxfHx8fDE3NzM3NDYxNTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1658280911730-467b4764c09c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwbWFyYmxlfGVufDF8fHx8MTc3Mzc0MjM3MHww&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1702411200201-3061d0eea802?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiZWRyb29tJTIwc3VpdGV8ZW58MXx8fHwxNzczNzY0MDM1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      ],
    },
  ];

  for (const { photos, ...data } of propertiesData) {
    await prisma.property.create({
      data: {
        ...data,
        photos: { create: photos.map((path) => ({ path })) },
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
