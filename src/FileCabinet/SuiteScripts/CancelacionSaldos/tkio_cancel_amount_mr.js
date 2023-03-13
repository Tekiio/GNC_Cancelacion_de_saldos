/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @param {record} record
 * @param {search} search
 * @param {runtime} runtime
 * @param {task} task
 * @param {config} config
 * @param {format} format
 */
define(['N/record', 'N/search', 'N/runtime', 'N/task', 'N/config', 'N/format', 'N/email', 'N/file', './moment'],
    function (record, search, runtime, task, config, format, email, file, moment) {


        const TRANSACTION_BODY = {};
        TRANSACTION_BODY.PROCESS = 'custbody_tkio_process_cs'
        TRANSACTION_BODY.TYPE = 'type';
        TRANSACTION_BODY.TYPE_CUSTOM_CS = 'custbodytype_transaction_cs';
        TRANSACTION_BODY.METHOD_PAYMENT = 'custbody_mx_payment_method';
        TRANSACTION_BODY.INTERNAL_ID = 'internalid';
        TRANSACTION_BODY.MAINLINE = 'mainline';
        TRANSACTION_BODY.TRANDATE = 'trandate';
        TRANSACTION_BODY.TRAN_NUMBER = 'transactionnumber';
        TRANSACTION_BODY.TRAN_ID = 'tranid';
        TRANSACTION_BODY.ENTITY = 'entity';
        TRANSACTION_BODY.AMOUNT = 'amount';
        TRANSACTION_BODY.SUBSIDIARY = 'subsidiary';
        TRANSACTION_BODY.AMOUNT_REMAINING = 'amountremaining';
        TRANSACTION_BODY.NAME = 'name';
        TRANSACTION_BODY.ACCOUNT = 'account';
        TRANSACTION_BODY.AR_ACCOUNT = 'aracct';
        TRANSACTION_BODY.CUSTOMER = 'customer';
        TRANSACTION_BODY.CLASS = 'class';
        TRANSACTION_BODY.LOCATION = 'location';
        TRANSACTION_BODY.CHANEL = 'cseg_efx_cstsg_cana';
        TRANSACTION_BODY.DEPARTMENT = 'department';
        TRANSACTION_BODY.INTER_COMPANY = 'csegefxintercompani';
        TRANSACTION_BODY.MEMO = 'memo';
        TRANSACTION_BODY.APPROVAL_STATUS = 'approvalstatus';
        TRANSACTION_BODY.IS_INACTIVE = 'isinactive';

        const TRANSACTION_LINE = {};
        TRANSACTION_LINE.LINE_ID = 'line';
        TRANSACTION_LINE.AMOUNT_DUE = 'due';
        TRANSACTION_LINE.AMOUNT = 'amount';
        TRANSACTION_LINE.ACCOUNT = 'account';
        TRANSACTION_LINE.CREDIT = 'credit';
        TRANSACTION_LINE.DEBIT = 'debit';
        TRANSACTION_LINE.ENTITY = 'entity';
        TRANSACTION_LINE.LINKED_TRANSACTION = 'custcol_linked_transactions';
        TRANSACTION_LINE.CLASSS = 'class';
        TRANSACTION_LINE.LOCATION = 'location';
        TRANSACTION_LINE.CHANEL = 'cseg_efx_cstsg_cana';
        TRANSACTION_LINE.MEMO = 'memo';
        TRANSACTION_LINE.DEPARTMENT = 'department';
        TRANSACTION_LINE.INTER_COMPANY = 'csegefxintercompani';
        TRANSACTION_LINE.APPLY_ID = 'apply';
        TRANSACTION_LINE.APPLY = 'apply';
        TRANSACTION_LINE.CREDIT_ID = 'credit';

        const ACCOUNT_COMBINATION = {};

        function getInputData() {
            try {

                var isGNC = (runtime.getCurrentScript().getParameter({ name: 'custscript_tkio_is_gnc_mr' }) === 'true' ? true : false);
                var lineToProcess = runtime.getCurrentScript().getParameter({ name: 'custscript_ss_lines' });
                var params = runtime.getCurrentScript().getParameter({ name: 'custscript_ss_params' });

                log.debug("lines to process: ", lineToProcess);
                log.debug("Parameters: ", params);
                log.debug("isGNC: ", isGNC);
                log.debug("isGNC: ", typeof isGNC);

                lineToProcess = JSON.parse(lineToProcess);
                params = JSON.parse(params);

                initializationConstantAccountCombination(isGNC)
                var jetranresults = {}; //searchExistedJE(lineToProcess);
                var accountConfigurations = GetConfigurations(params.subsidiary, isGNC);

                log.debug("accountConfigurations", accountConfigurations);
                var transactionsbycustomer = createJournalEntry(params, lineToProcess, accountConfigurations, jetranresults, isGNC);
                var newLineToProcess = [];
                for (var s in transactionsbycustomer) {
                    for (var i in transactionsbycustomer[s]) {
                        var transactionsCustomer = transactionsbycustomer[s][i];
                        for (var j in transactionsCustomer) {
                            newLineToProcess.push(transactionsCustomer[j]);
                        }
                    }
                }
                log.debug("newLineToProcess", newLineToProcess);
                return newLineToProcess;
            } catch (e) {
                log.error({ title: 'Error getInputData:', details: e });
            }
        }

        function map(context) {
            try {
                log.debug('map', context);
                log.debug('map value', context.value);
                var lineToProcess = JSON.parse(context.value);

                if (lineToProcess.je && !lineToProcess.errorname) {
                    var jeinfo = fieldLookUp = search.lookupFields({
                        type: search.Type.JOURNAL_ENTRY,
                        id: lineToProcess.je,
                        columns: ['tranid']
                    });
                    lineToProcess.tranidje = jeinfo['tranid'];
                }
                else {
                    lineToProcess.tranidje = '-';
                }

                if (lineToProcess[TRANSACTION_BODY.SUBSIDIARY]) {
                    var subinfo = fieldLookUp = search.lookupFields({
                        type: search.Type.SUBSIDIARY,
                        id: lineToProcess[TRANSACTION_BODY.SUBSIDIARY],
                        columns: ['name']
                    });
                    lineToProcess.subsidiaryname = subinfo['name'];
                }
                else {
                    lineToProcess.subsidiaryname = '-';
                }

                var trantype = lineToProcess.type;
                var recordType = '';
                if (trantype == 7 || trantype == "7") {
                    recordType = record.Type.INVOICE;
                }
                else if (trantype == 9 || trantype == "9") {
                    recordType = record.Type.CUSTOMER_PAYMENT;
                }
                else if (trantype == 11 || trantype == "11") {
                    recordType = record.Type.CREDIT_MEMO;
                }
                else if (trantype == 13 || trantype == "13") {
                    recordType = record.Type.VENDOR_BILL;
                }
                else if (trantype == 15 || trantype == "15") {
                    recordType = record.Type.VENDOR_CREDIT;
                }

                if (lineToProcess[TRANSACTION_BODY.NAME]) {
                    var subinfo = fieldLookUp = search.lookupFields({
                        type: recordType,
                        id: lineToProcess[TRANSACTION_BODY.INTERNAL_ID],
                        columns: ['entity']
                    });
                    log.debug("map subinfo", subinfo);
                    lineToProcess.customername = subinfo['entity'][0].text;
                }
                else {
                    lineToProcess.customername = '-';
                }

                var lineType = lineToProcess[TRANSACTION_BODY.TYPE];
                context.write({
                    key: lineToProcess[TRANSACTION_BODY.INTERNAL_ID],
                    value: lineToProcess
                });
            }
            catch (e) {
                log.error("map", e);
            }
        }

        function reduce(context) {
            var paymentid = 0;
            var recordType = 0;
            try {
                log.debug('reduce', context);
                log.debug('reduce value', context.values);

                var isGNC = (runtime.getCurrentScript().getParameter({ name: 'custscript_tkio_is_gnc_mr' }) === 'true' ? true : false);
                var params = runtime.getCurrentScript().getParameter({ name: 'custscript_ss_params' });
                log.debug('reduce params:', params);
                log.debug('reduce isGNC:', isGNC);
                log.debug('reduce isGNC:', typeof isGNC);
                params = JSON.parse(params);
                initializationConstantAccountCombination(isGNC);
                var accountConfigurations = GetConfigurations(params.subsidiary, isGNC)
                log.debug('reduce accountConfigurations: ', accountConfigurations);


                var lineToProcess = [];
                var je = 0;
                for (var i in context.values) {

                    var value = context.values[i];
                    value = JSON.parse(value);


                    je = (!je) ? value.je : 0;

                    var trantype = value.type;

                    if (trantype == 7 || trantype == "7") {
                        recordType = record.Type.INVOICE;
                    }
                    else if (trantype == 9 || trantype == "9") {
                        recordType = record.Type.CUSTOMER_PAYMENT;
                    }
                    else if (trantype == 11 || trantype == "11") {
                        recordType = record.Type.CREDIT_MEMO;
                    }
                    else if (trantype == 13 || trantype == "13") {
                        recordType = record.Type.VENDOR_BILL;
                    }
                    else if (trantype == 15 || trantype == "15") {
                        recordType = record.Type.VENDOR_CREDIT;
                    }
                    var transactiondata = search.lookupFields({
                        type: recordType,
                        id: value.internalid,
                        columns: ['tranid', 'trandate']
                    });

                    value.trandate = transactiondata['trandate'];
                    value.tranid = transactiondata['tranid'];
                    if (!isGNC) {
                        value.receiptents = accountConfigurations[value[TRANSACTION_BODY.SUBSIDIARY]][ACCOUNT_COMBINATION.RECEIPTENTS].split(",");
                    }
                    lineToProcess.push(value);
                }

                log.debug('reduce lineToProcess', lineToProcess);

                var jvId = lineToProcess[0].je;
                if (je) {
                    var idtransaction = CreateCustomerPayment(params, lineToProcess, accountConfigurations, je);
                    log.debug("reduce ID saved transaction", idtransaction);

                    var fieldLookUp = search.lookupFields({
                        type: recordType,
                        id: value.internalid,
                        columns: ['status', 'amountremaining']
                    });

                    if (fieldLookUp['status'][0].value == 'paidInFull') {
                        lineToProcess[0].processed = true;
                    }
                    else {
                        lineToProcess[0].processed = false;
                    }
                }

                context.write({
                    key: lineToProcess[0].je,
                    value: lineToProcess[0]
                });

            } catch (error) {
                log.error({
                    title: "Reduce error",
                    details: error
                });

                if (error.name != 'RCRD_DSNT_EXIST') {
                    lineToProcess[0].errorname = error.name;
                    lineToProcess[0].errormsg = error.message;
                    //deletelines(lineToProcess[0].je, lineToProcess[0].tranid);
                    lineToProcess[0].tranidje = "-";
                    lineToProcess[0].processed = false;
                }
                else {
                    var fieldLookUp = search.lookupFields({
                        type: recordType,
                        id: lineToProcess[0].internalid,
                        columns: ['status', 'amountremaining']
                    });

                    if (fieldLookUp['status'][0].value == 'paidInFull') {
                        lineToProcess[0].processed = true;
                    }
                    else {
                        lineToProcess[0].processed = false;
                    }

                }

                context.write({
                    key: lineToProcess[0].je,
                    value: lineToProcess[0]
                });
            }
        }
        /*
        function searchExistedJE(lineToProcess) {
            try {
                var filters = [];
                for (var i in lineToProcess) {
                    var line = lineToProcess[i];
                    filters.push(['memo', search.Operator.IS, line.tranid]);
                    if (filters.length && lineToProcess.length - 1 > i) {
                        filters.push("OR");
                    }
                }

                log.debug("searchExistedJE filters", filters);

                var JEresults = {};
                var searhcJE = search.create({
                    type: search.Type.JOURNAL_ENTRY,
                    filters: filters,
                    columns: [
                        'tranid',
                        'memo',
                        'internalid'
                    ]
                });
                var resultsJE = searhcJE.runPaged();
                var thePageRanges = resultsJE.pageRanges;
                for (var i in thePageRanges) {
                    var thepageData = resultsJE.fetch({
                        index: thePageRanges[i].index
                    });
                    thepageData.data.forEach(function (result, index_val) {
                        log.debug("thepagedata " + index_val, result);
                        var memo = result.getValue('memo');
                        var tranid = result.getValue('tranid');
                        JEresults[memo] = { id: result.id, tranid: tranid };
                        return true;
                    });
                }

                log.debug("searchExistedJE resultsJE", JEresults);
                return JEresults;

            }
            catch (e) {
                log.debug('searchExistedJE', e);
                return {};
            }
        }

        function deletelines(jeid, tranid) {
            try {
                var je = record.load({
                    type: record.Type.JOURNAL_ENTRY,
                    id: jeid,
                    isDynamic: true
                });
                var numlines = je.getLineCount({
                    sublistId: TRANSACTION_LINE.LINE_ID
                });
                if (numlines == 2) {
                    record.delete({
                        type: record.Type.JOURNAL_ENTRY,
                        id: jeid
                    });
                }
                else {
                    var countdeleted = 0;
                    for (var i = numlines - 1; i >= 0; i--) {
                        var memo = je.getSublistValue({
                            sublistId: TRANSACTION_LINE.LINE_ID,
                            fieldId: TRANSACTION_LINE.MEMO,
                            line: i
                        });
                        if (tranid == memo) {
                            je.removeLine({
                                sublistId: TRANSACTION_LINE.LINE_ID,
                                line: i
                            });
                            countdeleted++;
                            if (countdeleted == 2) {
                                break;
                            }
                        }

                    }
                    je.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
                }

            }
            catch (e) {
                log.error({ title: "deletelines", details: e });
            }
        }
        */

        function summarize(summary) {
            try {
                log.debug('summarize inputSummary', summary.inputSummary);
                log.debug('summarize mapSummary', summary.mapSummary);
                log.debug('summarize reduceSummary', summary.reduceSummary);
                var userObj = runtime.getCurrentUser();
                var employee = userObj.name;
                var date = new Date();
                var csv = "";
                var csvaux = "";
                var tablestring = "<table>" +
                    "<tr>" +
                    "<td style='border:1px solid #000' colspan ='3'><b>Nombre de empleado</b></td>" +
                    "<td style='border:1px solid #000'colspan ='4'><b>Fecha y hora de ejecución</b></td>" +
                    "</tr>" +
                    "<tr >" +
                    "<td style='border:1px solid #000'colspan ='3'>" + employee + "</td>" +
                    "<td style='border:1px solid #000'colspan ='4'>" + (date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + (date.getHours() + 2) + ":" + date.getMinutes()) + "</td>" +
                    "</tr>";
                var tableaux = "<tr>" +
                    "<td style='border:1px solid #000'><b>No. de documento</b></td>" +
                    "<td style='border:1px solid #000'><b>Cliente</b></td>" +
                    "<td style='border:1px solid #000'><b>Fecha de documento</b></td>" +
                    "<td style='border:1px solid #000'><b>Empresa</b></td>" +
                    "<td style='border:1px solid #000'><b>Monto ajustado</b></td>" +
                    "<td style='border:1px solid #000'><b>Póliza</b></td>" +
                    "<td style='border:1px solid #000'><b>Estatus</b></td>" +
                    "<td style='border:1px solid #000'><b>Notas de error</b></td>" +
                    "</tr>";
                csvaux += "No. de documento, No. Cliente, Fecha de documento, Empresa, Monto ajustado, Póliza, Estatus, Notas de error\n";
                csv += "Nombre del emplado," + employee + "\n";
                csv += "Fecha y hora de ejecución," + (date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + (date.getHours() + 2) + ":" + date.getMinutes()) + "\n";

                var total = 0;

                var rec = [];

                var transactiontotal = 0;
                var processedtotal = 0;
                var errortotal = 0;
                var isGNC = (runtime.getCurrentScript().getParameter({ name: 'custscript_tkio_is_gnc_mr' }) === 'true' ? true : false);
                var params = runtime.getCurrentScript().getParameter({ name: 'custscript_ss_params' });
                params = JSON.parse(params);
                log.debug('reduce params:', params);
                //var accountConfigurations = GetConfigurations(params.sublistId, isGNC);
                summary.output.iterator().each(function (key, value) {
                    log.debug({ title: 'key', details: key });
                    log.debug({ title: 'value', details: value });

                    var data = JSON.parse(value);
                    var status = "Completado";
                    var errordetials = "N/A";


                    if (data.je && data.processed == false) { //TRY TO RE-PROCESS MISSING TRANSACTIONS
                        /*try {
                            var lineToProcess = [];
                            lineToProcess.push(data);
                            var idtransaction = CreateCustomerPayment(params, lineToProcess, accountConfigurations, data.je);
                            log.debug("reduce ID saved transaction", idtransaction);
    
                            var recordType = '';
                            var trantype = data.type;
                            if(trantype == 7 || trantype == "7"){
                                recordType = record.Type.INVOICE;
                            }
                            else if(trantype == 9 || trantype == "9"){
                                recordType = record.Type.CUSTOMER_PAYMENT;
                            }
                            else if(trantype == 11 || trantype == "11"){
                                recordType = record.Type.CREDIT_MEMO;
                            }
                            else if(trantype == 13 || trantype == "13"){
                                recordType = record.Type.VENDOR_BILL;
                            }
                            else if(trantype == 15 || trantype == "15"){
                                recordType = record.Type.VENDOR_CREDIT;
                            }
                            var fieldLookUp = search.lookupFields({
                                type: recordType,
                                id: data.internalid,
                                columns: ['status','amountremaining']
                            });
    
                            if(fieldLookUp['status'][0].value == 'paidInFull' || fieldLookUp['status'][0].value == 'deposited' || fieldLookUp['status'][0].value == 'applied'){
                                data.processed = true;
                                data.errorname = '';
                                data.errormsg = '';
                            }
                            else {
                                data.processed = false;
                                data.je = '';
                                data.tranidje = '-';
                                data.errorname = 'NO_CREATED_PAYMENT';
                                data.errormsg = 'No ha sido posible generar la transacción para cancelar el saldo abierto.';
                            }
    
                        }
                        catch (error) {
                            log.error({
                                title: "Reduce error",
                                details: error
                            });
    
                            if(error.name != 'RCRD_DSNT_EXIST'){
                                data.errorname = error.name;
                                data.errormsg = error.message;
                                deletelines(data.je, data.tranid);
                                data.tranidje = "-";
                                data.je = '';
                                data.processed = false;
                            }
                            else {
                                data.processed = true;
                                data.errorname = '';
                                data.errormsg = '';
                            }
                        }*/
                    }

                    if (data.errorname) {
                        status = "Error";
                        errordetials = data.errormsg;
                        errortotal++;
                    }
                    else {
                        processedtotal++;
                    }
                    csvaux += data.tranid + "," + data.customername + "," + data.trandate + "," + data.subsidiaryname + "," + data.amountremaining + "," + data.tranidje + "," + status + "," + errordetials + "\n";
                    tableaux += "<tr>" +
                        "<td style='border:1px solid #000'>" + data.tranid + "</td>" +
                        "<td style='border:1px solid #000'>" + data.customername + "</td>" +
                        "<td style='border:1px solid #000'>" + data.trandate + "</td>" +
                        "<td style='border:1px solid #000'>" + data.subsidiaryname + "</td>" +
                        "<td style='border:1px solid #000; text-align:right'>" + data.amountremaining * 1 + "</td>" +
                        "<td style='border:1px solid #000'>" + data.tranidje + "</td>" +
                        "<td style='border:1px solid #000'>" + status + "</td>" +
                        "<td style='border:1px solid #000'>" + errordetials + "</td>" +
                        "</tr>";
                    rec = data.receiptents || [];
                    total += data.amountremaining * 1;
                    log.debug({ title: 'information', details: data });
                    log.debug({ title: 'rec', details: rec });

                    transactiontotal++;

                    return true;
                });

                tablestring += "<tr>" +
                    "<td style='border:1px solid #000'colspan ='3'><b>Monto total:</b></td>" +
                    "<td style='border:1px solid #000; text-align:right'colspan ='4'>" + (Math.round(total * 100) / 100) + "</td>" +
                    "</tr>";


                tablestring += "<tr>" +
                    "<td style='border:1px solid #000' colspan ='2'><b>Total de transacciones:</b>     " + transactiontotal + "</td>" +
                    "<td style='border:1px solid #000' colspan ='2 '><b>Total procesados:</b>     " + processedtotal + "</td>" +
                    "<td style='border:1px solid #000' colspan ='3'><b>Total con error:</b>     " + errortotal + "</td>" +
                    "</tr>";
                csv += "Monto total," + (Math.round(total * 100) / 100) + "\n";
                csv += "Total de transacciones," + transactiontotal + "\n";
                csv += "Total procesados," + processedtotal + "\n";
                csv += "Total con error," + errortotal + "\n";
                csv += csvaux;

                var folder = runtime.getCurrentScript().getParameter({
                    name: 'custscript_tkio_cancel_folder'
                });

                var filebane = date.getTime();
                var fileObj = file.create({
                    name: filebane + '.csv',
                    fileType: file.Type.CSV,
                    contents: csv,
                    folder: folder
                });
                var idfile = fileObj.save();

                var fileFinal = file.load({
                    id: idfile
                });

                //tablestring += tableaux;
                tablestring += "</table>";

                log.debug("tablestring", tablestring);
                if (userObj.id && userObj.id > 0) {
                    rec.push(userObj.id);
                }

                var employee = runtime.getCurrentScript().getParameter({
                    name: 'custscript_tkio_cs_sender'
                });
                var emailresults = email.send({
                    author: employee,
                    recipients: rec,
                    subject: 'Reporte de cancelación de saldos',
                    body: tablestring,
                    attachments: [fileFinal]
                });
                log.debug("emailresults", emailresults);
            } catch (e) {
                log.error({ title: 'Error summarize:', details: e });
            }
        }
        function initializationConstantAccountCombination(isGNC) {
            try {
                if (isGNC) {
                    ACCOUNT_COMBINATION.RecordId = 'customrecord_cb_accountig_comb_settings';
                    ACCOUNT_COMBINATION.MAIN_ACCOUNT = 'custrecord_cb_conf_main_account';
                    ACCOUNT_COMBINATION.SUB_ACCOUNT = 'custrecord_cb_conf_subaccount';
                    ACCOUNT_COMBINATION.INTER_COMPANY = 'custrecord_cb_conf_intercompany';
                    ACCOUNT_COMBINATION.DEPARTMENT = 'custrecord_cb_conf_cr';
                    ACCOUNT_COMBINATION.CLASS = 'custrecord_cb_conf_additional';
                    ACCOUNT_COMBINATION.SUBSIDIARY = 'custrecord_cb_conf_subsidiary';

                } else {
                    ACCOUNT_COMBINATION.RecordId = 'customrecord_tkio_configuracion_cuenta';
                    ACCOUNT_COMBINATION.MAIN_ACCOUNT = 'custrecord_tkio_conf_cuenta_ajuste';
                    ACCOUNT_COMBINATION.SUB_ACCOUNT = '';//DESAPARECE
                    ACCOUNT_COMBINATION.INTER_COMPANY = '';//DESAPARECE
                    ACCOUNT_COMBINATION.LOCATION = 'custrecord_tkio_conf_ubicacion';
                    ACCOUNT_COMBINATION.DEPARTMENT = 'custrecord_tkio_conf_departamento';
                    ACCOUNT_COMBINATION.CLASS = '';//DESAPARECE
                    ACCOUNT_COMBINATION.CHANEL = 'custrecord_tkio_conf_canal';
                    ACCOUNT_COMBINATION.SUBSIDIARY = 'custrecord_tkio_conf_subsidiaria';
                    ACCOUNT_COMBINATION.RECEIPTENTS = 'custrecord_tkio_cs_receptores';
                }
            } catch (e) {
                log.error({ title: 'Error initializationConstantAccountCombination:', details: e });
            }
        }
        function createJournalEntry(params, originalLinesToProcess, accountConfigurations, resultsJE, isGNC) {
            try {
                // format a date
                var configRecObj = config.load({
                    type: config.Type.USER_PREFERENCES
                });
                var dateFormat = configRecObj.getValue({
                    fieldId: 'DATEFORMAT'
                });
                var date = new Date();
                log.debug({ title: 'map  dateFormat', details: dateFormat });

                var mydateobject = moment(date, dateFormat).toDate();

                var parsedDate = format.parse({ value: (isGNC ? params.trandate : mydateobject), type: format.Type.DATE });
                var linesbycustomer = {};

                for (var i in originalLinesToProcess) {
                    if (!linesbycustomer[originalLinesToProcess[i][TRANSACTION_BODY.SUBSIDIARY]]) {
                        linesbycustomer[originalLinesToProcess[i][TRANSACTION_BODY.SUBSIDIARY]] = {};
                    }
                    if (!linesbycustomer[originalLinesToProcess[i][TRANSACTION_BODY.SUBSIDIARY]][originalLinesToProcess[i][TRANSACTION_BODY.NAME]]) {
                        linesbycustomer[originalLinesToProcess[i][TRANSACTION_BODY.SUBSIDIARY]][originalLinesToProcess[i][TRANSACTION_BODY.NAME]] = [];
                    }
                    linesbycustomer[originalLinesToProcess[i][TRANSACTION_BODY.SUBSIDIARY]][originalLinesToProcess[i][TRANSACTION_BODY.NAME]].push(originalLinesToProcess[i]);
                }
                log.debug("createJournalEntry by customer", linesbycustomer);

                var countimpacts = 0;
                var countje = 0;

                for (var s in linesbycustomer) {
                    if (countje <= 300) {
                        for (var c in linesbycustomer[s]) {
                            var lineToProcess = linesbycustomer[s][c];

                            // create a journal entry
                            var journal = record.create({
                                type: record.Type.JOURNAL_ENTRY,
                                isDynamic: true
                            });
                            log.debug({ title: 's', details: s });
                            log.debug({ title: 'Tipo s:', details: typeof s });
                            log.debug('createJournalEntry params', params);
                            log.debug('createJournalEntry lineToProcess', lineToProcess);
                            log.debug('createJournalEntry accountConfigurations', accountConfigurations);

                            // set subsidiary
                            journal.setValue({
                                fieldId: TRANSACTION_BODY.SUBSIDIARY,
                                value: s
                            });
                            if (!isGNC) {
                                log.debug('parsedDate', parsedDate);
                                log.debug('params.reason', params.reason);
                                //set the values in the required fields in JE main section
                                journal.setValue(TRANSACTION_BODY.TRANDATE, parsedDate); // set date
                                journal.setValue(TRANSACTION_BODY.MEMO, params.reason); // set memo
                            }
                            
                            journal.setValue(TRANSACTION_BODY.APPROVAL_STATUS, 2);
                            journal.setValue(TRANSACTION_BODY.PROCESS, true);

                            var countLine = 0;
                            for (var line = 0; line < lineToProcess.length; line++) {
                                var lineType = lineToProcess[line][TRANSACTION_BODY.TYPE];
                                var tranid = lineToProcess[line][TRANSACTION_BODY.TRAN_ID];

                                if (isGNC) {
                                    var tipoTransaccion = 'Cancelación de saldos – '
                                    if (lineType === '7' || lineType === 7) {
                                        tipoTransaccion += 'Factura de venta';
                                    }
                                    if (lineType === '9' || lineType === 9) {
                                        tipoTransaccion += 'Pago de cliente'
                                    }
                                    journal.setValue({
                                        fieldId: TRANSACTION_BODY.TYPE_CUSTOM_CS,
                                        value: tipoTransaccion
                                    });
                                }

                                // invoice || credit billt
                                if (!isGNC) {
                                    if (resultsJE[tranid]) {
                                        lineToProcess[line].je = resultsJE[tranid].id;
                                        lineToProcess[line].tranidje = resultsJE[tranid].tranid;
                                        continue;
                                    }
                                    log.debug("line " + line, lineToProcess[line][TRANSACTION_BODY.IS_INACTIVE]);
                                    if (lineToProcess[line][TRANSACTION_BODY.IS_INACTIVE] == true || lineToProcess[line][TRANSACTION_BODY.IS_INACTIVE] == 'true') {
                                        lineToProcess[line].errorname = 'CUSTOMER_INACTIVE';
                                        lineToProcess[line].errormsg = 'El cliente se encuentra inactivo.';
                                        continue;
                                    }
                                }

                                if (lineType === 7 || lineType == 15) {
                                    log.debug('Invoice Credit ', "ACCOUNT:" + lineToProcess[line][TRANSACTION_BODY.ACCOUNT] + "; AMOUNT: " + lineToProcess[line][TRANSACTION_BODY.AMOUNT_REMAINING]);
                                    journal.selectNewLine(TRANSACTION_LINE.LINE_ID);
                                    //Set the value for the field in the currently selected line.
                                    journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.ACCOUNT, lineToProcess[line][TRANSACTION_BODY.ACCOUNT]);
                                    journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.CREDIT, parseFloat(lineToProcess[line][TRANSACTION_BODY.AMOUNT_REMAINING]));
                                    journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.ENTITY, lineToProcess[line][TRANSACTION_BODY.NAME]);
                                    journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.LINKED_TRANSACTION, lineToProcess[line][TRANSACTION_BODY.INTERNAL_ID]);
                                    if (isGNC) {
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.CLASSS, lineToProcess[line][TRANSACTION_BODY.CLASS]);//accountConfigurations[ACCOUNT_COMBINATION.CLASS]);
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.DEPARTMENT, lineToProcess[line][TRANSACTION_BODY.DEPARTMENT]);//accountConfigurations[ACCOUNT_COMBINATION.DEPARTMENT]);
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.INTER_COMPANY, lineToProcess[line][TRANSACTION_BODY.INTER_COMPANY]);
                                        log.debug("interco", TRANSACTION_LINE.LINE_ID + " " + TRANSACTION_LINE.INTER_COMPANY + " " + lineToProcess[line][TRANSACTION_BODY.INTER_COMPANY]);
                                    } else {
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.LOCATION, accountConfigurations[s][ACCOUNT_COMBINATION.LOCATION]);
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.CHANEL, accountConfigurations[s][ACCOUNT_COMBINATION.CHANEL]);
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.MEMO, lineToProcess[line][TRANSACTION_BODY.TRAN_ID]);
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.DEPARTMENT, accountConfigurations[s][ACCOUNT_COMBINATION.DEPARTMENT]);
                                    }
                                    //Commits the currently selected line on a sublist.
                                    journal.commitLine('line');

                                    log.debug('Invoice Debit ', "ACCOUNT:" + (isGNC ? accountConfigurations[ACCOUNT_COMBINATION.MAIN_ACCOUNT] : accountConfigurations[s][ACCOUNT_COMBINATION.MAIN_ACCOUNT]) + "; AMOUNT: " + lineToProcess[line][TRANSACTION_BODY.AMOUNT_REMAINING]);
                                    // Debit Line
                                    journal.selectNewLine('line');
                                    //Set the value for the field in the currently selected line.
                                    journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.ACCOUNT, (isGNC ? accountConfigurations[ACCOUNT_COMBINATION.SUB_ACCOUNT] : accountConfigurations[s][ACCOUNT_COMBINATION.MAIN_ACCOUNT])); // account from custom record
                                    journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.DEBIT, parseFloat(lineToProcess[line][TRANSACTION_BODY.AMOUNT_REMAINING]));
                                    journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.ENTITY, lineToProcess[line][TRANSACTION_BODY.NAME]);
                                    journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.LINKED_TRANSACTION, lineToProcess[line][TRANSACTION_BODY.INTERNAL_ID]);
                                    if (isGNC) {
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.CLASSS, accountConfigurations[ACCOUNT_COMBINATION.CLASS]);
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.DEPARTMENT, accountConfigurations[ACCOUNT_COMBINATION.DEPARTMENT]);
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.INTER_COMPANY, accountConfigurations[ACCOUNT_COMBINATION.INTER_COMPANY]);
                                    } else {
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.LOCATION, accountConfigurations[s][ACCOUNT_COMBINATION.LOCATION]);
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.MEMO, lineToProcess[line][TRANSACTION_BODY.TRAN_ID]);
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.CHANEL, accountConfigurations[s][ACCOUNT_COMBINATION.CHANEL]);
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.DEPARTMENT, accountConfigurations[s][ACCOUNT_COMBINATION.DEPARTMENT]);
                                    }
                                    //Commits the currently selected line on a sublist.
                                    journal.commitLine('line');
                                }

                                // customer payment || Credit memo || vendor bill
                                if (lineType === 9 || lineType === 11 || lineType == 13) {
                                    log.debug('Payment Debit Amount', lineToProcess[line][TRANSACTION_BODY.AMOUNT_REMAINING]);
                                    journal.selectNewLine(TRANSACTION_LINE.LINE_ID);
                                    //Set the value for the field in the currently selected line.
                                    journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.ACCOUNT, lineToProcess[line][TRANSACTION_BODY.ACCOUNT]);
                                    journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.DEBIT, parseFloat(lineToProcess[line][TRANSACTION_BODY.AMOUNT_REMAINING]));
                                    journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.ENTITY, lineToProcess[line][TRANSACTION_BODY.NAME]);
                                    journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.LINKED_TRANSACTION, lineToProcess[line][TRANSACTION_BODY.INTERNAL_ID]);
                                    if (isGNC) {
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.CLASSS, lineToProcess[line][TRANSACTION_BODY.CLASS]);//accountConfigurations[ACCOUNT_COMBINATION.CLASS]);
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.DEPARTMENT, lineToProcess[line][TRANSACTION_BODY.DEPARTMENT]);//accountConfigurations[ACCOUNT_COMBINATION.DEPARTMENT]);
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.INTER_COMPANY, lineToProcess[line][TRANSACTION_BODY.INTER_COMPANY]);
                                    } else {
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.LOCATION, accountConfigurations[s][ACCOUNT_COMBINATION.LOCATION]);
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.CHANEL, accountConfigurations[s][ACCOUNT_COMBINATION.CHANEL]);
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.MEMO, lineToProcess[line][TRANSACTION_BODY.TRAN_ID]);
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.DEPARTMENT, accountConfigurations[s][ACCOUNT_COMBINATION.DEPARTMENT]);
                                    }
                                    //Commits the currently selected line on a sublist.
                                    journal.commitLine('line');

                                    log.debug('Payment credit Amount', lineToProcess[line][TRANSACTION_BODY.AMOUNT_REMAINING]);
                                    // credit Line
                                    journal.selectNewLine('line');
                                    //Set the value for the field in the currently selected line.
                                    journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.ACCOUNT, (isGNC ? accountConfigurations[ACCOUNT_COMBINATION.SUB_ACCOUNT] : accountConfigurations[s][ACCOUNT_COMBINATION.MAIN_ACCOUNT])); // account from custom record
                                    journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.ENTITY, lineToProcess[line][TRANSACTION_BODY.NAME]);
                                    journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.CREDIT, parseFloat(lineToProcess[line][TRANSACTION_BODY.AMOUNT_REMAINING]));
                                    journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.LINKED_TRANSACTION, lineToProcess[line][TRANSACTION_BODY.INTERNAL_ID]);
                                    if (isGNC) {
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.CLASSS, accountConfigurations[ACCOUNT_COMBINATION.CLASS]);
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.DEPARTMENT, accountConfigurations[ACCOUNT_COMBINATION.DEPARTMENT]);
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.INTER_COMPANY, accountConfigurations[ACCOUNT_COMBINATION.INTER_COMPANY]);
                                    } else {
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.LOCATION, accountConfigurations[s][ACCOUNT_COMBINATION.LOCATION]);
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.CHANEL, accountConfigurations[s][ACCOUNT_COMBINATION.CHANEL]);
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.MEMO, lineToProcess[line][TRANSACTION_BODY.TRAN_ID]);
                                        journal.setCurrentSublistValue(TRANSACTION_LINE.LINE_ID, TRANSACTION_LINE.DEPARTMENT, accountConfigurations[s][ACCOUNT_COMBINATION.DEPARTMENT]);
                                    }
                                    //Commits the currently selected line on a sublist.
                                    journal.commitLine('line');
                                }
                                if (!isGNC) {
                                    lineToProcess[line].jelines = [];
                                    lineToProcess[line].jelines.push(countLine);
                                    lineToProcess[line].jelines.push(countLine + 1);
                                    countLine += 2;
                                }
                                countimpacts++;
                            }
                            //save the record.
                            var jvId = 0;
                            var jsvError = {
                                errorname: '',
                                errormsg: ''
                            };
                            try {
                                if (countimpacts > 0) {
                                    jvId = journal.save();
                                }

                            } catch (error) {
                                jsvError.errorname = error.name;
                                jsvError.errormsg = error.message;
                                log.error('SAVE JE', error);
                            }

                            log.debug('jvId ' + c, jvId);
                            for (var line in lineToProcess) {
                                if (jvId) {
                                    lineToProcess[line].je = jvId;
                                }
                                else {
                                    lineToProcess[line].je = 0;
                                    lineToProcess[line].errorname = (!lineToProcess[line].errorname) ? jsvError.errorname : lineToProcess[line].errorname;
                                    lineToProcess[line].errormsg = (!lineToProcess[line].errorname) ? jsvError.errormsg : lineToProcess[line].errormsg;
                                }
                            }
                            countje++;
                        }
                    }
                    else {
                        for (var c in linesbycustomer[s]) {
                            var lineToProcess = linesbycustomer[s][c];
                            for (var line in lineToProcess) {
                                lineToProcess[line].je = 0;
                                lineToProcess[line].errorname = "LIMITEDEXCED_EXECUTION";
                                lineToProcess[line].errormsg = "Se ha excedido el limite de polizas a crear por ejecución.";
                            }
                        }
                    }


                }

                return linesbycustomer;
            } catch (error) {
                log.debug('Error createJournalEntry: ', error);
            }
        }

        function CreateCustomerPayment(params, lineToProcess, accountConfigurations, jvId) {
            log.debug('CreateCustomerPayment params', params);
            log.debug('CreateCustomerPayment lineToProcess', lineToProcess);
            log.debug('CreateCustomerPayment accountConfigurations', accountConfigurations);
            log.debug('CreateCustomerPayment jvId', jvId);
            log.debug('CreateCustomerPayment TYPE', lineToProcess[0][TRANSACTION_BODY.TYPE]);

            var transType = params.transaction_type;

            if (lineToProcess[0][TRANSACTION_BODY.TYPE] == 7 || lineToProcess[0][TRANSACTION_BODY.TYPE] == "7") {

                var customerPayment = record.create({
                    type: record.Type.CUSTOMER_PAYMENT,
                    isDynamic: true
                });

                customerPayment.setValue({
                    fieldId: TRANSACTION_BODY.CUSTOMER,
                    value: lineToProcess[0][TRANSACTION_BODY.NAME]
                });

                customerPayment.setValue({
                    fieldId: TRANSACTION_BODY.SUBSIDIARY,
                    value: params.subsidiary
                });

                customerPayment.setValue({
                    fieldId: TRANSACTION_BODY.CHANEL,
                    value: accountConfigurations[ACCOUNT_COMBINATION.CHANEL]
                });

                customerPayment.setValue({
                    fieldId: TRANSACTION_BODY.LOCATION,
                    value: accountConfigurations[ACCOUNT_COMBINATION.LOCATION]
                });


                customerPayment.setValue({
                    fieldId: TRANSACTION_BODY.DEPARTMENT,
                    value: accountConfigurations[ACCOUNT_COMBINATION.DEPARTMENT]
                });

                customerPayment.setValue({
                    fieldId: TRANSACTION_BODY.AR_ACCOUNT,
                    value: lineToProcess[0][TRANSACTION_BODY.ACCOUNT]
                });


                var lineCount = customerPayment.getLineCount({
                    sublistId: TRANSACTION_LINE.APPLY_ID
                });

                var invoicefound = false;
                var jefound = false;
                if (lineCount > 0) {

                    ///Search Invoices
                    for (var applyLine = 0; applyLine < lineCount; applyLine++) {

                        customerPayment.selectLine({
                            sublistId: TRANSACTION_LINE.APPLY_ID,
                            line: applyLine
                        });

                        var transactionId = customerPayment.getCurrentSublistValue({
                            sublistId: TRANSACTION_LINE.APPLY_ID,
                            fieldId: TRANSACTION_BODY.INTERNAL_ID
                        });




                        var amountdebit = customerPayment.getCurrentSublistValue({
                            sublistId: TRANSACTION_LINE.APPLY_ID,
                            fieldId: TRANSACTION_LINE.AMOUNT_DUE
                        });

                        var isLinePresent = lineToProcess.filter(function (d) {
                            return d[TRANSACTION_BODY.INTERNAL_ID] == transactionId && (d[TRANSACTION_BODY.AMOUNT_REMAINING] * 1) == (amountdebit * 1);
                        });

                        log.debug("Validation VEN: " + lineToProcess[0][TRANSACTION_BODY.INTERNAL_ID] + " == " + transactionId + " && (" + lineToProcess[0][TRANSACTION_BODY.AMOUNT_REMAINING] * 1 + ") == (" + amountdebit * 1 + ") ", lineToProcess[0][TRANSACTION_BODY.INTERNAL_ID] == transactionId && (lineToProcess[0][TRANSACTION_BODY.AMOUNT_REMAINING] * 1) == (amount * 1));

                        if (lineToProcess[0][TRANSACTION_BODY.INTERNAL_ID] == transactionId && (lineToProcess[0][TRANSACTION_BODY.AMOUNT_REMAINING] * 1) == (amountdebit * 1)) {
                            customerPayment.setCurrentSublistValue({
                                sublistId: TRANSACTION_LINE.APPLY_ID,
                                fieldId: TRANSACTION_LINE.APPLY,
                                value: true
                            });

                            customerPayment.commitLine({
                                sublistId: TRANSACTION_LINE.APPLY_ID
                            });
                            invoicefound = true;
                            log.debug("Transaction applied debit", 'T');
                            break;
                        }



                        /*if (isLinePresent.length > 0) {
                            customerPayment.setCurrentSublistValue({
                                sublistId: TRANSACTION_LINE.APPLY_ID,
                                fieldId: TRANSACTION_LINE.APPLY,
                                value: true
                            });

                            customerPayment.commitLine({
                                sublistId: TRANSACTION_LINE.APPLY_ID
                            });
                            found = true;
                            break;
                        } else {
                            if (transactionId == jvId && (lineToProcess[0][TRANSACTION_BODY.AMOUNT_REMAINING]*1) == (amount*1)) {
                                customerPayment.setCurrentSublistValue({
                                    sublistId: TRANSACTION_LINE.APPLY_ID,
                                    fieldId: TRANSACTION_LINE.APPLY,
                                    value: true
                                });

                                customerPayment.commitLine({
                                    sublistId: TRANSACTION_LINE.APPLY_ID
                                });
                            }
                        }*/

                    }
                }


                var creditLineCount = customerPayment.getLineCount({
                    sublistId: TRANSACTION_LINE.CREDIT_ID
                });

                log.debug("first option count credit", lineCount);
                //Search Journal Entry
                if (creditLineCount > 0) {
                    for (var c = 0; c < creditLineCount; c++) {
                        customerPayment.selectLine({
                            sublistId: TRANSACTION_LINE.CREDIT_ID,
                            line: c
                        })

                        var creditId = customerPayment.getCurrentSublistValue({
                            sublistId: TRANSACTION_LINE.CREDIT_ID,
                            fieldId: TRANSACTION_BODY.INTERNAL_ID
                        });

                        var amount = customerPayment.getCurrentSublistValue({
                            sublistId: TRANSACTION_LINE.CREDIT_ID,
                            fieldId: TRANSACTION_LINE.AMOUNT_DUE
                        });

                        log.debug("validaciones credit: " + creditId + " == " + jvId + " && (" + lineToProcess[0][TRANSACTION_BODY.AMOUNT_REMAINING] * 1 + ") == (" + amount * 1 + ")", creditId == jvId && (lineToProcess[0][TRANSACTION_BODY.AMOUNT_REMAINING] * 1) == (amount * 1));



                        if (creditId == jvId && (lineToProcess[0][TRANSACTION_BODY.AMOUNT_REMAINING] * 1) == (amount * 1)) {
                            customerPayment.setCurrentSublistValue({
                                sublistId: TRANSACTION_LINE.CREDIT_ID,
                                fieldId: TRANSACTION_LINE.APPLY,
                                value: true
                            });

                            customerPayment.commitLine({
                                sublistId: TRANSACTION_LINE.CREDIT_ID
                            });
                            jefound = true;
                            break;
                        }
                    }
                }

                var id = 0;
                if (jefound && invoicefound) {
                    id = customerPayment.save({
                        enableSourcing: false,
                        ignoreMandatoryFields: true
                    });
                }

                log.debug("Customer Payment First", id);
                //save the record.
                return id;
            }
            else if (lineToProcess[0][TRANSACTION_BODY.TYPE] == 9 || lineToProcess[0][TRANSACTION_BODY.TYPE] == "9") {

                var customerPayment = record.load({
                    type: record.Type.CUSTOMER_PAYMENT,
                    isDynamic: true,
                    id: lineToProcess[0][TRANSACTION_BODY.INTERNAL_ID]
                });

                var lineCount = customerPayment.getLineCount({
                    sublistId: TRANSACTION_LINE.APPLY_ID
                });

                log.debug("second option count apply", lineCount);

                var jefound = false;
                if (lineCount > 0) {

                    for (var applyLine = 0; applyLine < lineCount; applyLine++) {

                        customerPayment.selectLine({
                            sublistId: TRANSACTION_LINE.APPLY_ID,
                            line: applyLine
                        });

                        var transactionId = customerPayment.getCurrentSublistValue({
                            sublistId: TRANSACTION_LINE.APPLY_ID,
                            fieldId: TRANSACTION_BODY.INTERNAL_ID
                        });




                        var amountdebit = customerPayment.getCurrentSublistValue({
                            sublistId: TRANSACTION_LINE.APPLY_ID,
                            fieldId: TRANSACTION_LINE.AMOUNT_DUE
                        });

                        var isLinePresent = lineToProcess.filter(function (d) {
                            return d[TRANSACTION_BODY.INTERNAL_ID] == transactionId && (d[TRANSACTION_BODY.AMOUNT_REMAINING] * 1) == (amountdebit * 1);
                        });


                        log.debug("Validation: " + transactionId + " == " + jvId + " && (" + lineToProcess[0][TRANSACTION_BODY.AMOUNT_REMAINING] * 1 + ") == (" + amountdebit * 1 + ")", transactionId == jvId && (lineToProcess[0][TRANSACTION_BODY.AMOUNT_REMAINING] * 1) == (amountdebit * 1));


                        if (transactionId == jvId && (lineToProcess[0][TRANSACTION_BODY.AMOUNT_REMAINING] * 1) == (amountdebit * 1)) {
                            customerPayment.setCurrentSublistValue({
                                sublistId: TRANSACTION_LINE.APPLY_ID,
                                fieldId: TRANSACTION_LINE.APPLY,
                                value: true
                            });

                            customerPayment.commitLine({
                                sublistId: TRANSACTION_LINE.APPLY_ID
                            });
                            jefound = true;
                            break;
                        }

                    }
                }

                var id = 0;
                if (jefound) {
                    id = customerPayment.save({
                        enableSourcing: false,
                        ignoreMandatoryFields: true
                    });
                }

                log.debug("Customer Payment First-2", id);
                //save the record.
                return id;
            }
            else if (lineToProcess[0][TRANSACTION_BODY.TYPE] == 11 || lineToProcess[0][TRANSACTION_BODY.TYPE] == "11") {
                var creditPayment = record.load({
                    type: record.Type.CREDIT_MEMO,
                    isDynamic: true,
                    id: lineToProcess[0][TRANSACTION_BODY.INTERNAL_ID]
                });
                creditPayment.setValue({
                    fieldId: 'custbody_tkio_cs_cancelacion',
                    value: true
                })
                var creditLineCount = creditPayment.getLineCount({
                    sublistId: TRANSACTION_LINE.APPLY_ID
                });

                if (creditLineCount > 0) {
                    for (var c = 0; c < creditLineCount; c++) {
                        creditPayment.selectLine({
                            sublistId: TRANSACTION_LINE.APPLY_ID,
                            line: c
                        })

                        var creditId = creditPayment.getCurrentSublistValue({
                            sublistId: TRANSACTION_LINE.APPLY_ID,
                            fieldId: TRANSACTION_BODY.INTERNAL_ID
                        });

                        isLinePresent = lineToProcess.filter(function (d) {
                            return parseInt(d[TRANSACTION_BODY.INTERNAL_ID]) === parseInt(creditId);
                        });

                        if (isLinePresent.length > 0) {
                            creditPayment.setCurrentSublistValue({
                                sublistId: TRANSACTION_LINE.APPLY_ID,
                                fieldId: TRANSACTION_LINE.APPLY,
                                value: true
                            });

                            creditPayment.commitLine({
                                sublistId: TRANSACTION_LINE.APPLY_ID
                            });
                        } else {
                            if (parseInt(creditId) === parseInt(jvId)) {
                                creditPayment.setCurrentSublistValue({
                                    sublistId: TRANSACTION_LINE.APPLY_ID,
                                    fieldId: TRANSACTION_LINE.APPLY,
                                    value: true
                                });

                                creditPayment.commitLine({
                                    sublistId: TRANSACTION_LINE.APPLY_ID
                                });
                            }
                        }
                    }
                }

                var id = creditPayment.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                });
                log.debug("Customer Payment Second", id);
                return id;
            }
            else if (lineToProcess[0][TRANSACTION_BODY.TYPE] == 13 || lineToProcess[0][TRANSACTION_BODY.TYPE] == "13") {
                var billPayment = record.transform({
                    fromType: record.Type.VENDOR_BILL,
                    isDynamic: true,
                    toType: record.Type.VENDOR_PAYMENT,
                    fromId: lineToProcess[0][TRANSACTION_BODY.INTERNAL_ID]
                });
                billPayment.setValue({
                    fieldId: TRANSACTION_BODY.METHOD_PAYMENT,
                    value: 32
                });
                var creditLineCount = billPayment.getLineCount({
                    sublistId: TRANSACTION_LINE.APPLY_ID
                });

                if (creditLineCount > 0) {
                    for (var c = 0; c < creditLineCount; c++) {
                        billPayment.selectLine({
                            sublistId: TRANSACTION_LINE.APPLY_ID,
                            line: c
                        })

                        var creditId = billPayment.getCurrentSublistValue({
                            sublistId: TRANSACTION_LINE.APPLY_ID,
                            fieldId: TRANSACTION_BODY.INTERNAL_ID
                        });

                        isLinePresent = lineToProcess.filter(function (d) {
                            return parseInt(d[TRANSACTION_BODY.INTERNAL_ID]) === parseInt(creditId);
                        });

                        if (isLinePresent.length > 0) {
                            billPayment.setCurrentSublistValue({
                                sublistId: TRANSACTION_LINE.APPLY_ID,
                                fieldId: TRANSACTION_LINE.APPLY,
                                value: true
                            });

                            billPayment.commitLine({
                                sublistId: TRANSACTION_LINE.APPLY_ID
                            });
                        } else {
                            if (parseInt(creditId) === parseInt(jvId)) {
                                billPayment.setCurrentSublistValue({
                                    sublistId: TRANSACTION_LINE.APPLY_ID,
                                    fieldId: TRANSACTION_LINE.APPLY,
                                    value: true
                                });

                                billPayment.commitLine({
                                    sublistId: TRANSACTION_LINE.APPLY_ID
                                });
                            }
                        }
                    }
                }

                var id = billPayment.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                });
                log.debug("Customer Payment Third", id);
                return id;
            }
            else if (lineToProcess[0][TRANSACTION_BODY.TYPE] == 15 || lineToProcess[0][TRANSACTION_BODY.TYPE] == "15") {
                var creditBill = record.load({
                    type: record.Type.VENDOR_CREDIT,
                    isDynamic: true,
                    id: lineToProcess[0][TRANSACTION_BODY.INTERNAL_ID]
                });
                var creditLineCount = creditBill.getLineCount({
                    sublistId: TRANSACTION_LINE.APPLY_ID
                });

                if (creditLineCount > 0) {
                    for (var c = 0; c < creditLineCount; c++) {
                        creditBill.selectLine({
                            sublistId: TRANSACTION_LINE.APPLY_ID,
                            line: c
                        })

                        var creditId = creditBill.getCurrentSublistValue({
                            sublistId: TRANSACTION_LINE.APPLY_ID,
                            fieldId: TRANSACTION_BODY.INTERNAL_ID
                        });

                        isLinePresent = lineToProcess.filter(function (d) {
                            return parseInt(d[TRANSACTION_BODY.INTERNAL_ID]) === parseInt(creditId);
                        });

                        if (isLinePresent.length > 0) {
                            creditBill.setCurrentSublistValue({
                                sublistId: TRANSACTION_LINE.APPLY_ID,
                                fieldId: TRANSACTION_LINE.APPLY,
                                value: true
                            });

                            creditBill.commitLine({
                                sublistId: TRANSACTION_LINE.APPLY_ID
                            });
                        } else {
                            if (parseInt(creditId) === parseInt(jvId)) {
                                creditBill.setCurrentSublistValue({
                                    sublistId: TRANSACTION_LINE.APPLY_ID,
                                    fieldId: TRANSACTION_LINE.APPLY,
                                    value: true
                                });

                                creditBill.commitLine({
                                    sublistId: TRANSACTION_LINE.APPLY_ID
                                });
                            }
                        }
                    }
                }

                var id = creditBill.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                });
                log.debug("Customer Payment Fourth", id);
                return id;
            }
        }

        function GetConfigurations(subsidiaryId, isGNC) {
            log.debug({ title: 'subsidiaryId', details: subsidiaryId });
            log.debug({ title: 'isGNC', details: isGNC });
            var res = {};
            try {
                if (isGNC) {
                    var searchObj = search.create({
                        type: ACCOUNT_COMBINATION.RecordId,
                        filters:
                            [
                                [ACCOUNT_COMBINATION.SUBSIDIARY, search.Operator.ANYOF, subsidiaryId]
                            ],
                        columns:
                            [
                                search.createColumn({ name: ACCOUNT_COMBINATION.CLASS }),
                                search.createColumn({ name: ACCOUNT_COMBINATION.DEPARTMENT }),
                                search.createColumn({ name: ACCOUNT_COMBINATION.MAIN_ACCOUNT }),
                                search.createColumn({ name: ACCOUNT_COMBINATION.SUB_ACCOUNT }),
                                search.createColumn({ name: ACCOUNT_COMBINATION.SUBSIDIARY }),
                                search.createColumn({ name: ACCOUNT_COMBINATION.INTER_COMPANY })
                            ]
                    });
                    var searchResultCount = searchObj.runPaged().count;
                    log.debug({ title: 'searchResultCount:', details: searchResultCount });
                    if (searchResultCount > 0) {
                        searchObj.run().each(function (result) {
                            // .run().each has a limit of 4,000 results
                            res[ACCOUNT_COMBINATION.CLASS] = result.getValue(ACCOUNT_COMBINATION.CLASS);
                            res[ACCOUNT_COMBINATION.DEPARTMENT] = result.getValue(ACCOUNT_COMBINATION.DEPARTMENT);
                            res[ACCOUNT_COMBINATION.MAIN_ACCOUNT] = result.getValue(ACCOUNT_COMBINATION.MAIN_ACCOUNT);
                            res[ACCOUNT_COMBINATION.SUBSIDIARY] = result.getValue(ACCOUNT_COMBINATION.SUBSIDIARY);
                            res[ACCOUNT_COMBINATION.SUB_ACCOUNT] = result.getValue(ACCOUNT_COMBINATION.SUB_ACCOUNT);
                            res[ACCOUNT_COMBINATION.INTER_COMPANY] = result.getValue(ACCOUNT_COMBINATION.INTER_COMPANY);
                            return true;
                        });
                    }
                }
                else {
                    var searchObj = search.create({
                        type: ACCOUNT_COMBINATION.RecordId,
                        filters: [],
                        columns:
                            [
                                search.createColumn({ name: ACCOUNT_COMBINATION.CHANEL }),
                                search.createColumn({ name: ACCOUNT_COMBINATION.LOCATION }),
                                search.createColumn({ name: ACCOUNT_COMBINATION.DEPARTMENT }),
                                search.createColumn({ name: ACCOUNT_COMBINATION.MAIN_ACCOUNT }),
                                search.createColumn({ name: ACCOUNT_COMBINATION.SUBSIDIARY }),
                                search.createColumn({ name: ACCOUNT_COMBINATION.RECEIPTENTS }),
                            ]
                    });

                    var searchResultCount = searchObj.runPaged().count;
                    if (searchResultCount > 0) {
                        searchObj.run().each(function (result) {
                            // .run().each has a limit of 4,000 results
                            var subsidiary = result.getValue(ACCOUNT_COMBINATION.SUBSIDIARY);
                            res[subsidiary] = {};
                            res[subsidiary][ACCOUNT_COMBINATION.CHANEL] = result.getValue(ACCOUNT_COMBINATION.CHANEL);
                            res[subsidiary][ACCOUNT_COMBINATION.LOCATION] = result.getValue(ACCOUNT_COMBINATION.LOCATION);
                            res[subsidiary][ACCOUNT_COMBINATION.DEPARTMENT] = result.getValue(ACCOUNT_COMBINATION.DEPARTMENT);
                            res[subsidiary][ACCOUNT_COMBINATION.MAIN_ACCOUNT] = result.getValue(ACCOUNT_COMBINATION.MAIN_ACCOUNT);
                            res[subsidiary][ACCOUNT_COMBINATION.SUBSIDIARY] = result.getValue(ACCOUNT_COMBINATION.SUBSIDIARY);
                            res[subsidiary][ACCOUNT_COMBINATION.RECEIPTENTS] = result.getValue(ACCOUNT_COMBINATION.RECEIPTENTS);
                            return true;
                        });
                    }
                }

                return res;
            } catch (e) {
                log.error({ title: 'Error GetConfigurations:', details: e });
                return res;
            }
        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };
    });