-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 16, 2023 at 06:57 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `testing`
--

-- --------------------------------------------------------

--
-- Table structure for table `board`
--

CREATE TABLE `board` (
  `id` int(3) NOT NULL,
  `taken` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `institution`
--

CREATE TABLE `institution` (
  `id` int(4) NOT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `institution`
--

INSERT INTO `institution` (`id`, `name`) VALUES
(0, 'admin'),
(4637, 'Universidad Autónoma de Madrid'),
(4203, 'Universidad Complutense de Madrid'),
(5522, 'Universidad Politécnica de Madrid');

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `id` int(10) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`id`, `description`) VALUES
(1, 'admin'),
(2, 'professor'),
(3, 'student');

-- --------------------------------------------------------

--
-- Table structure for table `session`
--

CREATE TABLE `session` (
  `id` int(4) NOT NULL,
  `username` varchar(255) NOT NULL,
  `id_board` int(3) NOT NULL,
  `session_score` int(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `study_group`
--

CREATE TABLE `study_group` (
  `id` int(8) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `institution_id` int(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `study_group`
--

INSERT INTO `study_group` (`id`, `name`, `institution_id`) VALUES
(42525681, '3º Carrera A', 4637),
(52414390, '5º Carrera B', 4637);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `surname` varchar(255) NOT NULL,
  `age` int(10) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` int(10) DEFAULT NULL,
  `institution_id` int(11) DEFAULT NULL,
  `study_group_id` int(8) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`username`, `email`, `name`, `surname`, `age`, `password`, `role`, `institution_id`, `study_group_id`) VALUES
('admin', 'admin@admin.com', 'admin', 'admin', 0, '$2b$10$CZKZvRcGvBFS9H53z.NeI.WgxsxgK948YpB54Ao8IgPBcFC.veF3m', 1, 4203, NULL),
('profe', 'profe@ucm.es', 'Tamasho', 'Martín', 34, '$2b$10$VelIoF12aM0oDtdIDZ25Y.YGvlFqorzDWlSKZ9K7Ug2ryme39MPMi', 2, 4637, 42525681);

-- --------------------------------------------------------

--
-- Table structure for table `xapi`
--

CREATE TABLE `xapi` (
  `userId` varchar(50) NOT NULL,
  `classId` varchar(50) NOT NULL,
  `traza` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`traza`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `xapi`
--

INSERT INTO `xapi` (`userId`, `classId`, `traza`) VALUES
('52414390', 'siao', '{\"actor\":{\"objectType\":\"Agent\",\"name\":\"siao\",\"mbox\":\"mailto:mm@ucm.es\"},\"verb\":{\"id\":\"https://w3id.org/xapi/seriousgames/verbs/accessed\",\"display\":{\"en-US\":\"accessed\"}},\"object\":{\"id\":\"http://adlnet.gov/expapi/activities/about\",\"definition\":{\"name\":{\"en-US\":\"about\"},\"type\":\"http://www.example.com/types/screen\"},\"objectType\":\"Activity\"},\"result\":{\"score\":{},\"extensions\":{}},\"context\":{\"registration\":\"b2ebe144-884a-8434-4be5-4548275b8b3c\",\"contextActivities\":{\"parent\":[{\"id\":\"https://www.tetris.com//class/52414390\",\"objectType\":\"Activity\"},{\"id\":\"http://adlnet.gov/expapi/activities/about\",\"definition\":{\"name\":{\"en-US\":\"about\"},\"type\":\"http://www.example.com/types/screen\"},\"objectType\":\"Activity\"}]},\"extensions\":{\"https://example.com/niclaID\":\"0\"}},\"timestamp\":\"2023-05-15T09:34:09.176Z\"}'),
('52414390', 'siao', '{\"actor\":{\"objectType\":\"Agent\",\"name\":\"siao\",\"mbox\":\"mailto:mm@ucm.es\"},\"verb\":{\"id\":\"http://adlnet.gov/expapi/verbs/initialized\",\"display\":{\"en-US\":\"initialized\"}},\"object\":{\"id\":\"http://adlnet.gov/expapi/activities/tetris\",\"definition\":{\"name\":{\"en-US\":\"Tetris\"},\"type\":\"http://www.example.com/types/game\"},\"objectType\":\"Activity\"},\"result\":{\"score\":{\"raw\":0},\"extensions\":{\"https://www.tetris.com/attempt\":1,\"https://www.tetris.com/level\":1,\"https://www.tetris.com/lines\":0,\"https://www.tetris.com/apm\":0,\"https://www.tetris.com/time\":0}},\"context\":{\"registration\":\"b2ebe144-884a-8434-4be5-4548275b8b3c\",\"contextActivities\":{\"parent\":[{\"id\":\"https://www.tetris.com//class/52414390\",\"objectType\":\"Activity\"},{\"id\":\"http://adlnet.gov/expapi/activities/tetris\",\"definition\":{\"name\":{\"en-US\":\"Tetris\"},\"type\":\"http://www.example.com/types/game\"},\"objectType\":\"Activity\"}]},\"extensions\":{\"https://example.com/niclaID\":\"0\"}},\"timestamp\":\"2023-05-15T09:34:09.177Z\"}'),
('52414390', 'siao', '{\"actor\":{\"objectType\":\"Agent\",\"name\":\"siao\",\"mbox\":\"mailto:mm@ucm.es\"},\"verb\":{\"id\":\"http://adlnet.gov/expapi/verbs/completed\",\"display\":{\"en-US\":\"completed\"}},\"object\":{\"id\":\"http://adlnet.gov/expapi/activities/tetris\",\"definition\":{\"name\":{\"en-US\":\"Tetris\"},\"type\":\"http://www.example.com/types/game\"},\"objectType\":\"Activity\"},\"result\":{\"score\":{\"raw\":654},\"extensions\":{\"https://www.tetris.com/attempt\":null,\"https://www.tetris.com/level\":1,\"https://www.tetris.com/lines\":0,\"https://www.tetris.com/apm\":865,\"https://www.tetris.com/time\":7}},\"context\":{\"registration\":\"b2ebe144-884a-8434-4be5-4548275b8b3c\",\"contextActivities\":{\"parent\":[{\"id\":\"https://www.tetris.com//class/52414390\",\"objectType\":\"Activity\"},{\"id\":\"http://adlnet.gov/expapi/activities/tetris\",\"definition\":{\"name\":{\"en-US\":\"Tetris\"},\"type\":\"http://www.example.com/types/game\"},\"objectType\":\"Activity\"}]},\"extensions\":{\"https://example.com/niclaID\":\"0\"}},\"timestamp\":\"2023-05-15T09:34:19.333Z\"}'),
('52414390', 'siao', '{\"actor\":{\"objectType\":\"Agent\",\"name\":\"siao\",\"mbox\":\"mailto:mm@ucm.es\"},\"verb\":{\"id\":\"https://w3id.org/xapi/seriousgames/verbs/accessed\",\"display\":{\"en-US\":\"accessed\"}},\"object\":{\"id\":\"http://adlnet.gov/expapi/activities/about\",\"definition\":{\"name\":{\"en-US\":\"about\"},\"type\":\"http://www.example.com/types/screen\"},\"objectType\":\"Activity\"},\"result\":{\"score\":{\"raw\":654},\"extensions\":{\"https://www.tetris.com/attempt\":null,\"https://www.tetris.com/level\":1,\"https://www.tetris.com/lines\":0,\"https://www.tetris.com/apm\":865,\"https://www.tetris.com/time\":7}},\"context\":{\"registration\":\"b2ebe144-884a-8434-4be5-4548275b8b3c\",\"contextActivities\":{\"parent\":[{\"id\":\"https://www.tetris.com//class/52414390\",\"objectType\":\"Activity\"},{\"id\":\"http://adlnet.gov/expapi/activities/about\",\"definition\":{\"name\":{\"en-US\":\"about\"},\"type\":\"http://www.example.com/types/screen\"},\"objectType\":\"Activity\"}]},\"extensions\":{\"https://example.com/niclaID\":\"0\"}},\"timestamp\":\"2023-05-15T09:34:31.010Z\"}'),
('52414390', 'siao', '{\"actor\":{\"objectType\":\"Agent\",\"name\":\"siao\",\"mbox\":\"mailto:mm@ucm.es\"},\"verb\":{\"id\":\"http://adlnet.gov/expapi/verbs/initialized\",\"display\":{\"en-US\":\"initialized\"}},\"object\":{\"id\":\"http://adlnet.gov/expapi/activities/tetris\",\"definition\":{\"name\":{\"en-US\":\"Tetris\"},\"type\":\"http://www.example.com/types/game\"},\"objectType\":\"Activity\"},\"result\":{\"score\":{\"raw\":0},\"extensions\":{\"https://www.tetris.com/attempt\":1,\"https://www.tetris.com/level\":1,\"https://www.tetris.com/lines\":0,\"https://www.tetris.com/apm\":0,\"https://www.tetris.com/time\":0}},\"context\":{\"registration\":\"b2ebe144-884a-8434-4be5-4548275b8b3c\",\"contextActivities\":{\"parent\":[{\"id\":\"https://www.tetris.com//class/52414390\",\"objectType\":\"Activity\"},{\"id\":\"http://adlnet.gov/expapi/activities/tetris\",\"definition\":{\"name\":{\"en-US\":\"Tetris\"},\"type\":\"http://www.example.com/types/game\"},\"objectType\":\"Activity\"}]},\"extensions\":{\"https://example.com/niclaID\":\"0\"}},\"timestamp\":\"2023-05-15T09:34:32.069Z\"}'),
('52414390', 'siao', '{\"actor\":{\"objectType\":\"Agent\",\"name\":\"siao\",\"mbox\":\"mailto:mm@ucm.es\"},\"verb\":{\"id\":\"http://adlnet.gov/expapi/verbs/completed\",\"display\":{\"en-US\":\"completed\"}},\"object\":{\"id\":\"http://adlnet.gov/expapi/activities/tetris\",\"definition\":{\"name\":{\"en-US\":\"Tetris\"},\"type\":\"http://www.example.com/types/game\"},\"objectType\":\"Activity\"},\"result\":{\"score\":{\"raw\":438},\"extensions\":{\"https://www.tetris.com/attempt\":null,\"https://www.tetris.com/level\":1,\"https://www.tetris.com/lines\":0,\"https://www.tetris.com/apm\":668,\"https://www.tetris.com/time\":7}},\"context\":{\"registration\":\"b2ebe144-884a-8434-4be5-4548275b8b3c\",\"contextActivities\":{\"parent\":[{\"id\":\"https://www.tetris.com//class/52414390\",\"objectType\":\"Activity\"},{\"id\":\"http://adlnet.gov/expapi/activities/tetris\",\"definition\":{\"name\":{\"en-US\":\"Tetris\"},\"type\":\"http://www.example.com/types/game\"},\"objectType\":\"Activity\"}]},\"extensions\":{\"https://example.com/niclaID\":\"0\"}},\"timestamp\":\"2023-05-15T09:34:41.464Z\"}'),
('52414390', 'siao', '{\"actor\":{\"objectType\":\"Agent\",\"name\":\"siao\",\"mbox\":\"mailto:mm@ucm.es\"},\"verb\":{\"id\":\"https://w3id.org/xapi/seriousgames/verbs/accessed\",\"display\":{\"en-US\":\"accessed\"}},\"object\":{\"id\":\"http://adlnet.gov/expapi/activities/about\",\"definition\":{\"name\":{\"en-US\":\"about\"},\"type\":\"http://www.example.com/types/screen\"},\"objectType\":\"Activity\"},\"result\":{\"score\":{},\"extensions\":{}},\"context\":{\"registration\":\"8d90a974-3eed-1809-6bb6-69a82dc53c2d\",\"contextActivities\":{\"parent\":[{\"id\":\"https://www.tetris.com//class/52414390\",\"objectType\":\"Activity\"},{\"id\":\"http://adlnet.gov/expapi/activities/about\",\"definition\":{\"name\":{\"en-US\":\"about\"},\"type\":\"http://www.example.com/types/screen\"},\"objectType\":\"Activity\"}]},\"extensions\":{\"https://example.com/niclaID\":\"0\"}},\"timestamp\":\"2023-05-15T09:41:49.156Z\"}'),
('52414390', 'siao', '{\"actor\":{\"objectType\":\"Agent\",\"name\":\"siao\",\"mbox\":\"mailto:mm@ucm.es\"},\"verb\":{\"id\":\"http://adlnet.gov/expapi/verbs/initialized\",\"display\":{\"en-US\":\"initialized\"}},\"object\":{\"id\":\"http://adlnet.gov/expapi/activities/tetris\",\"definition\":{\"name\":{\"en-US\":\"Tetris\"},\"type\":\"http://www.example.com/types/game\"},\"objectType\":\"Activity\"},\"result\":{\"score\":{\"raw\":0},\"extensions\":{\"https://www.tetris.com/attempt\":1,\"https://www.tetris.com/level\":1,\"https://www.tetris.com/lines\":0,\"https://www.tetris.com/apm\":0,\"https://www.tetris.com/time\":0}},\"context\":{\"registration\":\"8d90a974-3eed-1809-6bb6-69a82dc53c2d\",\"contextActivities\":{\"parent\":[{\"id\":\"https://www.tetris.com//class/52414390\",\"objectType\":\"Activity\"},{\"id\":\"http://adlnet.gov/expapi/activities/tetris\",\"definition\":{\"name\":{\"en-US\":\"Tetris\"},\"type\":\"http://www.example.com/types/game\"},\"objectType\":\"Activity\"}]},\"extensions\":{\"https://example.com/niclaID\":\"0\"}},\"timestamp\":\"2023-05-15T09:41:49.158Z\"}'),
('52414390', 'siao', '{\"actor\":{\"objectType\":\"Agent\",\"name\":\"siao\",\"mbox\":\"mailto:mm@ucm.es\"},\"verb\":{\"id\":\"http://adlnet.gov/expapi/verbs/suspended\",\"display\":{\"en-US\":\"suspended\"}},\"object\":{\"id\":\"http://adlnet.gov/expapi/activities/tetris\",\"definition\":{\"name\":{\"en-US\":\"Tetris\"},\"type\":\"http://www.example.com/types/game\"},\"objectType\":\"Activity\"},\"result\":{\"score\":{\"raw\":0},\"extensions\":{\"https://www.tetris.com/attempt\":null,\"https://www.tetris.com/level\":1,\"https://www.tetris.com/lines\":0,\"https://www.tetris.com/apm\":0,\"https://www.tetris.com/time\":1}},\"context\":{\"registration\":\"8d90a974-3eed-1809-6bb6-69a82dc53c2d\",\"contextActivities\":{\"parent\":[{\"id\":\"https://www.tetris.com//class/52414390\",\"objectType\":\"Activity\"},{\"id\":\"http://adlnet.gov/expapi/activities/tetris\",\"definition\":{\"name\":{\"en-US\":\"Tetris\"},\"type\":\"http://www.example.com/types/game\"},\"objectType\":\"Activity\"}]},\"extensions\":{\"https://example.com/niclaID\":\"0\"}},\"timestamp\":\"2023-05-15T09:41:50.730Z\"}'),
('64280786', 'siao', '{\"actor\":{\"objectType\":\"Agent\",\"name\":\"siao\",\"mbox\":\"mailto:mm@ucm.es\"},\"verb\":{\"id\":\"https://w3id.org/xapi/seriousgames/verbs/accessed\",\"display\":{\"en-US\":\"accessed\"}},\"object\":{\"id\":\"http://adlnet.gov/expapi/activities/about\",\"definition\":{\"name\":{\"en-US\":\"about\"},\"type\":\"http://www.example.com/types/screen\"},\"objectType\":\"Activity\"},\"result\":{\"score\":{},\"extensions\":{}},\"context\":{\"registration\":\"9cc68a86-d249-e476-df45-3344ed5376c0\",\"contextActivities\":{\"parent\":[{\"id\":\"https://www.tetris.com//class/64280786\",\"objectType\":\"Activity\"},{\"id\":\"http://adlnet.gov/expapi/activities/about\",\"definition\":{\"name\":{\"en-US\":\"about\"},\"type\":\"http://www.example.com/types/screen\"},\"objectType\":\"Activity\"}]},\"extensions\":{\"https://example.com/niclaID\":\"0\"}},\"timestamp\":\"2023-05-15T11:47:35.408Z\"}'),
('64280786', 'siao', '{\"actor\":{\"objectType\":\"Agent\",\"name\":\"siao\",\"mbox\":\"mailto:mm@ucm.es\"},\"verb\":{\"id\":\"http://adlnet.gov/expapi/verbs/initialized\",\"display\":{\"en-US\":\"initialized\"}},\"object\":{\"id\":\"http://adlnet.gov/expapi/activities/tetris\",\"definition\":{\"name\":{\"en-US\":\"Tetris\"},\"type\":\"http://www.example.com/types/game\"},\"objectType\":\"Activity\"},\"result\":{\"score\":{\"raw\":0},\"extensions\":{\"https://www.tetris.com/attempt\":1,\"https://www.tetris.com/level\":1,\"https://www.tetris.com/lines\":0,\"https://www.tetris.com/apm\":0,\"https://www.tetris.com/time\":0}},\"context\":{\"registration\":\"9cc68a86-d249-e476-df45-3344ed5376c0\",\"contextActivities\":{\"parent\":[{\"id\":\"https://www.tetris.com//class/64280786\",\"objectType\":\"Activity\"},{\"id\":\"http://adlnet.gov/expapi/activities/tetris\",\"definition\":{\"name\":{\"en-US\":\"Tetris\"},\"type\":\"http://www.example.com/types/game\"},\"objectType\":\"Activity\"}]},\"extensions\":{\"https://example.com/niclaID\":\"0\"}},\"timestamp\":\"2023-05-15T11:47:35.409Z\"}'),
('64280786', 'siao', '{\"actor\":{\"objectType\":\"Agent\",\"name\":\"siao\",\"mbox\":\"mailto:mm@ucm.es\"},\"verb\":{\"id\":\"http://adlnet.gov/expapi/verbs/completed\",\"display\":{\"en-US\":\"completed\"}},\"object\":{\"id\":\"http://adlnet.gov/expapi/activities/tetris\",\"definition\":{\"name\":{\"en-US\":\"Tetris\"},\"type\":\"http://www.example.com/types/game\"},\"objectType\":\"Activity\"},\"result\":{\"score\":{\"raw\":2549},\"extensions\":{\"https://www.tetris.com/attempt\":null,\"https://www.tetris.com/level\":2,\"https://www.tetris.com/lines\":1,\"https://www.tetris.com/apm\":586,\"https://www.tetris.com/time\":27}},\"context\":{\"registration\":\"9cc68a86-d249-e476-df45-3344ed5376c0\",\"contextActivities\":{\"parent\":[{\"id\":\"https://www.tetris.com//class/64280786\",\"objectType\":\"Activity\"},{\"id\":\"http://adlnet.gov/expapi/activities/tetris\",\"definition\":{\"name\":{\"en-US\":\"Tetris\"},\"type\":\"http://www.example.com/types/game\"},\"objectType\":\"Activity\"}]},\"extensions\":{\"https://example.com/niclaID\":\"0\"}},\"timestamp\":\"2023-05-15T11:48:05.017Z\"}');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `board`
--
ALTER TABLE `board`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `institution`
--
ALTER TABLE `institution`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `institution_pk` (`name`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `description` (`description`);

--
-- Indexes for table `session`
--
ALTER TABLE `session`
  ADD PRIMARY KEY (`id`),
  ADD KEY `username` (`username`);

--
-- Indexes for table `study_group`
--
ALTER TABLE `study_group`
  ADD PRIMARY KEY (`id`),
  ADD KEY `study_group_institution_id_fk` (`institution_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`username`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `institution_id` (`institution_id`),
  ADD KEY `study_group_id` (`study_group_id`),
  ADD KEY `role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `session`
--
ALTER TABLE `session`
  MODIFY `id` int(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `session`
--
ALTER TABLE `session`
  ADD CONSTRAINT `session_ibfk_2` FOREIGN KEY (`username`) REFERENCES `user` (`username`);

--
-- Constraints for table `study_group`
--
ALTER TABLE `study_group`
  ADD CONSTRAINT `study_group_ibfk_1` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`),
  ADD CONSTRAINT `study_group_institution_id_fk` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`);

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`),
  ADD CONSTRAINT `user_ibfk_2` FOREIGN KEY (`study_group_id`) REFERENCES `study_group` (`id`),
  ADD CONSTRAINT `user_ibfk_3` FOREIGN KEY (`role`) REFERENCES `role` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
