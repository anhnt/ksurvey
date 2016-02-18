var PLAIN_TEXT_ANSWER = 'PLAIN_TEXT_ANSWER';
function generateWebsiteTitle(page){
    log.info('generateWebsiteTitle > page={}', page);
    var title = page.attributes.surveyId.jsonObject.name;
    return title;
}

// POST /ksurvey/surveyId
function submitSurvey(page, params){
	log.info('submitSurvey >', params.submitSurvey);


	log.info('params {}', params);
	var surveyId = params['temp-surveyId'];
	var userId = params['temp-user'];
	var userAgentHeader = params['temp-userAgentHeader'];
	var fromAddress = params['temp-fromAddress'];
	var totalQuestions = params['temp-totalQuestions'];
	var surveyResult = [];
    var parser = new UAParser(userAgentHeader).getResult();
    var browserName = parser.browser.name;
    var browserVersion = parser.browser.version;
    var osName = parser.os.name;
    var osVersion = parser.os.version;
    var deviceVendor = 'N/A';
    var deviceModel = 'N/A';
    var deviceType = 'N/A';
    if(parser.device.model && parser.device.vendor){
        deviceVendor = parser.device.vendor;
        deviceModel = parser.device.model;
        deviceType = parser.device.type;
    }
	for(var p in params){
		if(p.indexOf('question-') === 0){
			if(surveyId && p && params[p]){
				var answerBody = '';
				var answerId = '';
				if(params[p].indexOf('answer-')===-1){
					answerBody = params[p];
					answerId = PLAIN_TEXT_ANSWER;
                    surveyResult.push({
                        answerBody: answerBody,
                        answerId: answerId,
                        questionId: p,
                    });
				}else{
					answerId = params[p];
                    if(answerId.indexOf(',')!==-1){
                        var answerIds = answerId.split(',');
                        for(var i = 0; i < answerIds.length; i++){
                            if(answerIds[i] && answerIds[i].indexOf('answer-')===0){
                                surveyResult.push({
                                    questionId: p,
                                    answerId: answerIds[i],
                                    answerBody: answerBody
                                });
                            }
                        }
                    }else{
                        surveyResult.push({
                            questionId: p,
                            answerId: answerId,
                            answerBody: answerBody,
                        });
                    }
				}
			}
		}
	}

	var db = getDB(page);
	var result = {
        status: true,
        messages: ['Successfully submitted survey'],
        data: surveyResult
    };
    if(surveyResult.length<totalQuestions){
    	result.status = false;
    	result.messages = ['Please check your answers and submit again!'];
    }else{
    	for(var i = 0; i < surveyResult.length; i++){
			newId = RECORD_TYPES.RESULT + '-' + generateRandomText(30);
            var obj = {
                surveyId: surveyId,
                
                userId: userId,
                answerBody: answerBody,
                createdDate: new Date()
            };
            obj.questionId = surveyResult[i].questionId;
            obj.answerId = surveyResult[i].answerId;
            obj.answerBody = surveyResult[i].answerBody;
			db.createNew(newId, JSON.stringify(obj), RECORD_TYPES.RESULT);
		}

        newSurveySubmitId = RECORD_TYPES.SUBMIT + '-' + generateRandomText(30);
        var submitObj = {
            fromAddress: fromAddress,
            browserName: browserName,
            browserVersion: browserVersion,
            osName: osName,
            osVersion: osVersion,
            deviceVendor: deviceVendor,
            deviceType: deviceType,
            deviceModel: deviceModel,
            surveyId: surveyId,
            userId: userId,
            createdDate: new Date()
        };
        db.createNew(newSurveySubmitId, JSON.stringify(submitObj), RECORD_TYPES.SUBMIT);
		log.info('saveResult done {}', JSON.stringify(surveyResult));
    }

	return views.jsonObjectView(JSON.stringify(result)).wrapJsonResult();
}

// private function to check if user already submitted survey
function getSurveyResultByUser(page, userId, surveyId){
	var queryJson = {
        'fields': [
            'surveyId',
            'userId'
        ],
        'size': 1,
        'query': {
            'bool': {
                'must': [
                    { 'type': { 'value': RECORD_TYPES.SUBMIT } },
                    { 'term': { 'surveyId': surveyId } },
                    { 'term': { 'userId': userId } }
                ]
            }
        }
    };
    var result = doDBSearch(page, queryJson);
    log.info('getSurveyResultByUser {}', result);
    return result;
}

