function initCheckboxes(){
	$('.answers input[type=checkbox]').on('click', function(e){
		var name = $(this).attr('name');
		var val = $('input[type=text][name=temp-'+name+']').val().split(',');
		if(this.checked){
			if(val.length && val.indexOf(this.value)===-1){
				val.push(this.value);
			}
		}else{
			if(val.length && val.indexOf(this.value)!==-1){
				var index = val.indexOf(this.value);
				val.splice(index, 1);
			}
		}

		$('input[type=text][name=temp-'+name+']').val(val.join(','));
	});
}

function initForm(){
	$('#surveyform').forms({
		onSuccess: function(resp, form, config) {
			if(resp.status){
				form.trigger('reset');
				Msg.info('Survey submitted successfully!');
				setTimeout(function(){
					window.location = window.location;
				},1000);
			}else{
				Msg.error(resp.messages.join('<br/>'));
			}
		}
	})
}

function initTimeago(){
    $('.timeago').timeago();
    $('.surveytime').each(function(){
        var txt = $(this).text();
         $(this).text(moment(txt).format('DD/MM/YYYY hh:mm:ss'));
    })
}

$(function(){
	initCheckboxes();
	initForm();
	initTimeago();
});