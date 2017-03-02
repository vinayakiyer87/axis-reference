var request = require('request');
var moment = require('moment');
var schedule = require('node-schedule');
var googleAuth = require('google-oauth-jwt');
var google = require('googleapis');
var bigquery = google.bigquery('v2');
var CloudStorage = require('cloud-storage');
var storage = new CloudStorage({
    accessId: 'abhijeet-dev@axisbank-bigquery.iam.gserviceaccount.com',
    privateKey: 'axisGA.pem'
});
var stringify = require('csv-stringify');
var async = require('async');
var fs = require('fs');
var parse = require('csv-parse');
var oracledb = require('oracledb');
var uuid = require('uuid');
var gcs = require('@google-cloud/storage')({
    projectId: 'axis-bank',
    keyFilename: 'axisGA.pem',
    email: 'abhijeet-dev@axisbank-bigquery.iam.gserviceaccount.com'
});
var googleAuth = require('google-oauth-jwt');

var ga_config = require('../config/ga_config');
var ods_config = require('../config/ods_config');
var bq_config = require('../config/ga_config');
var utility = require('./utility');

exports.getbgToken = function(key, cb) {
    try {
        //########## GA AUTHENTICATE ###################
        var _accessToken;
        console.log("########## KEY ######### " + key);

        console.log("************************** GOOGLE AUTHENTICATION EXECUTED ****************************");

        // AUTHENTICATE WITH GOOGLE APIS CONSOLE. 

        googleAuth.authenticate({
            /*email: bq_config.email,
            iss: bq_config.email,
            keyFile: key,*/
            email: 'abhijeet-dev@axisbank-bigquery.iam.gserviceaccount.com',
            iss: 'abhijeet-dev@axisbank-bigquery.iam.gserviceaccount.com',
            keyFile: 'axisGA.pem',
            scopes: ['https://www.googleapis.com/auth/bigquery https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/cloud-platform.read-only']
        }, function(err, token) {
            if (err) {
                console.log("#### Error while Google Auth ##### " + err);
                /*ERROR LOG SAVE*/
                var err = "ERROR while Authenticating Google API, check internet connectivity and try again. Error- " + err;
                //utility.saveErrorLog(err);
            } else {
                console.log("Access Token : " + token);
                _accessToken = token;
                cb(_accessToken);
            }
        });
    } catch (ex) {
        console.log("Exception In Token : " + ex);
        /*ERROR LOG SAVE*/
        //utility.saveErrorLog(ex, req.originalUrl);
    }
};
//*****************************GET BQ TOKEN ENDS ******************************************************//


exports.ods_query = function(rule,bqrowID) { 
	console.log("**** ods_query CALLED ROWID***** "+JSON.stringify(bqrowID));
	try{
         
        connection.query('UPDATE bquploadschedules SET status="start" WHERE id= ? ', bqrowID, function(err, _result) {
            if (err) {
                console.log(err);
            } else {
                 
                console.log("UPDATE ROW TO START ** EXECUTE START");  
		connection.query('SELECT * FROM bquploadschedules where id= ?', bqrowID, function(err, data) {
            if (err) {
                console.log('###### Error in bquploadschedules Listing ######');
                
            } else {
                console.log("DATA " + JSON.stringify(data));
                            var tmp_dataset = data[0].tempdataset;               			                
			                var bq_schedules_row = data;
			                console.log(" THIS IS OUR ODS QUERY: "+data[0].odsquery);
                  //************* FIND UNIQUE VALUE $YESTERDAY BEGINS*************************//   
                            var ods_query1 = data[0].odsquery,
                            myName = "$YESTERDAY",
                            hits = 0,
                            array = ods_query1.split(/\s/),
                            length = array.length,
                            i = 0;

                        while (i < length) {
                            if (myName === array[i]) {
                                hits += 1;
                            }                            
                            i += 1;
                        }

                        if (hits === 0) {
                            console.log("****UNIQUE IDENTIFIER $YESTERDAY NOT FOUND! *****"+ods_query1);
                            var odsquery = ods_query1;
                            ods_logic(rule, bqrowID, bq_schedules_row, odsquery);

                        } else {
                            console.log("****HURRAY UNIQUE IDENTIFIER $YESTERDAY FOUND! ***** "+ods_query1);
                            var d = new Date();
                             d.setDate(d.getDate() - 1);
                             var d_yesterday = moment(d).format('YYYY-MM-DD');
                             console.log(" YESTERDAY: "+d_yesterday);
                            var ods_query = ods_query1.replace("$YESTERDAY", d_yesterday);
                            console.log(" ODS QUERY  REPLACED "+ods_query);
                            var odsquery = ods_query;
                            ods_logic(rule, bqrowID, bq_schedules_row, odsquery);
                        }              
			                
                    //************* FIND UNIQUE VALUE $YESTERDAY ENDS*************************//          
			  
            } 
        });//connection query slect from bquploadschedules ends
          } //ELSE update bquploadschedules ends
        }) // update bquploadschedules ends
	} catch (ex) {
               console.log(" ### Exception In ODS QUERY : " + ex+" BQROW ID: "+bqrowID);
             }

}//exports.ods_query ENDS

//****** ODS_LOGIC FUNCTION STARTS ********************//

function ods_logic(rule, bqrowID, bq_schedules_row, odsquery){
	
	try{
		console.log(" ROWID: "+bqrowID+" ODS QUERY: "+odsquery+ " ODS CONFIG: "+ods_config);
		var query = odsquery;
		var filename = bq_schedules_row[0].filename.toString();
		var newfname = filename.slice(0, -3);

		oracledb.getConnection({
    			user: "system",
  password: "password",
  connectString: "localhost:1521/orcl",
            },
    function(err, connection) {
        if (err) {
        	throw err;
        }

        connection.execute(
            query,
            {}, //no binds
            {
                resultSet: true,
                prefetchRows: 1000
            },
            function(err, results) {
                var rowsProcessed = 0;
                var startTime;

                if (err) throw err;

                startTime = Date.now();

                function processResultSet() {
                    results.resultSet.getRows(1000, function(err, rows) {
                        if (err) throw err;

                        if (rows.length) {
                           var val = "";
	                        for (i = 0; i < rows.length; i++) {
	                            rowsProcessed += 1;
	                            val += rows[i].concat('\n');
	                            // console.log("NUMBER OF ROWS:  "+rows[i]);                        
	                        }
                        //display entire data log
                        //console.log(" THIS IS THE VAL: "+val);

                        fs.appendFile('csv-data/' + newfname, val, 'utf8', function(err) {
                            if (err) {
                                console.log('Some error occured - ' + err);

                            } else {
                                console.log('It\'s saved!' + '.csv');
                            }
                        })

                            processResultSet(); //try to get more rows from the result set

                            return; //exit recursive function prior to closing result set
                        }
                      // ********* DONE START *************  
                        console.log('Finish processing ' + rowsProcessed + ' rows');
                        console.log('Total time (in seconds):', ((Date.now() - startTime)/1000));
                        var file_name = './csv-data/'+ newfname;
                        // call the rest of ./csv-data/1.csvthe code and have it execute after 10 seconds
                        setTimeout(function() {
                            convertGZ(file_name,rule, bqrowID, bq_schedules_row);
                        }, 10000);
                      //**********DONE ENDS ***********  

                        results.resultSet.close(function(err) {
                            if (err) console.error(err.message);

                            connection.release(function(err) {
                                if (err) console.error(err.message);
                            });
                        });
                    });
                }

                processResultSet();
            }
        );
    }
);
			
		/*TRY ENDS BELOW*/
	} catch (ex){
		console.log(" **** Catch Exception:  "+ex+ "ROWID "+bqrowID);
	}

} //function ods_logi ENDS

