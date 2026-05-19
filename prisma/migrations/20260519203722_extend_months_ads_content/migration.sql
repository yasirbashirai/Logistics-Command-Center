/*
  Warnings:

  - Added the required column `updatedAt` to the `ContentItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Month" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monthNumber" INTEGER NOT NULL,
    "theme" TEXT NOT NULL,
    "startDayNumber" INTEGER NOT NULL,
    "endDayNumber" INTEGER NOT NULL,
    "revenueTarget" INTEGER NOT NULL,
    "mrrTarget" INTEGER NOT NULL,
    "clientsTarget" INTEGER NOT NULL,
    "adBudget" INTEGER NOT NULL,
    "objectives" TEXT NOT NULL,
    "retainerMix" TEXT,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "AdCampaign" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "campaignType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "monthNumber" INTEGER NOT NULL DEFAULT 1,
    "dailyBudget" REAL NOT NULL DEFAULT 0,
    "monthlyBudget" REAL NOT NULL DEFAULT 0,
    "audience" TEXT,
    "objective" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AdCreative" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "campaignId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "hook" TEXT,
    "body" TEXT,
    "cta" TEXT,
    "scriptKeyRef" TEXT,
    "mediaUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdCreative_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "AdCampaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdMetric" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "campaignId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "spend" REAL NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "leads" INTEGER NOT NULL DEFAULT 0,
    "bookedCalls" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdMetric_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "AdCampaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ContentItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'linkedin',
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'idea',
    "dayOfWeek" TEXT,
    "scheduledFor" DATETIME,
    "publishedAt" DATETIME,
    "hookText" TEXT,
    "body" TEXT,
    "mediaUrl" TEXT,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "postUrl" TEXT,
    "notes" TEXT,
    "weekNumber" INTEGER,
    "monthNumber" INTEGER NOT NULL DEFAULT 1,
    "scriptKeyRef" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "inboundDms" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ContentItem" ("body", "createdAt", "dayOfWeek", "hookText", "id", "mediaUrl", "notes", "postUrl", "publishedAt", "scheduledFor", "status", "title", "type", "weekNumber") SELECT "body", "createdAt", "dayOfWeek", "hookText", "id", "mediaUrl", "notes", "postUrl", "publishedAt", "scheduledFor", "status", "title", "type", "weekNumber" FROM "ContentItem";
DROP TABLE "ContentItem";
ALTER TABLE "new_ContentItem" RENAME TO "ContentItem";
CREATE TABLE "new_Day" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dayNumber" INTEGER NOT NULL,
    "monthNumber" INTEGER NOT NULL DEFAULT 1,
    "weekNumber" INTEGER NOT NULL,
    "weekday" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "focusArea" TEXT NOT NULL,
    "hoursEstimated" INTEGER NOT NULL DEFAULT 4,
    "weeklyTheme" TEXT,
    "isCustom" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Day" ("dayNumber", "focusArea", "hoursEstimated", "id", "label", "weekNumber", "weekday", "weeklyTheme") SELECT "dayNumber", "focusArea", "hoursEstimated", "id", "label", "weekNumber", "weekday", "weeklyTheme" FROM "Day";
DROP TABLE "Day";
ALTER TABLE "new_Day" RENAME TO "Day";
CREATE UNIQUE INDEX "Day_dayNumber_key" ON "Day"("dayNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Month_monthNumber_key" ON "Month"("monthNumber");

-- CreateIndex
CREATE INDEX "AdMetric_date_idx" ON "AdMetric"("date");
