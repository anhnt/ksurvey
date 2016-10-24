// private functions
function getSurveysList(page) {
    log.info('getSurveys > page={} ', page);

    var db = getDB(page);
    var surveys = db.findByType(RECORD_TYPES.SURVEY);

    log.info('Found {} surveys(s)', surveys.length);

    return surveys;
}

// GET /ksurvey/getSurveys
function getSurveys(page, params) {
	var surveys = getSurveysList(page);
    page.attributes.surveys = surveys;
    log.info('Display {} surveys(s)', page.attributes.surveys.length);
}

// GET /ksurvey/getSurvey
function getSurvey(page, params){
    log.info('getSurvey > params ', page, params.getSurvey);
    // Get query strings
    var survey = page.attributes.surveyId;
    page.attributes.survey = survey;
    var searchResult = findQuestionBySurvey(page, survey.name);
    page.attributes.questionResult = searchResult.questionResult;
    page.attributes.answerResult = searchResult.answerResult;
}

function saveGroupAccess(page, params){
    log.info('saveGroupAccess >', params);
    var surveyId = params.surveyId;
    var groupName = params.group;
    var isAdd = safeBoolean(params.isAdd);
    var errors = [];
    if(surveyId && groupName){
        var db = getDB(page);
        var surveyRes = db.child(surveyId);
        log.info('Survey found {}',surveyRes);
        if(surveyRes){
            var survey = JSON.parse(surveyRes.json);
            var groups = survey.groups;
            var arr = splitToCleanArray(groups, ',');
            if(isAdd && arr.indexOf(groupName)===-1){
                arr.push(groupName);
            }else{
                var index = arr.indexOf(groupName);
                if(index>-1) arr.splice(index, 1);
            }
            survey.groups = arr.join(',');
            surveyRes.update(JSON.stringify(survey), RECORD_TYPES.SURVEY);
            log.info('updated survey {}', survey);
        }
    }else{
        errors.push('System error! Please contact to administrator for more information.');
    }
    
    var result;
    if(errors.length>0){
        result = {
            status: false,
            messages: errors
        };    
    }else{
        result = {
            status: true,
            messages: ['Successfully add/update survey']
        };
    }
    
    return views.jsonObjectView(JSON.stringify(result)).wrapJsonResult();
}

// POST /ksurvey
function saveSurvey (page, params) {
    log.info('saveSurvey >', params.saveSurvey);
    var surveyId = params.surveyId;
    var name = params.name;
    var description = params.description;
    var user = params.user;
    var status = safeBoolean(params.status);
    var startTime = params.startTime;
    var endTime = params.endTime;
    var websites = params.websites;
    var db = getDB(page);
    var errors = [];
    var returnObj;
    if(!name || !description){
        errors.push('There was an error when creating/updating survey. Please try again!');
    }else{
        if(surveyId){
            // Update
            var surveyRes = db.child(surveyId);
            if(surveyRes !== null){
                var survey = JSON.parse(surveyRes.json);
                survey.name = name;
                survey.description = description;
                survey.status = status;
                survey.modifiedDate = new Date();
                survey.createdBy = user;
                survey.modifiedBy = user;
                survey.websites = websites;
                if(startTime && endTime){
                    survey.startTime = startTime;
                    survey.endTime = endTime;
                }
                returnObj = survey;
                returnObj.surveyId = surveyId;
                surveyRes.update(JSON.stringify(survey), RECORD_TYPES.SURVEY);
                log.info('updated survey {}', survey);
            }else{
                errors.push('There was an error when updating survey. Please try again!')
            }
        }else{
            // Create new answer
            newId = RECORD_TYPES.SURVEY + '-' + generateRandomText(30);
            var surveyJson = {
                name: name,
                description: description,
                status: status,
                modifiedDate: new Date(),
                createdDate: new Date(),
                createdBy: user,
                modifiedBy: user,
                websites: websites
            };
            if(startTime && endTime){
                surveyJson.startTime = startTime;
                surveyJson.endTime = endTime;
            }
            returnObj = surveyJson;
            returnObj.surveyId = newId;
            db.createNew(newId, JSON.stringify(surveyJson), RECORD_TYPES.SURVEY);
            log.info('Added new survey {}', surveyJson);
        }
    }

    var result;
    if(errors.length>0){
        result = {
            status: false,
            messages: errors
        };    
    }else{
        result = {
            status: true,
            messages: ['Successfully add/update survey'],
            data: returnObj
        };
    }
    
    return views.jsonObjectView(JSON.stringify(result)).wrapJsonResult();
}

// GET /ksurvey/deleteAnswer
function deleteAnswer(page, params){
    var answerId = params.answerId;
    if(answerId){
        var db = getDB(page);
        var answerRes = db.child(answerId);
        if(answerRes !== null){
            var result = answerRes.delete();
            return views.jsonObjectView(JSON.stringify({status: true})).wrapJsonResult();
        }
    } else{
        return views.jsonObjectView(JSON.stringify({status: false, messages: ['There was an error when deleting this answer. Please try again']})).wrapJsonResult();
    }
}