function getSurveyStatistic(page, surveyId){
	log.info('getSurveyStatistic {}');
	var queryJson = {
        'fields': [
            'surveyId',
            'questionId',
            'answerId',
            'userId',
            'fromAddress',
            'answerBody',
            'createdDate'
        ],
        'size': 0,
        'query': {
            'bool': {
                'must': [
                    { 'type': { 'value': RECORD_TYPES.RESULT } },
                    { 'term': { 'surveyId': surveyId } },
                ]
            }
        },
        'aggs': {
            'by_question': {
                'terms': {
                    'field': 'questionId'
                },
                'aggs': {
                	'by_answer': {
                		'terms': {
				            'field': 'answerId'
				        }
                	}
                }
            }
        }
    };
    var searchResult = doDBSearch(page, queryJson);
    var surveyResult = {};
    
    if (searchResult.hits.totalHits > 0) {
    	var buckets = [];
        if (searchResult.aggregations && searchResult.aggregations.get('by_question') && searchResult.aggregations.get('by_question').buckets) {
            buckets = searchResult.aggregations.get('by_question').buckets;
        }
        for (var i = 0; i < buckets.length; i++) {
            var question = buckets[i];
            
            surveyResult[question.key] = {
            	docCount: question.docCount,
            	answers: {}
            };

            var answerBuckets = [];
            if(question.aggregations && question.aggregations.get('by_answer') && question.aggregations.get('by_answer').buckets){
            	answerBuckets = question.aggregations.get('by_answer').buckets;
            }

            for (var j = 0; j < answerBuckets.length; j++) {
            	var ans = answerBuckets[j];
            	log.info('answer key {}', ans.key);
            	surveyResult[question.key].answers[ans.key] = ans.docCount;
            }
        }

        log.info('surveyResult {}', JSON.stringify(surveyResult));
        
    }


    var queryJson1 = {
        'fields': [
            'surveyId',
            'userId',
            'createdDate'
        ],
        'size': 10000,
        'query': {
            'bool': {
                'must': [
                    { 'type': { 'value': RECORD_TYPES.SUBMIT } },
                    { 'term': { 'surveyId': surveyId } },
                ]
            }
        },
        'aggs': {
            'by_browser': {
                'terms': {
                    'field': 'browserName'
                }
            },
            'by_os': {
                'terms': {
                    'field': 'osName'
                }
            },
            'by_device': {
                'terms': {
                    'field': 'deviceModel'
                }
            },
            'by_createdDate': {
                'date_histogram': {
                    "field" : "createdDate",
                    "interval" : "day"
                }
            }
        }
    };

    var searchResult1 = doDBSearch(page, queryJson1);
    var userAgentResult = {
        browser: {},
        os: {},
        device: {}
    };
    var histogram = {};

    if(searchResult1.hits.totalHits>0){
        // Browsers
        var browserBuckets = [];
        if (searchResult1.aggregations && searchResult1.aggregations.get('by_browser') && searchResult1.aggregations.get('by_browser').buckets) {
            browserBuckets = searchResult1.aggregations.get('by_browser').buckets;
        }
        for (var i = 0; i < browserBuckets.length; i++) {
            var browserBucket = browserBuckets[i];
            userAgentResult.browser[browserBucket.key]=browserBucket.docCount;
        }

        // OS
        var osBuckets = [];
        if (searchResult1.aggregations && searchResult1.aggregations.get('by_os') && searchResult1.aggregations.get('by_os').buckets) {
            osBuckets = searchResult1.aggregations.get('by_os').buckets;
        }
        for (var i = 0; i < osBuckets.length; i++) {
            var osBucket = osBuckets[i];
            userAgentResult.os[osBucket.key]=osBucket.docCount;
        }

        // Devices
        var deviceBuckets = [];
        if (searchResult1.aggregations && searchResult1.aggregations.get('by_os') && searchResult1.aggregations.get('by_os').buckets) {
            deviceBuckets = searchResult1.aggregations.get('by_os').buckets;
        }
        for (var i = 0; i < deviceBuckets.length; i++) {
            var deviceBucket = deviceBuckets[i];
            userAgentResult.device[deviceBucket.key]=deviceBucket.docCount;
        }

        // by_createdDate
        var createdDateBuckets = [];
        if (searchResult1.aggregations && searchResult1.aggregations.get('by_createdDate') && searchResult1.aggregations.get('by_createdDate').buckets) {
            createdDateBuckets = searchResult1.aggregations.get('by_createdDate').buckets;
        }
        for (var i = 0; i < createdDateBuckets.length; i++) {
            var createdDateBucket = createdDateBuckets[i];
            histogram[createdDateBucket.keyAsString]=createdDateBucket.docCount;
        }
    }
    return {
        surveyResult: surveyResult,
        userAgentResult: userAgentResult,
        totalSubmits: searchResult1.hits.totalHits,
        histogram: histogram
    };
}

function getPlainAnswers(page, questionId, surveyId){
    log.info('getPlainAnswers {} questionId {} surveyId {}', page, questionId, surveyId);
    var queryJson = {
        'fields': [
            'surveyId',
            'questionId',
            'answerId',
            'userId',
            'fromAddress',
            'userAgentHeader',
            'answerBody',
            'createdDate'
        ],
        'size': 10000,
        'query': {
            'bool': {
                'must': [
                    { 'type': { 'value': RECORD_TYPES.RESULT } },
                    { 'term': { 'surveyId': surveyId } },
                    { 'term': { 'questionId': questionId } },
                ]
            }
        }
    };
    var searchResult = doDBSearch(page, queryJson);
    return searchResult;
}

function viewSurveyResult(page, params){
    log.info('viewSurveyResult {}',params);
}