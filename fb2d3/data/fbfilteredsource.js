var FBFilteredSource = (function () {
    function FBFilteredSource() {
        FBFilteredSource.startQuery = "/me/friends";
        FBFilteredSource.queryFields = {
            fields: 'name,id,location,birthday',
            limit: 20
        };
    }
    FBFilteredSource.prototype.getToken = function (reply) {
        if(FBFilteredSource.token != undefined) {
            reply(FBFilteredSource.token);
            return;
        }
        FB.init({
            appId: '3983783298',
            status: true,
            cookie: true,
            xfbml: true
        });
        FB.getLoginStatus(function (response) {
            if(response.status === 'connected') {
                FBFilteredSource.token = response.authResponse.accessToken;
                reply(FBFilteredSource.token);
            } else if(response.status === 'not_authorized') {
                throw 'Unauthorized';
            } else {
                throw 'Not logged in';
            }
        });
    };
    FBFilteredSource.prototype.GetInfoNodes = function (reply) {
        this.getToken(function (token) {
            FB.api(FBFilteredSource.startQuery, FBFilteredSource.queryFields, function (response) {
                var nodeArray = [];
                if(response.data == undefined) {
                    throw 'Indecipherable call to the Graph API';
                }
                console.log('Friends count: ' + response.data.length);
                for(var i = 0; i < response.data.length; i++) {
                    var rawNode = response.data[i];
                    nodeArray[i] = new GenericInfoNode();
                    nodeArray[i].Name = rawNode.name;
                    nodeArray[i].Id = rawNode.id;
                }
                reply(nodeArray);
            });
        });
    };
    FBFilteredSource.prototype.GetFirstInfoNodePage = function (reply) {
        FBFilteredSource.pagingQuery = FBFilteredSource.startQuery;
        this.getNodePage(reply);
    };
    FBFilteredSource.prototype.GetNextInfoNodePage = function (reply) {
        this.getNodePage(reply);
    };
    FBFilteredSource.prototype.GetFirstInfoNodePageAsync = function () {
        FBFilteredSource.pagingQuery = FBFilteredSource.startQuery;
        var def = $.Deferred();
        this.getNodePage(function (nodes) {
            def.resolve(nodes);
        });
        return def.promise();
    };
    FBFilteredSource.prototype.GetNextInfoNodePageAsync = function () {
        var def = $.Deferred();
        this.getNodePage(function (nodes) {
            def.resolve(nodes);
        });
        return def.promise();
    };
    FBFilteredSource.prototype.getNodePage = function (reply) {
        if(FBFilteredSource.pagingQuery == undefined) {
            throw 'Invalid call to GetNextInfoNodePage; call GetInfoNodePage() first.';
        }
        this.getToken(function (token) {
            FB.api(FBFilteredSource.pagingQuery, FBFilteredSource.queryFields, function (response) {
                var nodeArray = [];
                if(response.data != undefined) {
                    console.log('Friends count: ' + response.data.length);
                    var numNodes = 0;
                    for(var i = 0; i < response.data.length; i++) {
                        var rawNode = response.data[i];
                        if(rawNode.location == undefined) {
                            continue;
                        }
                        nodeArray[numNodes] = new GenericInfoNode();
                        nodeArray[numNodes].Name = rawNode.name;
                        nodeArray[numNodes].Id = rawNode.id;
                        nodeArray[numNodes].TextLocation = rawNode.location.name;
                        numNodes++;
                    }
                    FBFilteredSource.pagingQuery = response.paging.next;
                    console.log('GraphAPIQuery = ' + FBFilteredSource.pagingQuery);
                } else {
                    throw 'Indecipherable call to the Graph API';
                }
                reply(nodeArray);
            });
        });
    };
    return FBFilteredSource;
})();
//@ sourceMappingURL=fbfilteredsource.js.map
