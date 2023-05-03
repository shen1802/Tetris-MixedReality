-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 03, 2023 at 10:04 AM
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

--
-- Truncate table before insert `board`
--

TRUNCATE TABLE `board`;
--
-- Dumping data for table `board`
--

INSERT INTO `board` (`id`, `taken`) VALUES
(0, 'no');

-- --------------------------------------------------------

--
-- Table structure for table `institution`
--

CREATE TABLE `institution` (
  `id` int(4) NOT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Truncate table before insert `institution`
--

TRUNCATE TABLE `institution`;
--
-- Dumping data for table `institution`
--

INSERT INTO `institution` (`id`, `name`) VALUES
(0, 'admin'),
(6458, 'Universidad Autónoma de Madrid'),
(5242, 'Universidad Carlos III de Madrid'),
(4203, 'Universidad Complutense de Madrid'),
(5522, 'Universidad Politécnica de Madrid'),
(5812, 'Universidad Rey Juan Carlos');

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `id` int(10) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Truncate table before insert `role`
--

TRUNCATE TABLE `role`;
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

--
-- Truncate table before insert `session`
--

TRUNCATE TABLE `session`;
-- --------------------------------------------------------

--
-- Table structure for table `study_group`
--

CREATE TABLE `study_group` (
  `id` int(10) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `institution_id` int(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Truncate table before insert `study_group`
--

TRUNCATE TABLE `study_group`;
--
-- Dumping data for table `study_group`
--

INSERT INTO `study_group` (`id`, `name`, `institution_id`) VALUES
(2147483647, '1ro de Carrera', 4203);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `username` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `surname` varchar(255) NOT NULL,
  `age` int(10) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` int(10) DEFAULT NULL,
  `institution_id` int(11) DEFAULT NULL,
  `study_group_id` int(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Truncate table before insert `user`
--

TRUNCATE TABLE `user`;
--
-- Dumping data for table `user`
--

INSERT INTO `user` (`username`, `name`, `surname`, `age`, `password`, `role`, `institution_id`, `study_group_id`) VALUES
('admin', 'admin', 'admin', 0, 'admin', 1, 0, NULL),
('profe', 'Tamayo', 'Salas', 32, '1234', 2, 4203, NULL),
('Siao', 'Shihao', 'Shen', 23, '1234', 3, 4203, NULL);

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
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `session`
--
ALTER TABLE `session`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `study_group`
--
ALTER TABLE `study_group`
  ADD KEY `study_group_institution_id_fk` (`institution_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `session`
--
ALTER TABLE `session`
  MODIFY `id` int(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `study_group`
--
ALTER TABLE `study_group`
  ADD CONSTRAINT `study_group_institution_id_fk` FOREIGN KEY (`institution_id`) REFERENCES `institution` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
