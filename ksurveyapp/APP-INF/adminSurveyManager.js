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
                survey.modifiedBy = user;
                survey.startTime = startTime;
                survey.endTime = endTime;
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
                startTime: startTime,
                endTime: endTime
            };
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
            'type'
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
    var QUESTION_TYPES = ['Multichoices','Plain text', 'Yes/No question', 'Selectbox question'];
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