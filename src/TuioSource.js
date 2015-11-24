(function(root) {

var Tuio = root.Tuio,
    _ = root._;

if (typeof require !== "undefined") {
    Tuio = require("./Tuio");
    _ = require("lodash");
}

Tuio.Source = Tuio.Model.extend({
    sourceId: null,
    
    initialize: function(params) {
        params = params || {};
        var sourceStringParams = this.getSourceString(params.sourceString),
            sourceId = params.sourceId || 0,
            sourceName = params.sourceName || sourceStringParams.sourceName,
            sourceInstance = params.sourceInstance || sourceStringParams.sourceInstance,
            sourceAddress = params.sourceAddress || sourceStringParams.sourceAddress,
            dimension = params.dimension || 0;
        
        this.sourceId = sourceId;
        this.sourceName = sourceName;
        this.sourceInstance = sourceInstance;
        this.sourceAddress = sourceAddress;
        this.dimension = dimension; 
    },
    
    getSourceString: function(sourceString) {
        var defaultSource = {
            sourceName: "",
            sourceInstance: 0,
            sourceAddress: "localhost"
        },
            sourceParams = {},
            // awful - breaks name:1@address into [,"name", "1", "address"];
            // or name:1 into [,"name", "1", undefined];
            sourceRegex = /([^\:]+)(?::([^@]+)(?:@(\S+))?)?/,
            sourceParamsArray = [];
        
        if (typeof sourceString === "string") {
            sourceParamsArray = sourceString.match(sourceRegex);
            sourceParams = {
                sourceName: sourceParamsArray[1],
                sourceInstance: sourceParamsArray[2],
                sourceAddress: sourceParamsArray[3]
            };
            if (typeof sourceParams.sourceInstance !== "undefined") {
                sourceParams.sourceInstance = parseInt(sourceParams.sourceInstance, 10);
            }
        }
        
        return _.merge(defaultSource, sourceParams);
    },
    
    setSourceString: function() {
        
    },
}, {
});
    
if (typeof exports !== "undefined") {
    module.exports = Tuio.Source;
}
    
}(this));