-- CreateTable
CREATE TABLE "AppState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "startDate" DATETIME NOT NULL,
    "founderName" TEXT NOT NULL DEFAULT 'Yasir Bashir',
    "agencyName" TEXT NOT NULL DEFAULT 'Logistics Solutions',
    "northStarTarget" INTEGER NOT NULL DEFAULT 8,
    "mrrTarget" INTEGER NOT NULL DEFAULT 10000,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Day" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dayNumber" INTEGER NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "weekday" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "focusArea" TEXT NOT NULL,
    "hoursEstimated" INTEGER NOT NULL DEFAULT 4,
    "weeklyTheme" TEXT
);

-- CreateTable
CREATE TABLE "DailyTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dayId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "hoursEstimated" REAL NOT NULL DEFAULT 1,
    "deliverable" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "pointsValue" INTEGER NOT NULL DEFAULT 10,
    "completedAt" DATETIME,
    "scriptRef" TEXT,
    "toolsNeeded" TEXT,
    CONSTRAINT "DailyTask_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecurringTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "unit" TEXT NOT NULL,
    "pointsPerUnit" REAL NOT NULL DEFAULT 0.1,
    "activeFromDay" INTEGER NOT NULL DEFAULT 8,
    "activeToDay" INTEGER NOT NULL DEFAULT 30,
    "description" TEXT,
    "benchmark" TEXT
);

-- CreateTable
CREATE TABLE "RecurringLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "recurringTaskId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "actualCount" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecurringLog_recurringTaskId_fkey" FOREIGN KEY ("recurringTaskId") REFERENCES "RecurringTask" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KpiDefinition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "weeklyTarget" REAL,
    "monthlyTarget" REAL,
    "thresholdMin" REAL,
    "thresholdHigher" BOOLEAN NOT NULL DEFAULT true,
    "isNorthStar" BOOLEAN NOT NULL DEFAULT false,
    "isHealthCheck" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "failureMode" TEXT
);

-- CreateTable
CREATE TABLE "KpiLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kpiId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "value" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KpiLog_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "KpiDefinition" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScoreSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "dailyScore" REAL NOT NULL,
    "weeklyScore" REAL NOT NULL,
    "monthlyScore" REAL NOT NULL,
    "streak" INTEGER NOT NULL,
    "northStarValue" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "source" TEXT NOT NULL,
    "persona" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'new',
    "estimatedValue" REAL NOT NULL DEFAULT 0,
    "retainerValue" REAL NOT NULL DEFAULT 0,
    "painPoint" TEXT,
    "notes" TEXT,
    "tags" TEXT,
    "lastActivityAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stageEnteredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Script" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "persona" TEXT NOT NULL DEFAULT 'general',
    "funnelStage" TEXT,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "variables" TEXT,
    "notes" TEXT,
    "dayAppliedFrom" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "PastClient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT,
    "platform" TEXT NOT NULL,
    "originalProjectYear" INTEGER,
    "originalProjectSummary" TEXT,
    "segment" TEXT NOT NULL DEFAULT 'B',
    "status" TEXT NOT NULL DEFAULT 'not_contacted',
    "loomRecorded" BOOLEAN NOT NULL DEFAULT false,
    "loomUrl" TEXT,
    "notes" TEXT,
    "lastContactedAt" DATETIME,
    "repliedAt" DATETIME,
    "bookedAt" DATETIME,
    "closedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pastClientId" INTEGER NOT NULL,
    "referredName" TEXT NOT NULL,
    "referredCompany" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payoutAmount" REAL NOT NULL DEFAULT 500,
    "payoutPaid" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Referral_pastClientId_fkey" FOREIGN KEY ("pastClientId") REFERENCES "PastClient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "role" TEXT NOT NULL,
    "weeklyTarget" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'count',
    "costPerMonth" REAL NOT NULL DEFAULT 0,
    "expectedClients" TEXT,
    "benchmarks" TEXT,
    "bestPractice" TEXT,
    "rules" TEXT,
    "notes" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "plan" TEXT,
    "costPerMonth" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "loginUrl" TEXT,
    "alternativesRuledOut" TEXT,
    "warning" TEXT,
    "warningDate" DATETIME,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "ContentItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'idea',
    "dayOfWeek" TEXT,
    "scheduledFor" DATETIME,
    "publishedAt" DATETIME,
    "hookText" TEXT,
    "body" TEXT,
    "mediaUrl" TEXT,
    "postUrl" TEXT,
    "notes" TEXT,
    "weekNumber" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Persona" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "decisionMaker" TEXT NOT NULL,
    "secondaryInfluencer" TEXT,
    "topPains" TEXT NOT NULL,
    "websiteAngle" TEXT NOT NULL,
    "budgetRange" TEXT NOT NULL,
    "salesCycle" TEXT NOT NULL,
    "priorityQuarter" TEXT,
    "techLiteracy" TEXT,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "ObjectionHandler" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "objection" TEXT NOT NULL,
    "realMeaning" TEXT NOT NULL,
    "counter" TEXT NOT NULL,
    "personaId" INTEGER,
    "notes" TEXT,
    CONSTRAINT "ObjectionHandler_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ComplianceRule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rule" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'mandatory',
    "source" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "TimedWarning" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "eventDate" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "affectedAreas" TEXT,
    "action" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "DecisionRule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "trigger" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "sourceModule" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'alert',
    "notes" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Day_dayNumber_key" ON "Day"("dayNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RecurringTask_key_key" ON "RecurringTask"("key");

-- CreateIndex
CREATE INDEX "RecurringLog_date_idx" ON "RecurringLog"("date");

-- CreateIndex
CREATE UNIQUE INDEX "KpiDefinition_key_key" ON "KpiDefinition"("key");

-- CreateIndex
CREATE INDEX "KpiLog_date_idx" ON "KpiLog"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreSnapshot_date_key" ON "ScoreSnapshot"("date");

-- CreateIndex
CREATE INDEX "Lead_stage_idx" ON "Lead"("stage");

-- CreateIndex
CREATE UNIQUE INDEX "Script_key_key" ON "Script"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_key_key" ON "Channel"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Tool_name_key" ON "Tool"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Persona_key_key" ON "Persona"("key");
