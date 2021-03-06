// admin controllers

//controllerMappings
//    .dependencies()
//    .add('KongoDB')
//    .build();

controllerMappings
    .adminController()
    .path('/ksurvey/')
    .enabled(true)
    .defaultView(views.templateView('ksurveyapp/manageSurveys.html'))
    .addMethod('GET', 'getSurveys')
    .addMethod('POST', 'saveSurvey', 'saveSurvey')
    .addMethod('POST', 'deleteSurvey', 'deleteSurvey')
    .addMethod('POST', 'clearSurveyResult', 'clearSurveyResult')
    .build();

controllerMappings
    .adminController()
    .path('/ksurvey')
    .enabled(true)
    .addMethod("GET", "checkRedirect")
    .build();

controllerMappings
    .adminController()
    .path('/ksurvey/(?<surveyId>[^/]*)/')
    .enabled(true)
    .addPathResolver('surveyId', 'findSurvey')
    .defaultView(views.templateView('ksurveyapp/surveyDetail.html'))
    .addMethod('GET', 'getSurvey')
    .addMethod('POST', 'saveSurvey')
    .title('generateTitle')
    .build();

controllerMappings
    .adminController()
    .path('/ksurvey/(?<surveyId>[^/]*)')
    .enabled(true)
    .addMethod("GET", "checkRedirect")
    .build();

controllerMappings
    .adminController()
    .path('/ksurvey/saveGroupAccess/')
    .enabled(true)
    .addMethod('POST', 'saveGroupAccess')
    .build();

controllerMappings
    .adminController()
    .path('/ksurvey/answer/')
    .enabled(true)
    .addMethod('GET','deleteAnswer', 'deleteAnswer')
    .addMethod('GET','getPlainAnswers', 'getPlainAnswers')
    .addMethod('POST','saveAnswer')
    .build();

controllerMappings
    .adminController()
    .path('/ksurvey/clearResult/')
    .enabled(true)
    .addMethod('POST','clearResult')
    .build();

controllerMappings
    .adminController()
    .path('/ksurvey/question/')
    .enabled(true)
    .addMethod('GET','getQuestion','getQuestion')
    .addMethod('GET','deleteQuestion','deleteQuestion')
    .addMethod('POST','saveQuestion')
    .build();

// website controllers
controllerMappings
    .websiteController()
    .path('/ksurvey/')
    .enabled(true)
    .defaultView(views.templateView('ksurveyapp/manageSurveys.html'))
    .addMethod('GET', 'getSurveys')
    .build();

controllerMappings
    .websiteController()
    .path('/ksurvey')
    .enabled(true)
    .addMethod("GET", "checkRedirect")
    .build();

controllerMappings
    .websiteController()
    .path('/ksurvey/(?<surveyId>[^/]*)/')
    .enabled(true)
    .postPriviledge("READ_CONTENT")
    .addPathResolver('surveyId', 'findSurvey')
    .defaultView(views.templateView('ksurveyapp/surveyDetail.html'))
    .addMethod('GET', 'getSurvey')
    .addMethod('POST', 'submitSurvey')
    .title('generateWebsiteTitle')
    .build();

controllerMappings
    .websiteController()
    .path('/ksurvey/(?<surveyId>[^/]*)')
    .enabled(true)
    .addMethod("GET", "checkRedirect")
    .build();

controllerMappings
    .websiteController()
    .path('/ksurvey/(?<surveyId>[^/]*)/result/')
    .enabled(true)
    .addPathResolver('surveyId', 'findSurvey')
    .defaultView(views.templateView('ksurveyapp/surveyResult.html'))
    .addMethod('GET', 'getSurvey')
    .title('generateWebsiteTitle')
    .build();

controllerMappings
    .websiteController()
    .path('/ksurvey/(?<surveyId>[^/]*)/result')
    .enabled(true)
    .addMethod("GET", "checkRedirect")
    .build();

function initApp(orgRoot, webRoot, enabled){
    log.info("initApp: orgRoot={}", orgRoot);

    var dbs = orgRoot.find('jsondb');
    var db = dbs.child(DB_NAME);
    
    if (isNull(db)) {
        log.info('{} does not exist!', DB_TITLE);

        db = dbs.createDb(DB_NAME, DB_TITLE, DB_NAME);

        saveMapping(db);
    }
}

function checkRedirect(page, params) {
    var href = page.href;
    if (!href.endsWith('/')) {
        href = href + '/';
    }

    return views.redirectView(href);
}


controllerMappings.addNodeType("ksurveySubmittedGoal", "ksurveyapp/ksurveySubmittedGoalNode.js");

controllerMappings.addComponent( "ksurveyapp", "ksurveyEmail", "email", "Shows button with link to survey");
controllerMappings.addComponent( "ksurveyapp", "ksurveyForm", "html", "Shows survey form questions");
controllerMappings.addComponent( "ksurveyapp", "ksurveyResult", "html", "Shows survey result");
controllerMappings.addComponent( "ksurveyapp", "ksurveyList", "html", "Shows surveys list");