function Settings() {
    this.AutohideCommentsSpells = [];
    this.AutohideCommentsWithImages = false;
    this.AutohideCommentsWithAudio = false;
    this.Interval = 0;
}

Settings.prototype.Load = function () {
    $(".comment-autohide")[0].value = window.localStorage["vkscript-comments-spells"];
    $("input[name='image-filter']")[0].checked = JSON.parse(window.localStorage["vkscript-comments-imageshide"]);
    $("input[name='audio-filter']")[0].checked = JSON.parse(window.localStorage["vkscript-comments-audioshide"]);
}

Settings.prototype.SaveComments = function () {
    window.localStorage["vkscript-comments-spells"] = $(".comment-autohide")[0].value;
    window.localStorage["vkscript-comments-imageshide"] = $("input[name='image-filter']")[0].checked;
    window.localStorage["vkscript-comments-audioshide"] = $("input[name='audio-filter']")[0].checked;

    var value = $(".comment-autohide")[0].value.split(",").map(function (el) {
        return el.trim().toLowerCase();
    });

    this.AutohideCommentsSpells = value;
    this.AutohideCommentsWithImages = $("input[name='image-filter']")[0].checked;
    this.AutohideCommentsWithAudio = $("input[name='audio-filter']")[0].checked;
}

var confing;
var currentImage;

$(document).ready(function () {
    var wrapper = $('<div id="vkscript-wrapper"></div>');
    $('body').append(wrapper);
    $('#vkscript-wrapper').load(chrome.extension.getURL("popup.html"), function () {
        confing = new Settings();

        $(".autohide-button").click(function () {
            $("#vkscript-about").addClass("hidden");

            $("#vkscript-comments").toggleClass("hidden");
        });

        $(".about-button").click(function () {
            $("#vkscript-comments").addClass("hidden");

            $("#vkscript-about").toggleClass("hidden");
        });

        $("#comment-autohide-apply").click(function () {
            confing.SaveComments();
        });

        confing.Interval = setInterval(ProcessScript, 200);

        confing.Load();
        confing.SaveComments();

    });
});

function ProcessScript() {
    /*Comments*/
    $("*").removeClass("script-hidden");
    confing.AutohideCommentsSpells.forEach(function (word) {
        $(".fw_reply, .reply").each(function (index, element) {
            var $el = $(element).find(".fw_reply_text, .wall_reply_text, .reply_text");

            if ($(element).has(".audio").length > 0 && confing.AutohideCommentsWithAudio)
                $(element).addClass("script-hidden");

            if ($(element).has(".page_post_thumb_sized_photo").length > 0 && confing.AutohideCommentsWithImages)
                $(element).addClass("script-hidden");

            if ($el.length > 0 && $el.text().indexOf(word) > -1 && word.length > 0)
                $(element).addClass("script-hidden");
        });

    });
    /*Images*/
    if ($("#pv_actions").length > 0)
    {
        currentImage = $("#pv_photo img").prop("src");
        if ($(".vkscript-find").length == 0)
        {
            $("#pv_actions").append($('<a class="vkscript-find vkscript-find-yandex" target="_blank" href="http://yandex.ru/images/search?rpt=imageview&img_url=' + currentImage + '"></a>'));
            $("#pv_actions").append($('<a class="vkscript-find vkscript-find-google" target="_blank" href="http://www.google.com/searchbyimage?image_url=' + currentImage + '&safe=off"></a>'));
            $("#pv_actions").append($('<a class="vkscript-find vkscript-find-iqdb" target="_blank" href="http://iqdb.org/?url=' + currentImage + '"></a>'));
        }
    }
        

}