// POST /ksurvey/saveAnswer
function saveAnswer(page, params){
    var questionId = params.questionId;
    var surveyId = params.surveyId;
    var answerId = params.answerId;
    var answerBody = params.answerBody;
    var db = getDB(page);
    var errors = [];
    var newId;
    if(surveyId === null || questionId === null || answerBody === null){
        errors.push('There was an error when creating/updating answer. Please try again!');
    } else {
        if(answerId !== null) {
            log.info('update answer');
            // Update answer
            var answerRes = db.child(answerId);
            if(answerRes !== null){
                var answer = JSON.parse(answerRes.json);
                answer.body = answerBody;
                answer.modifiedDate = new Date();
                var updateStatus = answerRes.update(JSON.stringify(answer), RECORD_TYPES.ANSWER);
            }else{
                errors.push('There was an error when updating answer. Please try again!')
            }
            
        } else {
            // Create new answer
            newId = RECORD_TYPES.ANSWER + '-' + generateRandomText(30);
            var answerJson = {
                surveyId: surveyId,
                questionId: questionId,
                body: answerBody,
                modifiedDate: new Date(),
                createdDate: new Date()
            };
            db.createNew(newId, JSON.stringify(answerJson), RECORD_TYPES.ANSWER);
            log.info('Added new answer {}', answer);
        }
    }
    
    var status;
    if(errors.length>0){
        status = {
            status: false,
            messages: errors
        };    
    }else{
        var returnId = answerId? answerId: newId;
        status = {
            status: true,
            messages: ['Successfully add/update answer'],
            data: {answerId: returnId, answerBody: answerBody}
        }
    }
    
    return views.jsonObjectView(JSON.stringify(status)).wrapJsonResult();
}

// GET /ksurvey/getQuestion
function getQuestion (page, params) {
    log.info('getQuestion {}', params.getQuestion);
    var questionId = params.questionId;
    var result;
    var db = getDB(page);
    if(!questionId){
        result = {
            status: false,
            messages: ['There was an error when getting question.']
        };
    }else{
        var questionRes = db.child(questionId);
        if(!questionRes){
            result = {
                status: false,
                messages: ['Question not found']
            };
        }else{
            result = {
                status: true,
                data: questionRes.json,
            };
        }
    }
    return views.jsonObjectView(JSON.stringify(result)).wrapJsonResult();
}

// POST /ksurvey/saveQuestion
function saveQuestion(page, params){
    var questionId = params.questionId;
    var surveyId = params.surveyId;
    var questionTitle = params.questionTitle;
    var questionType = params.questionType;
    var answerLayout = params.answerLayout || 0; // o means vertical
    var questionBody = params.questionBody || '';
    var user = params.createdBy;
    var db = getDB(page);
    var errors = [];
    var returnObj;
    if(!surveyId || !questionTitle ){
        errors.push('There was an error when creating/updating question. Please try again!');
    } else {
        if(questionId) {
            log.info('update question {}', questionId);
            // Update answer
            var questionRes = db.child(questionId);
            if(questionRes !== null){
                var question = JSON.parse(questionRes.json);
                question.title = questionTitle;
                question.type = questionType;
                question.body = questionBody;
                question.answerLayout = answerLayout;
                question.modifiedDate = new Date();
                returnObj = question;
                returnObj.questionId = questionId;
                questionRes.update(JSON.stringify(question), RECORD_TYPES.QUESTION);
            }else{
                errors.push('There was an error when updating question. Please try again!')
            }
            
        } else {
            // Create new question
            var newId = RECORD_TYPES.QUESTION + '-' + generateRandomText(30);
            var questionJson = {
                surveyId: surveyId,
                title: questionTitle,
                type: questionType,
                body: questionBody,
                answerLayout: answerLayout,
                modifiedDate: new Date(),
                createdDate: new Date(),
                createdBy: user
            };
            returnObj = questionJson;
            returnObj.questionId = newId;
            db.createNew(newId, JSON.stringify(questionJson), RECORD_TYPES.QUESTION);
            if(questionType==2){
                var answers = [
                    {questionId: newId, surveyId: surveyId, body: 'Yes', modifiedDate: new Date(), createdDate: new Date()},
                    {questionId: newId, surveyId: surveyId, body: 'No', modifiedDate: new Date(), createdDate: new Date()}
                ];
                for(var i = 0; i < answers.length; i++){
                    newAnswerId = RECORD_TYPES.ANSWER + '-' + generateRandomText(30);
                    db.createNew(newAnswerId, JSON.stringify(answers[i]), RECORD_TYPES.ANSWER);
                    log.info('Added new answer {}', answers[i]);
                }
            }
            log.info('Added new question {}', questionJson);
        }
    }
    
    var status;
    if(errors.length>0){
        status = {
            status: false,
            messages: errors
        };    
    }else{
        status = {
            status: true,
            messages: ['Successfully add/update question'],
            data: returnObj
        }
    }
    
    return views.jsonObjectView(JSON.stringify(status)).wrapJsonResult();
}

