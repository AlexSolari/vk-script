Array.prototype.removeConditional = function (comparator) {
    var result = [];
    this.forEach(function (arg) { if (!comparator(arg)) result.push(arg) });
    return result;
};

String.prototype.getHash = function () {
    var arr = this.split('');
    var hash = 0;
    for (var i = 0; i < arr.length; i++) {
        hash += arr[i].charCodeAt(0)
    }
    hash = arr[0] + hash + arr[arr.length - 1];
    hash = hash + hash.length;
    return hash;
}

function Settings() {
    this.AutohideCommentsSpells = [];
    this.AutohideCommentsWithImages = false;
    this.AutohideCommentsWithAudio = false;

    this.Bookmarks = [];

    this.AutohidePostsSpells = [];
    this.AutohideReposts = false;

    this.HideEmodzi = false;

    this.Interval = 0;
}

Settings.prototype.Load = function () {
    $(".comment-autohide")[0].value = window.localStorage["vkscript-comments-spells"] || "";

    $(".post-autohide")[0].value = window.localStorage["vkscript-posts-spells"] || "";
    $("input[name='repost-filter']")[0].checked = JSON.parse(window.localStorage["vkscript-repostshide"]);

    $("input[name='image-filter']")[0].checked = JSON.parse(window.localStorage["vkscript-comments-imageshide"]);
    $("input[name='audio-filter']")[0].checked = JSON.parse(window.localStorage["vkscript-comments-audioshide"]);

    $("input[name='emodji-filter']")[0].checked = JSON.parse(window.localStorage["vkscript-emodji-filter"]);

    this.Bookmarks = JSON.parse(window.localStorage["vkscript-bookmarks"] || "[]");
}

Settings.prototype.SavePosts = function () {
    window.localStorage["vkscript-posts-spells"] = $(".post-autohide")[0].value;
    window.localStorage["vkscript-repostshide"] = $("input[name='repost-filter']")[0].checked;

    var posts_spells = $(".post-autohide")[0].value.split(",").map(function (el) {
        return el.trim().toLowerCase();
    });

    this.AutohidePostsSpells = posts_spells;
    this.AutohideReposts = $("input[name='repost-filter']")[0].checked;

    $(".post").removeClass("hidden");
}

Settings.prototype.SaveComments = function () {
    window.localStorage["vkscript-comments-spells"] = $(".comment-autohide")[0].value;

    window.localStorage["vkscript-comments-imageshide"] = $("input[name='image-filter']")[0].checked;
    window.localStorage["vkscript-comments-audioshide"] = $("input[name='audio-filter']")[0].checked;

    var comments_spells = $(".comment-autohide")[0].value.split(",").map(function (el) {
        return el.trim().toLowerCase();
    });

    this.AutohideCommentsSpells = comments_spells;

    this.AutohideCommentsWithImages = $("input[name='image-filter']")[0].checked;
    this.AutohideCommentsWithAudio = $("input[name='audio-filter']")[0].checked;

    $(".fw_reply, .reply").removeClass("script-hidden");
}

Settings.prototype.SaveDiff = function () {
    window.localStorage["vkscript-emodji-filter"] = $("input[name='emodji-filter']")[0].checked;

    this.HideEmodzi = $("input[name='emodji-filter']")[0].checked;
}

Settings.prototype.AddBookmark = function (url, text) {
    var copies = this.Bookmarks.find(function (x) {
        return x.text.getHash() + x.url.getHash() == text.getHash() + url.getHash()
    });

    if (copies)
        return null;

    var mark = { "url": url, "text": text, "id": "mark-" + ("" + Math.random()).split('.')[1] };

    this.Bookmarks.push(mark);

    return mark;
}

Settings.prototype.DeleteBookmark = function (id) {
    this.Bookmarks = this.Bookmarks.removeConditional(function (mark) {
        return mark.id == id;
    });
}

Settings.prototype.ClearBookmarks = function () {
    this.Bookmarks = [];
}

Settings.prototype.SaveBookmarks = function () {
    window.localStorage["vkscript-bookmarks"] = JSON.stringify(this.Bookmarks);
}

var config;
var currentImage;

$(window).load(function () {
    var wrapper = $('<div id="vkscript-wrapper"></div>');
    $('body').append(wrapper);
    $('#vkscript-wrapper').load(chrome.extension.getURL("popup.html"), function () {
        config = new Settings();

        $(".autohide-button").click(function () {
            $("#vkscript-about").addClass("hidden");
            $("#vkscript-diff").addClass("hidden");
            $("#vkscript-posts").addClass("hidden");
            $("#vkscript-bookmarks").addClass("hidden");

            $("#vkscript-comments").toggleClass("hidden");
        });
        $(".about-button").click(function () {
            $("#vkscript-comments").addClass("hidden");
            $("#vkscript-diff").addClass("hidden");
            $("#vkscript-posts").addClass("hidden");
            $("#vkscript-bookmarks").addClass("hidden");

            $("#vkscript-about").toggleClass("hidden");
        });
        $(".diff-button").click(function () {
            $("#vkscript-comments").addClass("hidden");
            $("#vkscript-about").addClass("hidden");
            $("#vkscript-posts").addClass("hidden");
            $("#vkscript-bookmarks").addClass("hidden");

            $("#vkscript-diff").toggleClass("hidden");
        });
        $(".posts-button").click(function () {
            $("#vkscript-comments").addClass("hidden");
            $("#vkscript-about").addClass("hidden");
            $("#vkscript-diff").addClass("hidden");
            $("#vkscript-bookmarks").addClass("hidden");

            $("#vkscript-posts").toggleClass("hidden");
        });
        $(".bookmarks-button").click(function () {
            $("#vkscript-comments").addClass("hidden");
            $("#vkscript-about").addClass("hidden");
            $("#vkscript-diff").addClass("hidden");
            $("#vkscript-posts").addClass("hidden");

            $("#vkscript-bookmarks").toggleClass("hidden");
        });

        $("#comment-autohide-apply").click(function () {
            config.SaveComments();
            ProcessScript();
        });
        $("#diff-apply").click(function () {
            config.SaveDiff();
            ProcessScript();
        });
        $("#post-autohide-apply").click(function () {
            config.SavePosts();
            ProcessScript();
        });

        $("#delete-all-bookmarks").click(function () {
            config.ClearBookmarks();
            RedrawBookmarks();
            config.SaveBookmarks();
        })

        config.Interval = setInterval(ProcessScript, 500);

        config.Load();
        config.SaveComments();
        config.SaveDiff();
        config.SavePosts();

        RedrawBookmarks();
    });
});

