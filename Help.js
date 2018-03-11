function toggleHelpText() {
    var tgt = 600;
    if ($('#helpText').width() > 0) tgt = 0;
    $('#helpText').animate({
        width: tgt+'px',
    }, { duration: 250 });
}
$(document).ready(function() {
    document.addEventListener('keydown', function(ev) {
        if (ev.keyCode == ROT.VK_QUESTION_MARK || (ev.keyCode == ROT.VK_SLASH && ev.shiftKey) || ev.keyCode == ROT.VK_F1) {
            if (ev.keyCode == ROT.VK_F1) ev.preventDefault();
            toggleHelpText();
            return;
        }
    });
    $('#helpTab').on('click', function(ev) {
        toggleHelpText();
    });
});