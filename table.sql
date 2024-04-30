CREATE TABLE `ai_concept_keyword` (
  `Keyword` varchar(256) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `CreateCount` int NOT NULL,
  `UseCount` int NOT NULL,
  `ModelName` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin not null,
  PRIMARY KEY (`Keyword`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;

CREATE TABLE `ai_concept` (
  `Id` int NOT NULL,
  `NameEn` varchar(256) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `NameJp` varchar(256) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `Description` varchar(4096) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  `ModelName` varchar(64) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin not null,
  `EntryDate` date NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;

CREATE TABLE `ai_concept_tag` (
  `Id` int NOT NULL,
  `Tag` varchar(256) CHARACTER SET utf8mb3 COLLATE utf8mb3_bin NOT NULL,
  PRIMARY KEY (`Id`, `Tag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_bin;
