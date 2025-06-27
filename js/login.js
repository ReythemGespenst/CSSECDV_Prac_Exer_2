$(document).ready(function () {
    const hasError = $('#errors p').length > 0;
    if (hasError) {
        $('.formbox').css('background-color', '#ffe6e6');
    }
});