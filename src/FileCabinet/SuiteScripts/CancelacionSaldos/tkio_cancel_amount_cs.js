/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/ui/dialog', 'N/format', 'N/search', 'N/currentRecord', 'N/ui/message', 'N/url', 'N/runtime', 'N/ui/message'],

    function (dialog, format, search, currentRecord, message, url, runtime, message) {

        var glbCurrentRecord;
        const CUSTOM_FIELDS = {};
        CUSTOM_FIELDS.SELECT_CURRENT = 'custpage_select_current';
        CUSTOM_FIELDS.PAGE = 'custpage_page';
        CUSTOM_FIELDS.SELECT_ALL = 'custpage_select_all';
        CUSTOM_FIELDS.CUSTOMER = 'custpage_customer';
        CUSTOM_FIELDS.SUBSIDIARY = 'custpage_subsidiary';
        CUSTOM_FIELDS.TRAN_TYPE = 'custpage_transaction_type';
        CUSTOM_FIELDS.START_DATE = 'custpage_startdate';
        CUSTOM_FIELDS.END_DATE = 'custpage_enddate';
        CUSTOM_FIELDS.START_AMT = 'custpage_start_amt';
        CUSTOM_FIELDS.END_AMT = 'custpage_end_amt';
        CUSTOM_FIELDS.REASON = 'custpage_reason';
        CUSTOM_FIELDS.PRIMARY = 'custpage_primaryfilters';
        CUSTOM_FIELDS.SECONDARY = 'custpage_secondaryfilters';
        CUSTOM_FIELDS.MESSAGE = 'custpage_message';

        const ACCOUNT_COMBINATION = {};

        const CUSTOM_LISTS = {};
        CUSTOM_LISTS.LIST_ID = 'custpage_transactions';
        CUSTOM_LISTS.SELECT = 'custpage_list_select';

        CUSTOM_FIELDS.LISTS = CUSTOM_LISTS;

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {
            glbCurrentRecord = currentRecord.get();
            console.log("inicio");
            var isGNC = runtime.getCurrentScript().getParameter({ name: 'custscript_tkio_is_gnc' });
            if (!isGNC) {
                ACCOUNT_COMBINATION.RecordId = 'customrecord_tkio_configuracion_cuenta';
                ACCOUNT_COMBINATION.MAIN_ACCOUNT = 'custrecord_tkio_conf_cuenta_ajuste';
                ACCOUNT_COMBINATION.SUB_ACCOUNT = '';//DESAPARECE
                ACCOUNT_COMBINATION.INTER_COMPANY = '';//DESAPARECE
                ACCOUNT_COMBINATION.LOCATION = 'custrecord_tkio_conf_ubicacion';
                ACCOUNT_COMBINATION.DEPARTMENT = 'custrecord_tkio_conf_departamento';
                ACCOUNT_COMBINATION.CLASS = '';//DESAPARECE
                ACCOUNT_COMBINATION.CHANEL = 'custrecord_tkio_conf_canal';
                ACCOUNT_COMBINATION.SUBSIDIARY = 'custrecord_tkio_conf_subsidiaria';
            } else {
                var currentForm = scriptContext.currentRecord;
                var msg = currentForm.getValue({
                    fieldId: CUSTOM_FIELDS.MESSAGE
                });

                console.log("MSG", msg);
                if (msg) {
                    var myMsg = message.create({
                        title: "Proceso en progreso",
                        message: msg,
                        type: message.Type.INFORMATION
                    });
                    myMsg.show();
                }

                ACCOUNT_COMBINATION.RecordId = 'customrecord_cb_accountig_comb_settings';
                ACCOUNT_COMBINATION.MAIN_ACCOUNT = 'custrecord_cb_conf_main_account';
                ACCOUNT_COMBINATION.SUB_ACCOUNT = 'custrecord_cb_conf_subaccount';
                ACCOUNT_COMBINATION.INTER_COMPANY = 'custrecord_cb_conf_intercompany';
                ACCOUNT_COMBINATION.DEPARTMENT = 'custrecord_cb_conf_cr';
                ACCOUNT_COMBINATION.CLASS = 'custrecord_cb_conf_additional';
                ACCOUNT_COMBINATION.SUBSIDIARY = 'custrecord_cb_conf_subsidiary';
            }

        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {

        }

        /**
         * Function to be executed when field is slaved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */
        function postSourcing(scriptContext) {

        }

        /**
         * Function to be executed after sublist is inserted, removed, or edited.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function sublistChanged(scriptContext) {

        }

        /**
         * Function to be executed after line is selected.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function lineInit(scriptContext) {

        }

        /**
         * Validation function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @returns {boolean} Return true if field is valid
         *
         * @since 2015.2
         */
        function validateField(scriptContext) {
            try {
                var isGNC = runtime.getCurrentScript().getParameter({ name: 'custscript_tkio_is_gnc' });
                var maxtolerance = 0;
                var fieldName = scriptContext.fieldId;
                var currRec = scriptContext.currentRecord;
                if (fieldName === CUSTOM_FIELDS.START_AMT || fieldName === CUSTOM_FIELDS.END_AMT) {
                    if (!isGNC) {
                        maxtolerance = runtime.getCurrentScript().getParameter({ name: 'custscript_tkio_cs_tolerancia' })
                    }
                    var amount = currRec.getValue({
                        fieldId: fieldName
                    });

                    if (amount !== '') {
                        if (amount === 0 || amount === 0.00) {
                            dialog.alert({
                                title: "Warning",
                                message: "Monto no puede ser cero"
                            });

                            currRec.setValue({
                                fieldId: fieldName,
                                value: ''
                            })

                            return false;
                        }
                        if (amount > maxtolerance && !isGNC) {
                            dialog.alert({
                                title: "Warning",
                                message: "El monto no puede ser mayor a " + maxtolerance
                            });

                            currRec.setValue({
                                fieldId: fieldName,
                                value: ''
                            })

                            return false;
                        }
                    }
                }

                if (fieldName === CUSTOM_FIELDS.START_DATE || fieldName === CUSTOM_FIELDS.END_DATE) {
                    var startDate = currRec.getValue({
                        fieldId: CUSTOM_FIELDS.START_DATE
                    });

                    var endDate = currRec.getValue({
                        fieldId: CUSTOM_FIELDS.END_DATE
                    });

                    if (startDate && endDate) {
                        startDate = format.parse({
                            value: startDate,
                            type: format.Type.DATE
                        });

                        endDate = format.parse({
                            value: endDate,
                            type: format.Type.DATE
                        });

                        var difference = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
                        console.log("difference", difference);

                        if (startDate.getTime() > endDate.getTime()) {
                            dialog.alert({
                                title: "Warning",
                                message: (isGNC ? "Start date can not be greater than end date." : "Fecha de inicio no debe ser mayor que la fecha fin.")
                            });

                            currRec.setValue({
                                fieldId: CUSTOM_FIELDS.END_DATE,
                                value: ''
                            });
                        }
                        else if (difference > 30 && !isGNC) {
                            dialog.alert({
                                title: "Warning",
                                message: "No se puede ingresar un rango de fechas mayor a 31 días."
                            });

                            currRec.setValue({
                                fieldId: CUSTOM_FIELDS.END_DATE,
                                value: ''
                            });
                        }
                    }
                }
            }
            catch (e) {
                log.error({ title: "validateLine", details: e });
                return false
            }

            return true;
        }

        /**
         * Validation function to be executed when sublist line is committed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateLine(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is inserted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateInsert(scriptContext) {

        }

        /**
         * Validation function to be executed when record is deleted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateDelete(scriptContext) {

        }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRecord(scriptContext) {
            var currRec = scriptContext.currentRecord;

            var lineCount = currRec.getLineCount({
                sublistId: CUSTOM_FIELDS.LISTS.LIST_ID
            })

            if (lineCount > 0) {
                var subsidiaryId = currRec.getValue(CUSTOM_FIELDS.SUBSIDIARY);
                var isConfiguration = GetConfigurations(subsidiaryId);
                if (!isConfiguration) {
                    var errorMsg = message.create({
                        title: 'Error',
                        message: 'Please configure account combinations for selected subsidiary.',
                        type: message.Type.ERROR
                    });

                    errorMsg.show();

                    return false;
                }
            }
            return true;
        }

        function GetConfigurations(subsidiaryId) {
            var searchObj = search.create({
                type: ACCOUNT_COMBINATION.RecordId,
                filters:
                    [
                        [ACCOUNT_COMBINATION.SUBSIDIARY, search.Operator.ANYOF, subsidiaryId]
                    ],
                columns:
                    [
                        search.createColumn({ name: ACCOUNT_COMBINATION.SUBSIDIARY }),
                    ]
            });

            var searchResultCount = searchObj.runPaged().count;
            return searchResultCount > 0;
        }

        function excel() {
            /*var params = {};
            var currentForm = currentRecord.get();
            
            var output = url.resolveScript({
                scriptId: 'customscript_cs_cancel_amount_sl',
                deploymentId: 'customdeploy_cs_cancel_amount_sl',
              params: params
            });
            
            var f = document.createElement("form");
            f.setAttribute("type", "text");
            f.setAttribute("method", "post");
            f.setAttribute("action", output);
            
            var custpage_customer_input = document.createElement("INPUT");
            custpage_customer_input.setAttribute("type", "text");
            custpage_customer_input.setAttribute("name", "custpage_customer");
            custpage_customer_input.setAttribute("value", currentForm.getValue({fieldId: 'custpage_customer'}));
            f.appendChild(custpage_customer_input);
            
            var custpage_transaction_type = currentForm.getValue({fieldId: 'custpage_transaction_type'});
            var typetext = '';
            for(var i in custpage_transaction_type){
              if(typetext){
                typetext += '\u0005';
              }
              typetext += custpage_transaction_type[i];
            }
            var custpage_transaction_type_input = document.createElement("INPUT");
            custpage_transaction_type_input.setAttribute("type", "text");
            custpage_transaction_type_input.setAttribute("name", "custpage_transaction_type");
            custpage_transaction_type_input.setAttribute("value", typetext);
            f.appendChild(custpage_transaction_type_input);
            
            var custpage_reason_input = document.createElement("INPUT");
            custpage_reason_input.setAttribute("type", "text");
            custpage_reason_input.setAttribute("name", "custpage_reason");
            custpage_reason_input.setAttribute("value", currentForm.getValue({fieldId: 'custpage_reason'}));
            f.appendChild(custpage_reason_input);
            
            var enddate = currentForm.getValue({fieldId: 'custpage_enddate'});
            var enddatetext = enddate.getDate() +'/'+  (enddate.getMonth() + 1) + '/'+enddate.getFullYear();
            var custpage_enddate_input = document.createElement("INPUT");
            custpage_enddate_input.setAttribute("type", "text");
            custpage_enddate_input.setAttribute("name", "custpage_enddate");
            custpage_enddate_input.setAttribute("value", enddatetext);
            f.appendChild(custpage_enddate_input);
            
            var startdate = currentForm.getValue({fieldId: 'custpage_startdate'});
            var startdatetext = startdate.getDate() +'/'+  (startdate.getMonth() + 1) + '/'+startdate.getFullYear();
            var custpage_startdate_input = document.createElement("INPUT");
            custpage_startdate_input.setAttribute("type", "text");
            custpage_startdate_input.setAttribute("name", "custpage_startdate");
            custpage_startdate_input.setAttribute("value", startdatetext);
            f.appendChild(custpage_startdate_input);
            
            var trandate = currentForm.getValue({fieldId: 'custpage_trandate'});
            var trandatetext = trandate.getDate() +'/'+  (trandate.getMonth() + 1) + '/'+trandate.getFullYear();
            var custpage_trandate_input = document.createElement("INPUT");
            custpage_trandate_input.setAttribute("type", "text");
            custpage_trandate_input.setAttribute("name", "custpage_trandate");
            custpage_trandate_input.setAttribute("value", trandatetext);
            f.appendChild(custpage_trandate_input);
            
            var custpage_end_amt_input = document.createElement("INPUT");
            custpage_end_amt_input.setAttribute("type", "text");
            custpage_end_amt_input.setAttribute("name", "custpage_end_amt");
            custpage_end_amt_input.setAttribute("value", currentForm.getValue({fieldId: 'custpage_end_amt'}));
            f.appendChild(custpage_end_amt_input);
            
            var custpage_start_amt_input = document.createElement("INPUT");
            custpage_start_amt_input.setAttribute("type", "text");
            custpage_start_amt_input.setAttribute("name", "custpage_start_amt");
            custpage_start_amt_input.setAttribute("value", currentForm.getValue({fieldId: 'custpage_start_amt'}));
            f.appendChild(custpage_start_amt_input);
            
            var custpage_subsidiary_input = document.createElement("INPUT");
            custpage_subsidiary_input.setAttribute("type", "text");
            custpage_subsidiary_input.setAttribute("name", "custpage_subsidiary");
            custpage_subsidiary_input.setAttribute("value", currentForm.getValue({fieldId: 'custpage_subsidiary'}));
            f.appendChild(custpage_subsidiary_input);
             var custpage_subsidiary_input = document.createElement("INPUT");
            custpage_subsidiary_input.setAttribute("type", "text");
            custpage_subsidiary_input.setAttribute("name", "custpage_file");
            custpage_subsidiary_input.setAttribute("value", 'T');
            f.appendChild(custpage_subsidiary_input);
            
            document.getElementsByTagName('body')[0].appendChild(f);*/
            var currentForm = currentRecord.get();
            currentForm.setValue({ fieldId: 'custpage_file', value: 'T' });

            var f = document.getElementsByName("main_form");
            f[0].submit();
            currentForm.setValue({ fieldId: 'custpage_file', value: '' });
            /*var output = url.resolveScript({
                scriptId: 'customscript_cs_cancel_amount_sl',
                deploymentId: 'customdeploy_cs_cancel_amount_sl',
              params: params
            });
            window.open(output, '_self');*/
        }

        function reload() {
            var output = url.resolveScript({
                scriptId: 'customscript_tkio_cs_cancel_amount_sl',
                deploymentId: 'customdeploy_tkio_cs_cancel_amount_sl',
            });
            window.open(output, '_self');

        }

        function checkAll() {
            glbCurrentRecord = currentRecord.get();
            var lineCount = glbCurrentRecord.getLineCount({
                sublistId: CUSTOM_FIELDS.LISTS.LIST_ID
            });
            for (var index = 0; index < lineCount; index++) {
                setSublistValue(CUSTOM_FIELDS.LISTS.LIST_ID, CUSTOM_FIELDS.LISTS.SELECT, index, true);
            }
        }

        function uncheckAll() {
            glbCurrentRecord = currentRecord.get();
            var lineCount = glbCurrentRecord.getLineCount({
                sublistId: CUSTOM_FIELDS.LISTS.LIST_ID
            });
            for (var index = 0; index < lineCount; index++) {
                setSublistValue(CUSTOM_FIELDS.LISTS.LIST_ID, CUSTOM_FIELDS.LISTS.SELECT, index, false);
            }
        }
        function setSublistValue(sublistId, fieldId, line, value) {
            glbCurrentRecord.selectLine({
                sublistId: sublistId,
                line: line
            });
            glbCurrentRecord.setCurrentSublistValue({
                sublistId: sublistId,
                fieldId: fieldId,
                value: value,
                line: line
            });
        }
        function filter() {
            var currentform = currentRecord.get();

            var subsidiary = currentform.getValue({
                fieldId: CUSTOM_FIELDS.SUBSIDIARY
            });
            var typetransaction = currentform.getValue({
                fieldId: CUSTOM_FIELDS.TRAN_TYPE
            });
            var value = (typetransaction.length) ? typetransaction[0] : '';
            console.log("typetran", typetransaction);
            var customer = currentform.getValue({
                fieldId: CUSTOM_FIELDS.CUSTOMER
            });
            var customervalue = (customer.length) ? customer[0] : '';

            var startdate = currentform.getValue({
                fieldId: CUSTOM_FIELDS.START_DATE
            });
            var enddate = currentform.getValue({
                fieldId: CUSTOM_FIELDS.END_DATE
            });
            var amount = currentform.getValue({
                fieldId: CUSTOM_FIELDS.END_AMT
            });

            if (!subsidiary || !value || !startdate || !enddate || !amount) {
                dialog.alert({
                    title: "Warning",
                    message: "Debe ingresar toda la información requerida para continuar filtrando"
                });


                return false;
            }

            var parameters = {};

            parameters[CUSTOM_FIELDS.END_AMT] = amount;
            parameters[CUSTOM_FIELDS.END_DATE] = enddate.getDate() + "/" + (enddate.getMonth() + 1) + "/" + enddate.getFullYear();
            parameters[CUSTOM_FIELDS.START_DATE] = startdate.getDate() + "/" + (startdate.getMonth() + 1) + "/" + startdate.getFullYear();
            parameters[CUSTOM_FIELDS.SUBSIDIARY] = subsidiary;
            parameters[CUSTOM_FIELDS.TRAN_TYPE] = JSON.stringify(typetransaction);
            if (customervalue) parameters[CUSTOM_FIELDS.CUSTOMER] = JSON.stringify(customer);


            var output = url.resolveScript({
                scriptId: 'customscript_tkio_cs_cancel_amount_sl',
                deploymentId: 'customdeploy_tkio_cs_cancel_amount_sl',
                params: parameters
            });
            window.open(output, '_self');

        }

        return {
            // fieldChanged: fieldChanged,
            // postSourcing: postSourcing,
            // sublistChanged: sublistChanged,
            // lineInit: lineInit,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            pageInit: pageInit,
            validateField: validateField,
            saveRecord: saveRecord,
            excel: excel,
            reload: reload,
            filter: filter,
            checkAll: checkAll,
            uncheckAll: uncheckAll
        };

    });