function ProcessScript() {
    ProcessComments();
    ProcessImages();
    ProcessDiff();
    ProcessPosts();
    ProcessBookmarks();
}

function ProcessImages() {
    if ($("#pv_actions").length > 0) {
        currentImage = $("#pv_photo img").prop("src");
        if ($(".vkscript-find").length == 0) {
            $("#pv_actions").append($('<a class="vkscript-find vkscript-find-yandex" target="_blank" href="http://yandex.ru/images/search?rpt=imageview&img_url=' + currentImage + '"></a>'));
            $("#pv_actions").append($('<a class="vkscript-find vkscript-find-google" target="_blank" href="http://www.google.com/searchbyimage?image_url=' + currentImage + '&safe=off"></a>'));
            $("#pv_actions").append($('<a class="vkscript-find vkscript-find-iqdb" target="_blank" href="http://iqdb.org/?url=' + currentImage + '"></a>'));
        }
    }
}

function ProcessComments() {
    $(".fw_reply, .reply").each(function (index, element) {
        var $el = $(element).find(".fw_reply_text, .wall_reply_text, .reply_text");

        if ($(element).has(".audio").length > 0 && config.AutohideCommentsWithAudio)
            $(element).addClass("script-hidden");
        else if ($(element).has(".page_post_thumb_sized_photo").length > 0 && config.AutohideCommentsWithImages)
            $(element).addClass("script-hidden");
        else 
            config.AutohideCommentsSpells.forEach(function (word) {
                if ($el.length > 0 && $el.text().toLowerCase().indexOf(word) > -1 && word.length > 0)
                    $(element).addClass("script-hidden");
            });
    });
    

}

function ProcessDiff() {
    var $m = $(".im_in:has(.emoji, .emoji_css), .im_out:has(.emoji, .emoji_css)");
    var $emoji = $(".emoji, .emoji_css");
    if (config.HideEmodzi) {
        $(".emoji_smile").addClass("hidden");
        $m.each(function (index, element) {
            var $el = $(element);
            var textDom = $el.find(".im_msg_text");
            var attachments = $el.find(".wall_module");
            if (textDom.length > 0 && textDom.text().length == 0 && attachments.length == 0)
            {
                $el.addClass("hidden");
            }
        })
        $emoji.addClass("hidden");
    }
    else {
        $(".emoji_smile").removeClass("hidden");
        $m.removeClass("hidden");
        $emoji.removeClass("hidden");
    }
}

function ProcessPosts() {
    $(".post").each(function (index, element) {
        var $el = $(element).find(".wall_post_text");

        if (config.AutohideReposts && $(element).find(".published_by_wrap").length > 0)
            $(element).addClass("hidden");
        else
            config.AutohidePostsSpells.forEach(function (word) {
                if ($el.length > 0 && $el.text().toLowerCase().indexOf(word) > -1 && word.length > 0)
                    $(element).addClass("hidden");
            });
    });
    
}

function ProcessBookmarks() {
    $(".post").each(function (index, element) {
        if ($(element).find(".add_bookmark").length == 0) {
            var $el = $(element).find(".wall_text_name");
            var url = "http://vk.com/" + $(element).prop("id").replace("post", "wall");
            

            var attemptToFindReplica = config.Bookmarks.find(function (x) {
                return x.url == url;
            });

            if (attemptToFindReplica)
            {
                $el.append($('<a class="add_bookmark bookmarked"></a>'));
                return;
            }
            else
                $el.append($('<a class="add_bookmark"></a>'));
                    
            var name = $(element).find(".wall_text_name")
                .text()
                .trim()
                .split(" ")
                .map(function (x) { return x[0] })
                .join("");
            var text = $(element).find(".wall_post_text")
                .text()
                .trim()
                .substring(0, 100) + "...";

            $el.find(".add_bookmark").click(function () {
                config.AddBookmark(url, name + " # " + text);
                config.SaveBookmarks();

                $(this).addClass("bookmarked");

                RedrawBookmarks();
                
            });
        }
    });
}

function RedrawBookmarks() {
    $list = $("#saved-bookmarks");
    $list.html("");

    config.Bookmarks.forEach(function (mark) {
        var elem = $('<li id="' + mark.id + '"><a class="delete-bookmark"></a><a href="' + mark.url + '">' + mark.text + '</a></li>');
        $list.append(elem);
        $("#" + mark.id + " .delete-bookmark").click(function() {
            $("#" + mark.id).remove();
            config.DeleteBookmark(mark.id);
            $("#post" + $(this).next().prop("href").split("wall")[1] + " .bookmarked").remove();
        });
    });
}