//******* ODS_LOGIC FUNCTION ENDS *********************//

//****** CONVERT TO GZ START **************
	function convertGZ(file_name,rule, bqrowID, bq_schedules_row){
		try {
        const execFile = require('child_process').execFile;
        console.log("FNAMEEEE :  " + file_name);
        const child = execFile('gzip', ['-f', file_name], (error, stdout, stderr) => {
            if (error) {
                throw error;
            } else {
                console.log(" GZIP DONE: " + file_name + stderr);
                file_name = file_name + '.gz';
                console.log(" NAME OF GZIP FILE: "+file_name);
                gz_gcspush(file_name, rule, bqrowID, bq_schedules_row);
            }
        });
    	} catch (ex) {
    	    console.log(" ### Error while Gziping File: " + filename + " Err- " + ex);
    		}
		}
//***** CONVERT TO GZ ENDS ****************

//*********Push GZ to GCS start*******
	function gz_gcspush(file_name, rule, bqrowID, bq_schedules_row){
		try{
			 console.log(" ** INSIDE GCS PUSH***"+file_name);
	        var bucket = gcs.bucket('dummy-upload');
	        bucket.upload(file_name, function(err, file) {
	            if (!err) {
	                // "CSV" is now in your bucket. 
	                console.log(" *** PUSHED DATA TO GCS ***" + file);
	                bquery_append(file_name, rule, bqrowID, bq_schedules_row);

	            } else {
	                console.log("Error while Pushing file to GCS: " + err);
	            }
	        });
		} catch (ex){
			console.log(" #### Exception while pushing file to GCS: "+ex);
		}
	}

//********Push GZ to GCS ENDS ********

