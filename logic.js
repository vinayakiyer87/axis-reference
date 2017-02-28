var express = require('express');
var router = express.Router();
var fs = require('fs')
//var csv = require('fast-csv');
//var async = require('async');
//var parse = require('csv-parse');
var oracledb = require('oracledb');
var uid = require('uuid');
var googleAuth = require('google-oauth-jwt');
var google = require('googleapis');
//var bigquery = google.bigquery('v2');
var storage = google.storage('v1');
var bigquery = google.bigquery('v2');
var BigQuery = require('@google-cloud/bigquery');
//var gcloud = require('gcloud');
var gcs = require('@google-cloud/storage')({
    projectId: 'axis-bank',
    keyFilename: 'axisGA.pem',
    email: 'abhijeet-dev@axisbank-bigquery.iam.gserviceaccount.com'
});
var CloudStorage = require('cloud-storage');
var storage = new CloudStorage({
    accessId: 'abhijeet-dev@axisbank-bigquery.iam.gserviceaccount.com',
    privateKey: 'axisGA.pem'
});
var ods_config = require('../config/ods_config');
var ga_config = require('../config/ga_config');
var bq_config = require('../config/bq_config');
var logic_util = require('./logic');
var GAPI = require('gapitoken'),
    request = require('request'),
    fs = require('fs'),
    util = require('util');
var queue = require('queue');

/* GET listing. */
router.get('/', function(req, res, next) {
    console.log("logic called");
});

