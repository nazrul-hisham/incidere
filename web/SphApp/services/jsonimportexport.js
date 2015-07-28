/// <reference path="../../Scripts/jquery-2.0.3.intellisense.js" />
/// <reference path="../../Scripts/knockout-2.3.0.debug.js" />
/// <reference path="../../Scripts/knockout.mapping-latest.debug.js" />
/// <reference path="../../Scripts/require.js" />
/// <reference path="../../Scripts/underscore.js" />
/// <reference path="../../Scripts/moment.js" />
/// <reference path="../services/datacontext.js" />
/// <reference path="../services/domain.g.js" />

define([],
    function () {

        var
            exportJson = function (filename, text) {

                var tcs = new $.Deferred();
                function download() {
                    var pom = document.createElement('a');
                    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                    pom.setAttribute('download', filename);
                    pom.click();
                    tcs.resolve(true);
                }

                download(filename, text);
                return tcs.promise();

            },

         importJson = function () {

             var tcs = new $.Deferred();
             
             function handleFileSelect(evt) {
                 var files = evt.target.files;
                 for (var i = 0, f; f = files[i]; i++) {
                     var reader = new FileReader();

                     reader.onload = (function () {
                         return function (e) {
                             tcs.resolve(e.target.result);
                         };
                     })(f);

                     reader.readAsText(f);
                 }
             }

             var upload = function () {
                 var pom = document.createElement('input');
                 pom.setAttribute('type', 'file');
                 pom.setAttribute('id', 'files');
                 pom.setAttribute('name', 'files[]');
                 pom.addEventListener('change', handleFileSelect, false);
                 pom.click();
             };

             upload();


             return tcs.promise();
         };

        var vm = {
            importJson: importJson,
            exportJson: exportJson
        };

        return vm;

    });