//********* BIGQUERY APPEND Starts*********************
	function bquery_append(file_name, rule, bqrowID, bq_schedules_row, cb){
		
		try {
            if(bq_schedules_row[0].bqtable==undefined || bq_schedules_row[0].bqtable==''){
                console.log(" **** GO TO ERROR DIRECTLY **** ");
            }
         //********** M-YY Logic Starts **************
             var d = new Date();   
             var m_names = ['January', 'February', 'March', 
               'April', 'May', 'June', 'July', 
               'August', 'September', 'October', 'November', 'December'];  

               var _yrMont = m_names[d.getMonth()] + '_' + d.getFullYear();
               console.log("DATE FORMAT: "+_yrMont);
         //********** M-YY Logic ENDS *****************
        console.log("******BQ PUSH BEFORE redirect CALLLED**00");
        //res.redirect('/bqscheduler');
        console.log("########### STARTED BIG QUERY EXECUTION ############" /*+ JSON.stringify(req.body)*/ );
        //var bqquery = queryResult1[0].big_query;
        var bqquery = bq_schedules_row[0].bquerytag;
        var bqprojectId = 'axis-bank';
        var bqtable = bq_schedules_row[0].bqtable+'_'+_yrMont;
        /*var sid = bq_rowID;
        global.bq_rowID = sid;*/
        /*global._failcountBQ = 1;*/
        //*********************Updating Failure column to start********************
        /*var updateScheduleID = bq_rowID;
        connection.query('UPDATE bqschedules SET fail="start" WHERE id= ? ', updateScheduleID, function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log("UPDATE ROW TO START ** EXECUTE START");
            }
        })*/
        // Updating failure column to start end***************
        var keypath = 'axisGA.pem';
        utility.getbgToken(keypath, function(_accessToken) {
            console.log("******** BQ TABLEEE:  "+bqtable+"<<<<<BIGQUERY: "+bqquery);

            var _url = 'https://www.googleapis.com/bigquery/v2/projects/' + bqprojectId + '/jobs';
            request({
                url: _url,
                method: 'POST',
                headers: {
                    "Authorization": "Bearer " + _accessToken
                },
                json: {

                    "configuration": {
                        "query": {
                            //"query":"select a.*,b.new_CHANNEL,b.new_Tag,b.new_Sub_Tag from (select *, (Case when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-CLOSURE%' then 'BRN/ACCOUNT CLOSE-TD' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'CLOSURE INT%' then 'BRN/ACCOUNT CLOSE-TD' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'CREDIT FOR : TD%' then 'BRN/ACCOUNT CLOSE-TD' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'CLOSURE %' then 'BRN/ACCOUNT CLOSE-TD' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'TO CLEARING%' then 'BRN/INWRD CLG' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-CLG-CHQ%' then 'BRN/INWRD CLG' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-CLG%' then 'BRN/INWRD CLG' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'ZONE:123123/%' then 'BRN/INWRD CLG' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'INT RUN%' then 'BRN/LOAN DEMAND GENERATION' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-INT%' then 'BRN/LOAN DEMAND GENERATION' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'ALKA1%' then 'BRN/LOAN DISBURSMENT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-TO DISB%' then 'BRN/LOAN DISBURSMENT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-BY DISB%' then 'BRN/LOAN DISBURSMENT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-DISB%' then 'BRN/LOAN DISBURSMENT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN LN REC PRN%' then 'BRN/LOAN RECOVERY' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN LN REV PRN%' then 'BRN/LOAN RECOVERY' when (TXN_PARTICULARS) like 'LOAN RECOVERY%' then 'BRN/LOAN RECOVERY' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'CR TO XFER AC DUE TO CLOSURE OF :ARUPCA02' then 'BRN/ACCOUNT CLOSE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-PROCEEDS%' then 'BRN/ACCOUNT CLOSE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like '%CLOSURE PROCEEDS%' then 'BRN/ACCOUNT CLOSE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-TO ACCT%' then 'BRN/ACCOUNT CLOSE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BY CASH%' then 'BRN/CASH DEPOSIT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-BYCASH%' then 'BRN/CASH DEPOSIT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-BY CASH%' then 'BRN/CASH DEPOSIT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'TO CASH/SELF%' then 'BRN/CASH DEPOSIT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-TO CASH%' then 'BRN/CASH DEPOSIT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN TO CASH%' then 'BRN/CASH DEPOSIT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN - TO CASH%' then 'BRN/CASH DEPOSIT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'STOP PAYMENT%' then 'BRN/STOP PAYMENT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-STOP%' then 'BRN/STOP PAYMENT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'LM TRF FROM%' then 'BRN/LM REV SWEEP' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-LM REV%' then 'BRN/LM REV SWEEP' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-LMS%' then 'BRN/LM REV SWEEP' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-NEFT%' then 'BRN/NEFT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-RTGS%' then 'BRN/RTGS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-TDS%' then 'TDS REFUND' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'TDS REFUND%' then 'TDS REFUND' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'RENEWAL%' then 'BRN/TD RENEWAL' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-RENEWAL%' then 'BRN/TD RENEWAL' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'IF:SBA:AXIS%' then 'BRN/INIT FUND: NEW ACCT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-INITIAL FUNDING%' then 'BRN/INIT FUND: NEW ACCT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'INITIAL%' then 'BRN/INIT FUND: NEW ACCT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-BY INITIAL FUNDING%' then 'BRN/INIT FUND: NEW ACCT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'TO CASH REVERSAL%' then 'Cash Reversal' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-TO CASH REVERSAL%' then 'Cash Reversal' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'PAYMENT FOR CARD::%' then 'BRN/CARD PAYMENT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-PYMT-CARD%' then 'BRN/CARD PAYMENT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'EMI PROCESSING%' then 'BRN/EMI PROCESS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-EMI-%' then 'BRN/EMI PROCESS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-BY CHARGE REVERSAL%' then 'BRN/CHARGE REVERSAL' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN AS REV%' then 'BRN/CHARGE REVERSAL' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN- CHARGES REVERSED%' then 'BRN/CHARGE REVERSAL' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-PC Offset-D%' then 'BRN/OFFSET' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REMARKS%' then 'BRN/SALARY UPLOAD' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-OTHERS-%' then 'BRN/SALARY UPLOAD' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-SALARY PAY%' then 'BRN/SALARY UPLOAD' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-SALARY-%' then 'BRN/SALARY UPLOAD' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-SALARY %' then 'BRN/SALARY UPLOAD' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-SALARY' then 'BRN/SALARY UPLOAD' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN BY SALARY%' then 'BRN/SALARY UPLOAD' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-EDUCATION FUND-BY SALARY%' then 'BRN/SALARY PAYMENT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-ARRIERS/%' then 'BRN/SALARY UPLOAD' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-OTHERS-BY CONVEYANCE%' then 'BRN/REIMBURSMENT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REIMBURSEMENT%' then 'BRN/REIMBURSMENT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-OTHERS-BY LIC COMMISSION%' then 'LIC Commission' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-BG-COMMISSION%' then 'BRN/COMMISSION' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-BONUS%' then 'BRN/BONUS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-INCENTIVE%' then 'BRN/INCENTIVE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'D1457894%' then 'BRN/SI' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-SI-%' then 'BRN/SI' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FLEXI DEPOSIT INT TFR FROM%' then 'BRN/TDS RECOVERY' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FLEXI DEPOSIT INT TFR TO%' then 'BRN/TDS PAYMENT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FLEXI DEPOSIT PRIN TFR FROM%' then 'BRN/SWEEPS TRANS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FLEXI DEPOSIT TRANSFER TO%' then 'BRN/FD CREATION' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN -FLEXI DEPOSIT TRANSFER TO%' then 'BRN/FD CREATION' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-OW RTN CLG%' then 'BRN/CHEQUE RETURN' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NOFIR%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NORIR%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FIR/%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO ROR%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO ARIM%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO OTT%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-OTT/%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NORCC%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-ARIM/%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-BKNG-REF NOFP%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO FFMC%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NOFCBC%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NOFCCP%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-ROR/%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-RCC/%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO RIO%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NORTI%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO RIO%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-RDD/%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-RIR/%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-BKNG-REF NOFS%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO RDD%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO RCS%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO ODD%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NORCP%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO FCCS%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-RTI/%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FCBC/%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FFMC/%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FCCP/%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO RMI%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-ODD/%' then 'BRN/REMITTANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-SERVICE TAX%' then 'BRN/SERVICE TAX' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-Service Tax%' then 'BRN/SERVICE TAX' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FLC-FLCSERVICE%' then 'BRN/SERVICE TAX' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-BGBCLOU SERVICE TAX%' then 'BRN/SERVICE TAX' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-CNCL-REF NOFS%' then 'BRN/SERVICE TAX' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-CNCL-REF NOFP%' then 'BRN/SERVICE TAX' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-ILC-LCO-SERVICE%' then 'BRN/SERVICE TAX' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-LC-XLADVSERVICE TAX%' then 'BRN/SERVICE TAX' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FBGSERVICE TAX /%' then 'BRN/SERVICE TAX' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-BGBCSERVICE%' then 'BRN/SERVICE TAX' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-LC-LCI-SERVICE TAX/%' then 'BRN/SERVICE TAX' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-BG ISSUE CHRG AND SERVICE TAX%' then 'BRN/SERVICE TAX' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FBGSERVICE TAX%' then 'BRN/SERVICE TAX' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-CLG-MULTIPLE CHEQUES%' then 'BRN/INWRD CLG' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-POSTAGE ON BG%' then 'BRN/BG POSTAGES' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-POSTAGE%' then 'BRN/BG POSTAGES' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-BG-POSTAGE%' then 'BRN/BG POSTAGES' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-BG AMENDMENT%' then 'BRN/BRN-BG AMENDMENT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-BG ISSUE CHRGS%' then 'BRN/BRN-BG AMENDMENT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO FIDB%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO FSGC%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO -BE%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO FBLS%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO FUGC%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO FBFP%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO FIGU%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FBLU/%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO FBLU%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FIDB/%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO -OBC%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO EBRD%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO EBUN%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO FIGS%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO EBSN%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO BDWR%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO FUBD%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FIGU/%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FIGS/%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FUGC/%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO FXBC/%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO FSBN%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FXBC/%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO FXBC/%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO FXBC%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO EBRP%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FBFP/%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO ACBS%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO FSBP%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN--BE/SERVICE TAX%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO AACE%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO ACBU%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FSGC/%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FBLS/%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN--OBC/%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN--BE/%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-REF NO FUBN%' then 'BRN/BILLS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-LC-LCI-POSTAGE%' then 'BRN/POSTAGE CHARGE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-ILC-LCO-POSTAGE%' then 'BRN/POSTAGE CHARGE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-LC-XLADVLC%' then 'BRN/LC ADV CHRGS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-LC-LCI-LC%' then 'BRN/LC ADV CHRGS' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FLC-FLCCOMMITMENT/ISS%' then 'BRN/FLC-ISSUE-CHRG' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FLC-FLCCOMMITMENT AND USANCE/ISS%' then 'BRN/FLC-ISSUE-CHRG' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FLC-FLCCOMMITMENT/AMND%' then 'BRN/FLC-AMEND-COMMIT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FLC-FLCAMENDMENT CHARG%' then 'BRN/FLC-AMEND-CHARGES' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FBGFBG- AMENDMENT%' then 'BRN/FBG - AMENDMENT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FBGFBG - AMD%' then 'BRN/FBG - AMENDMENT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FLC-FLCSWIFT CHARGES%' then 'BRN/FLC-ISSUE-SWIFT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FBGFBG- SWIFT CHARGES%' then 'BRN/FLC-ISSUE-SWIFT' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-BGBCFBG - ISSUE CHARGES%' then 'BRN/FBG-ISSUE CHARGES' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-ILC-FLCSWIFT CHARGES/ISS%' then 'BRN/FBG-ISSUE CHARGES' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FBGFBG - ISSUE CHARGES%' then 'BRN/FBG-ISSUE CHARGES' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FBGGTSD CHARGES%' then 'BRN/FBG-ISSUE CHARGES' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-FLC-FLCUSANCE/%' then 'BRN/FLC-USANCE CHARGES' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-BGBC%' then 'BRN/FBG-ISSUE CHARGES' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-BG ISSUE CHRGS%' then 'BG-COMMISSION' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-ILC-LCO-COMM/%' then 'BRN/COMMITMENT AND USANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-ILC-LCO-SFMS CHARGES/%' then 'BRN/COMMITMENT AND USANCE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-Gold Loan Fee%' then 'BRN/GOLD LOAN FEE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-SFMS CHARGES%' then 'BRN/SFMS CHARGE' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-TRFR-TO-%' then 'BRN/TRANSFER' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-TRF-TO-%' then 'BRN/TRANSFER' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-TRFR-FR-%' then 'BRN/TRANSFER' when (TXN_PARTICULARS) like 'BRN%' and (TXN_PARTICULARS) like 'BRN-TRF-FR-%' then 'BRN/TRANSFER' when (TXN_PARTICULARS) like 'TRANSFER%' then 'BRN/TRANSFER' when (TXN_PARTICULARS) like 'TRF FROM%' then 'BRN/TRANSFER' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'CASH-ATM-AXIS/%' then 'Axis ATM' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM-CASH-AXIS/%' then 'ATM/AXIS ATM' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'CASH-ATM/%' then 'ATM/NON AXIS ATM' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM-CASH/%' then 'ATM/NON AXIS ATM' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM-CASH%' then 'ATM/NON AXIS ATM' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM CASH%' then 'ATM/NON AXIS ATM' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM-Donation/%' then 'ATM/DONATION' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM DEPOSIT%' then 'ATM/DEPOSIT' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATMCASH%' and PART_TRAN_TYPE = 'C' then 'ATM/DEPOSIT' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM C ASH%' and PART_TRAN_TYPE= 'C' then 'ATM/DEPOSIT' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM ENVELOPE CASH DEPOSIT%' then 'ATM/DEPOSIT' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM REV%' then 'ATM/ATM REVERSAL' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM rev%' then 'ATM/ATM REVERSAL' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM/REV%' then 'ATM/ATM REVERSAL' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM-FundTransfer/%' then 'ATM/ATM FUND TRANSFER' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM-FUNDTRANSFER/%' then 'ATM/ATM FUND TRANSFER' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM-FUND TRANSFER/%' then 'ATM/ATM FUND TRANSFER' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM-TRFR-TO%' then 'ATM/ATM FUND TRANSFER' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM-TRFR-FROM%' then 'ATM/ATM FUND TRANSFER' when (TXN_PARTICULARS) like 'TRF-ATM%' then 'ATM/ATM FUND TRANSFER' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATMWDL/%' then 'ATM/TTUMCUSTFILE' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM LOADING%' then 'ATM LOADING' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM LAODING%' then 'ATM LOADING' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM-BillPay/%' then 'ATM/ATM BILL PAY' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM-BILLPAY/%' then 'ATM/ATM BILL PAY' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM-BILL PAY/%' then 'ATM/ATM BILL PAY' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM-MobileRefill/%' then 'ATM/ATM MOBILEREFILL' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM-Mobile Refill/%' then 'ATM/ATM MOBILEREFILL' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM-MOBILE REFILL/%' then 'ATM/ATM MOBILEREFILL' when (TXN_PARTICULARS) like 'ATM%' and (TXN_PARTICULARS) like 'ATM-MOBILEREFILL/%' then 'ATM/ATM MOBILEREFILL' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like 'INB/IFT/%' and (TXN_PARTICULARS) like '%TPARTY%' then 'INB/TPARTY FUND TRANSFER' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like 'INB/IFT/%' and (TXN_PARTICULARS) like '%SELF%' then 'INB/SELF FUND TRANSFER' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like 'INB/IFT/%' then 'INB/FUND TRANSFER' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like 'INB/DD/%' then 'INB/DD / PO' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like 'INB/FIXED DEPOSIT/%' then 'INB/FD REQUEST' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like 'INB/RECURRING DEPOSIT/%' then 'INB/RD REQUEST' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like 'INB/CREDIT CARD/%' then 'INB/CC PAYMENT' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like 'INB/e-Wallet%' then 'INB/E-WALLET' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like 'VMT-ICON/%' then 'INB/VMT' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like 'INB/VISA%' then 'INB/VMT' when (TXN_PARTICULARS) like 'VMT-ICON/%' then 'INB/VMT' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like 'INB-BULK-UPLD/%' then 'INB/BULK UPLOAD' when (TXN_PARTICULARS) like 'ICONN-DR%' then 'INB/BULK UPLOAD' when (TXN_PARTICULARS) like 'ICONN-CR%' then 'INB/BULK UPLOAD' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like 'INB-BULK-UPLD-REV/%' then 'INB/INB/BULK UPLOAD REV' when (TXN_PARTICULARS) like 'ICONN-REV%' then 'INB/INB/BULK UPLOAD REV' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like 'INB/NEFT/%' then 'INB/NEFT' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like 'INB/RTGS/%' then 'INB/RTGS' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like '%MOBILE RECHARGE%' then 'INB/AXIS MOBILE RECHARGE' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like '%DTH RECHARGE%' then 'INB/AXIS DTH RECHARGE' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like '%AXIS DATA CARD RECHARGE%' then 'INB/AXIS DATA CARD RECHARGE' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like '%RECHARGE%' then 'INB/RECHARGE' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like '%BILLDESK%' and ((TXN_PARTICULARS) like '%BANK%' or (TXN_PARTICULARS) like '%AMERICAN%') then 'INB/BILLDESK BANK PAYMENTS' when (TXN_PARTICULARS) like 'INB%' and ((TXN_PARTICULARS) like '%BANK%' or (TXN_PARTICULARS) like '%CARD%') then 'INB/BANK PAYMENTS' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like '%RAILWAY%' then 'INB/IRCTC TRN' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like '%BILLDESK%' then 'INB/BILLDESK' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like '%BILLDESK%' then 'INB/BILLDESK' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like '%BILL DE%' then 'INB/BILLDESK' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like '%BILLDE%' then 'INB/BILLDESK' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like '%INSTANT MONEY%' then 'INB/IMT TRN' when (TXN_PARTICULARS) like 'INB%' and (TXN_PARTICULARS) like '%/INTERNET TAX PAYMENT/%' then 'INB/TAX PAYMENTS' when (TXN_PARTICULARS) like 'INB/ORM%' then 'OUTWARD REMITTANCE' when (TXN_PARTICULARS) like 'INB%' then 'INB/BILL / SHOPPING MALL TXN' when (TXN_PARTICULARS) like 'ICONNREF%' then 'INB/REFUND' when (TXN_PARTICULARS) like 'ICONNECT REFUND%' then 'INB/REFUND' when (TXN_PARTICULARS) like 'ICONNECT REV%' then 'INB/REFUND' when (TXN_PARTICULARS) like 'ICONN REF%' then 'INB/REFUND' when (TXN_PARTICULARS) like 'EURONET ICON/%' then 'INB/REFUND' when (TXN_PARTICULARS) like 'AXMOB/SELFFT%' then 'MOB/SELF FUND TRF' when (TXN_PARTICULARS) like 'MOB/SELFFT%' then 'MOB/SELF FUND TRF' when (TXN_PARTICULARS) like 'AXMOB/TPFT%' then 'MOB/TPFT FUND TRF' when (TXN_PARTICULARS) like 'MOB/TPFT%' then 'MOB/TPFT FUND TRF' when (TXN_PARTICULARS) like 'AXMOB/MBR%' then 'MOB/MOBILE RECHARGE' when (TXN_PARTICULARS) like 'AXMOB/DTHR%' then 'MOB/DTH RECHARGE' when (TXN_PARTICULARS) like 'AXMOB/DCR%' then 'MOB/DATA CARD RECHARGE' when (TXN_PARTICULARS) like 'MOB/MBR%' then 'MOB/MOBILE RECHARGE' when (TXN_PARTICULARS) like 'MOB/DTHR%' then 'MOB/DTH RECHARGE' when (TXN_PARTICULARS) like 'MOB/DCR%' then 'MOB/DATA CARD RECHARGE' when (TXN_PARTICULARS) like 'AXMOB/PULLFT%' then 'MOB/PULL FUND' when (TXN_PARTICULARS) like 'MOB/PULLFT%' then 'MOB/PULL FUND' when (TXN_PARTICULARS) like 'AXMOB/CCPMT%' then 'MOB/CC PAYMENT' when (TXN_PARTICULARS) like 'MOB/CCPMT%' then 'MOB/CC PAYMENT' when (TXN_PARTICULARS) like 'MOB/RELOAD/%' then 'MOB/TCDC RELOAD' when (TXN_PARTICULARS) like 'MOB/%' and (TXN_PARTICULARS) like '%CARD%' then 'MOB/OB CC PAYMENT' when (TXN_PARTICULARS) like 'MOB/MBR%' then 'MOB/MOBILE RECHARGE' when (TXN_PARTICULARS) like 'MOB/%' then 'MOB/BILL PAY' when (TXN_PARTICULARS) like 'IMPS/PA%' then 'IMPS/PA' when (TXN_PARTICULARS) like 'IMPS/PM%' then 'IMPS/PM' when (TXN_PARTICULARS) like 'IMPS/PP%' then 'IMPS/PP' when (TXN_PARTICULARS) like 'IMPS/Declined%' then 'IMPS/DECLINED' when (TXN_PARTICULARS) like 'IMPS/DECLINED%' then 'IMPS/DECLINED' when (TXN_PARTICULARS) like 'IMPS/MRT%' then 'IMPS/MRT' when (TXN_PARTICULARS) like 'IMPS/PUL%' then 'IMPS/PUL' when (TXN_PARTICULARS) like 'IMPS-CHARGES%' then 'IMPS/CHARGES' when (TXN_PARTICULARS) like 'IMPS-CB%' then 'IMPS/CB' when (TXN_PARTICULARS) like 'IMPS/Unclaimed%' then 'IMPS/UNCLAIMED' when (TXN_PARTICULARS) like 'IMPS/UNCLAIMED%' then 'IMPS/UNCLAIMED' when (TXN_PARTICULARS) like 'IMPS/%' then 'IMPS/' when (TXN_PARTICULARS) like 'PUR/%' then 'PUR/OFFLINE PUR' when (TXN_PARTICULARS) like 'PUR /%' then 'PUR/OFFLINE PUR' when (TXN_PARTICULARS) like 'PUR %' then 'PUR/OFFLINE PUR' when (TXN_PARTICULARS) like 'PUR REV%' then 'PUR/PUR REVERSAL' when (TXN_PARTICULARS) like 'PUR-REV/%' then 'PUR/PUR REVERSAL' when (TXN_PARTICULARS) like 'PUR-REV%' then 'PUR/PUR REVERSAL' when (TXN_PARTICULARS) like 'ESHOP/%' then 'ECOM/ONLINE PUR' when (TXN_PARTICULARS) like 'ECOM PUR/%' then 'ECOM/ONLINE PUR' when (TXN_PARTICULARS) like 'MERCHREFUND%' then 'ECOM/ONLINE PUR REV' when (TXN_PARTICULARS) like 'POS/%' then 'POS/OFFLINE PUR' when (TXN_PARTICULARS) like 'POS %' then 'POS/OFFLINE PUR' when (TXN_PARTICULARS) like 'POS-RVSL %' then 'POS/POS REVERSAL' when (TXN_PARTICULARS) like 'BY CASH DEPOSIT-BNA%' then 'BNA/CASH DEPOSIT' when (TXN_PARTICULARS) like 'BY CASH DEPOSIT BNA%' then 'BNA/CASH DEPOSIT' when (TXN_PARTICULARS) like 'BNA%' then 'BNA/CASH DEPOSIT' when (TXN_PARTICULARS) like 'NEFT/MB/%' then 'NEFT/MB' when (TXN_PARTICULARS) like 'NEFT/IB/%' then 'NEFT/IB' when (TXN_PARTICULARS) like 'NEFT/AXISP%' then 'NEFT/NEFT/AXISP' when (TXN_PARTICULARS) like 'NEFT/PT%' then 'NEFT/NEFT/PT/' when (TXN_PARTICULARS) like 'NEFT REJ/%' then 'NEFT/NEFT REJ' when (TXN_PARTICULARS) like 'NEFT CHRG REV%' then 'NEFT/CHARGES' when (TXN_PARTICULARS) like 'NEFT REV%' then 'NEFT/NEFT RET' when (TXN_PARTICULARS) like 'NEFT RETURN%' then 'NEFT/NEFT RET' when (TXN_PARTICULARS) like 'NEFT RTN%' then 'NEFT/NEFT RET' when (TXN_PARTICULARS) like 'NEFT NOT PROCESSED%' then 'NEFT/NEFT RET' when (TXN_PARTICULARS) like 'NEFT PROCESSED%' then 'NEFT' when (TXN_PARTICULARS) like 'NEFT/%' then 'NEFT/NEFT' when (TXN_PARTICULARS) like 'RTGS/%' then 'RTGS/RTGS' when (TXN_PARTICULARS) like 'RTGS REJECT%' then 'RTGS/RTGS REJECT' when (TXN_PARTICULARS) like 'RTGS %' then 'RTGS/RTGS' when (TXN_PARTICULARS) like 'BY CASH%' then 'BY CASH/CASH' when (TXN_PARTICULARS) like 'CASH TRA%' then 'BY CASH/CASH' when (TXN_PARTICULARS) like 'INTPD%' or (TXN_PARTICULARS) like 'IntPd%' then 'INTPD/INT' when (TXN_PARTICULARS) like '%INT.PD%' then 'INTPD/INT' when (TXN_PARTICULARS) like 'INT ON%' then 'INTPD/INT' when (TXN_PARTICULARS) like 'IOC REF%' then 'INTPD/INT' when (TXN_PARTICULARS) like 'IO FOR%' then 'INTPD/INT' when (TXN_PARTICULARS) like 'Consolidated Charges%' then 'CONS CHRG' when (TXN_PARTICULARS) like 'CONSOLIDATED CHARGES%' then 'CONS CHRG' when (TXN_PARTICULARS) like 'CONSOLIDATED DP CHARGES%' then 'CONS CHRG' when (TXN_PARTICULARS) like 'By Clg%' then 'BY CLG/BY CLG' when (TXN_PARTICULARS) like 'BY CLG%' then 'BY CLG/BY CLG' when (TXN_PARTICULARS) like 'BY CHQ%' then 'BY CLG/BY CLG' when (TXN_PARTICULARS) like 'FROM CHQ%' then 'BY CLG/BY CLG' when (TXN_PARTICULARS) like 'BY CHEQ%' then 'BY CLG/BY CLG' when (TXN_PARTICULARS) like 'BY CLEARING%' then 'BY CLG/BY CLG' when (TXN_PARTICULARS) like 'TO CLEARING%' then 'BY CLG/BY CLG' when (TXN_PARTICULARS) like 'INWARD C%'then 'BY CLG/BY CLG' when (TXN_PARTICULARS) like 'CHQ%'then 'BY CLG/BY CLG' when (TXN_PARTICULARS) like 'CLG-%' then 'BY CLG/BY CLG' when (TXN_PARTICULARS) like 'CLG %' then 'BY CLG/BY CLG' when (INSTR) like 'CHQ' then 'BY CLG/BY CLG' when (TXN_PARTICULARS) like '%Service%' then 'SERVICE CHARGE/SVTAX' when (TXN_PARTICULARS) like '%SERVICE%' then 'SERVICE CHARGE/SVTAX' when (TXN_PARTICULARS) like 'ECS CHRG%' then 'ECS/ECS CHRG' when (TXN_PARTICULARS) like 'ECS %' then 'ECS/ECS' when (TXN_PARTICULARS) like 'ECS/%' then 'ECS/ECS' when (TXN_PARTICULARS) like 'CECS/%' then 'ECS/ECS' when (TXN_PARTICULARS) like '%Dr Card%' then 'DRC ANNUALCHARG/CHARGE' when (TXN_PARTICULARS) like '%DR CARD%' then 'DRC ANNUALCHARG/CHARGE' when (TXN_PARTICULARS) like 'M-Banking%' then 'M-BANKING/TXN' when (TXN_PARTICULARS) like 'M-BANKING%' then 'M-BANKING/TXN' when (TXN_PARTICULARS) like 'INITIAL FUNDING%' then 'INITIAL FUNDING/TXN' when (TXN_PARTICULARS) like 'INETIAL FUNDING%' then 'INITIAL FUNDING/TXN' when (TXN_PARTICULARS) like 'INITIAL DEPOSIT%' then 'INITIAL FUNDING/TXN' when (TXN_PARTICULARS) like 'TIP/%' then 'TIP/POS' when (TXN_PARTICULARS) like 'TIPS/%' then 'TIP/POS' when (TXN_PARTICULARS) like 'AXISDIRE%' then 'AXISDIRECT/FT' when (TXN_PARTICULARS) like 'PPR EMI RVSL%' then 'PPR EMI/PPR EMI RVSL' when (TXN_PARTICULARS) like 'PPREMI%' then 'PPREMI/' when (TXN_PARTICULARS) like 'PPR EMI%' then 'PPREMI/' when (TXN_PARTICULARS) like 'PPR-EMI%' then 'PPREMI/' when (TXN_PARTICULARS) like 'PHR-EMI%' then 'PPREMI/' when (TXN_PARTICULARS) like 'PHREMI%' then 'PPREMI/' when (TXN_PARTICULARS) like 'AUREMI%' then 'PPREMI/' when (TXN_PARTICULARS) like 'AUR-EMI%' then 'PPREMI/' when (TXN_PARTICULARS) like 'PHR EMI%' then 'PPREMI/' when (TXN_PARTICULARS) like 'PHR_EMI%' then 'PPREMI/' when (TXN_PARTICULARS) like 'PH_EMI%' then 'PPREMI/' when (TXN_PARTICULARS) like 'PHR_PEMI%' then 'PPREMI/' when (TXN_PARTICULARS) like 'PHR PEMI%' then 'PPREMI/' when (TXN_PARTICULARS) like 'PPR_EMI%' then 'PPREMI/' when (TXN_PARTICULARS) like 'PPR EMI%' then 'PPREMI/' when (TXN_PARTICULARS) like 'AUR_EMI%' then 'PPREMI/' when (TXN_PARTICULARS) like 'ALR_EMI%' then 'PPREMI/' when (TXN_PARTICULARS) like 'LPR_EMI%' then 'PPREMI/' when (TXN_PARTICULARS) like 'UCR_EMI%' then 'PPREMI/' when (TXN_PARTICULARS) like 'CVR_EMI%' then 'PPREMI/' when (TXN_PARTICULARS) like 'HTR_EMI%' then 'PPREMI/' when (TXN_PARTICULARS) like 'PCR_EMI%' then 'PPREMI/' when (TXN_PARTICULARS) like 'LTR_EMI%' then 'PPREMI/' when (TXN_PARTICULARS) like 'PPB_EMI%' then 'PPREMI/'  when (TXN_PARTICULARS) like 'CASH-AXIS-RVSL/%' then 'CASH-AXIS-RVSL/ATM' when (TXN_PARTICULARS) like 'IRCTC Re%' then 'IRCTC REFUND/INB' when (TXN_PARTICULARS) like 'IRCTC RE%' then 'IRCTC REFUND/INB' when (TXN_PARTICULARS) like 'IFT/PT/E%' then 'IFT/PT/E/FT' when (TXN_PARTICULARS) like 'To Charges/NEFT/%' then 'TO CHARGES/NEFT/CHRG' when (TXN_PARTICULARS) like 'To Charges/NEFT%' then 'TO CHARGES/NEFT/CHRG' when (TXN_PARTICULARS) like 'TO CHARGES/NEFT%' then 'TO CHARGES/NEFT/CHRG' when (TXN_PARTICULARS) like 'CASH-RVS%' then 'CASH-RVSL-ATM/ATM' when (TXN_PARTICULARS) like 'BY SALAR%' then 'BY SALAR/NI' when (TXN_PARTICULARS) like 'BY SAL %' then 'BY SALAR/NI' when (TXN_PARTICULARS) like 'FOR SALAR%' then 'BY SALAR/NI' when (TXN_PARTICULARS) like 'NET SAL%' then 'BY SALAR/NI' when (TXN_PARTICULARS) like '%SALARY%' then 'BY SALAR/NI' when (TXN_PARTICULARS) like '% SALARY %' then 'BY SALAR/NI' when (TXN_PARTICULARS) like '%/SALARY%' then 'BY SALAR/NI' when (TXN_PARTICULARS) like '%SAL %' then 'BY SALAR/NI' when (TXN_PARTICULARS) like '%SAL-%' then 'BY SALAR/NI'  when (TXN_PARTICULARS) like 'FOR DD%' then 'BRN/DDPO' when (TXN_PARTICULARS) like 'TO DD%' then 'BRN/DDPO' when (TXN_PARTICULARS) like 'TO PO%' then 'BRN/DDPO' when (TXN_PARTICULARS) like 'FOR PO%' then 'BRN/DDPO' when (TXN_PARTICULARS) like 'PO %' then 'BRN/DDPO' when (TXN_PARTICULARS) like 'DD %' then 'BRN/DDPO'  when (TXN_PARTICULARS) like '% PO %' then 'BRN/DDPO' when (TXN_PARTICULARS) like '% DD %' then 'BRN/DDPO'  when (TXN_PARTICULARS) like 'DD TRANSACTION CHARGES%' then 'BRN/DD TRANSACTION CHARGES' when (TXN_PARTICULARS) like 'PO CHRGS%' then 'BRN/DD TRANSACTION CHARGES' when (TXN_PARTICULARS) like 'DD CHRGS%' then 'BRN/DD TRANSACTION CHARGES' when (TXN_PARTICULARS) like 'DD REVALIDATION CHARGES%' then 'BRN/DD TRANSACTION CHARGES' when (TXN_PARTICULARS) like 'DD CHARGE%' then 'BRN/DD TRANSACTION CHARGES' when (TXN_PARTICULARS) like 'PO CHARGE%' then 'BRN/DD TRANSACTION CHARGES' when (TXN_PARTICULARS) like 'PO ISSUENCE CHRGS%' then 'BRN/DD TRANSACTION CHARGES' when (TXN_PARTICULARS) like 'PO ISSUANCE CHRGS%' then 'BRN/DD TRANSACTION CHARGES' when (TXN_PARTICULARS) like 'DD ISSUANCE CHRGS%' then 'BRN/DD TRANSACTION CHARGES' when (TXN_PARTICULARS) like 'REVAL PO CHRG%' then 'BRN/DD TRANSACTION CHARGES' when (TXN_PARTICULARS) like 'DD CANCELLATION CHRGES%' then 'BRN/DD TRANSACTION CHARGES' when (TXN_PARTICULARS) like 'DD/PO REVALIDATION CHARGE%' then 'BRN/DD TRANSACTION CHARGES' when (TXN_PARTICULARS) like 'REV CHGS/%' then 'BRN/DD TRANSACTION CHARGES' when (TXN_PARTICULARS) like 'REVALIDATION CHGS OF DD%' then 'BRN/DD TRANSACTION CHARGES'  when (TXN_PARTICULARS) like 'PO REVER%' then 'BRN/DD TRANSACTION REV' when (TXN_PARTICULARS) like 'DD REVER%' then 'BRN/DD TRANSACTION REV'  when (TXN_PARTICULARS) like 'PARTIALLY%' then 'BRN/LOAN DISBURSMENT' when (TXN_PARTICULARS) like 'LOAN DISB%' then 'BRN/LOAN DISBURSMENT' when (TXN_PARTICULARS) like '%CLOSURE PROCEEDS%' then 'BRN/ACCOUNT CLOSE' when (TXN_PARTICULARS) like '%MF%' then 'AUTO/MF' when (TXN_PARTICULARS) like '%MUTUAL FUND%' then 'AUTO/MF' when (TXN_PARTICULARS) like '%mutual fund%' then 'AUTO/MF' when (TXN_PARTICULARS) like '%WTAXPD%' then 'WTAXPD' when (TXN_PARTICULARS) like '%:WTAX.PD%' then 'WTAXPD' when (TXN_PARTICULARS) like '%NACH-DR%' then 'ECS/ECS' when (TXN_PARTICULARS) like '%NACH_DR%' then 'ECS/ECS' else '' end) as TRAN_SUB_TYPE_tag FROM [mydataset.F_TXN_JUL16]) a left join (select SUB_TAG_OLD, CHANNEL as new_CHANNEL, TAG as new_TAG, SUB_TAG as new_SUB_TAG from [mydataset.TRANSACTION_MASTER]) b on a.TRAN_SUB_TYPE_tag = b.SUB_TAG_OLD limit 7000000",
                            query: bqquery,
                            allowLargeResults: true,
                            useLegacySql: true,
                            destinationTable: {
                                //main append table
                                projectId: 'axis-bank',
                                datasetId: 'mydataset',
                                tableId: bqtable
                            },
                            'writeDisposition': "WRITE_APPEND"
                        }
                    }
                }
            }, function(err, response, body) {

                if (!err && response.statusCode == 200) {
                    console.log("#################### No Error #################### " + _accessToken);
                    console.log("######### body #### " + JSON.stringify(body));
                    var jobid = body.jobReference.jobId;
                     
                    console.log(" <<<<<<THIS IS THE BQ ROW ID:::::>> "+bqrowID);
                    connection.query('SELECT * FROM bqschedules WHERE id = ?', [bqrowID], function(err, data) {
                        if (err) {
                            console.log('#### ERROR #### ' + err)
                            var err = "ERROR while BQ EXECUTION-- " + err;
                            //utility.saveErrorLog(err);
                        } else {
                            /*if (data[0].bqjobId != 'null' || data[0].bqjobId != '') {*/
                            if (jobid != 'null' || jobid != '') {
                                console.log("###### UPDATE ##########")
                                utility.getJobStatus(jobid, bqprojectId, bqrowID, bq_schedules_row, file_name)
                                /*connection.query('UPDATE  bqschedules SET bqjobId = ? WHERE id = ?', [jobid, sid], function(err, queryResul) {
                                    if (err) {
                                        console.log("########## ERROR ########### " + err)
                                        var err = "ERROR while Updating in table bqschedules in MYSQL- " + error;
                                        //utility.saveErrorLog(err);
                                    } else {
                                        console.log("######## EXISTING JOB ID UPDATED ########")
                                        //bqutility.getJobStatus(jobid, insertQuery, bqprojectId, sid)
                                    }
                                })*/

                            } else {
                                console.log("######INSERT##########");
                                utility.getJobStatus(jobid, bqprojectId, bqrowID, bq_schedules_row, file_name)                                
                            }
                        }
                    });



                } else {
                    console.log("Error : " + JSON.stringify(response));
                    console.log("ERR " + JSON.stringify(err));
                    var err = "ERROR in BQ-- " + err + response;
                    //utility.saveErrorLog(err);
                }
            });
        });
        // } //else of queryResult1 function Ends
        // }); //Connection.Query Ends
        //try ends in below /
    } catch (ex) {
        console.log("### EXCEPTION ## " + ex);
        var err = "ERROR while Pushing Data to Bigquery " + ex;
        //utility.saveErrorLog(err);
    }

	} //function bquery_append ends