// GET /ksurvey/deleteQuestion
function deleteQuestion(page, params){
    log.info('delete question {}', params.deleteQuestion);
    var questionId = params.questionId;
    if(questionId){
        var db = getDB(page);
        var questionRes = db.child(questionId);
        if(questionRes !== null){
            var result = questionRes.delete();
            return views.jsonObjectView(JSON.stringify({status: true})).wrapJsonResult();
        }
    } else{
        return views.jsonObjectView(JSON.stringify({status: false, messages: ['There was an error when deleting this question. Please try again']})).wrapJsonResult();
    }
}

// GET /ksurvey
function deleteSurvey(page, params){
    log.info('delete survey {}', params.deleteSurvey);
    var surveyId = params.surveyId;
    if(surveyId){
        var db = getDB(page);
        var surveyRes = db.child(surveyId);
        if(surveyRes !== null){
            var result = surveyRes.delete();
            return views.jsonObjectView(JSON.stringify({status: true})).wrapJsonResult();
        }
    } else{
        return views.jsonObjectView(JSON.stringify({status: false, messages: ['There was an error when deleting this question. Please try again']})).wrapJsonResult();
    }
}

function findQuestionBySurvey(page, surveyId){
    log.info('findQuestionBySurvey > page={}, surveyId={}', page, surveyId);

    var queryJson = {
        'sort': {
            'createdDate':'asc'
        },
        'fields': [
            'body',
            'surveyId',
            'questionId',
            'title',
            'type',
            'answerLayout'
        ],
        'size': 1000,
        'aggs': {
            "group_by_question": {
                "terms": {
                    "field": "questionId"
                }
            }
        },
        'query': {
            'bool': {
                'must': [
                    {'type': { 'value': RECORD_TYPES.QUESTION } },
                    { 'term': { 'surveyId': surveyId } }
                ]
            }
        }
    };


    var questionResult = doDBSearch(page, queryJson);
    queryJson.query = {
        'bool': {
            'must': [
                {'type': { 'value': RECORD_TYPES.ANSWER } },
                { 'term': { 'surveyId': surveyId } }
            ]
        }
    };
    var answerResult = doDBSearch(page, queryJson);
    return {
        questionResult: questionResult,
        answerResult: answerResult
    };
}

// this function would be invoked in view
function getQuestionType(type){
    var QUESTION_TYPES = ['Multiple Choices','Plain Text', 'Yes/No question', 'Single Choice'];
    return QUESTION_TYPES[type];
}

function findSurvey(rf, groupName, groupVal, mapOfGroups) {
    log.info('findSurvey > {} {} {} {}', rf, groupName, groupVal, mapOfGroups);

    var db = getDB(rf);
    var survey = db.child(groupVal);
    log.info('Survey found {}',survey);
    if (isNull(survey)) {
        return null;
    }

    return survey;
}

function generateTitle(page){
    log.info('generateTitle > page={}', page);
    var title = 'Manage Survey | ' + page.attributes.surveyId.jsonObject.name;
    return title;
}

function clearResult(page, params){
    log.info('findSubmissions {}', page);

    var db = getDB(page);
    var userId = params.userId;
    var surveyId = params.surveyId;

    var queryJson = {
        'fields': [
            'userId',
            'surveyId'
        ],
        'size': 10000,
        'query': {
            'bool': {
                'must': [
                    {'type': { 'value': RECORD_TYPES.SUBMIT } },
                    { 'term': { 'surveyId': surveyId } }
                ]
            }
        }
    };

    var queryJson2 = {
        'fields': [
            'userId',
            'surveyId'
        ],
        'size': 10000,
        'query': {
            'bool': {
                'must': [
                    {'type': { 'value': RECORD_TYPES.RESULT } },
                    { 'term': { 'surveyId': surveyId } }
                ]
            }
        }
    };
    if (userId) {
        queryJson.query.bool.must.push({'term': {'userId': userId}});
    }


    var searchResult = doDBSearch(page, queryJson);
    if (searchResult.hits.totalHits > 0) {
        var hits = searchResult.hits.hits;
        for(var i = 0; i< hits.length; i++){
            log.info('hit item {}, id {}', hits[i], hits[i].id);
            var submitRes = db.child(hits[i].id);
            if(submitRes) submitRes.delete();
        }
    }

    var searchResult2 = doDBSearch(page, queryJson2);
    if (searchResult2.hits.totalHits > 0) {
        var hits = searchResult2.hits.hits;
        for(var i = 0; i< hits.length; i++){
            log.info('hit item {}, id {}', hits[i], hits[i].id);
            var resultRes = db.child(hits[i].id);
            if(resultRes) resultRes.delete();
        }
    }

    return views.jsonObjectView(JSON.stringify({status: true}))
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
                    'field': 'questionId',
                    'size': 10000
                },
                'aggs': {
                    'by_answer': {
                        'terms': {
                            'field': 'answerId',
                            'size': 10000
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
                    'field': 'browserName',
                    'size': 10000
                }
            },
            'by_os': {
                'terms': {
                    'field': 'osName',
                    'size': 10000
                }
            },
            'by_device': {
                'terms': {
                    'field': 'deviceModel',
                    'size': 10000
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