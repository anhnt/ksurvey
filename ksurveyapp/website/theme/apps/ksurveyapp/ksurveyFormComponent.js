(function ($) {
    var KEditor = $.keditor;
    var flog = KEditor.log;

    KEditor.components['ksurveyForm'] = {
        settingEnabled: true,

        settingTitle: 'KSurveyForm Settings',

        initSettingForm: function (form, keditor) {
            return $.ajax({
                url: '_components/ksurveyForm?settings',
                type: 'get',
                dataType: 'HTML',
                success: function (resp) {
                    form.html(resp);

                    form.find('.select-survey').on('change', function () {
                        var surveyName = this.value;

                        var component = keditor.getSettingComponent();
                        var dynamicElement = component.find('[data-dynamic-href]');

                        component.attr('data-surveyname', surveyName);
                        keditor.initDynamicContent(dynamicElement);
                    });
                }
            });
        },
        showSettingForm: function (form, component, keditor) {
            flog('showSettingForm "ksurveyForm" component');

            var dataAttributes = keditor.getDataAttributes(component, ['data-type'], false);
            form.find('.select-survey').val(dataAttributes['data-surveyname']);
        }
    };

})(jQuery);