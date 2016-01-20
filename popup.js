$(document).ready(function () {
    var wrapper = $('<div id="vkscript-wrapper"></div>');
    $('body').append(wrapper);
    $('#vkscript-wrapper').load(chrome.extension.getURL("popup.html"), function () {
        window.AutohideCommentsSpells = [];
        window.AutohideCommentsWithImages = false;
        window.AutohideCommentsWithAudio = false;
        window.AutohideCommentsInterval = 0;

        $(".autohide-button").click(function () {
            $("#vkscript-about").addClass("hidden");

            $("#vkscript-autohide").toggleClass("hidden");
        });

        $(".about-button").click(function () {
            $("#vkscript-autohide").addClass("hidden");

            $("#vkscript-about").toggleClass("hidden");
        });

        $("#comment-autohide-apply").click(function () {
            AutohideCommentsApply();
        });

        $(".comment-autohide")[0].value = window.localStorage["vkscript-comments-spells"];
        $("input[name='image-filter']")[0].checked = JSON.parse(window.localStorage["vkscript-comments-imageshide"]);
        $("input[name='audio-filter']")[0].checked = JSON.parse(window.localStorage["vkscript-comments-audioshide"]);
        AutohideCommentsApply();
    });
});

function AutohideCommentsApply() {
    $("*").removeClass("script-hidden");
    var value = $(".comment-autohide")[0].value.split(",").map(function (el) {
        return el.trim().toLowerCase();
    });

    window.AutohideCommentsSpells = value;
    window.AutohideCommentsWithImages = $("input[name='image-filter']")[0].checked;
    window.AutohideCommentsWithAudio = $("input[name='audio-filter']")[0].checked;

    window.localStorage["vkscript-comments-spells"] = $(".comment-autohide")[0].value;
    window.localStorage["vkscript-comments-imageshide"] = $("input[name='image-filter']")[0].checked;
    window.localStorage["vkscript-comments-audioshide"] = $("input[name='audio-filter']")[0].checked;
    clearInterval(window.AutohideCommentsInterval);
    window.AutohideCommentsInterval = setInterval(function () {

        window.AutohideCommentsSpells.forEach(function (word) {
            $(".fw_reply, .reply").each(function (index, element) {
                var $el = $(element).find(".fw_reply_text, .wall_reply_text, .reply_text");

                if ($(element).has(".audio").length > 0 && window.AutohideCommentsWithAudio)
                    $(element).addClass("script-hidden");

                if ($(element).has(".page_post_thumb_sized_photo").length > 0 && window.AutohideCommentsWithImages)
                    $(element).addClass("script-hidden");

                if ($el.length > 0 && $el.text().indexOf(word) > -1 && word.length > 0)
                    $(element).addClass("script-hidden");
            });

        })

        
    }, 200);
}

