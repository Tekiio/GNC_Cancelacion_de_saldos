/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/log', 'N/search', 'N/runtime', 'N/task'],

    (log, search, runtime, task) => {

            const TRANSACTION_BODY = {};
            TRANSACTION_BODY.TYPE = 'type';
            TRANSACTION_BODY.TYPE_ENTITY = 'typeentity';
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
            TRANSACTION_BODY.MEMO = 'memo';
            TRANSACTION_BODY.APPROVAL_STATUS = 'approvalstatus';
            TRANSACTION_BODY.IS_INACTIVE = 'isinactive';

            const PARAMETERS = {};
            PARAMETERS.SAVED_SEARCH = 'custscript_tkio_cs_saved_search';
            PARAMETERS.TOLERANCE = 'custscript_tkio_cs_tolerancia';

            const COLUMNS = {};
            COLUMNS.ID_SEARCH = 'id';
            COLUMNS.INTERNAL_ID = 'internalid';
            COLUMNS.AMOUNT_REMAINING = 'amountremaining';
            COLUMNS.ROW_NUM = 'formulatext';
            COLUMNS.RECORD_TYPE = 'recordtype';
            COLUMNS.TRAN_ID = 'tranid';
            COLUMNS.TRAN_DATE = 'trandate';
            COLUMNS.ENTITY = 'entity';
            COLUMNS.ACCOUNT = 'account';
            COLUMNS.SUBSIDIARY = 'subsidiary';
            COLUMNS.LOCATION = 'location';
            COLUMNS.DEPARTMENT = 'department';
            COLUMNS.CHANEL = 'cseg_efx_cstsg_cana';
            COLUMNS.CUSTOMER_MAIN_INACTIVE = 'isinactive.customerMain';
            COLUMNS.VENDOR_INACTIVE = 'isinactive.vendo';

            const SCRIPTS = {};
            SCRIPTS.SCHEDULED_SCRIPT = {};
            SCRIPTS.SCHEDULED_SCRIPT.SCRIPT_ID = 'customscript_tkio_cs_cancel_amount_me'; //'customscript_ss_closinh_balances';
            SCRIPTS.SCHEDULED_SCRIPT.DEPLOY_ID = 'customdeploy_tkio_cancel_amount_mr';

        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        const getInputData = (inputContext) => {
                try{

                        var savedsaerch = runtime.getCurrentScript().getParameter({
                                name : PARAMETERS.SAVED_SEARCH
                        });

                        log.debug("savedsearchparameter", savedsaerch);

                        var tolerance = runtime.getCurrentScript().getParameter({
                                name : PARAMETERS.TOLERANCE
                        });

                        log.debug("tolerance", tolerance);

                        var lookupsavedsearch = search.lookupFields({
                                type: search.Type.SAVED_SEARCH,
                                id: savedsaerch,
                                columns: [COLUMNS.ID_SEARCH]
                        });

                        log.debug("lookupsavedsearch", lookupsavedsearch);

                        var searchInfo = search.load({
                                id:lookupsavedsearch[COLUMNS.ID_SEARCH]
                        });

                        log.debug("searchInfo", searchInfo);
                        log.debug("searchInfo FILTERS", searchInfo.filters);

                        searchInfo.filters.push(search.createFilter({name: COLUMNS.AMOUNT_REMAINING, operator: search.Operator.LESSTHANOREQUALTO, values: tolerance}));

                        log.debug("searchInfo FILTERS NEW", searchInfo.filters);
                        return searchInfo;
                }
                catch (e) {
                     log.error({title: 'getInputData error', details: e});
                }
        }

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */

        const map = (mapContext) => {
                try{
                        //log.debug({title: 'map context', details: mapContext});
                        var lineToProcess = JSON.parse(mapContext.value);
                        log.debug({title: 'map lineToProcess', details: lineToProcess});
                        var lineItems = {};
                        lineItems[TRANSACTION_BODY.INTERNAL_ID] = lineToProcess['values'][COLUMNS.INTERNAL_ID];

                        var name = lineToProcess['values'][COLUMNS.RECORD_TYPE];

                        var type = 0;
                        var typeentity = 0;
                        if(name === 'invoice'){
                            type = 7;
                            typeentity = 1;
                        }
                        else if( name === 'customerpayment'){
                            type = 9;
                            typeentity = 1;
                        }
                        else if( name === 'creditmemo'){
                            type = 11;
                            typeentity = 1;
                        }
                        else if( name === 'vendorbill'){
                            type = 13;
                            typeentity = 2;
                        }
                        else if( name === 'vendorpayment'){
                            type = 15;
                            typeentity = 2;
                        }
                        lineItems[TRANSACTION_BODY.INTERNAL_ID] = lineToProcess['values'][COLUMNS.INTERNAL_ID].value;
                        lineItems[TRANSACTION_BODY.TYPE] = type;
                        lineItems[TRANSACTION_BODY.TYPE_ENTITY] = typeentity;
                        lineItems[TRANSACTION_BODY.NAME] = lineToProcess['values'][COLUMNS.ENTITY].value;
                        lineItems[TRANSACTION_BODY.ACCOUNT] = lineToProcess['values'][COLUMNS.ACCOUNT].value;
                        lineItems[TRANSACTION_BODY.AMOUNT_REMAINING] = lineToProcess['values'][COLUMNS.AMOUNT_REMAINING];
                        lineItems[TRANSACTION_BODY.TRAN_ID] = lineToProcess['values'][COLUMNS.TRAN_ID];
                        lineItems[TRANSACTION_BODY.TRAN_ID] = lineToProcess['values'][COLUMNS.TRAN_ID];
                        lineItems[TRANSACTION_BODY.TRANDATE] = lineToProcess['values'][COLUMNS.TRAN_DATE];
                        lineItems[TRANSACTION_BODY.SUBSIDIARY] = lineToProcess['values'][COLUMNS.SUBSIDIARY].value;
                        var inactive = lineToProcess['values'][COLUMNS.CUSTOMER_MAIN_INACTIVE];
                        if(typeentity == 2){
                            inactive = lineToProcess['values'][COLUMNS.VENDOR_INACTIVE];
                        }
                        lineItems[TRANSACTION_BODY.IS_INACTIVE] = (inactive == 'F' || !inactive)?false: true;

                        log.debug({title: "map lineItems", details: lineItems});
                        mapContext.write({
                                key: lineItems[TRANSACTION_BODY.SUBSIDIARY],
                                value: lineItems
                        });
                }
                catch (e) {
                        log.error({title: 'map error', details: e});
                }
        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reduceContext) => {
            try {
                //log.debug('reduce', reduceContext);
                log.debug('reduce values', reduceContext.values);

                var defaulttolerance = runtime.getCurrentScript().getParameter({name: 'custscript_tkio_cs_tolerancia'});
                var params = {"customer":"","subsidiary":"","transaction_type":[],"startdate":"","enddate":"","end_amt":defaulttolerance}
                var linetoprocess = [];
                for (var i in reduceContext.values){
                    var value = reduceContext.values[i];
                    value = JSON.parse(value);
                    linetoprocess.push(value);
                    params.subsidiary = value.subsidiary;
                    if(params.transaction_type.indexOf(value.type) == -1){
                        params.transaction_type.push(value.type)
                    }
                }

                log.debug('reduce linetoprocess', linetoprocess);
                log.debug('reduce params', params);

                for(var i = 1; i <= 5; i++){
                    var deploymentid=SCRIPTS.SCHEDULED_SCRIPT.DEPLOY_ID + i;
                    var shTask = task.create({
                        taskType: task.TaskType.MAP_REDUCE,
                        scriptId: SCRIPTS.SCHEDULED_SCRIPT.SCRIPT_ID,
                        deploymentId: deploymentid,
                        params: {
                            "custscript_ss_lines": JSON.stringify(linetoprocess), //"custscript_params1": objparam1,
                            "custscript_ss_params": JSON.stringify(params) //"custscript_params2": objparam2
                        }
                    });

                    var run = true;
                    try{
                        var idtask = shTask.submit();
                        log.debug("TASK ID", idtask);
                    }
                    catch (e) {
                        run = false;
                        log.debug("ERROR", e);
                        log.debug("Implementación aún corriedo", deploymentid);
                    }
                    if(run){
                        break;
                    }

                }


            }
            catch (e) {
                log.error({title: 'reduce error', details: e});
            }
        }


        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {

        }

        return {getInputData, map, reduce, summarize}

    });
