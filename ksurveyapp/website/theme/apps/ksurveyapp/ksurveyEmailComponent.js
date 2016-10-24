(function ($) {
    var KEditor = $.keditor;
    var flog = KEditor.log;

    KEditor.components['ksurveyEmail'] = {
        settingEnabled: true,

        settingTitle: 'KSurvey Settings',

        initSettingForm: function (form, keditor) {
            return $.ajax({
                url: '_components/ksurveyEmail?settings',
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
                    form.find('.select-website').on('change', function () {
                        var websiteName = this.value;

                        var component = keditor.getSettingComponent();
                        var dynamicElement = component.find('[data-dynamic-href]');

                        component.attr('data-websitename', websiteName);
                        keditor.initDynamicContent(dynamicElement);
                    });

                    form.find('.invitation').on('change', function () {
                        var invitation = this.value;

                        var component = keditor.getSettingComponent();
                        var dynamicElement = component.find('[data-dynamic-href]');

                        component.attr('data-invitation', invitation);
                        keditor.initDynamicContent(dynamicElement);
                    });

                    form.find('.buttonStyle').on('change', function () {
                        var invitation = this.value;

                        var component = keditor.getSettingComponent();
                        var dynamicElement = component.find('[data-dynamic-href]');

                        component.attr('data-style', invitation);
                        keditor.initDynamicContent(dynamicElement);
                    });

                    form.find('.align').on('change', function () {
                        var va = this.value;

                        var component = keditor.getSettingComponent();
                        var dynamicElement = component.find('[data-dynamic-href]');

                        component.attr('data-align', va);
                        keditor.initDynamicContent(dynamicElement);
                    });

                }
            });
        },
        showSettingForm: function (form, component, keditor) {
            flog('showSettingForm "ksurveyEmail" component');

            var dataAttributes = keditor.getDataAttributes(component, ['data-type'], false);
            form.find('.select-survey').val(dataAttributes['data-surveyname']);
            form.find('.select-website').val(dataAttributes['data-websitename']);
            form.find('.invitation').val(dataAttributes['data-invitation']);
            form.find('.buttonStyle').val(dataAttributes['data-style']);
            form.find('.align').val(dataAttributes['data-align']);
        }
    };

})(jQuery);