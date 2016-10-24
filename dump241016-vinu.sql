-- MySQL dump 10.13  Distrib 5.7.12, for Win64 (x86_64)
--
-- Host: localhost    Database: axis
-- ------------------------------------------------------
-- Server version	5.5.51

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bqkeys`
--

DROP TABLE IF EXISTS `bqkeys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bqkeys` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key_name` varchar(45) NOT NULL,
  `key_path` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bqkeys`
--

LOCK TABLES `bqkeys` WRITE;
/*!40000 ALTER TABLE `bqkeys` DISABLE KEYS */;
INSERT INTO `bqkeys` VALUES (4,'axisGA.pem','./key/axisGA.pem'),(5,'axisGA.pem','./key/axisGA.pem');
/*!40000 ALTER TABLE `bqkeys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bqproject`
--

DROP TABLE IF EXISTS `bqproject`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bqproject` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_name` varchar(45) DEFAULT NULL,
  `security_key` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bqproject`
--

LOCK TABLES `bqproject` WRITE;
/*!40000 ALTER TABLE `bqproject` DISABLE KEYS */;
INSERT INTO `bqproject` VALUES (42,'axisbank-bigquery','./key/axisGA.pem'),(44,'axis-bq-prod','./key/axisGA.pem');
/*!40000 ALTER TABLE `bqproject` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bqschedules`
--

DROP TABLE IF EXISTS `bqschedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bqschedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project` varchar(300) DEFAULT NULL,
  `time` varchar(20) DEFAULT NULL,
  `big_query` mediumtext,
  `insert_query` varchar(500) DEFAULT NULL,
  `schedulename` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bqschedules`
--

LOCK TABLES `bqschedules` WRITE;
/*!40000 ALTER TABLE `bqschedules` DISABLE KEYS */;
INSERT INTO `bqschedules` VALUES (1,'axisbank-bigquery','19:15',' select a.*,b.new_CHANNEL,b.new_Tag,b.new_Sub_Tag from \r\n(select *,\r\n(Case\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-CLOSURE%\'  then \'BRN/ACCOUNT CLOSE-TD\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'CLOSURE INT%\'  then \'BRN/ACCOUNT CLOSE-TD\' \r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'CREDIT FOR :  TD%\'  then \'BRN/ACCOUNT CLOSE-TD\' \r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'CLOSURE %\'  then \'BRN/ACCOUNT CLOSE-TD\' \r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'TO CLEARING%\'  then \'BRN/INWRD CLG\' \r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-CLG-CHQ%\'  then \'BRN/INWRD CLG\' \r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-CLG%\'  then \'BRN/INWRD CLG\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'ZONE:123123/%\'  then \'BRN/INWRD CLG\' \r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'INT RUN%\'  then \'BRN/LOAN DEMAND GENERATION\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-INT%\'  then \'BRN/LOAN DEMAND GENERATION\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'ALKA1%\'  then \'BRN/LOAN DISBURSMENT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-TO DISB%\'  then \'BRN/LOAN DISBURSMENT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-BY DISB%\'  then \'BRN/LOAN DISBURSMENT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-DISB%\'  then \'BRN/LOAN DISBURSMENT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN LN REC PRN%\'  then \'BRN/LOAN RECOVERY\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN LN REV PRN%\'  then \'BRN/LOAN RECOVERY\'\r\n when (TXN_PARTICULARS) like \'LOAN RECOVERY%\'  then \'BRN/LOAN RECOVERY\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'CR TO XFER AC DUE TO CLOSURE OF :ARUPCA02\'  then \'BRN/ACCOUNT CLOSE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-PROCEEDS%\'  then \'BRN/ACCOUNT CLOSE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'%CLOSURE PROCEEDS%\'  then \'BRN/ACCOUNT CLOSE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-TO ACCT%\'  then \'BRN/ACCOUNT CLOSE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BY CASH%\'  then \'BRN/CASH DEPOSIT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-BYCASH%\'  then \'BRN/CASH DEPOSIT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-BY CASH%\'  then \'BRN/CASH DEPOSIT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'TO CASH/SELF%\'  then \'BRN/CASH DEPOSIT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-TO CASH%\'  then \'BRN/CASH DEPOSIT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN TO CASH%\'  then \'BRN/CASH DEPOSIT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN - TO CASH%\'  then \'BRN/CASH DEPOSIT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'STOP PAYMENT%\'  then \'BRN/STOP PAYMENT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-STOP%\'  then \'BRN/STOP PAYMENT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'LM TRF FROM%\'  then \'BRN/LM REV SWEEP\' \r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-LM REV%\'  then \'BRN/LM REV SWEEP\' \r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-LMS%\'  then \'BRN/LM REV SWEEP\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-NEFT%\'  then \'BRN/NEFT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-RTGS%\'  then \'BRN/RTGS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-TDS%\'  then \'TDS REFUND\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'TDS REFUND%\'  then \'TDS REFUND\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'RENEWAL%\'  then \'BRN/TD RENEWAL\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-RENEWAL%\'  then \'BRN/TD RENEWAL\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'IF:SBA:AXIS%\'  then \'BRN/INIT FUND: NEW ACCT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-INITIAL FUNDING%\'  then \'BRN/INIT FUND: NEW ACCT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'INITIAL%\'  then \'BRN/INIT FUND: NEW ACCT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-BY INITIAL FUNDING%\'  then \'BRN/INIT FUND: NEW ACCT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'TO CASH REVERSAL%\'  then \'Cash Reversal\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-TO CASH REVERSAL%\'  then \'Cash Reversal\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'PAYMENT FOR CARD::%\'  then \'BRN/CARD PAYMENT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-PYMT-CARD%\'  then \'BRN/CARD PAYMENT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'EMI PROCESSING%\'  then \'BRN/EMI PROCESS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-EMI-%\'  then \'BRN/EMI PROCESS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-BY CHARGE REVERSAL%\'  then \'BRN/CHARGE REVERSAL\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN AS REV%\'  then \'BRN/CHARGE REVERSAL\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN- CHARGES REVERSED%\'  then \'BRN/CHARGE REVERSAL\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-PC Offset-D%\'  then \'BRN/OFFSET\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REMARKS%\'  then \'BRN/SALARY UPLOAD\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-OTHERS-%\'  then \'BRN/SALARY UPLOAD\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-SALARY PAY%\'  then \'BRN/SALARY UPLOAD\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-SALARY-%\'  then \'BRN/SALARY UPLOAD\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-SALARY %\'  then \'BRN/SALARY UPLOAD\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-SALARY\'  then \'BRN/SALARY UPLOAD\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN BY SALARY%\'  then \'BRN/SALARY UPLOAD\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-EDUCATION FUND-BY SALARY%\'  then \'BRN/SALARY PAYMENT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-ARRIERS/%\'  then \'BRN/SALARY UPLOAD\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-OTHERS-BY CONVEYANCE%\'  then \'BRN/REIMBURSMENT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REIMBURSEMENT%\'  then \'BRN/REIMBURSMENT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-OTHERS-BY LIC COMMISSION%\'  then \'LIC Commission\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-BG-COMMISSION%\' then \'BRN/COMMISSION\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-BONUS%\'  then \'BRN/BONUS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-INCENTIVE%\'  then \'BRN/INCENTIVE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'D1457894%\'  then \'BRN/SI\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-SI-%\'  then \'BRN/SI\' \r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FLEXI DEPOSIT INT TFR FROM%\'  then \'BRN/TDS RECOVERY\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FLEXI DEPOSIT INT TFR TO%\'  then \'BRN/TDS PAYMENT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FLEXI DEPOSIT PRIN TFR FROM%\'  then \'BRN/SWEEPS TRANS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FLEXI DEPOSIT TRANSFER TO%\'  then \'BRN/FD CREATION\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN -FLEXI DEPOSIT TRANSFER TO%\'  then \'BRN/FD CREATION\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-OW RTN CLG%\'  then \'BRN/CHEQUE RETURN\' \r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NOFIR%\'  then \'BRN/REMITTANCE\' \r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NORIR%\'  then \'BRN/REMITTANCE\' \r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FIR/%\'  then \'BRN/REMITTANCE\' \r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO ROR%\'  then \'BRN/REMITTANCE\' \r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO ARIM%\'  then \'BRN/REMITTANCE\' \r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO OTT%\'  then \'BRN/REMITTANCE\' \r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-OTT/%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NORCC%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-ARIM/%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-BKNG-REF NOFP%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO FFMC%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NOFCBC%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NOFCCP%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-ROR/%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-RCC/%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO RIO%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NORTI%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO RIO%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-RDD/%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-RIR/%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-BKNG-REF NOFS%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO RDD%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO RCS%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO ODD%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NORCP%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO FCCS%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-RTI/%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FCBC/%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FFMC/%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FCCP/%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO RMI%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-ODD/%\'  then \'BRN/REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-SERVICE TAX%\'  then \'BRN/SERVICE TAX\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-Service Tax%\'  then \'BRN/SERVICE TAX\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FLC-FLCSERVICE%\'  then \'BRN/SERVICE TAX\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-BGBCLOU SERVICE TAX%\'  then \'BRN/SERVICE TAX\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-CNCL-REF NOFS%\'  then \'BRN/SERVICE TAX\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-CNCL-REF NOFP%\'  then \'BRN/SERVICE TAX\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-ILC-LCO-SERVICE%\'  then \'BRN/SERVICE TAX\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-LC-XLADVSERVICE TAX%\'  then \'BRN/SERVICE TAX\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FBGSERVICE TAX /%\'  then \'BRN/SERVICE TAX\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-BGBCSERVICE%\'  then \'BRN/SERVICE TAX\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-LC-LCI-SERVICE TAX/%\'  then \'BRN/SERVICE TAX\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-BG ISSUE CHRG AND SERVICE TAX%\'  then \'BRN/SERVICE TAX\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FBGSERVICE TAX%\'  then \'BRN/SERVICE TAX\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-CLG-MULTIPLE CHEQUES%\'  then \'BRN/INWRD CLG\' \r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-POSTAGE ON BG%\'  then \'BRN/BG POSTAGES\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-POSTAGE%\'  then \'BRN/BG POSTAGES\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-BG-POSTAGE%\'  then \'BRN/BG POSTAGES\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-BG AMENDMENT%\'  then \'BRN/BRN-BG AMENDMENT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-BG ISSUE CHRGS%\'  then \'BRN/BRN-BG AMENDMENT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO FIDB%\'  then \'BRN/BILLS\' \r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO FSGC%\'  then \'BRN/BILLS\' \r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO -BE%\'  then \'BRN/BILLS\' \r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO FBLS%\'  then \'BRN/BILLS\' \r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO FUGC%\'  then \'BRN/BILLS\' \r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO FBFP%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO FIGU%\' then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FBLU/%\' then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO FBLU%\' then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FIDB/%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO -OBC%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO EBRD%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO EBUN%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO FIGS%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO EBSN%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO BDWR%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO FUBD%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FIGU/%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FIGS/%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FUGC/%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO FXBC/%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO FSBN%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FXBC/%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO FXBC/%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO FXBC%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO EBRP%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FBFP/%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO ACBS%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO FSBP%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN--BE/SERVICE TAX%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO AACE%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO ACBU%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FSGC/%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FBLS/%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN--OBC/%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN--BE/%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-REF NO FUBN%\'  then \'BRN/BILLS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-LC-LCI-POSTAGE%\'  then \'BRN/POSTAGE CHARGE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-ILC-LCO-POSTAGE%\'  then \'BRN/POSTAGE CHARGE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-LC-XLADVLC%\'  then \'BRN/LC ADV CHRGS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-LC-LCI-LC%\'  then \'BRN/LC ADV CHRGS\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FLC-FLCCOMMITMENT/ISS%\'  then \'BRN/FLC-ISSUE-CHRG\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FLC-FLCCOMMITMENT AND USANCE/ISS%\'  then \'BRN/FLC-ISSUE-CHRG\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FLC-FLCCOMMITMENT/AMND%\'  then \'BRN/FLC-AMEND-COMMIT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FLC-FLCAMENDMENT CHARG%\'  then \'BRN/FLC-AMEND-CHARGES\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FBGFBG- AMENDMENT%\'  then \'BRN/FBG - AMENDMENT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FBGFBG - AMD%\'  then \'BRN/FBG - AMENDMENT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FLC-FLCSWIFT CHARGES%\'  then \'BRN/FLC-ISSUE-SWIFT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FBGFBG- SWIFT CHARGES%\'  then \'BRN/FLC-ISSUE-SWIFT\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-BGBCFBG - ISSUE CHARGES%\'  then \'BRN/FBG-ISSUE CHARGES\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-ILC-FLCSWIFT CHARGES/ISS%\'  then \'BRN/FBG-ISSUE CHARGES\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FBGFBG - ISSUE CHARGES%\'  then \'BRN/FBG-ISSUE CHARGES\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FBGGTSD CHARGES%\'  then \'BRN/FBG-ISSUE CHARGES\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-FLC-FLCUSANCE/%\'  then \'BRN/FLC-USANCE CHARGES\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-BGBC%\'  then \'BRN/FBG-ISSUE CHARGES\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-BG ISSUE CHRGS%\'  then \'BG-COMMISSION\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-ILC-LCO-COMM/%\'  then \'BRN/COMMITMENT AND USANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-ILC-LCO-SFMS CHARGES/%\'  then \'BRN/COMMITMENT AND USANCE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-Gold Loan Fee%\'  then \'BRN/GOLD LOAN FEE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-SFMS CHARGES%\'  then \'BRN/SFMS CHARGE\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-TRFR-TO-%\'  then \'BRN/TRANSFER\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-TRF-TO-%\'  then \'BRN/TRANSFER\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-TRFR-FR-%\'  then \'BRN/TRANSFER\'\r\n when (TXN_PARTICULARS) like \'BRN%\' and (TXN_PARTICULARS) like \'BRN-TRF-FR-%\'  then \'BRN/TRANSFER\'\r\n when (TXN_PARTICULARS) like \'TRANSFER%\'  then \'BRN/TRANSFER\'\r\n when (TXN_PARTICULARS) like \'TRF FROM%\'  then \'BRN/TRANSFER\'\r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'CASH-ATM-AXIS/%\' then \'Axis ATM\' \r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM-CASH-AXIS/%\' then \'ATM/AXIS ATM\' \r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'CASH-ATM/%\' then \'ATM/NON AXIS ATM\' \r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM-CASH/%\' then \'ATM/NON AXIS ATM\' \r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM-CASH%\' then \'ATM/NON AXIS ATM\'\r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM CASH%\' then \'ATM/NON AXIS ATM\'\r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM-Donation/%\' then \'ATM/DONATION\'\r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM DEPOSIT%\' then \'ATM/DEPOSIT\' \r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATMCASH%\' and PART_TRAN_TYPE = \'C\' then \'ATM/DEPOSIT\' \r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM C ASH%\' and PART_TRAN_TYPE= \'C\' then \'ATM/DEPOSIT\' \r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM ENVELOPE CASH DEPOSIT%\' then \'ATM/DEPOSIT\' \r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM REV%\' then \'ATM/ATM REVERSAL\'\r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM rev%\' then \'ATM/ATM REVERSAL\'\r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM/REV%\' then \'ATM/ATM REVERSAL\' \r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM-FundTransfer/%\' then \'ATM/ATM FUND TRANSFER\' \r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM-FUNDTRANSFER/%\' then \'ATM/ATM FUND TRANSFER\' \r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM-FUND TRANSFER/%\' then \'ATM/ATM FUND TRANSFER\' \r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM-TRFR-TO%\' then \'ATM/ATM FUND TRANSFER\' \r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM-TRFR-FROM%\' then \'ATM/ATM FUND TRANSFER\'\r\n when (TXN_PARTICULARS) like \'TRF-ATM%\' then \'ATM/ATM FUND TRANSFER\' \r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATMWDL/%\' then \'ATM/TTUMCUSTFILE\' \r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM LOADING%\' then \'ATM LOADING\' \r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM LAODING%\' then \'ATM LOADING\' \r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM-BillPay/%\' then \'ATM/ATM BILL PAY\' \r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM-BILLPAY/%\' then \'ATM/ATM BILL PAY\' \r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM-BILL PAY/%\' then \'ATM/ATM BILL PAY\' \r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM-MobileRefill/%\' then \'ATM/ATM MOBILEREFILL\'\r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM-Mobile Refill/%\' then \'ATM/ATM MOBILEREFILL\'\r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM-MOBILE REFILL/%\' then \'ATM/ATM MOBILEREFILL\'\r\n when (TXN_PARTICULARS) like \'ATM%\' and (TXN_PARTICULARS) like \'ATM-MOBILEREFILL/%\' then \'ATM/ATM MOBILEREFILL\' \r\n when (TXN_PARTICULARS) like \'INB%\' and (TXN_PARTICULARS) like \'INB/IFT/%\' and (TXN_PARTICULARS) like \'%TPARTY%\' then \'INB/TPARTY FUND TRANSFER\'\r\n when (TXN_PARTICULARS) like \'INB%\' and (TXN_PARTICULARS) like \'INB/IFT/%\' and (TXN_PARTICULARS) like \'%SELF%\' then \'INB/SELF FUND TRANSFER\'\r\n when (TXN_PARTICULARS) like \'INB%\' and (TXN_PARTICULARS) like \'INB/IFT/%\' then \'INB/FUND TRANSFER\'\r\n when (TXN_PARTICULARS) like \'INB%\' and (TXN_PARTICULARS) like \'INB/DD/%\' then \'INB/DD / PO\'\r\n when (TXN_PARTICULARS) like \'INB%\' and (TXN_PARTICULARS) like \'INB/FIXED DEPOSIT/%\' then \'INB/FD REQUEST\'\r\n when (TXN_PARTICULARS) like \'INB%\' and (TXN_PARTICULARS) like \'INB/RECURRING DEPOSIT/%\' then \'INB/RD REQUEST\'\r\n when (TXN_PARTICULARS) like \'INB%\' and (TXN_PARTICULARS) like \'INB/CREDIT CARD/%\' then \'INB/CC PAYMENT\'\r\n when (TXN_PARTICULARS) like \'INB%\' and (TXN_PARTICULARS) like \'INB/e-Wallet%\' then \'INB/E-WALLET\'\r\n when (TXN_PARTICULARS) like \'INB%\' and (TXN_PARTICULARS) like \'VMT-ICON/%\' then \'INB/VMT\'\r\n when (TXN_PARTICULARS) like \'INB%\' and (TXN_PARTICULARS) like \'INB/VISA%\' then \'INB/VMT\'\r\n when (TXN_PARTICULARS) like \'VMT-ICON/%\' then \'INB/VMT\'\r\n when (TXN_PARTICULARS) like \'INB%\' and (TXN_PARTICULARS) like \'INB-BULK-UPLD/%\' then \'INB/BULK UPLOAD\'\r\n when (TXN_PARTICULARS) like \'ICONN-DR%\' then \'INB/BULK UPLOAD\'\r\n when (TXN_PARTICULARS) like \'ICONN-CR%\' then \'INB/BULK UPLOAD\'\r\n when (TXN_PARTICULARS) like \'INB%\' and (TXN_PARTICULARS) like \'INB-BULK-UPLD-REV/%\' then \'INB/INB/BULK UPLOAD REV\'\r\n when (TXN_PARTICULARS) like \'ICONN-REV%\' then \'INB/INB/BULK UPLOAD REV\'\r\n when (TXN_PARTICULARS) like \'INB%\' and (TXN_PARTICULARS) like \'INB/NEFT/%\' then \'INB/NEFT\'\r\n when (TXN_PARTICULARS) like \'INB%\' and (TXN_PARTICULARS) like \'INB/RTGS/%\' then \'INB/RTGS\'\r\n when (TXN_PARTICULARS) like \'INB%\' and (TXN_PARTICULARS) like \'%MOBILE RECHARGE%\' then \'INB/AXIS MOBILE RECHARGE\'\r\n when (TXN_PARTICULARS) like \'INB%\' and (TXN_PARTICULARS) like \'%DTH RECHARGE%\' then \'INB/AXIS DTH RECHARGE\'\r\n when (TXN_PARTICULARS) like \'INB%\' and (TXN_PARTICULARS) like \'%AXIS DATA CARD RECHARGE%\' then \'INB/AXIS DATA CARD RECHARGE\'\r\n when (TXN_PARTICULARS) like \'INB%\' and (TXN_PARTICULARS) like \'%RECHARGE%\' then \'INB/RECHARGE\'\r\n when (TXN_PARTICULARS) like \'INB%\' and (TXN_PARTICULARS) like \'%BILLDESK%\' and ((TXN_PARTICULARS) like \'%BANK%\' or (TXN_PARTICULARS) like \r\n\'%AMERICAN%\') then \'INB/BILLDESK BANK PAYMENTS\'\r\n when (TXN_PARTICULARS) like \'INB%\' and ((TXN_PARTICULARS) like \'%BANK%\' or (TXN_PARTICULARS) like \'%CARD%\') then \'INB/BANK PAYMENTS\'\r\n when (TXN_PARTICULARS) like \'INB%\' and (TXN_PARTICULARS) like \'%RAILWAY%\'  then \'INB/IRCTC TRN\'\r\n when (TXN_PARTICULARS) like \'INB%\' and (TXN_PARTICULARS) like \'%BILLDESK%\' then \'INB/BILLDESK\'\r\n when (TXN_PARTICULARS) like \'INB%\'  and (TXN_PARTICULARS) like \'%BILLDESK%\' then \'INB/BILLDESK\'\r\n when (TXN_PARTICULARS) like \'INB%\'  and (TXN_PARTICULARS) like \'%BILL DE%\' then \'INB/BILLDESK\'\r\n when (TXN_PARTICULARS) like \'INB%\'  and (TXN_PARTICULARS) like \'%BILLDE%\' then \'INB/BILLDESK\'\r\n when (TXN_PARTICULARS) like \'INB%\'  and (TXN_PARTICULARS) like \'%INSTANT MONEY%\' then \'INB/IMT TRN\'\r\n when (TXN_PARTICULARS) like \'INB%\' and (TXN_PARTICULARS) like \'%/INTERNET TAX PAYMENT/%\' then \'INB/TAX PAYMENTS\'\r\n when (TXN_PARTICULARS) like \'INB/ORM%\' then \'OUTWARD REMITTANCE\'\r\n when (TXN_PARTICULARS) like \'INB%\' then \'INB/BILL / SHOPPING MALL TXN\'\r\n when (TXN_PARTICULARS) like \'ICONNREF%\' then \'INB/REFUND\'\r\n when (TXN_PARTICULARS) like \'ICONNECT REFUND%\' then \'INB/REFUND\'\r\n when (TXN_PARTICULARS) like \'ICONNECT REV%\' then \'INB/REFUND\'\r\n when (TXN_PARTICULARS) like \'ICONN REF%\' then \'INB/REFUND\'\r\n when (TXN_PARTICULARS) like \'EURONET ICON/%\' then \'INB/REFUND\'\r\n when (TXN_PARTICULARS) like \'AXMOB/SELFFT%\' then \'MOB/SELF FUND TRF\' \r\n when (TXN_PARTICULARS) like \'MOB/SELFFT%\' then \'MOB/SELF FUND TRF\' \r\n when (TXN_PARTICULARS) like \'AXMOB/TPFT%\' then \'MOB/TPFT FUND TRF\' \r\n when (TXN_PARTICULARS) like \'MOB/TPFT%\' then \'MOB/TPFT FUND TRF\'\r\n when (TXN_PARTICULARS) like \'AXMOB/MBR%\' then \'MOB/MOBILE RECHARGE\' \r\n when (TXN_PARTICULARS) like \'AXMOB/DTHR%\' then \'MOB/DTH RECHARGE\' \r\n when (TXN_PARTICULARS) like \'AXMOB/DCR%\' then \'MOB/DATA CARD RECHARGE\' \r\n when (TXN_PARTICULARS) like \'MOB/MBR%\' then \'MOB/MOBILE RECHARGE\' \r\n when (TXN_PARTICULARS) like \'MOB/DTHR%\' then \'MOB/DTH RECHARGE\' \r\n when (TXN_PARTICULARS) like \'MOB/DCR%\' then \'MOB/DATA CARD RECHARGE\' \r\n when (TXN_PARTICULARS) like \'AXMOB/PULLFT%\' then \'MOB/PULL FUND\' \r\n when (TXN_PARTICULARS) like \'MOB/PULLFT%\' then \'MOB/PULL FUND\' \r\n when (TXN_PARTICULARS) like \'AXMOB/CCPMT%\' then \'MOB/CC PAYMENT\' \r\n when (TXN_PARTICULARS) like \'MOB/CCPMT%\' then \'MOB/CC PAYMENT\' \r\n when (TXN_PARTICULARS) like \'MOB/RELOAD/%\' then \'MOB/TCDC RELOAD\' \r\n when (TXN_PARTICULARS) like \'MOB/%\' and (TXN_PARTICULARS) like \'%CARD%\' then \'MOB/OB CC PAYMENT\' \r\n when (TXN_PARTICULARS) like \'MOB/MBR%\' then \'MOB/MOBILE RECHARGE\' \r\n when (TXN_PARTICULARS) like \'MOB/%\' then \'MOB/BILL PAY\' \r\n when (TXN_PARTICULARS) like \'IMPS/PA%\' then \'IMPS/PA\'\r\n when (TXN_PARTICULARS) like \'IMPS/PM%\' then \'IMPS/PM\' \r\n when (TXN_PARTICULARS) like \'IMPS/PP%\' then \'IMPS/PP\'\r\n when (TXN_PARTICULARS) like \'IMPS/Declined%\' then \'IMPS/DECLINED\' \r\n when (TXN_PARTICULARS) like \'IMPS/DECLINED%\' then \'IMPS/DECLINED\'\r\n when (TXN_PARTICULARS) like \'IMPS/MRT%\' then \'IMPS/MRT\'\r\n when (TXN_PARTICULARS) like \'IMPS/PUL%\' then \'IMPS/PUL\'\r\n when (TXN_PARTICULARS) like \'IMPS-CHARGES%\' then \'IMPS/CHARGES\'\r\n when (TXN_PARTICULARS) like \'IMPS-CB%\' then \'IMPS/CB\'\r\n when (TXN_PARTICULARS) like \'IMPS/Unclaimed%\' then \'IMPS/UNCLAIMED\' \r\n when (TXN_PARTICULARS) like \'IMPS/UNCLAIMED%\' then \'IMPS/UNCLAIMED\'\r\n when (TXN_PARTICULARS) like \'IMPS/%\' then \'IMPS/\'\r\n when (TXN_PARTICULARS) like \'PUR/%\' then \'PUR/OFFLINE PUR\' \r\n when (TXN_PARTICULARS) like \'PUR /%\' then \'PUR/OFFLINE PUR\' \r\n when (TXN_PARTICULARS) like \'PUR %\' then \'PUR/OFFLINE PUR\'\r\n when (TXN_PARTICULARS) like \'PUR REV%\' then \'PUR/PUR REVERSAL\' \r\n when (TXN_PARTICULARS) like \'PUR-REV/%\' then \'PUR/PUR REVERSAL\' \r\n when (TXN_PARTICULARS) like \'PUR-REV%\' then \'PUR/PUR REVERSAL\'\r\n when (TXN_PARTICULARS) like \'ESHOP/%\' then \'ECOM/ONLINE PUR\'\r\n when (TXN_PARTICULARS) like \'ECOM PUR/%\' then \'ECOM/ONLINE PUR\'\r\n when (TXN_PARTICULARS) like \'MERCHREFUND%\' then \'ECOM/ONLINE PUR REV\'\r\n when (TXN_PARTICULARS) like \'POS/%\' then \'POS/OFFLINE PUR\'\r\n when (TXN_PARTICULARS) like \'POS %\' then \'POS/OFFLINE PUR\'\r\n when (TXN_PARTICULARS) like \'POS-RVSL %\' then \'POS/POS REVERSAL\'\r\n when (TXN_PARTICULARS) like \'BY CASH DEPOSIT-BNA%\' then \'BNA/CASH DEPOSIT\'\r\n when (TXN_PARTICULARS) like \'BY CASH DEPOSIT BNA%\' then \'BNA/CASH DEPOSIT\'\r\n when (TXN_PARTICULARS) like \'BNA%\' then \'BNA/CASH DEPOSIT\'      \r\n when (TXN_PARTICULARS) like \'NEFT/MB/%\' then \'NEFT/MB\'\r\n when (TXN_PARTICULARS) like \'NEFT/IB/%\' then \'NEFT/IB\'\r\n when (TXN_PARTICULARS) like \'NEFT/AXISP%\' then \'NEFT/NEFT/AXISP\'\r\n when (TXN_PARTICULARS) like \'NEFT/PT%\' then \'NEFT/NEFT/PT/\'\r\n when (TXN_PARTICULARS) like \'NEFT REJ/%\' then \'NEFT/NEFT REJ\'\r\n when (TXN_PARTICULARS) like \'NEFT CHRG REV%\' then \'NEFT/CHARGES\'\r\n when (TXN_PARTICULARS) like \'NEFT REV%\' then \'NEFT/NEFT RET\'\r\n when (TXN_PARTICULARS) like \'NEFT RETURN%\' then \'NEFT/NEFT RET\'\r\n when (TXN_PARTICULARS) like \'NEFT RTN%\' then \'NEFT/NEFT RET\'\r\n when (TXN_PARTICULARS) like \'NEFT NOT PROCESSED%\' then \'NEFT/NEFT RET\'\r\n when (TXN_PARTICULARS) like \'NEFT PROCESSED%\' then \'NEFT\'\r\n when (TXN_PARTICULARS) like \'NEFT/%\' then \'NEFT/NEFT\'\r\n when (TXN_PARTICULARS) like \'RTGS/%\' then \'RTGS/RTGS\'\r\n when (TXN_PARTICULARS) like \'RTGS REJECT%\' then \'RTGS/RTGS REJECT\'\r\n when (TXN_PARTICULARS) like \'RTGS %\' then \'RTGS/RTGS\'\r\n when (TXN_PARTICULARS) like \'BY CASH%\' then \'BY CASH/CASH\'     \r\n when (TXN_PARTICULARS) like \'CASH TRA%\' then \'BY CASH/CASH\'     \r\n when (TXN_PARTICULARS) like \'INTPD%\' or (TXN_PARTICULARS) like \'IntPd%\' then \'INTPD/INT\'\r\n when (TXN_PARTICULARS) like \'%INT.PD%\' then \'INTPD/INT\'\r\n when (TXN_PARTICULARS) like \'INT ON%\' then \'INTPD/INT\'\r\n when (TXN_PARTICULARS) like \'IOC REF%\' then \'INTPD/INT\'\r\n when (TXN_PARTICULARS) like \'IO FOR%\' then \'INTPD/INT\'\r\n when (TXN_PARTICULARS) like \'Consolidated Charges%\' then \'CONS CHRG\'\r\n when (TXN_PARTICULARS) like \'CONSOLIDATED CHARGES%\' then \'CONS CHRG\'\r\n when (TXN_PARTICULARS) like \'CONSOLIDATED DP CHARGES%\' then \'CONS CHRG\'\r\n when (TXN_PARTICULARS) like \'By Clg%\' then \'BY CLG/BY CLG\'\r\n when (TXN_PARTICULARS) like \'BY CLG%\' then \'BY CLG/BY CLG\'\r\n when (TXN_PARTICULARS) like \'BY CHQ%\' then \'BY CLG/BY CLG\'\r\n when (TXN_PARTICULARS) like \'FROM CHQ%\' then \'BY CLG/BY CLG\'\r\n when (TXN_PARTICULARS) like \'BY CHEQ%\' then \'BY CLG/BY CLG\'\r\n when (TXN_PARTICULARS) like \'BY CLEARING%\' then \'BY CLG/BY CLG\'\r\n when (TXN_PARTICULARS) like \'TO CLEARING%\' then \'BY CLG/BY CLG\'\r\n when (TXN_PARTICULARS) like \'INWARD C%\'then \'BY CLG/BY CLG\'\r\n when (TXN_PARTICULARS) like \'CHQ%\'then \'BY CLG/BY CLG\'\r\n when (TXN_PARTICULARS) like \'CLG-%\' then \'BY CLG/BY CLG\'\r\n when (TXN_PARTICULARS) like \'CLG %\' then \'BY CLG/BY CLG\'\r\n when (INSTR) like \'CHQ\' then \'BY CLG/BY CLG\'\r\n\r\n when (TXN_PARTICULARS) like \'%Service%\' then \'SERVICE CHARGE/SVTAX\'\r\n when (TXN_PARTICULARS) like \'%SERVICE%\' then \'SERVICE CHARGE/SVTAX\'\r\n when (TXN_PARTICULARS) like \'ECS CHRG%\' then \'ECS/ECS CHRG\'\r\n when (TXN_PARTICULARS) like \'ECS %\' then \'ECS/ECS\'\r\n when (TXN_PARTICULARS) like \'ECS/%\' then \'ECS/ECS\'\r\n when (TXN_PARTICULARS) like \'CECS/%\' then \'ECS/ECS\'\r\n when (TXN_PARTICULARS) like \'%Dr Card%\' then \'DRC ANNUALCHARG/CHARGE\'\r\n when (TXN_PARTICULARS) like \'%DR CARD%\' then \'DRC ANNUALCHARG/CHARGE\'\r\n when (TXN_PARTICULARS) like \'M-Banking%\' then \'M-BANKING/TXN\'\r\n when (TXN_PARTICULARS) like \'M-BANKING%\' then \'M-BANKING/TXN\'\r\n when (TXN_PARTICULARS) like \'INITIAL FUNDING%\' then \'INITIAL FUNDING/TXN\'\r\n when (TXN_PARTICULARS) like \'INETIAL FUNDING%\' then \'INITIAL FUNDING/TXN\'\r\n when (TXN_PARTICULARS) like \'INITIAL DEPOSIT%\' then \'INITIAL FUNDING/TXN\'\r\n when (TXN_PARTICULARS) like \'TIP/%\' then \'TIP/POS\'\r\n when (TXN_PARTICULARS) like \'TIPS/%\' then \'TIP/POS\'\r\n when (TXN_PARTICULARS) like \'AXISDIRE%\' then \'AXISDIRECT/FT\'\r\n when (TXN_PARTICULARS) like \'PPR EMI RVSL%\' then \'PPR EMI/PPR EMI RVSL\'\r\n when (TXN_PARTICULARS) like \'PPREMI%\' then \'PPREMI/\'\r\n when (TXN_PARTICULARS) like \'PPR EMI%\' then \'PPREMI/\'\r\n when (TXN_PARTICULARS) like \'PPR-EMI%\' then \'PPREMI/\'\r\n when (TXN_PARTICULARS) like \'PHR-EMI%\' then \'PPREMI/\'\r\n when (TXN_PARTICULARS) like \'PHREMI%\' then \'PPREMI/\'\r\n when (TXN_PARTICULARS) like \'AUREMI%\' then \'PPREMI/\'\r\n when (TXN_PARTICULARS) like \'AUR-EMI%\' then \'PPREMI/\'\r\n when (TXN_PARTICULARS) like \'PHR EMI%\' then \'PPREMI/\'\r\n when (TXN_PARTICULARS) like \'PHR_EMI%\' then \'PPREMI/\'\r\n when (TXN_PARTICULARS) like \'PH_EMI%\' then \'PPREMI/\'\r\n when (TXN_PARTICULARS) like \'PHR_PEMI%\' then \'PPREMI/\'\r\n when (TXN_PARTICULARS) like \'PHR PEMI%\' then \'PPREMI/\'\r\n when (TXN_PARTICULARS) like \'PPR_EMI%\' then \'PPREMI/\'\r\n when (TXN_PARTICULARS) like \'PPR EMI%\' then \'PPREMI/\'\r\n when (TXN_PARTICULARS) like \'AUR_EMI%\' then \'PPREMI/\'\r\n when (TXN_PARTICULARS) like \'ALR_EMI%\' then \'PPREMI/\'\r\n when (TXN_PARTICULARS) like \'LPR_EMI%\' then \'PPREMI/\'\r\n when (TXN_PARTICULARS) like \'UCR_EMI%\' then \'PPREMI/\'\r\n when (TXN_PARTICULARS) like \'CVR_EMI%\' then \'PPREMI/\'\r\n when (TXN_PARTICULARS) like \'HTR_EMI%\' then \'PPREMI/\'\r\n when (TXN_PARTICULARS) like \'PCR_EMI%\' then \'PPREMI/\'\r\n when (TXN_PARTICULARS) like \'LTR_EMI%\' then \'PPREMI/\'\r\n when (TXN_PARTICULARS) like \'PPB_EMI%\' then \'PPREMI/\'\r\n\r\n\r\n when (TXN_PARTICULARS) like \'CASH-AXIS-RVSL/%\' then \'CASH-AXIS-RVSL/ATM\'\r\n when (TXN_PARTICULARS) like \'IRCTC Re%\' then \'IRCTC REFUND/INB\'\r\n when (TXN_PARTICULARS) like \'IRCTC RE%\' then \'IRCTC REFUND/INB\'\r\n when (TXN_PARTICULARS) like \'IFT/PT/E%\' then \'IFT/PT/E/FT\'\r\n when (TXN_PARTICULARS) like \'To Charges/NEFT/%\' then \'TO CHARGES/NEFT/CHRG\'\r\n when (TXN_PARTICULARS) like \'To Charges/NEFT%\' then \'TO CHARGES/NEFT/CHRG\'\r\n when (TXN_PARTICULARS) like \'TO CHARGES/NEFT%\' then \'TO CHARGES/NEFT/CHRG\'\r\n when (TXN_PARTICULARS) like \'CASH-RVS%\' then \'CASH-RVSL-ATM/ATM\'\r\n\r\n when (TXN_PARTICULARS) like \'BY SALAR%\' then \'BY SALAR/NI\' \r\n when (TXN_PARTICULARS) like \'BY SAL %\' then \'BY SALAR/NI\' \r\n when (TXN_PARTICULARS) like \'FOR SALAR%\' then \'BY SALAR/NI\' \r\n when (TXN_PARTICULARS) like \'NET SAL%\' then \'BY SALAR/NI\' \r\n when (TXN_PARTICULARS) like \'%SALARY%\' then \'BY SALAR/NI\' \r\n when (TXN_PARTICULARS) like \'% SALARY %\' then \'BY SALAR/NI\' \r\n when (TXN_PARTICULARS) like \'%/SALARY%\' then \'BY SALAR/NI\' \r\n when (TXN_PARTICULARS) like \'%SAL %\' then \'BY SALAR/NI\' \r\n when (TXN_PARTICULARS) like \'%SAL-%\' then \'BY SALAR/NI\' \r\n\r\n when (TXN_PARTICULARS) like \'FOR DD%\' then \'BRN/DDPO\' \r\n when (TXN_PARTICULARS) like \'TO DD%\' then \'BRN/DDPO\' \r\n when (TXN_PARTICULARS) like \'TO PO%\' then \'BRN/DDPO\' \r\n when (TXN_PARTICULARS) like \'FOR PO%\' then \'BRN/DDPO\' \r\n when (TXN_PARTICULARS) like \'PO %\' then \'BRN/DDPO\' \r\n when (TXN_PARTICULARS) like \'DD %\' then \'BRN/DDPO\' \r\n\r\n when (TXN_PARTICULARS) like \'% PO %\' then \'BRN/DDPO\' \r\n when (TXN_PARTICULARS) like \'% DD %\' then \'BRN/DDPO\' \r\n\r\n when (TXN_PARTICULARS) like \'DD TRANSACTION CHARGES%\' then \'BRN/DD TRANSACTION CHARGES\' \r\n when (TXN_PARTICULARS) like \'PO CHRGS%\' then \'BRN/DD TRANSACTION CHARGES\' \r\n when (TXN_PARTICULARS) like \'DD CHRGS%\' then \'BRN/DD TRANSACTION CHARGES\' \r\n when (TXN_PARTICULARS) like \'DD REVALIDATION CHARGES%\' then \'BRN/DD TRANSACTION CHARGES\' \r\n when (TXN_PARTICULARS) like \'DD CHARGE%\' then \'BRN/DD TRANSACTION CHARGES\' \r\n when (TXN_PARTICULARS) like \'PO CHARGE%\' then \'BRN/DD TRANSACTION CHARGES\' \r\n when (TXN_PARTICULARS) like \'PO ISSUENCE CHRGS%\' then \'BRN/DD TRANSACTION CHARGES\' \r\n when (TXN_PARTICULARS) like \'PO ISSUANCE CHRGS%\' then \'BRN/DD TRANSACTION CHARGES\' \r\n when (TXN_PARTICULARS) like \'DD ISSUANCE CHRGS%\' then \'BRN/DD TRANSACTION CHARGES\' \r\n when (TXN_PARTICULARS) like \'REVAL PO CHRG%\' then \'BRN/DD TRANSACTION CHARGES\' \r\n when (TXN_PARTICULARS) like \'DD CANCELLATION CHRGES%\' then \'BRN/DD TRANSACTION CHARGES\' \r\n when (TXN_PARTICULARS) like \'DD/PO REVALIDATION CHARGE%\' then \'BRN/DD TRANSACTION CHARGES\' \r\n when (TXN_PARTICULARS) like \'REV CHGS/%\' then \'BRN/DD TRANSACTION CHARGES\' \r\n when (TXN_PARTICULARS) like \'REVALIDATION CHGS OF DD%\' then \'BRN/DD TRANSACTION CHARGES\' \r\n\r\n when (TXN_PARTICULARS) like \'PO REVER%\' then \'BRN/DD TRANSACTION REV\' \r\n when (TXN_PARTICULARS) like \'DD REVER%\' then \'BRN/DD TRANSACTION REV\' \r\n\r\n when (TXN_PARTICULARS) like \'PARTIALLY%\' then \'BRN/LOAN DISBURSMENT\' \r\n when (TXN_PARTICULARS) like \'LOAN DISB%\' then \'BRN/LOAN DISBURSMENT\' \r\n when (TXN_PARTICULARS) like \'%CLOSURE PROCEEDS%\'  then \'BRN/ACCOUNT CLOSE\'\r\n\r\n when (TXN_PARTICULARS) like \'%MF%\'   then \'AUTO/MF\'\r\n when (TXN_PARTICULARS) like \'%MUTUAL FUND%\'   then \'AUTO/MF\'\r\n when (TXN_PARTICULARS) like \'%mutual fund%\'   then \'AUTO/MF\'\r\n\r\n when (TXN_PARTICULARS) like \'%WTAXPD%\'   then \'WTAXPD\'\r\n when (TXN_PARTICULARS) like \'%:WTAX.PD%\'   then \'WTAXPD\'\r\n when (TXN_PARTICULARS) like \'%NACH-DR%\' then \'ECS/ECS\'\r\n when (TXN_PARTICULARS) like \'%NACH_DR%\' then \'ECS/ECS\'\r\n\r\n\r\nelse \'\' end) as TRAN_SUB_TYPE_tag\r\nFROM [mydataset.F_TXN_JUL16]) a\r\nleft join (select SUB_TAG_OLD, CHANNEL as new_CHANNEL, TAG as new_TAG, SUB_TAG as new_SUB_TAG from [mydataset.TRANSACTION_MASTER]) b\r\non a.TRAN_SUB_TYPE_tag = b.SUB_TAG_OLD limit 10000','insert INTO BQDEMO1 ( A_ACC_NO, A_SOL_ID_INIT , A_SOL_ID_ACC , A_TXNID , A_PART_TRAN_TYPE , A_TXN_AMT, A_TXN_TYPE, A_RCRE_USERID, A_TRAN_TYPE , A_TRAN_SUB_TYPE, A_INSTR , A_ACID , A_TXN_PARTICULARS, A_TXN_REMARKS , A_TXN_REMARKS2 , A_TRAN_DATE , A_TRAN_SUB_TYPE_TAG , B_NEW_CHANNEL , B_NEW_TAG , B_NEW_SUB_TAG )','bq-demo-axis-prod');
/*!40000 ALTER TABLE `bqschedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dimensions`
--

DROP TABLE IF EXISTS `dimensions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dimensions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dimensionGroup` varchar(45) NOT NULL,
  `dimensions` varchar(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dimensions`
--

LOCK TABLES `dimensions` WRITE;
/*!40000 ALTER TABLE `dimensions` DISABLE KEYS */;
INSERT INTO `dimensions` VALUES (1,'ib_1_dimensions_users','ga:userType,ga:browser,ga:operatingSystem');
/*!40000 ALTER TABLE `dimensions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dimensions_list`
--

DROP TABLE IF EXISTS `dimensions_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dimensions_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dimensions` varchar(5000) DEFAULT NULL,
  `custom_dimension` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=253 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dimensions_list`
--

LOCK TABLES `dimensions_list` WRITE;
/*!40000 ALTER TABLE `dimensions_list` DISABLE KEYS */;
INSERT INTO `dimensions_list` VALUES (1,'ga:userType','ga:TEST'),(2,'ga:sessionCount','ga:test2'),(3,'ga:daysSinceLastSession',''),(4,'ga:userDefinedValue',''),(5,'ga:sessionDurationBucket',''),(6,'ga:referralPath',''),(7,'ga:fullReferrer',''),(8,'ga:campaign',''),(9,'ga:source',''),(10,'ga:medium',''),(11,'ga:sourceMedium',''),(12,'ga:keyword',''),(13,'ga:adContent',''),(14,'ga:socialNetwork',''),(15,'ga:hasSocialSourceReferral',''),(16,'ga:campaignCode',''),(17,'ga:adGroup',''),(18,'ga:adSlot',''),(19,'ga:adDistributionNetwork',''),(20,'ga:adMatchType',''),(21,'ga:adKeywordMatchType',''),(22,'ga:adMatchedQuery',''),(23,'ga:adPlacementDomain',''),(24,'ga:adPlacementUrl',''),(25,'ga:adFormat',''),(26,'ga:adTargetingType',''),(27,'ga:adTargetingOption',''),(28,'ga:adDisplayUrl',''),(29,'ga:adDestinationUrl',''),(30,'ga:adwordsCustomerID',''),(31,'ga:adwordsCampaignID',''),(32,'ga:adwordsAdGroupID',''),(33,'ga:adwordsCreativeID',''),(34,'ga:adwordsCriteriaID',''),(35,'ga:adQueryWordCount',''),(36,'ga:isTrueViewVideoAd',''),(37,'ga:goalCompletionLocation',''),(38,'ga:goalPreviousStep1',''),(39,'ga:goalPreviousStep2',''),(40,'ga:goalPreviousStep3',''),(41,'ga:browser',''),(42,'ga:browserVersion',''),(43,'ga:operatingSystem',''),(44,'ga:operatingSystemVersion',''),(45,'ga:mobileDeviceBranding',''),(46,'ga:mobileDeviceModel',''),(47,'ga:mobileInputSelector',''),(48,'ga:mobileDeviceInfo',''),(49,'ga:mobileDeviceMarketingName',''),(50,'ga:deviceCategory',''),(51,'ga:browserSize',''),(52,'ga:dataSource',''),(53,'ga:continent',''),(54,'ga:subContinent',''),(55,'ga:country',''),(56,'ga:region',''),(57,'ga:metro',''),(58,'ga:city',''),(59,'ga:latitude',''),(60,'ga:longitude',''),(61,'ga:networkDomain',''),(62,'ga:networkLocation',''),(63,'ga:cityId',''),(64,'ga:continentId',''),(65,'ga:countryIsoCode',''),(66,'ga:metroId',''),(67,'ga:regionId',''),(68,'ga:regionIsoCode',''),(69,'ga:subContinentCode',''),(70,'ga:flashVersion',''),(71,'ga:javaEnabled',''),(72,'ga:language',''),(73,'ga:screenColors',''),(74,'ga:sourcePropertyDisplayName',''),(75,'ga:sourcePropertyTrackingId',''),(76,'ga:screenResolution',''),(77,'ga:landingContentGroupXX',''),(78,'ga:previousContentGroupXX',''),(79,'ga:contentGroupXX',''),(80,'ga:searchUsed',''),(81,'ga:searchKeyword',''),(82,'ga:searchKeywordRefinement',''),(83,'ga:searchCategory',''),(84,'ga:searchStartPage',''),(85,'ga:searchDestinationPage',''),(86,'ga:searchAfterDestinationPage',''),(87,'ga:appInstallerId',''),(88,'ga:appVersion',''),(89,'ga:appName',''),(90,'ga:appId',''),(91,'ga:screenName',''),(92,'ga:screenDepth',''),(93,'ga:landingScreenName',''),(94,'ga:exitScreenName',''),(95,'ga:eventCategory',''),(96,'ga:eventAction',''),(97,'ga:eventLabel',''),(98,'ga:transactionId',''),(99,'ga:affiliation',''),(100,'ga:sessionsToTransaction',''),(101,'ga:daysToTransaction',''),(102,'ga:productSku',''),(103,'ga:productName',''),(104,'ga:productCategory',''),(105,'ga:currencyCode',''),(106,'ga:checkoutOptions',''),(107,'ga:internalPromotionCreative',''),(108,'ga:internalPromotionId',''),(109,'ga:internalPromotionName',''),(110,'ga:internalPromotionPosition',''),(111,'ga:orderCouponCode',''),(112,'ga:productBrand',''),(113,'ga:productCategoryHierarchy',''),(114,'ga:productCategoryLevelXX',''),(115,'ga:productCouponCode',''),(116,'ga:productListName',''),(117,'ga:productListPosition',''),(118,'ga:productVariant',''),(119,'ga:shoppingStage',''),(120,'ga:socialInteractionNetwork',''),(121,'ga:socialInteractionAction',''),(122,'ga:socialInteractionNetworkAction',''),(123,'ga:socialInteractionTarget',''),(124,'ga:socialEngagementType',''),(125,'ga:userTimingCategory',''),(126,'ga:userTimingLabel',''),(127,'ga:userTimingVariable',''),(128,'ga:exceptionDescription',''),(129,'ga:experimentId',''),(130,'ga:experimentVariant',''),(131,'ga:date',''),(132,'ga:year',''),(133,'ga:month',''),(134,'ga:week',''),(135,'ga:day',''),(136,'ga:hour',''),(137,'ga:minute',''),(138,'ga:nthMonth',''),(139,'ga:nthWeek',''),(140,'ga:nthDay',''),(141,'ga:nthMinute',''),(142,'ga:dayOfWeek',''),(143,'ga:dayOfWeekName',''),(144,'ga:dateHour',''),(145,'ga:yearMonth',''),(146,'ga:yearWeek',''),(147,'ga:isoWeek',''),(148,'ga:isoYear',''),(149,'ga:isoYearIsoWeek',''),(150,'ga:nthHour',''),(151,'ga:dcmClickAd',''),(152,'ga:dcmClickAdId',''),(153,'ga:dcmClickAdType',''),(154,'ga:dcmClickAdTypeId',''),(155,'ga:dcmClickAdvertiser',''),(156,'ga:dcmClickAdvertiserId',''),(157,'ga:dcmClickCampaign',''),(158,'ga:dcmClickCampaignId',''),(159,'ga:dcmClickCreativeId',''),(160,'ga:dcmClickCreative',''),(161,'ga:dcmClickRenderingId',''),(162,'ga:dcmClickCreativeType',''),(163,'ga:dcmClickCreativeTypeId',''),(164,'ga:dcmClickCreativeVersion',''),(165,'ga:dcmClickSite',''),(166,'ga:dcmClickSiteId',''),(167,'ga:dcmClickSitePlacement',''),(168,'ga:dcmClickSitePlacementId',''),(169,'ga:dcmClickSpotId',''),(170,'ga:dcmFloodlightActivity',''),(171,'ga:dcmFloodlightActivityAndGroup',''),(172,'ga:dcmFloodlightActivityGroup',''),(173,'ga:dcmFloodlightActivityGroupId',''),(174,'ga:dcmFloodlightActivityId',''),(175,'ga:dcmFloodlightAdvertiserId',''),(176,'ga:dcmFloodlightSpotId',''),(177,'ga:dcmLastEventAd',''),(178,'ga:dcmLastEventAdId',''),(179,'ga:dcmLastEventAdType',''),(180,'ga:dcmLastEventAdTypeId',''),(181,'ga:dcmLastEventAdvertiser',''),(182,'ga:dcmLastEventAdvertiserId',''),(183,'ga:dcmLastEventAttributionType',''),(184,'ga:dcmLastEventCampaign',''),(185,'ga:dcmLastEventCampaignId',''),(186,'ga:dcmLastEventCreativeId',''),(187,'ga:dcmLastEventCreative',''),(188,'ga:dcmLastEventRenderingId',''),(189,'ga:dcmLastEventCreativeType',''),(190,'ga:dcmLastEventCreativeTypeId',''),(191,'ga:dcmLastEventCreativeVersion',''),(192,'ga:dcmLastEventSite',''),(193,'ga:dcmLastEventSiteId',''),(194,'ga:dcmLastEventSitePlacement',''),(195,'ga:dcmLastEventSitePlacementId',''),(196,'ga:dcmLastEventSpotId',''),(197,'ga:userAgeBracket',''),(198,'ga:userGender',''),(199,'ga:interestOtherCategory',''),(200,'ga:interestAffinityCategory',''),(201,'ga:interestInMarketCategory',''),(202,'ga:acquisitionCampaign',''),(203,'ga:acquisitionMedium',''),(204,'ga:acquisitionSource',''),(205,'ga:acquisitionSourceMedium',''),(206,'ga:acquisitionTrafficChannel',''),(207,'ga:cohort',''),(208,'ga:cohortNthDay',''),(209,'ga:cohortNthMonth',''),(210,'ga:cohortNthWeek',''),(211,'ga:channelGrouping',''),(212,'ga:correlationModelId',''),(213,'ga:queryProductId',''),(214,'ga:queryProductName',''),(215,'ga:queryProductVariation',''),(216,'ga:relatedProductId',''),(217,'ga:relatedProductName',''),(218,'ga:relatedProductVariation',''),(219,'ga:dbmClickAdvertiser',''),(220,'ga:dbmClickAdvertiserId',''),(221,'ga:dbmClickCreativeId',''),(222,'ga:dbmClickExchange',''),(223,'ga:dbmClickExchangeId',''),(224,'ga:dbmClickInsertionOrder',''),(225,'ga:dbmClickInsertionOrderId',''),(226,'ga:dbmClickLineItem',''),(227,'ga:dbmClickLineItemId',''),(228,'ga:dbmClickSite',''),(229,'ga:dbmClickSiteId',''),(230,'ga:dbmLastEventAdvertiser',''),(231,'ga:dbmLastEventAdvertiserId',''),(232,'ga:dbmLastEventCreativeId',''),(233,'ga:dbmLastEventExchange',''),(234,'ga:dbmLastEventExchangeId',''),(235,'ga:dbmLastEventInsertionOrder',''),(236,'ga:dbmLastEventInsertionOrderId',''),(237,'ga:dbmLastEventLineItem',''),(238,'ga:dbmLastEventLineItemId',''),(239,'ga:dbmLastEventSite',''),(240,'ga:dbmLastEventSiteId',''),(241,'ga:dsAdGroup',''),(242,'ga:dsAdGroupId',''),(243,'ga:dsAdvertiser',''),(244,'ga:dsAdvertiserId',''),(245,'ga:dsAgency',''),(246,'ga:dsAgencyId',''),(247,'ga:dsCampaign',''),(248,'ga:dsCampaignId',''),(249,'ga:dsEngineAccount',''),(250,'ga:dsEngineAccountId',''),(251,'ga:dsKeyword',''),(252,'ga:dsKeywordId','');
/*!40000 ALTER TABLE `dimensions_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `downloadstatus`
--

DROP TABLE IF EXISTS `downloadstatus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `downloadstatus` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `urls` varchar(10000) DEFAULT NULL,
  `bucket` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `downloadstatus`
--

LOCK TABLES `downloadstatus` WRITE;
/*!40000 ALTER TABLE `downloadstatus` DISABLE KEYS */;
INSERT INTO `downloadstatus` VALUES (1,'acc-000000000000.csv.gz','dummy-test');
/*!40000 ALTER TABLE `downloadstatus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `errolog`
--

DROP TABLE IF EXISTS `errolog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `errolog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `datetime` varchar(50) DEFAULT NULL,
  `message` varchar(200) DEFAULT NULL,
  `url` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `errolog`
--

LOCK TABLES `errolog` WRITE;
/*!40000 ALTER TABLE `errolog` DISABLE KEYS */;
INSERT INTO `errolog` VALUES (1,'03/10/2016 07:07:31 pm','TypeError: bigquery.query is not a function','/bigquery/v3'),(2,'03/10/2016 07:39:58 pm','TypeError: bigquery.query is not a function','/bigquery/v3'),(3,'04/10/2016 04:38:24 pm','TypeError: bigquery.query is not a function','/bigquery/v3'),(4,'04/10/2016 06:05:27 pm','TypeError: bigquery.query is not a function','/bigquery/v3');
/*!40000 ALTER TABLE `errolog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gakeys`
--

DROP TABLE IF EXISTS `gakeys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gakeys` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key_name` varchar(45) NOT NULL,
  `key_path` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gakeys`
--

LOCK TABLES `gakeys` WRITE;
/*!40000 ALTER TABLE `gakeys` DISABLE KEYS */;
INSERT INTO `gakeys` VALUES (1,'axisGA.pem','./key/axisGA.pem');
/*!40000 ALTER TABLE `gakeys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metrics`
--

DROP TABLE IF EXISTS `metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `metrics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `metricsGroup` varchar(45) NOT NULL,
  `metrics` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metrics`
--

LOCK TABLES `metrics` WRITE;
/*!40000 ALTER TABLE `metrics` DISABLE KEYS */;
INSERT INTO `metrics` VALUES (1,'ib_1_metrics_users','ga:users,ga:sessions,ga:bounces'),(2,'dfdfsdfsdf','ga:transactionsPerUser ,ga:demodd');
/*!40000 ALTER TABLE `metrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metrics_list`
--

DROP TABLE IF EXISTS `metrics_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `metrics_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `metrics` varchar(10000) DEFAULT NULL,
  `custom_metrics` varchar(400) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=198 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metrics_list`
--

LOCK TABLES `metrics_list` WRITE;
/*!40000 ALTER TABLE `metrics_list` DISABLE KEYS */;
INSERT INTO `metrics_list` VALUES (1,'ga:users','ga:demodd'),(2,'ga:newUsers ','ga:sdssd'),(3,'ga:percentNewSessions ','ga:sdss'),(4,'ga:1dayUsers','test'),(5,'ga:7dayUsers ','test1'),(6,'ga:14dayUsers','addd'),(7,'ga:30dayUsers','helllooo'),(8,'ga:sessions ','testdsadsada'),(9,'ga:bounces ','testdsada'),(10,'ga:bounceRate','vinayak'),(11,'ga:sessionDuration ','testsdxsada'),(12,'ga:avgSessionDuration ','ramani'),(13,'ga:organicSearches ','swhubho'),(14,'ga:impressions',''),(15,'ga:adClicks',''),(16,'ga:adCost ',''),(17,'ga:CPM',''),(18,'ga:CPC',''),(19,'ga:CTR ',''),(20,' ga:costPerTransaction ',''),(21,'ga:costPerGoalConversion ',''),(22,'ga:costPerConversion ',''),(23,'ga:RPC ',''),(24,'ga:ROAS ',''),(25,'ga:goalStartsAll ',''),(26,'ga:goalCompletionsAll',''),(27,'ga:goalValueAll ',''),(28,'ga:goalValuePerSession ',''),(29,'ga:goalConversionRateAll',''),(30,'ga:goalAbandonsAll ',''),(31,'ga:goalAbandonRateAll',''),(32,'ga:pageValue ',''),(33,'ga:entrances ',''),(34,'ga:entranceRate ',''),(35,'ga:pageviews ',''),(36,'ga:pageviewsPerSession ',''),(37,'ga:contentGroupUniqueViews1 ',''),(38,'ga:contentGroupUniqueViews2 ',''),(39,'ga:contentGroupUniqueViews3 ',''),(40,'ga:contentGroupUniqueViews4',''),(41,'ga:contentGroupUniqueViews5 ',''),(42,'ga:uniquePageviews ',''),(43,'ga:timeOnPage ',''),(44,'ga:avgTimeOnPage ',''),(45,'ga:exits ',''),(46,'ga:exitRate ',''),(47,'ga:searchResultViews ',''),(48,'ga:searchUniques ',''),(49,'ga:avgSearchResultViews ',''),(50,'ga:searchSessions ',''),(51,'ga:percentSessionsWithSearch ',''),(52,'ga:searchDepth ',''),(53,'ga:avgSearchDepth ',''),(54,'ga:searchRefinements ',''),(55,'ga:percentSearchRefinements ',''),(56,'ga:searchDuration ',''),(57,'ga:avgSearchDuration ',''),(58,'ga:searchExits ',''),(59,'ga:searchExitRate ',''),(60,'ga:searchGoalConversionRateAll ',''),(61,'ga:goalValueAllPerSearch ',''),(62,'ga:pageLoadTime ',''),(63,'ga:pageLoadSample ',''),(64,'ga:avgPageLoadTime ',''),(65,'ga:domainLookupTime ',''),(66,'ga:avgDomainLookupTime ',''),(67,'ga:pageDownloadTime ',''),(68,'ga:avgPageDownloadTime ',''),(69,'ga:redirectionTime ',''),(70,'ga:avgRedirectionTime ',''),(71,'ga:serverConnectionTime ',''),(72,'ga:avgServerConnectionTime ',''),(73,'ga:serverResponseTime ',''),(74,'ga:avgServerResponseTime ',''),(75,'ga:speedMetricsSample ',''),(76,'ga:domInteractiveTime ',''),(77,'ga:avgDomInteractiveTime ',''),(78,'ga:domContentLoadedTime ',''),(79,'ga:avgDomContentLoadedTime ',''),(80,'ga:domLatencyMetricsSample ',''),(81,'ga:screenviews ',''),(82,'ga:uniqueScreenviews ',''),(83,'ga:screenviewsPerSession ',''),(84,'ga:timeOnScreen ',''),(85,'ga:avgScreenviewDuration ',''),(86,'ga:totalEvents ',''),(87,'ga:uniqueEvents ',''),(88,'ga:eventValue ',''),(89,'ga:avgEventValue ',''),(90,'ga:sessionsWithEvent ',''),(91,'ga:eventsPerSessionWithEvent ',''),(92,'ga:transactions ',''),(93,'ga:transactionsPerSession ',''),(94,'ga:transactionRevenue ',''),(95,'ga:revenuePerTransaction ',''),(96,'ga:transactionRevenuePerSession ',''),(97,'ga:transactionShipping ',''),(98,'ga:transactionTax ',''),(99,'ga:totalValue ',''),(100,'ga:itemQuantity ',''),(101,'ga:uniquePurchases ',''),(102,'ga:revenuePerItem ',''),(103,'ga:itemRevenue ',''),(104,'ga:itemsPerPurchase ',''),(105,'ga:localTransactionRevenue ',''),(106,'ga:localTransactionShipping ',''),(107,'ga:localTransactionTax ',''),(108,'ga:localItemRevenue ',''),(109,'ga:socialInteractions ',''),(110,'ga:uniqueSocialInteractions ',''),(111,'ga:socialInteractionsPerSession ',''),(112,'ga:userTimingValue ',''),(113,'ga:userTimingSample ',''),(114,'ga:avgUserTimingValue ',''),(115,'ga:exceptions ',''),(116,'ga:exceptionsPerScreenview ',''),(117,'ga:fatalExceptions ',''),(118,'ga:fatalExceptionsPerScreenview ',''),(119,'ga:dcmFloodlightQuantity ',''),(120,'ga:dcmFloodlightRevenue ',''),(121,'ga:adsenseRevenue ',''),(122,'ga:adsenseAdUnitsViewed ',''),(123,'ga:adsenseAdsViewed ',''),(124,'ga:adsenseAdsClicks ',''),(125,'ga:adsensePageImpressions ',''),(126,'ga:adsenseCTR ',''),(127,'ga:adsenseECPM ',''),(128,'ga:adsenseExits ',''),(129,'ga:adsenseViewableImpressionPercent ',''),(130,'ga:adsenseCoverage ',''),(131,'ga:adxImpressions ',''),(132,'ga:adxCoverage ',''),(133,'ga:adxMonetizedPageviews ',''),(134,'ga:adxImpressionsPerSession ',''),(135,'ga:adxViewableImpressionsPercent ',''),(136,'ga:adxClicks ',''),(137,'ga:adxCTR ',''),(138,'ga:adxRevenue ',''),(139,'ga:adxRevenuePer1000Sessions ',''),(140,'ga:adxECPM ',''),(141,'ga:dfpImpressions ',''),(142,'ga:dfpCoverage ',''),(143,'ga:dfpMonetizedPageviews ',''),(144,'ga:dfpImpressionsPerSession ',''),(145,'ga:dfpViewableImpressionsPercent ',''),(146,'ga:dfpClicks ',''),(147,'ga:dfpCTR ',''),(148,'ga:dfpRevenue ',''),(149,'ga:dfpRevenuePer1000Sessions ',''),(150,'ga:dfpECPM ',''),(151,'ga:backfillImpressions ',''),(152,'ga:backfillCoverage ',''),(153,'ga:backfillMonetizedPageviews ',''),(154,'ga:backfillImpressionsPerSession ',''),(155,'ga:backfillViewableImpressionsPercent ',''),(156,'ga:backfillClicks ',''),(157,'ga:backfillCTR ',''),(158,'ga:backfillRevenue ',''),(159,'ga:backfillRevenuePer1000Sessions ',''),(160,'ga:backfillECPM ',''),(161,'ga:buyToDetailRate ',''),(162,'ga:cartToDetailRate ',''),(163,'ga:correlationScore ',''),(164,'ga:dcmCPC ',''),(165,'ga:dcmCTR ',''),(166,'ga:dcmClicks ',''),(167,'ga:dcmCost ',''),(168,'ga:dcmImpressions ',''),(169,'ga:dcmROAS ',''),(170,'ga:dcmRPC ',''),(171,'ga:hits ',''),(172,'ga:internalPromotionCTR ',''),(173,'ga:internalPromotionClicks ',''),(174,'ga:internalPromotionViews ',''),(175,'ga:localProductRefundAmount ',''),(176,'ga:localRefundAmount ',''),(177,'ga:productAddsToCart ',''),(178,'ga:productCheckouts ',''),(179,'ga:productDetailViews ',''),(180,'ga:productListCTR ',''),(181,'ga:productListClicks ',''),(182,'ga:productListViews ',''),(183,'ga:productRefundAmount ',''),(184,'ga:productRefunds ',''),(185,'ga:productRemovesFromCart ',''),(186,'ga:productRevenuePerPurchase ',''),(187,'ga:quantityAddedToCart ',''),(188,'ga:quantityCheckedOut ',''),(189,'ga:quantityRefunded ',''),(190,'ga:quantityRemovedFromCart ',''),(191,'ga:queryProductQuantity ',''),(192,'ga:refundAmount ',''),(193,'ga:relatedProductQuantity ',''),(194,'ga:revenuePerUser ',''),(195,'ga:sessionsPerUser ',''),(196,'ga:totalRefunds ',''),(197,'ga:transactionsPerUser','');
/*!40000 ALTER TABLE `metrics_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `portal`
--

DROP TABLE IF EXISTS `portal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `portal` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `portal_name` varchar(45) DEFAULT NULL,
  `gaid` varchar(100) DEFAULT NULL,
  `security_key` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `portal`
--

LOCK TABLES `portal` WRITE;
/*!40000 ALTER TABLE `portal` DISABLE KEYS */;
INSERT INTO `portal` VALUES (1,'internet_banking_demo','ga:59156596','./key/axisGA.pem'),(2,'internet_banking_demo22','59156596','./key/axisGA.pem');
/*!40000 ALTER TABLE `portal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedules`
--

DROP TABLE IF EXISTS `schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `portal` varchar(300) DEFAULT NULL,
  `dimensions` varchar(300) DEFAULT NULL,
  `metrics` varchar(250) DEFAULT NULL,
  `time` varchar(20) DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `sql_query` varchar(200) DEFAULT NULL,
  `type` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedules`
--

LOCK TABLES `schedules` WRITE;
/*!40000 ALTER TABLE `schedules` DISABLE KEYS */;
INSERT INTO `schedules` VALUES (1,'internet_banking_demo','ga:userType,ga:browser,ga:operatingSystem','ga:users,ga:sessions,ga:bounces','13:45','0000-00-00','0000-00-00','INSERT INTO FINALDEMO VALUES( USERTYPE,BROWSER,OPERATINGSYSTEM,USERS,SESSIONS,BOUNCES ) ','daily'),(2,'internet_banking_demo','ga:userType,ga:browser,ga:operatingSystem','ga:users,ga:sessions,ga:bounces','23:04','0000-00-00','0000-00-00','INSERT INTO EMP VALUES(ID,NAME)','daily');
/*!40000 ALTER TABLE `schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `email` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'test@gmail.com','1234','test@gmail.com'),(2,'koriarjun30@gmail.com','123','koriarjun30@gmail.com');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-10-24 17:22:25
