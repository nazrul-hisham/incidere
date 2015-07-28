$(function () {
    $('header#header').load('header.html');

    console.log("indexDB", typeof indexedDB);
    if (!indexedDB) {
        alert("Your browser is not compatible with this offline app");
        return;
    }

    console.log("Promise", typeof Promise);
    if (typeof Promise === "undefined") {
        alert("Your browser is not compatible with this offline app");
        return;
    }
    window.applicationCache.addEventListener('updateready', function (e) {
        if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
            window.applicationCache.swapCache();
            if (window.confirm('New version has been downloaded, Do you want to reload the app?')) {
                window.location.reload();
            }
        }

    }, false);

});