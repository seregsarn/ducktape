document.addEventListener('keydown', function(ev) {
    if (ev.keyCode == ROT.VK_QUESTION_MARK || (ev.keyCode == ROT.VK_SLASH && ev.shiftKey) || ev.keyCode == ROT.VK_F1) {
        if (vk == 'VK_F1') ev.preventDefault();
        //console.log("toggle help");
        var tgt = 600;
        if ($('#helpText').width() > 0) tgt = 0;
        $('#helpText').animate({
            width: tgt+'px',
        }, { duration: 250 });
        return;
    }
});