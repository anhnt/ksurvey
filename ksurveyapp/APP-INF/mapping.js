var RECORD_TYPES = {
    SURVEY: 'survey',
    QUESTION: 'question',
    ANSWER: 'answer',
    RESULT: 'result',
    SUBMIT: 'submit'
};

var surveyMapping = {
    "properties": {
        "name": {
            "type": "string"
        },
        "description": {
            "type": "string"
        },
        "status": {
            "type": "boolean"
        },
        "modifiedDate": {
            "type": "date"
        },
        "createdDate": {
            "type": "date"
        },
        "createdBy": {
            "type": "string"
        },
        "modifiedBy": {
            "type": "string"
        },
        "startTime": {
            "type": "date"
        },
        "endTime": {
            "type": "date"
        },
        "groups": {
            "type": "string"
        },
        "websites": {
            "type": "string"
        }
    }
};


var questionMapping = {
    "properties": {
        "title": {
            "type": "string"
        },
        "body": {
            "type": "string"
        },
        "answerLayout": {
            "type": "string"
        },
        "surveyId": {
            "type": "string",
            "index": "not_analyzed"
        },
        "modifiedDate": {
            "type": "date"
        },
        "createdDate": {
            "type": "date"
        },
        "createdBy": {
            "type": "string"
        },
        "type": {
            "type": "string"
        }
    }
};


var answerMapping = {
    "properties": {
        "questionId": {
            "type": "string",
            "index": "not_analyzed"
        },
        "body": {
            "type": "string"
        },
        "surveyId": {
            "type": "string",
            "index": "not_analyzed"
        },
        "modifiedDate": {
            "type": "date"
        },
        "createdDate": {
            "type": "date"
        },
        "createdBy": {
            "type": "string"
        }
    }
};

var surveySubmitsMapping = {
    "properties": {
        "surveyId": {
            "type": "string",
            "index": "not_analyzed"
        },
        "userId": {
            "type": "string",
            "index": "not_analyzed"
        },
        "createdDate": {
            "type": "date"
        },
        "fromAddress": {
            "type": "string"
        },
        "browserName": {
            "type": "string",
            "index": "not_analyzed"
        },
        "browserVersion": {
            "type": "string"
        },
        "osName": {
            "type": "string",
            "index": "not_analyzed"
        },
        "osVersion": {
            "type": "string"
        },
        "deviceModel": {
            "type": "string",
            "index": "not_analyzed"
        },
        "deviceVendor": {
            "type": "string",
            "index": "not_analyzed"
        },
        "deviceType": {
            "type": "string"
        }
    }
};

var resultMapping = {
    "properties": {
        "surveyId": {
            "type": "string",
            "index": "not_analyzed"
        },
        "questionId": {
            "type": "string",
            "index": "not_analyzed"
        },
        "answerId": {
            "type": "string",
            "index": "not_analyzed"
        },
        "userId": {
            "type": "string",
            "index": "not_analyzed"
        },
        "createdDate": {
            "type": "date"
        },
        "answerBody": {
            "type": "string"
        }
    }
};
