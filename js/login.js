$(document).ready(function () {
    $('.formbox').submit(function (e) {
        e.preventDefault();

        // Clear previous errors
        $('#errors').empty();
        $('.formbox').css('background-color', ''); // Reset bg color

        $.ajax({
            url: '/post/login',
            method: 'POST',
            data: $(this).serialize(),
            success: function (res) {
                if (res.success) {
                    // Redirect to dashboard on success
                    window.location.href = '/dashboard';
                } else {
                    // Show error visually
                    $('.formbox').css('background-color', '#ffe6e6'); // Light red background
                    $('#errors').append('<p style="color:red;">Username/password incorrect</p>');
                }
            },
            error: function () {
                $('.formbox').css('background-color', '#ffe6e6');
                $('#errors').append('<p style="color:red;">Server error. Please try again.</p>');
            }
        });
    });
});