//Query Results timeout test
router.get('/queryCSV', function(req, res) {
    try {
        oracledb.getConnection({
            user: "system",
            password: "password",
            connectString: "localhost:1521/orcl"

        }, function(err, oraconnection) {
            if (err) {
                console.log("########## ERROR WHILE QUERYING FILES ############ " + err);
                //utility.sendError(err);
            } else {
                console.log("connection success")
                /*  var csvData = line.toString().split(",");*/
                oraconnection.execute(
                    //'select * from F_TXN_CA_SEP16',
                    'SELECT ACID, TO_CHAR(TRAN_DATE,'YYYY-MM-DD HH:MM:SS')  as TRAN_DATE, TRIM(TRAN_ID), TRIM(PART_TRAN_SRL_NUM), TRIM(TRAN_SUB_T        YPE), TRIM(PART_TRAN_TYPE), '"' || REPLACE(TRIM(TRAN_PARTICULAR),'"','""') || '"'  as txn_particulars,
    965 '"' || REPLACE(TRIM(TRAN_RMKS),'"','""') || '"'  as txn_remarks,
    966 TRIM(INSTRMNT_NUM) as INSTR,
    967 '"' || REPLACE(TRIM(TRAN_RMKS_2),'"','""') || '"' as TXN_REMARKS_2,
    968 TRIM(RCRE_USER_ID) as RCRE_USER_ID,
    969 TRIM(TRAN_TYPE) as tran_type,
    970 TRIM(TRAN_AMT) as TRAN_AMOUNT,
    971 TRIM(SOL_ID_INIT) as SOL_ID_INIT,
    972 TRIM(SOL_ID_ACC) as Sol_Id_Acc
    973 from ODS_TRAN_DATA_CURR_DAY WHERE TRAN_DATE=TO_DATE('2017-02-27','YYYY-MM-DD')',

                    function(err, result) {
                        if (err) {
                            console.error("ERROR :" + err);

                        } else {
                            //console.log(result.rows.length+1);
                            //var parsed_res = JSON.parse(result.rows);

                            //console.log("PARSED Results: "+JSON.stringify(result.rows));
                            //write file start .
                            console.log("results: " + JSON.stringify(result.rows.length));
                            var output = result.rows;
                            output = output.map(function(e) {
                                return JSON.stringify(e);
                            });

                            var res = "";
                            console.log(" OUTPUT length:  " + output.length);
                            var start_index = 1;
                            for (i = 0; i < output.length; i++) {
                                //res += output[i].concat('\n');
                                res += output[i].replace(/\"/g, "").replace(/\[/g, "").replace(/\]/g, "").concat('\n');

                            }
                            res = res.toString();
                            // ********************write to csv starts******************************************************
                            console.log(res);
                            fs.writeFile('csv-data/' + '1.csv', res, 'utf8', function(err) {
                                if (err) {
                                    console.log('Some error occured - ' + err);

                                } else {
                                    console.log('It\'s saved!' + '.csv');
                                }
                            })
                            //  recursiveWrite(res,start_index);
                            //***********************write file ends**********************************************************           
                        }

                    });
                /* callback();      */

            }
        });
    } catch (ex) {
        console.log("Exception : " + ex);
    }
});

router.get('/csv_append_test', function(req, res, next) {

    //read from file 
    fs.createReadStream('./csv-data/2.csv')
        .pipe(csv())
        .on('data', function(data) {
            console.log(" THIS IS DATA :" + data);


            // fs append starts
            fs.appendFile('./csv-data/1.csv', data, function(err) {
                if (err) {
                    console.log('Some error occured - ' + err);

                } else {
                    console.log('It\'s saved!' + '.csv');
                }
            });
            // fs append ends

        })
        .on('end', function(data) {
            console.log(" *****FILE READ SUCCESSFULLY ***");
            //
            console.log('READ FILE COMPLETE' + JSON.stringify(data) + '.csv');

        });
});

//fs append file ends


router.get('/recurs_test', function(req, res, next) {
    try {
        oracledb.getConnection({
            user: "system",
            password: "password",
            connectString: "localhost:1521/orcl"


        }, function(err, oraconnection) {
            if (err) {
                console.log("########## ERROR WHILE QUERYING FILES ############ " + err);
                //utility.sendError(err);
            } else {
                console.log("connection success")
                /*  var csvData = line.toString().split(",");*/
                oraconnection.execute(
                    'select * from F_TXN_CA_SEP16',
                    function(err, result) {
                        if (err) {
                            console.error("ERROR :" + err);

                        } else {
                            //console.log(result.rows.length+1);
                            //var parsed_res = JSON.parse(result.rows);

                            //console.log("PARSED Results: "+JSON.stringify(result.rows));
                            //write file start .
                            //console.log("results: "+JSON.stringify(result));
                            var output = result.rows;
                            output = output.map(function(e) {
                                return JSON.stringify(e);
                            });


                            //    console.log("OUTPUT length "+output.length+"  OUTPUT: "+output);                                    
                            // var start_index =0;
                            var _i = 0;
                            var max_res_length = 10
                            _data = output;
                            // ********************write to csv starts******************************************************

                            recursiveWrite(_i, uid, _data, max_res_length);
                            /* fs.writeFile('csv-data/'+'1.csv', res, 'utf8', function(err) {
                                 if (err) {
                                     console.log('Some error occured - ' + err);
                                     
                                 } else {
                                     console.log('It\'s saved!' + '.csv');
                                 }
                             })*/
                            //  recursiveWrite(res,start_index);
                            //***********************write file ends**********************************************************                 
                        }

                    });
                /* callback();      */

            }
        });
    } catch (ex) {
        console.log("Exception : " + ex);
    }
})


function recursiveWrite(_i, uid, _data, max_res_length) {
    console.log(" I AM INSIDE recursiveWrite FUNCTION *");
    var res = "";
    for (i = _i; i < max_res_length; i++) {
        //res += output[i].concat('\n');       
        console.log("DATA RECURS:    " + _data[i]);
        if (_data[i] == undefined) {
            _data[i] = 0;
        }
        res += _data[i].replace(/\"/g, "").replace(/\[/g, "").replace(/\]/g, "").concat('\n');

    }
    res = res.toString();
    //console.log("THIS IS UUID "+uid.v1()+" This is res data: "+res);
    // uid = uid();
    var _data1 = res;

    fs.writeFile('csv-data/' + _i + '-' + uid + '.csv', _data1, 'utf8', function(err) {
        if (err) {
            console.log('Some error occured - ' + err);

        } else {
            console.log('It\'s saved!' + 'csv-data/' + _i + '-' + uid + '.csv');
        }
    })
    console.log("THIS IS max_res_length: " + max_res_length);
    max_res_length = max_res_length + 10;
    _i = _i + 10;
    uid = uid + _i;
    recursiveWrite1(_i, uid, _data, max_res_length);
}

function recursiveWrite1(_i, uid, _data, max_res_length) {
    console.log(" I AM INSIDE recursiveWrite1 FUNCTION *");
    var res = "";
    for (i = _i; i < max_res_length; i++) {
        //res += output[i].concat('\n');

        res += _data[i].replace(/\"/g, "").replace(/\[/g, "").replace(/\]/g, "").concat('\n');

    }
    res = res.toString();
    var _data1 = res;
    console.log("THIS IS NEW  _i " + _i + " THIS IS max_res_length  " + max_res_length);

    fs.writeFile('csv-data/' + _i + '-' + uid + '.csv', _data1, 'utf8', function(err) {
        if (err) {
            console.log('Some error occured - ' + err);

        } else {
            console.log('It\'s saved!2' + 'csv-data/' + _i + '-' + uid + '.csv');
        }
    })
    console.log("THIS IS max_res_length 2: " + max_res_length);
    max_res_length = max_res_length + 10;
    _i = _i + 10;
    uid = uid + _i;
    recursiveWrite(_i, uid, _data, max_res_length);
}

// **WORKING** READ CSV from GCS and append to  Bigquery table
router.get('/gcs_bqpush', function(req, res, next) {
    console.log(" ****INSIDE GCS PUSH ****");
    //console.log("########### BIG QUERY EXPORT ################");

    var keypath = 'axisGA.pem';
    //########## GA AUTHENTICATE ###################
    var _accessToken;

    console.log("****** GOOGLE AUTHENTICATION EXECUTED *********");

    // AUTHENTICATE WITH GOOGLE APIS CONSOLE. 
    googleAuth.authenticate({
        email: 'abhijeet-dev@axisbank-bigquery.iam.gserviceaccount.com',
        iss: 'abhijeet-dev@axisbank-bigquery.iam.gserviceaccount.com',
        keyFile: keypath,
        scopes: ['https://www.googleapis.com/auth/bigquery https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/cloud-platform.read-only']
    }, function(err, token) {
        if (err) {
            console.log("#### Error while Google Auth ##### " + err);
            /*ERROR LOG SAVE*/
            var err = "ERROR while Authenticating Google API, check internet connectivity and try again. Error- " + err;
        } else {
            console.log(" ACCESS TOKEN :  " + token);
            //cb(_accessToken);
            var tableId = 'test101';
            var bucketName = 'dummy-upload';
            var fileName = 'fed_sample123.csv.gz';
            var projectId = 'axis-bank';
            importFileFromGCS(token, tableId, bucketName, fileName, projectId);

        }
    });

})

function importFileFromGCS(token, tableId, bucketName, fileName, projectId) {
    console.log(" **** INSIDE importFileFromGCS **** ");
    /********************************************/

    // Instantiates clients
    var bigquery = BigQuery({
        projectId: projectId
    });
    var storage = gcloud.storage({
        keyFilename: 'axisGA.pem',
        projectId: 'axis-bank'
    });

    // References an existing dataset, e.g. "my_dataset"
    const dataset = bigquery.dataset('mydataset');
    // References an existing dataset, e.g. "my_dataset"
    const table = dataset.table(tableId);
    // References an existing bucket, e.g. "my-bucket"
    const bucket = storage.bucket(bucketName);
    // References an existing file, e.g. "file.txt"
    const file = bucket.file(fileName);

    var job;

    // Imports data from a GCS file into a table
    return table.import(file)
        .then((results) => {
            job = results[0];
            console.log("JOB:  " + JSON.stringify(job));
            console.log(`Job ${job.id} started.`);
            return job.promise();
        })
        .then((results) => {
            console.log(`Job ${job.id} completed.`);
            console.log(" COMPLETED JOBS:  " + JSON.stringify(results));
            return results;
        });



    /***************************  ****************/
}
// READ CSV from GCS and append to Bigquery table END


// WORKING PUSH TO GCS & CREATE BQ TABLE STARTS

//On Local Machine run this on 
router.get('/create_bqtbl', function(req, res, next) {
    console.log(" Create bq table called **");
    //need to add the below CLI to Spawn and check
    //bq mk --external_table_definition=one:string,name:string,num:string,four:string,five:string@CSV=gs://dummy-upload/mycsv.csv mydataset.fed_sample

    const exec = require('child_process').exec;
    exec('bq mk --external_table_definition=T66405605:string,date:string,S85418571:string,2937:string,I:string,D:string,ABAD FOOD SERVICES:string@CSV=gs://dummy-upload/fed_sample123.csv mydataset.fed_sample123', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);

    });
})
//WORKING PUSH TO GCS & CREATE BQ TABLE ENDS

// create tble api test NO GO ( NEED TO TEST THIS ON SERVER FOR RIGHT AUTH)
router.get('/cr_tbl', function(req, res, next) {
    console.log(" Create bq table called **");
    //need to add the below CLI to Spawn and check
    //bq mk --external_table_definition=one:string,name:string,num:string,four:string,five:string@CSV=gs://dummy-upload/mycsv.csv mydataset.fed_sample
    var bq = require('bigquery')
    var keypath = 'axisGA.pem';
    googleAuth.authenticate({
        email: 'abhijeet-dev@axisbank-bigquery.iam.gserviceaccount.com',
        iss: 'abhijeet-dev@axisbank-bigquery.iam.gserviceaccount.com',
        keyFile: keypath,
        scopes: ['https://www.googleapis.com/auth/bigquery https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/cloud-platform.read-only']
    }, function(err, token) {
        if (err) {
            console.log("#### Error while Google Auth ##### " + err);
            /*ERROR LOG SAVE*/
            var err = "ERROR while Authenticating Google API, check internet connectivity and try again. Error- " + err;
        } else {
            console.log(" ACCESS TOKEN :  " + token);


            /*var projectId = 'axis-bank';*/
            console.log(" INSIDE CREATE TABLE **");
            bq.job.iss.query('axis-bank', 'select count(*) from publicdata:samples.wikipedia', function(e, r, d) {
                if (e) {
                    console.log("ERROR: " + e)
                } else {
                    console.log(JSON.stringify(d));
                }
            });

        }
    });

})

//create tble api no go ( NEED TO TEST THIS ON SERVER FOR RIGHT AUTH)


// ***************** Tag Logic Start *********************** 
router.get('/tag_logic', function(req, res, next) {
    console.log(" ***** TAG LOGIC CALLED *******");

    var rule = 'test';
    logic_util.push(rule, function(data) {
        console.log("################### CSV GENERATED SUCCESSFULLY ##################" + data);
    });

}) //router get tag_logic ends

//***********************************GET BQ TOKEN START *******************************************//

exports.getbgToken1 = function(key, cb) {
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
                //console.log("Access Token : " + token);
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

//************************************* push starts *******************************

exports.push1 = function(rule, cb) {

    try {
        console.log("******BQ PUSH BEFORE redirect CALLLED**00");
        //res.redirect('/bqscheduler');
        console.log("########### STARTED BIG QUERY EXECUTION ############" /*+ JSON.stringify(req.body)*/ );
        /*connection.query('SELECT * FROM bqschedules WHERE id= ?', [rule.name], function(err, queryResult1) {
            if (err) {
                console.log("############ Error in Cron :" + err)
            } else {*/

        /*console.log("THIS IS THE RESULT OF RULE:  " + JSON.stringify(queryResult1));
        console.log("queryResult1 QUERY: " + queryResult1[0].big_query);*/

        //var bqquery = queryResult1[0].big_query;
        var bqquery = 'SELECT * FROM [axis-bank:mydataset.test111]';
        //var insertQuery = queryResult1[0].insert_query;
        //var bqprojectId = queryResult1[0].project;
        var bqprojectId = 'axis-bank';
        /*var sid = bq_rowID;
        global.bq_rowID = sid;*/
        global._failcountBQ = 1;
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
        logic_util.getbgToken1(keypath, function(_accessToken) {

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
                                projectId: 'axis-bank',
                                datasetId: 'mydataset',
                                tableId: 'dummy_tag'
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
                    var sid = 1;
                    connection.query('SELECT * FROM bqschedules WHERE id = ?', [sid], function(err, data) {
                        if (err) {
                            console.log('#### ERROR #### ' + err)
                            var err = "ERROR while BQ EXECUTION-- " + err;
                            //utility.saveErrorLog(err);
                        } else {
                            /*if (data[0].bqjobId != 'null' || data[0].bqjobId != '') {*/
                            if (jobid != 'null' || jobid != '') {
                                console.log("###### UPDATE ##########")
                                logic_util.getJobStatus1(jobid, bqprojectId, sid)
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
                                /**/
                            } else {
                                console.log("######INSERT##########");
                                logic_util.getJobStatus1(jobid, bqprojectId, sid)
                                /* connection.query('UPDATE  bqschedules SET  bqjobId= ? WHERE id = ?', [jobid, sid], function(err, queryResul) {
                                     if (err) {
                                         console.log("########## ERROR ########### " + err)
                                         var err = "ERROR in MYSQl bqschedules -- " + error;
                                         utility.saveErrorLog(err);
                                     } else {
                                         console.log("######## NEW JOB ID UPDATED ########")
                                         //bqutility.getJobStatus(jobid, insertQuery, bqprojectId, sid)
                                     }
                                 })*/
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
        var err = "ERROR while GCS push ERROR--- " + error;
        //utility.saveErrorLog(err);
    }

} //push1 ends
//******* BQ CRON FUNCTION END
//************************ push 1 ends **********************

//********** get job status start *****************************
//exports.getJobStatus = function(bqjobId, insertQuery, bqprojectId, sid) {
exports.getJobStatus1 = function(bqjobId, bqprojectId) {
    console.log("####### inside job status #############");
    //recursive(bqjobId, insertQuery, bqprojectId, sid);
    recursive(bqjobId, bqprojectId);
}
//var recursive = function(bqjobId, insertQuery, bqprojectId, sid) {
var recursive = function(bqjobId, bqprojectId) {

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
                setTimeout(recursive(bqjobId, bqprojectId), 2000);

            } else {
                //bqutility.migrateBqtoGcs(bqjobId, insertQuery, bqprojectId, sid);
                console.log(" ***** INSIDE ELESE migrateBqtoGcs ******");
                //logic_util.migrateBqtoGcs(bqjobId, bqprojectId);
            }
        }
    });
}
//************* get job stattus ends ******************************


//****************************************** Tag Logic Ends ********************************************

//***************** GZ FILE PUSH TEST START COMPLETELY WORKING**************************//
router.get('/csv_GCS', function(req, res) {
    console.log(" ** INSIDE GCS PUSH***")
    var bucket = gcs.bucket('dummy-upload');
    bucket.upload('./csv-data/1.csv', function(err, file) {
        if (!err) {
            // "CSV" is now in your bucket. 
            console.log(" *** PUSHED DATA TO GCS ***");
        } else {
            console.log("ERR GCS: " + err);
        }
    });
})
//***************** GZ FILE PUSH TEST ENDS ***************************//

//*************************** Oracledb query without limit **********************
router.get('/query_nolimit', function(req, res, next) {


    var myoffset = 0; // number of rows to skip
    var mymaxnumrows = 15000000; // number of rows to fetch

    // Properties are applicable to all connections and SQL executions.
    // They can also be set or overridden at the individual execute() call level
    //
    // This script sets maxRows in the execute() call but it could be set here instead
    // oracledb.maxRows = 150;   // Note the default value is 100 and EMPLOYEES has 107 rows

    oracledb.getConnection({
            user: "system",
            password: "password",
            connectString: "localhost:1521/orcl"
        },
        function(err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }
            //sql query here
            var sql = "select * from BQ_UPLOAD1";
            if (connection.oracleServerVersion >= 1201000000) {
                // 12c row-limiting syntax
                sql += " OFFSET :offset ROWS FETCH NEXT :maxnumrows ROWS ONLY";
            } else {
                // Pre-12c syntax [could also customize the original query and use row_number()]
                sql = "SELECT * FROM (SELECT A.*, ROWNUM AS MY_RNUM FROM" +
                    "(" + sql + ") A " +
                    "WHERE ROWNUM <= :maxnumrows + :offset) WHERE MY_RNUM > :offset";
            }

            connection.execute(
                sql, {
                    offset: myoffset,
                    maxnumrows: mymaxnumrows
                }, {
                    maxRows: 8000000
                },
                function(err, result) {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log("Executed: " + sql);
                        console.log("Number of rows returned: " + result.rows.length);
                        console.log("RESULT ROWS:  " + result.rows);

                        //
                        var output = result.rows;
                        output = output.map(function(e) {
                            return JSON.stringify(e);
                        });

                        var res = "";
                        console.log(" OUTPUT length:  " + output.length);
                        var start_index = 1;
                        for (i = 0; i < output.length; i++) {
                            //res += output[i].concat('\n');
                            res += output[i].replace(/\"/g, "").replace(/\[/g, "").replace(/\]/g, "").concat('\n');

                        }
                        res = res.toString();
                        // ********************write to csv starts******************************************************
                        console.log(res);
                        fs.writeFile('csv-data/' + '1.csv', res, 'utf8', function(err) {
                            if (err) {
                                console.log('Some error occured - ' + err);

                            } else {
                                console.log('It\'s saved!' + '.csv');
                            }
                        })
                        //  recursiveWrite(res,start_index);
                        //***********************write file ends********************************************************** 
                        //

                    }
                });
        });

})

//******************** Oracledb query without limit ends ************************

//****** Oracledb Perfectly WOrking with Huge results starts ***
router.get('/query', function(req, res, next) {
    console.log(" ** INSIDE ORACLEDB QUERY **");

    oracledb.getConnection({
            user: "system",
            password: "password",
            connectString: "localhost:1521/orcl"
        },
        function(err, connection) {
            if (err) throw err;

            connection.execute(
                //'select * from BQ_UPLOAD1',
                'select * from accgad1', {}, //no binds
                {
                    resultSet: true,
                    prefetchRows: 1000
                },
                function(err, results) {
                    var rowsProcessed = 0;
                    var startTime;
                    var val = "";
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
                                console.log(" THIS IS THE VAL: " + val);

                                fs.appendFile('csv-data/' + '1.csv', val, 'utf8', function(err) {
                                    if (err) {
                                        console.log('Some error occured - ' + err);

                                    } else {
                                        console.log('It\'s saved!' + '.csv');
                                    }
                                })
                                /* rows.forEach(function(row) {
                                     
                                     
                                     //do work on the row here        
                                    //console.log("THIS ARE ROWS: "+row); 
                                    console.log("ROW "+row ); 
                                    val+=row;
                                  // val += row.replace(/\"/g, "").replace(/\[/g, "").replace(/\]/g, "").concat('\n');
                                                     
                                 });*/

                                processResultSet(); //try to get more rows from the result set                            
                                return; //exit recursive function prior to closing result set
                            }
                            //console.log("THESE ARE VALUES2222: "+values);
                            console.log('Finish processing ' + rowsProcessed + ' rows');
                            console.log('Total time (in seconds):', ((Date.now() - startTime) / 1000));

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


})

//****** Oracledb Perfectly WOrking with Huge results ENDSS ***

//******************** CSV TO GZ STARTS ************************

router.get('/gz', function(req, res, next) {
    console.log("****WITHIN GZ****");
    const execFile = require('child_process').execFile;

    const child = execFile('gzip', ['1.csv'], (error, stdout, stderr) => {
        if (error) {
            throw error;
        } else {
            console.log(" DONE: " + stdout);
        }
    });

});

//******************** CSV TO GZ ENDS ****************************

//******NPM QUEUE TEST**************************
router.get('/queue_test', function(req, res, next) {
    console.log(" **** queue test executed");


    var q = queue();
    var results = [];

    // add jobs using the Array API 

    q.push(function(cb) {
        results.push('two');
        cb();
    });

    q.push(
        function(cb) {
            results.push('four');
            cb();
        },
        function(cb) {
            results.push('five');
            cb();
        }
    );

    q.unshift(function(cb) {
        results.push('one');
        cb();
    });

    q.splice(2, 0, function(cb) {
        results.push('three');
        cb();
    });

    // use the timeout feature to deal with jobs that 
    // take too long or forget to execute a callback 

    q.timeout = 100;

    q.on('timeout', function(next, job) {
        console.log('job timed out:', job.toString().replace(/\n/g, ''));
        next();
    });

    q.push(function(cb) {
        setTimeout(function() {
            console.log('slow job finished');
            cb();
        }, 5000);
    });

    q.push(function(cb) {
        console.log('forgot to execute callback');
    });

    // get notified when jobs complete 

    q.on('success', function(result, job) {
        console.log('job finished processing:', job.toString().replace(/\n/g, ''));
    });

    // begin processing, get notified on end / failure 

    q.start(function(err) {
        console.log('all done:', results);
    });
})

//*****NPM QUEUE TEST ENDS ***********************

//**********************DELETE ALL CSV FILES WITHIN BUCKET****************
router.get('/delobj_bucket', function(req, res, next) {
    console.log(" ***** delete files from bucket start ******* ");
    storage.remove('gs://dummy-upload/mycsv.csv', function(err, success) {
        if (err) {
            console.log("THIS IS ERR: " + JSON.stringify(err));
            if (err == "<?xml version='1.0' encoding='UTF-8'?><Error><Code>NoSuchKey</Code><Message>The specified key does not exist.</Message></Error>") {
                var _flag = 1;
            } else {
                console.log("ERROR: " + JSON.stringify(err));
            }
        } else {
            console.log("DONE" + success);

        }

    });

});

//*********************DELETE ALL CSV WITHIN BUCKET ENDSS ****************

//*************** AUTOMATION STARTS HARDCODED VALUES******************************************************************
router.get('/automate', function(req, res, next) {
    console.log(" ***** AUTOMATION HARDCODED STARTS ******* ");
    //some values in the constructor
    ods_query();

});

function ods_query() {
    console.log("**** ods_query CALLED *****");
    try {
        oracledb.getConnection({
               /* user: "system",
                password: "password",
                connectString: "localhost:1521/orcl"*/

                user: "big_query",
                password: "axis#1234",
                connectString: "10.9.112.237:44106/AXBIGQ"
            },
            function(err, connection) {
                try {
                    if (err) {
                        console.log("ERROR IN ODS CONNECTION: " + err);
                    };

                    connection.execute(
                        //'select * from BQ_UPLOAD1',
                        'SELECT ACID, TO_CHAR(TRAN_DATE,'YYYY-MM-DD HH:MM:SS')  as TRAN_DATE, TRIM(TRAN_ID), TRIM(PART_TRAN_SRL_NUM), TRIM(TRAN_SUB_TYPE), TRIM(PART_TRAN_TYPE), '"' || REPLACE(TRIM(TRAN_PARTICULAR),'"','""') || '"'  as txn_particulars, '"' || REPLACE(TRIM(TRAN_RMKS),'"','""') || '"'  as txn_remarks, TRIM(INSTRMNT_NUM) as INSTR, '"' || REPLACE(TRIM(TRAN_RMKS_2),'"','""') || '"' as TXN_REMARKS_2, TRIM(RCRE_USER_ID) as RCRE_USER_ID, TRIM(TRAN_TYPE) as tran_type, TRIM(TRAN_AMT) as TRAN_AMOUNT, TRIM(SOL_ID_INIT) as SOL_ID_INIT, TRIM(SOL_ID_ACC) as Sol_Id_Acc from ODS_TRAN_DATA_CURR_DAY WHERE TRAN_DATE=TO_DATE('2017-02-27','YYYY-MM-DD');', {}, //no binds
                        {
                            resultSet: true,
                            prefetchRows: 1000
                        },
                        function(err, results) {
                            try {
                                var rowsProcessed = 0;
                                var startTime;
                                var val = "";
                                if (err) {
                                    console.log("Err: " + err);
                                }

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

                                            fs.appendFile('csv-data/' + '1.csv', val, 'utf8', function(err) {
                                                if (err) {
                                                    console.log('Some error occured - ' + err);

                                                } else {
                                                    console.log('It\'s saved!' + '.csv');
                                                }
                                            })
                                            /* rows.forEach(function(row) {
                                                 
                                                 
                                                 //do work on the row here        
                                                //console.log("THIS ARE ROWS: "+row); 
                                                console.log("ROW "+row ); 
                                                val+=row;
                                              // val += row.replace(/\"/g, "").replace(/\[/g, "").replace(/\]/g, "").concat('\n');
                                                                 
                                             });*/

                                            processResultSet(); //try to get more rows from the result set                            
                                            return; //exit recursive function prior to closing result set
                                        }
                                        //console.log("THESE ARE VALUES2222: "+values);
                                        console.log('Finish processing ' + rowsProcessed + ' rows');
                                        console.log('Total time (in seconds):', ((Date.now() - startTime) / 1000));
                                        console.log(" #### CSV COMPLETELY GENERATED #######");
                                        var filename = './csv-data/1.csv';
                                        // call the rest of ./csv-data/1.csvthe code and have it execute after 10 seconds
                                        setTimeout(function() {
                                            convertGZ(filename);
                                        }, 10000);

                                        results.resultSet.close(function(err) {
                                            if (err) console.error(err.message);

                                            connection.release(function(err) {
                                                if (err) console.error(err.message);
                                            });
                                        });
                                    });

                                }

                                processResultSet();
                                /*try ends belo*/
                            } catch (ex) {
                                console.log(" ### Exception In ODS QUERY : " + ex);
                            }
                        } ///function(err, results) ENDS




                    );
                    /*TRY ENDS below*/
                } catch (ex) {
                    console.log(" ### Exception In ODS QUERY : " + ex);
                }
            } // function(err, connection) {

        );

    } catch (ex) {
        console.log(" ### Exception In ODS QUERY : " + ex);
    }

}

//convert to gz function start
function convertGZ(filename) {
    try {
        const execFile = require('child_process').execFile;
        console.log("FNAMEEEE :  " + filename);
        const child = execFile('gzip', ['-f', filename], (error, stdout, stderr) => {
            if (error) {
                throw error;
            } else {
                console.log(" GZIP DONE: " + filename + stderr);
                filename = filename + '.gz';
                gz_gcspush(filename);
            }
        });
    } catch (ex) {
        console.log(" ### Error while Gziping File: " + filename + " Err- " + ex);
    }
}
//convert to gz function END

//***gz push to gcs start
function gz_gcspush(filename) {
    try {
        console.log(" ** INSIDE GCS PUSH***")
        var bucket = gcs.bucket('dummy-upload');
        bucket.upload(filename, function(err, file) {
            if (!err) {
                // "CSV" is now in your bucket. 
                console.log(" *** PUSHED DATA TO GCS ***" + file);
                bquery_append(filename);

            } else {
                console.log("Error while Pushing file to GCS: " + err);
            }
        });
    } catch (ex) {
        console.log(" ### Error while Pushing file to GCS: " + file + " Err- " + ex);
    }
}

// *** gz push to gcs ends

// ***************** Big Query Append Starts ************
function bquery_append(filename) {
    try {
        console.log(" ** INSIDE BigQuery PUSH***");
        var rule = 'test';
        logic_util.push(rule, function(data) {
            console.log("################### CSV GENERATED SUCCESSFULLY ##################" + data);
        });

    } catch (ex) {
        console.log(" ### Error while Pushing Data to Bigquery " + ex);
    }
}

//***********************************GET BQ TOKEN START *******************************************//

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
                //console.log("Access Token : " + token);
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

//************************************* push starts *******************************

exports.push = function(rule, cb) {

    try {
        console.log("******BQ PUSH BEFORE redirect CALLLED**00");
        //res.redirect('/bqscheduler');
        console.log("########### STARTED BIG QUERY EXECUTION ############" /*+ JSON.stringify(req.body)*/ );
        /*connection.query('SELECT * FROM bqschedules WHERE id= ?', [rule.name], function(err, queryResult1) {
            if (err) {
                console.log("############ Error in Cron :" + err)
            } else {*/

        /*console.log("THIS IS THE RESULT OF RULE:  " + JSON.stringify(queryResult1));
        console.log("queryResult1 QUERY: " + queryResult1[0].big_query);*/

        //var bqquery = queryResult1[0].big_query;
        var bqquery = 'SELECT * FROM [axis-bank:mydataset.1_Feb]';
        //var insertQuery = queryResult1[0].insert_query;
        //var bqprojectId = queryResult1[0].project;
        var bqprojectId = 'axis-bank';
        /*var sid = bq_rowID;
        global.bq_rowID = sid;*/
        global._failcountBQ = 1;
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
        logic_util.getbgToken(keypath, function(_accessToken) {

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
                                tableId: 'dummy_tag'
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
                    var sid = 1;
                    connection.query('SELECT * FROM bqschedules WHERE id = ?', [sid], function(err, data) {
                        if (err) {
                            console.log('#### ERROR #### ' + err)
                            var err = "ERROR while BQ EXECUTION-- " + err;
                            //utility.saveErrorLog(err);
                        } else {
                            /*if (data[0].bqjobId != 'null' || data[0].bqjobId != '') {*/
                            if (jobid != 'null' || jobid != '') {
                                console.log("###### UPDATE ##########")
                                logic_util.getJobStatus(jobid, bqprojectId, sid)
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
                                logic_util.getJobStatus(jobid, bqprojectId, sid)
                                /* connection.query('UPDATE  bqschedules SET  bqjobId= ? WHERE id = ?', [jobid, sid], function(err, queryResul) {
                                     if (err) {
                                         console.log("########## ERROR ########### " + err)
                                         var err = "ERROR in MYSQl bqschedules -- " + error;
                                         utility.saveErrorLog(err);
                                     } else {
                                         console.log("######## NEW JOB ID UPDATED ########")
                                         //bqutility.getJobStatus(jobid, insertQuery, bqprojectId, sid)
                                     }
                                 })*/
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

} //push1 ends
//******* BQ CRON FUNCTION END
//************************ push 1 ends **********************

//********** get job status start *****************************
//exports.getJobStatus = function(bqjobId, insertQuery, bqprojectId, sid) {
exports.getJobStatus = function(bqjobId, bqprojectId) {
    try {
        console.log("####### inside job status #############");
        //recursive(bqjobId, insertQuery, bqprojectId, sid);
        recursive(bqjobId, bqprojectId);
    } catch (ex) {
        console.log("### EXCEPTION ## " + ex);
        var err = "ERROR while Pushing Data to Bigquery " + ex;
        //utility.saveErrorLog(err);
    }
}
//var recursive = function(bqjobId, insertQuery, bqprojectId, sid) {
var recursive = function(bqjobId, bqprojectId) {
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
                    setTimeout(recursive(bqjobId, bqprojectId), 2000);

                } else {
                    //bqutility.migrateBqtoGcs(bqjobId, insertQuery, bqprojectId, sid);
                    console.log(" ***** INSIDE ALL JOBS COMPLETED ******");
                    logic_util.gcs_deletefile(bqjobId, bqprojectId);
                }
            }
        });
    } catch (ex) {
        console.log("### EXCEPTION ## " + ex);
        var err = "ERROR while Pushing Data to Bigquery " + ex;
        //utility.saveErrorLog(err);
    }
}

exports.gcs_deletefile = function(bqjobId, bqprojectId, filename) {
    try {
        console.log(" ** GCS DELETE FILE CALLED ***");
        storage.remove('gs://dummy-upload/1.csv.gz', function(err, success) {

            if (err) {
                console.log(" ERROR in DELETING FILE: " + err);
            } else {
                console.log("***FILE DELETED****" + success);

            }

        });

    } catch (ex) {
        console.log("### EXCEPTION ## " + ex);
        var err = "ERROR in deleting GCS file " + ex;
        //utility.saveErrorLog(err);
    }

}


//************* get job stattus ends ******************************
// ********* Big Query Append Ends **********


//*************** AUTOMATION HARCODED VALUES ENDS ******************************************************************
module.exports = router;