//********* BIGQUERY APPEND ENDS*********************

//********** get job status start *****************************
//exports.getJobStatus = function(bqjobId, insertQuery, bqprojectId, sid) {
exports.getJobStatus = function(bqjobId, bqprojectId, bqrowID, bq_schedules_row, file_name) {
    try {
        console.log("####### inside job status #############");
        //recursive(bqjobId, insertQuery, bqprojectId, sid);
        recursive(bqjobId, bqprojectId, bqrowID, bq_schedules_row, file_name);
    } catch (ex) {
        console.log("### EXCEPTION ## " + ex);
        var err = "ERROR while Pushing Data to Bigquery " + ex;
        //utility.saveErrorLog(err);
    }
}
//var recursive = function(bqjobId, insertQuery, bqprojectId, sid) {
var recursive = function(bqjobId, bqprojectId, bqrowID, bq_schedules_row, file_name) {
    try {
        var authClient = new google.auth.JWT(
            bq_config.email,
            bq_config.keyFile,
            null, ['https://www.googleapis.com/auth/bigquery']);

        var request2 = {
            projectId: bqprojectId,
            jobId: bqjobId,
            auth: authClient
        };

        var list1 = bigquery.jobs.get(request2, function(err, result) {
            if (err) {
                console.log("### Error In Listing 2 ########## " + err);
                /*ERROR LOG SAVE*/
                var err = "ERROR while Authenticating Google API, check internet connectivity and try again. Error- " + err;
                utility.saveErrorLog(err);
            } else {
                console.log(result);

                if (result.status.state == 'RUNNING' || result.status.state == 'PENDING') {
                    //setTimeout(recursive(bqjobId, insertQuery, bqprojectId, sid), 200000);
                    setTimeout(recursive(bqjobId, bqprojectId, bqrowID, bq_schedules_row, file_name), 2000);

                } else {
                    //bqutility.migrateBqtoGcs(bqjobId, insertQuery, bqprojectId, sid);
                    console.log(" ********** INSIDE ALL JOBS COMPLETED *********");
                   utility.gcs_deletefile(bqjobId, bqprojectId,bqrowID, bq_schedules_row, file_name);
                }
            }
        });
    } catch (ex) {
        console.log("### EXCEPTION ## " + ex+" ROWIDD:  "+bqrowID);
        var err = "ERROR while Pushing Data to Bigquery " + ex;
        //utility.saveErrorLog(err);
    }
}

exports.gcs_deletefile = function(bqjobId, bqprojectId,bqrowID, bq_schedules_row, file_name) {
    try {
        console.log(" ** GCS DELETE FILE CALLED ***");
        storage.remove('gs://dummy-upload/'+file_name, function(err, success) {

            if (err) {
                console.log(" ERROR in DELETING FILE: " + err);
            } else {
                console.log("***FILE DELETED****" + success);
                //Update Status to Done start
                    connection.query('UPDATE bquploadschedules SET status="done" WHERE id= ? ', bqrowID, function(err, _result) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(" ***** BQ SET STATUS TO DONE !!! *******");
                        }
                    })
                //Update Status to Done Ends

            }

        });
    } catch (ex) {
        console.log("### EXCEPTION ## " + ex+" ROW ID: "+bqrowID);
        var err = "ERROR in deleting GCS file " + ex+" ROW ID: "+bqrowID;
        //utility.saveErrorLog(err);
    }
}


//************* get job stattus ends ******************************
// ********* Big Query Append Ends **********
