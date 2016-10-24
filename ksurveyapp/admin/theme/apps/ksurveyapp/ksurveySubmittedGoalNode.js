JBNodes['ksurveySubmittedGoal'] = {
    title: '<i class="fa fa-trophy"></i> <span class="node-type">KSurvey Submit Goal</span>',
    previewUrl: '/theme/apps/ksurveyapp/ksurvey-submit-goal.png',
    ports: {
        timeoutNode: {
            label: 'timeout',
            title: 'When timeout',
            maxConnections: 1
        },
        nextNodeId: {
            label: 'then',
            title: 'When completed',
            maxConnections: 1
        }
    },

    nodeTypeClass: 'customGoal',

    settingEnabled: false,

    initSettingForm: function (form) {
    },

    showSettingForm: function (form, node) {
    }
};
