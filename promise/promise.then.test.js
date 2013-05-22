/**
 * Created with JetBrains WebStorm.
 * User: jchaves
 * Date: 5/14/13
 * Time: 1:10 PM
 * To change this template use File | Settings | File Templates.
 */

function log(m) {
    alert(m);
}

function asyncMessage(msg) {
    var dfd = new jQuery.Deferred();
    setTimeout(function() { dfd.resolve(msg); }, 2000);
    return dfd.promise();
}

function multiAsyncMessage(msg) {
    var dfd = new jQuery.Deferred();
    var promises = [];

    promises.push(asyncMessage("1"));
    promises.push(asyncMessage("2"));

    $.when.apply($, promises).done(function(m) {dfd.resolve(m)});
    return dfd.promise();
}

asyncMessage("promise.then.test:A")
    .then(function(m) { return multiAsyncMessage(m + "B"); })
    .then(function(m) { return asyncMessage(m + "C"); })
    .done(log); // -> outputs "ABC"