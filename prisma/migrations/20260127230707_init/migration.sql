-- CreateTable
CREATE TABLE "factions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "factions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "races" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "factionId" INTEGER NOT NULL,

    CONSTRAINT "races_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "armorType" TEXT NOT NULL DEFAULT '',
    "colorCode" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "race_classes" (
    "id" SERIAL NOT NULL,
    "raceId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "race_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specializations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "specializations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "gender" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "raceId" INTEGER NOT NULL,
    "specializationId" INTEGER NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "factions_name_key" ON "factions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "races_name_key" ON "races"("name");

-- CreateIndex
CREATE UNIQUE INDEX "races_slug_key" ON "races"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "classes_name_key" ON "classes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "classes_slug_key" ON "classes"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "race_classes_raceId_classId_key" ON "race_classes"("raceId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "specializations_classId_name_key" ON "specializations"("classId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "specializations_classId_slug_key" ON "specializations"("classId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "characters_name_key" ON "characters"("name");

-- AddForeignKey
ALTER TABLE "races" ADD CONSTRAINT "races_factionId_fkey" FOREIGN KEY ("factionId") REFERENCES "factions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race_classes" ADD CONSTRAINT "race_classes_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "races"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race_classes" ADD CONSTRAINT "race_classes_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specializations" ADD CONSTRAINT "specializations_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "races"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "specializations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
