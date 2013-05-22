//Example: We want to construct a message "ABC" from three asynchronous messages ("A", "B", "C")

//this is required for Chrome (I gave up on IE9 - usability disaster)
function log(m) {
    console.log.apply(console, [m]);
}

var asyncMessage; //declare before defining, as we will be redefining afterwards.

asyncMessage = function(msg) {
    var dfd = new $.Deferred();
    setTimeout(function() { dfd.resolve(msg); }, 1000);
    return dfd.promise();
};

//Naive attempt at using 'done'

asyncMessage("Naive: A")
    .done(function(m) { return asyncMessage(m + "B"); })
    .done(function(m) { return asyncMessage(m + "C"); })
    .done(log); // -> outputs "Naive: A"


//The problem is that "done" doesn't return a new Deferred, but returns the previous one... so the "A" message just 'drops through'

//What you actually need, to get it working (yucky yuck)

asyncMessage("Ugly: A")
    .done(function(m) { return asyncMessage(m + "B").done(
        function(m) { return asyncMessage(m + "C").done(log); });
    });


//Aim: add a .chain() function  to  jquery.Deferred,  so that we can chain several dependent  asynchronous  functions  together, with each one being called with the  results of the  preceding  one.
//As  far as I can see, there's no way to inject the chain method on to Deferred, but we *can* inject our own object into the promise()  function. So here we create a function which will generate a chainable  promise for us...

var Chainable = function Chainable() {
    return {
        chain : function(next) { //next is another function which returns Deferred
            var newDef = $.Deferred(); //we will resolve this when next is done
            //next line: call next with a||null for method-tolerance
            this.done(function(a) { next(a||null).done(newDef.resolve); });
            return newDef.promise(Chainable());
        }
    };
}

//AFTER
//Redefine asyncMessage, the only difference is in the last line
asyncMessage = function(msg) {
    var dfd = new jQuery.Deferred();
    setTimeout(function() { dfd.resolve(msg); }, 1000);
    return dfd.promise(Chainable());
};

//Now we are much closer to the desired code

asyncMessage("Chained:A")
    .chain(function(m) { return asyncMessage(m + "B"); })
    .chain(function(m) { return asyncMessage(m + "C"); })
    .done(log); // -> outputs "ABC"


//Alternative from gradbot: http://stackoverflow.com/questions/5505828/how-do-you-attach-callbacks-to-the-deferred-object-that-is-attached-to-a-deferred/5692881#comment-6650499
//"The promiseMethods list is local so I couldn't extend it."

(function($) {
    function deferred_chain(next) {
        var dfd = new $.Deferred();
        this.done(function() {
            var dfd_next = next.apply(this, arguments);
            dfd_next.done(dfd.resolve);
        });
        return dfd;
    }

    var base = $._Deferred;

    $._Deferred = function() {
        var dfd = base();
        dfd.chain = deferred_chain;
        return dfd;
    };
})(jQuery);


//Redefine asyncMessage, (this time returning the Deferred object, not the promise)
asyncMessage = function(msg) {
    var dfd = new jQuery.Deferred();
    setTimeout(function() { dfd.resolve(msg); }, 1000);
    return dfd;
};

//This code looks like previous example

asyncMessage("Chained2:A")
    .chain(function(m) { return asyncMessage(m + "B"); })
    .chain(function(m) { return asyncMessage(m + "C"); })
    .done(log); // -> outputs "ABC"


//even prettier if we use "expression closures" (http://perfectionkills.com/a-closer-look-at-expression-closures/) (Mozilla only)

/*
asyncMessage("Beautiful:A").
 then(function(m) {asyncMessage(m + "B")}).
 then(function(m) {asyncMessage(m + "C")}).
 done(log);
*/
