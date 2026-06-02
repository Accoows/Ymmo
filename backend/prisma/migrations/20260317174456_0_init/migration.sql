-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Superadmin', 'Admin', 'AgencyHead', 'User');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'User',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL DEFAULT 'password',
    "username" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "localisation" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "surface" INTEGER NOT NULL,
    "bedroom" INTEGER NOT NULL,
    "bathroom" INTEGER NOT NULL,
    "garage" INTEGER NOT NULL,
    "details" JSONB,
    "posted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "propertyType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "propertyType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "property" ADD CONSTRAINT "property_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "propertyType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
