-- CreateTable
CREATE TABLE "CanteenMenu" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mainDish" TEXT NOT NULL,
    "sideDish" TEXT,
    "veggies" TEXT,
    "dessert" TEXT,
    "priceStudent" DECIMAL(5,2),
    "hoursStart" TEXT,
    "hoursEnd" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanteenMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanteenRating" (
    "id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CanteenRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanteenComment" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CanteenComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CanteenMenu_date_key" ON "CanteenMenu"("date");

-- CreateIndex
CREATE INDEX "CanteenRating_menuId_idx" ON "CanteenRating"("menuId");

-- CreateIndex
CREATE UNIQUE INDEX "CanteenRating_menuId_userId_key" ON "CanteenRating"("menuId", "userId");

-- CreateIndex
CREATE INDEX "CanteenComment_menuId_idx" ON "CanteenComment"("menuId");

-- AddForeignKey
ALTER TABLE "CanteenRating" ADD CONSTRAINT "CanteenRating_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "CanteenMenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanteenComment" ADD CONSTRAINT "CanteenComment_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "CanteenMenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
