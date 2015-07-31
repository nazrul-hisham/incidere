/// <reference path="../../Scripts/knockout-3.2.0.debug.js" />
/// <reference path="../../Scripts/jquery-2.1.3.intellisense.js" />
/// <reference path="../highlight.pack.js" />
/// <reference path="core.sph/Scripts/typeahead.bundle.js" />

define(["types"], function (types) {

    var nav = function (href2) {
        $("#applicationHost").load(href2, null, function (responseText, textStatus) {
            if (textStatus === "error") {
                $("#applicationHost").html("<div class=\"alert alert-danger alert-dismissable\">Cannot find the content for : " + href2 + "</div>");
                return;
            }
            $("#applicationHost img").addClass("img-thumbnail");
            $("#applicationHost a").prepend("<i class=\"fa fa-link\"></i>");
            $("pre code").each(function (i, block) {
                hljs.highlightBlock(block);
            });
        });
    },
        mapTopic = function (topicHash) {
            var tcs = new $.Deferred();
            topicHash = topicHash.toLowerCase().replace(/#\/?/g, "").replace(new RegExp(/\/.*$/g), "");

            // some default items
            if (topicHash.indexOf(" domain.sph") > -1) {
                var item = /bespoke.sph.domain.(.*?), domain.sph/g.exec(topicHash)[1];
                tcs.resolve(item + ".html");
                return tcs.promise();
            }
            $.get("scripts/topics.map", function (script) {
                var ooo = JSON.parse(script);
                tcs.resolve(ooo[topicHash]);
            });
            return tcs.promise();

        },
        topic = window.location.hash;
    $("#applicationHost").load("/docs/overview.html");
    $("#sidebar").load("/docs/sidebar.html");
    $("#sidebar").on("click", "a", function (e) {
        e.preventDefault();
        e.stopPropagation();
        nav(this.href);
        var appHostTop = $("#applicationHost").position().top;
        $("html, body").animate({ scrollTop: appHostTop - 60 }, 800);
    });
    $("#applicationHost").on("click", "a", function (e) {
        var $anchor = $(this),
            href = $anchor.attr("href");
        if (href.indexOf("http://") > -1) {
            return;
        }
        if (href.indexOf("https://") > -1) {
            return;
        }

        $("#applicationHost").load(href, null, function (responseText, textStatus) {
            if (textStatus === "error") {
                $("#applicationHost").html("<div class=\"alert alert-danger alert-dismissable\">Cannot find the content for : " + href + "</div>");
                return;
            }
            $("#applicationHost img").addClass("img-thumbnail");
            $("#applicationHost a").prepend("<i class=\"fa fa-link\">");
            console.log("downloaded %s", this.href);
            $("pre code").each(function (i, block) {
                hljs.highlightBlock(block);
            });

        });
        e.preventDefault();
        e.stopPropagation();

    });

    var paths = _(types.types).map(function (v) { return { path: v }; }),
                members = new Bloodhound({
                    datumTokenizer: function (d) {
                        return d.path.split(/s+/);
                    },
                    queryTokenizer: function (s) {
                        return s.split(/\./);
                    },
                    local: paths
                });
    members.initialize();

    $("#search").typeahead({
        minLength: 0,
        highlight: true,
    },
        {
            name: "types-search",
            displayKey: "path",
            source: members.ttAdapter()
        })
        .on("typeahead:closed", function () {
            $("#applicationHost").load($(this).val() + ".html");
        });

    if (topic) {
        mapTopic(topic)
        .then(function (g) {
            nav(g);
        });
    }
});