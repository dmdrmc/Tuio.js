(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(root) {
    
    // Initial Setup, events mixin and extend/inherits taken from Backbone.js
    // See Backbone.js source for original version and comments.

    var previousTuio = root.Tuio;

    var slice = Array.prototype.slice;
    var splice = Array.prototype.splice;

    var Tuio;
    if (typeof exports !== "undefined") {
        Tuio = exports;
    } else {
        Tuio = root.Tuio = {};
    }

    Tuio.VERSION = "0.0.1";
    
    // tuio possible states
    Tuio.TUIO_ADDED = 0;
    Tuio.TUIO_ACCELERATING = 1;
    Tuio.TUIO_DECELERATING = 2;
    Tuio.TUIO_STOPPED = 3;
    Tuio.TUIO_REMOVED = 4;
    Tuio.TUIO_ROTATING = 5;
    Tuio.TUIO_IDLE = 6;

    var _ = root._;

    if (!_ && (typeof require !== "undefined")) {
        _ = require("lodash");
    }

    Tuio.noConflict = function() {
        root.Tuio = previousTuio;
        return this;
    };

    var eventSplitter = /\s+/;

    var Events = Tuio.Events = {
        on: function(events, callback, context) {
            var calls, event, node, tail, list;
            if (!callback) {
                return this;
            }
            events = events.split(eventSplitter);
            calls = this._callbacks || (this._callbacks = {});

            while (event = events.shift()) {
                list = calls[event];
                node = list ? list.tail : {};
                node.next = tail = {};
                node.context = context;
                node.callback = callback;
                calls[event] = {tail: tail, next: list ? list.next : node};
            }

            return this;
        },

        off: function(events, callback, context) {
            var event, calls, node, tail, cb, ctx;

            if (!(calls = this._callbacks)) {
                return;
            }
            if (!(events || callback || context)) {
                delete this._callbacks;
                return this;
            }

            events = events ? events.split(eventSplitter) : _.keys(calls);
            while (event = events.shift()) {
                node = calls[event];
                delete calls[event];
                if (!node || !(callback || context)) {
                    continue;
                }
                tail = node.tail;
                while ((node = node.next) !== tail) {
                    cb = node.callback;
                    ctx = node.context;
                    if ((callback && cb !== callback) || (context && ctx !== context)) {
                        this.on(event, cb, ctx);
                    }
                }
            }

          return this;
        },

        trigger: function(events) {
            var event, node, calls, tail, args, all, rest;
            if (!(calls = this._callbacks)) {
                return this;
            }
            all = calls.all;
            events = events.split(eventSplitter);
            rest = slice.call(arguments, 1);

            while (event = events.shift()) {
                if (node = calls[event]) {
                    tail = node.tail;
                    while ((node = node.next) !== tail) {
                        node.callback.apply(node.context || this, rest);
                    }
                }
                if (node = all) {
                    tail = node.tail;
                    args = [event].concat(rest);
                    while ((node = node.next) !== tail) {
                        node.callback.apply(node.context || this, args);
                    }
                }
            }

            return this;
        }
    };

    var Model = Tuio.Model = function() {
        this.initialize.apply(this, arguments);
    };

    _.extend(Model.prototype, Events);

    var extend = function (protoProps, classProps) {
        var child = inherits(this, protoProps, classProps);
        child.extend = this.extend;
        return child;
    };

    Tuio.Model.extend = extend;

    var Ctor = function() {

    };

    var inherits = function(parent, protoProps, staticProps) {
        var child;

        if (protoProps && protoProps.hasOwnProperty("constructor")) {
            child = protoProps.constructor;
        } else {
            child = function() {
                parent.apply(this, arguments);
            };
        }

        _.extend(child, parent);

        Ctor.prototype = parent.prototype;
        child.prototype = new Ctor();

        if (protoProps) {
            _.extend(child.prototype, protoProps);
        }

        if (staticProps) {
            _.extend(child, staticProps);
        }

        child.prototype.constructor = child;

        child.__super__ = parent.prototype;

        return child;
    };
}(this));
},{"lodash":undefined}],2:[function(require,module,exports){
(function(root) {

var Tuio = root.Tuio,
    io = root.io,
    _ = root._,
    osc = root.osc;

if (typeof require !== "undefined") {
    Tuio = require("./Tuio");
    _ = require("lodash");
    osc = require("osc/dist/osc-browser");
}

Tuio.Client = Tuio.Model.extend({
    host: null,
    socket: null,
    connected: null,
    //tuio2Dobj
    objectList: null,
    aliveObjectList: null,
    newObjectList: null,
    frameObjects: null,
    //tuio/2Dcur
    cursorList: null,
    aliveCursorList: null,
    newCursorList: null,
    frameCursors: null,
    //tuio2 frames
    sourceList: null,
    //tuio2/any-component
    aliveComponentList: null,
    //tuio2 objects
    objectContainerList: null,
    frameObjects: null,
    //
    freeCursorList: null,
    maxCursorId: null,
    currentFrame: null,
    currentTime: null,
    oscReceiver: null,
    // last frame info
    frameSource: null,
    sourceCount: null,
    frameTime: null,
    lateFrame: null,

    initialize: function(params) {
        this.host = params.host;
        this.connected = false;
        //tuio/2Dobj
        this.objectList = {};
        this.aliveObjectList = [];
        this.newObjectList = [];
        this.frameObjects = [];
        //tuio/2Dcur
        this.cursorList = {};
        this.aliveCursorList = [];
        this.newCursorList = [];
        this.frameCursors = [];
        //tuio2 frames
        this.sourceList = {},
        //tuio2/any-component
        this.aliveComponentList = [];
        //tuio2/ptr
        this.objectContainerList = [];
        this.frameObjects = [];
        //
        this.freeCursorList = [];
        this.maxCursorId = -1;
        this.currentFrame = 0;
        this.currentTime = null;
        this.oscReceiver = new osc.WebSocketPort({
            url: this.host
        });
        //
        this.sourceCount = 0;
        this.lateFrame = false;

        _.bindAll(this, "onConnect", "acceptBundle", "acceptMessage", "onDisconnect");
    },

    connect: function() {
        Tuio.Time.initSession();
        this.currentTime = new Tuio.Time();
        this.currentTime.reset();
        
        this.oscReceiver.open();
        this.oscReceiver.on("open", this.onConnect);
        this.oscReceiver.on("close", this.onDisconnect);
    },

    onConnect: function() {
        this.oscReceiver.on("message", this.acceptMessage);
        this.oscReceiver.on("error", function(e) {
            console.log(e.message);
        });
        this.connected = true;
        this.trigger("connect");
    },

    onDisconnect: function() {
        this.oscReceiver.removeListener("message", this.acceptMessage);
        this.connected = false;
        this.trigger("disconnect");
    },

    isConnected: function() {
        return this.connected;
    },

    getTuioObjects: function(version1) {
        return _.clone(this.objectList);
    },

    getTuioCursors: function() {
        return _.clone(this.cursorList);
    },
    
    getTuioPointers: function() {
        var self = this,
            pointers = [];
        
        this.objectContainerList.forEach(function(object) {
            if (object.pointer &&
                    self.frameSource && 
                    object.getTuioSource().getSourceString() === self.frameSource.getSourceString()) {
                pointers.push(object.pointer);
            }
        });
        
        return pointers;
    },
    
    getTuioTokens: function() {
        var self = this,
            tokens = [];
        
        this.objectContainerList.forEach(function(object) {
            if (object.token &&
                    self.frameSource && 
                    object.getTuioSource().getSourceString() === self.frameSource.getSourceString()) {
                tokens.push(object.token);
            }
        });
        
        return tokens;
    },

    getTuioObject: function(sid) {
        return this.objectContainerList[sid];
    },

    getTuioCursor: function(sid) {
        return this.cursorList[sid];
    },
    /**
     * @deprecated osc.js can decode bundles into messages and call the .on("message") listeners
     */
    acceptBundle: function(oscBundle) {
        var msg = null,
            oscBundle = [];
        
        for (var i = 0, max = oscBundle.length; i < max; i++) {
            msg = oscBundle[i];
            switch (msg[0]) {
                case "/tuio/2Dobj":
                case "/tuio/2Dcur":
                    this.acceptMessage(msg);
                    break;
            }
        }
    },

    acceptMessage: function(oscMessage) {
        var address = oscMessage.address,
            messageArgs = oscMessage.args,
            tuio1command = messageArgs[0],
            tuio1arguments = messageArgs.slice(1, messageArgs.length);

        switch (address) {
            case "/tuio/2Dobj":
                this.handleObjectMessage(tuio1command, tuio1arguments);
                break;
            case "/tuio/2Dcur":
                this.handleCursorMessage(tuio1command, tuio1arguments);
                break;
            case "/tuio2/frm":
                this.handleFrameMessage(messageArgs);
                break;
            case "/tuio2/ptr":
                this.handlePointerMessage(messageArgs);
                break;
            case "/tuio2/tok":
                this.handleTokenMessage(messageArgs);
                break;
            case "/tuio2/alv":
                this.handleAliveMessage(messageArgs);
                break;
        }
    },

    handleObjectMessage: function(command, args) {
        switch (command) {
            case "set":
                this.objectSet(args);
                break;
            case "alive":
                this.objectAlive(args);
                break;
            case "fseq":
                this.objectFseq(args);
                break;
        }
    },

    handleCursorMessage: function(command, args) {
        switch (command) {
            case "set":
                this.cursorSet(args);
                break;
            case "alive":
                this.cursorAlive(args);
                break;
            case "fseq":
                this.cursorFseq(args);
                break;
        }
    },
    
    handleFrameMessage: function(args) {
        args = args || [];
        var frameId = args[0],
            timetag = args[1],
            dimension = args[2],
            sourceString = args[3],
            lastFrameId,
            timediff;
        
        this.frameSource = this.sourceList[sourceString];
        if (typeof this.frameSource === "undefined") {
            this.frameSource = new Tuio.Source({
                frameId: frameId,
                dimension: dimension,
                sourceString: sourceString,
                sourceId: this.sourceCount
            });
            this.sourceList[sourceString] = this.frameSource;
            this.sourceCount += 1;
        }
        // time to set
        this.frameTime = new Tuio.Time.fromMilliseconds(timetag.native*1000);
        this.frameTime.setFrameId(frameId);
        // last known source frame id
        lastFrameId = this.frameSource.getFrameTime().getFrameId();
        timediff = this.frameTime.getTotalMilliseconds() -
                        this.frameSource.getFrameTime().getTotalMilliseconds();
        // set time!
        this.frameSource.setFrameTime(this.frameTime);
        // late frame check
        this.lateFrame = (frameId < lastFrameId &&
                            frameId !== 0 &&
                            timediff < 1000) ? true : false;
    },
    
    handleAliveMessage: function(args) {
        args = args || [];
        var self = this;
        
        this.aliveComponentList = [];
        if (typeof args.length !== "undefined") {
            [].push.apply(this.aliveComponentList, args);
        }
        
        //mark all pointers not in the alive list for removal
        this.objectContainerList.forEach(function(object){
            if (self.aliveComponentList.indexOf(object.getSessionId()) === -1) {
                object.remove(self.frameTime);
                self.frameObjects.push(object);
            }
        });
        
        this.frameObjects.forEach(function(frameObject){
            switch(frameObject.getTuioState()) {
                case Tuio.TUIO_ADDED:
                    self.objectContainerList.push(frameObject);
                    break;
                case Tuio.TUIO_REMOVED:
                    var removeIndex = self.objectContainerList.indexOf(frameObject);
                    if (removeIndex !== -1) {
                        self.objectContainerList.splice(removeIndex, 1);
                    }
                    break;
            }
        });
        
        //end of frame
        this.frameObjects = [];
        if (this.frameTime) {
            this.trigger("refresh", Tuio.Time.fromTime(this.frameTime));   
        }
    },
    
    getAliveComponents: function() {
        return this.aliveComponentList;
    },
    
    /**
     * Tuio2 Pointers
     */
    handlePointerMessage: function(args) {
        var s_id = args[0],
            tu_id = args[1],
            c_id = args[2],
            xpos = args[3],
            ypos = args[4],
            angle = args[5],
            shear = args[6],
            radius = args[7],
            pressure = args[8],
            xspeed = args[9],
            yspeed = args[10],
            pspeed = args[11],
            maccel = args[12],
            paccel = args[13],
            object = this.obtainFrameObject(s_id),
            pointerUpdateParams = {
                xp: xpos,
                yp: ypos,
                a: angle,
                sa: shear,
                r: radius,
                p: pressure,
                ttime: this.frameTime,
                xs: xspeed,
                ys: yspeed,
                ps: pspeed,
                ma: maccel,
                pa: paccel
            },
            pointerCreateParams = _.extend({}, pointerUpdateParams, {
                pi: -1,
                source: this.frameSource,
                tobj: object
            }),
            pointer;
        
        pointer = object.getTuioPointer();
        if (!pointer) {
            pointer = new Tuio.Pointer(pointerCreateParams);
            pointer.setTypeUserId(tu_id);
            object.setTuioPointer(pointer);
        }
        else if (pointer.getX() !== xpos ||
                    pointer.getY() !== ypos ||
                    pointer.getAngle() !== angle ||
                    pointer.getShear() !== shear ||
                    pointer.getRadius() !== radius ||
                    pointer.getPressure() !== pressure ||
                    pointer.getXSpeed() !== xspeed ||
                    pointer.getYSpeed() !== yspeed ||
                    pointer.getPressureSpeed() !== pspeed ||
                    pointer.getPressureAccel() !== paccel ||
                    pointer.getMotionAccel() !== maccel) {
            pointer.update(pointerUpdateParams);
        }
    },
    
    handleTokenMessage: function(args) {
        var s_id = args[0],
            tu_id = args[1],
            c_id = args[2],
            xpos = args[3],
            ypos = args[4],
            angle = args[5],
            xspeed = args[9],
            yspeed = args[10],
            rspeed = args[11],
            maccel = args[12],
            raccel = args[13],
            object = this.obtainFrameObject(s_id),
            tokenUpdateParams = {
                xp: xpos,
                yp: ypos,
                a: angle,
                ttime: this.frameTime,
                xs: xspeed,
                ys: yspeed,
                rs: rspeed,
                ma: maccel,
                ra: raccel
            },
            tokenCreateParams = _.extend({}, tokenUpdateParams, {
                sym: -1,
                source: this.frameSource,
                tobj: object
            }),
            token;
        
        token = object.getTuioToken();
        if (!token) {
            token = new Tuio.Token(tokenCreateParams);
            token.setTypeUserId(tu_id);
            object.setTuioToken(token);
        }
        else if (token.getX() !== xpos ||
                    token.getY() !== ypos ||
                    token.getAngle() !== angle ||
                    token.getXSpeed() !== xspeed ||
                    token.getYSpeed() !== yspeed ||
                    token.getRotationSpeed() !== rspeed ||
                    token.getRotationAccel() !== raccel ||
                    token.getMotionAccel() !== maccel) {
            token.update(tokenUpdateParams);
        }
    },    
    
    getFrameObjects: function() {
        return this.frameObjects;
    },
    
    obtainFrameObject: function(sessionId) {
        var object;
        
        if (this.frameSource) {
            object = this.getFrameObject(this.frameSource.getSourceId(), sessionId);
        }
        if (typeof object === "undefined") {
            object = new Tuio.ObjectContainer({
                ttime: this.frameTime,
                si: sessionId,
                src: this.frameSource
            });
            this.frameObjects.push(object);
        }
        
        return object;
    },
    
    getFrameObject: function(sourceId, sessionId) {
        var wantedPointer;
        
        this.frameObjects.forEach(function(framePointer){
            if (framePointer.getSessionId() === sessionId) {
                wantedPointer = framePointer;
            }
        });
        
        if (typeof wantedPointer === "undefined") {
            this.objectContainerList.forEach(function(activePointer){
                if (typeof activePointer.getTuioSource() !== "undefined" &&
                        activePointer.getTuioSource().getSourceId() === sourceId &&
                        activePointer.getSessionId() === sessionId) {
                    wantedPointer = activePointer;
                }
            });
        }
        
        return wantedPointer;
    },
    
    objectSet: function(args) {
        var sid = args[0],
        cid = args[1],
        xPos = args[2],
        yPos = args[3],
        angle = args[4],
        xSpeed = args[5],
        ySpeed = args[6],
        rSpeed = args[7],
        mAccel = args[8],
        rAccel = args[9];

       if (!_.has(this.objectList, sid)) {
            var addObject = new Tuio.Object({
                si: sid,
                sym: cid,
                xp: xPos,
                yp: yPos,
                a: angle
            });
            this.frameObjects.push(addObject);
        } else {
            var tobj = this.objectList[sid];
            if (!tobj) {
                return;
            }
            if (
                (tobj.xPos !== xPos) ||
                (tobj.yPos !== yPos) ||
                (tobj.angle !== angle) ||
                (tobj.xSpeed !== xSpeed) ||
                (tobj.ySpeed !== ySpeed) ||
                (tobj.rotationSpeed !== rSpeed) ||
                (tobj.motionAccel !== mAccel) ||
                (tobj.rotationAccel !== rAccel)) {

                var updateObject = new Tuio.Object({
                    si: sid,
                    sym: cid,
                    xp: xPos,
                    yp: yPos,
                    a: angle
                });
                updateObject.update({
                    xp: xPos,
                    yp: yPos,
                    a: angle,
                    xs: xSpeed,
                    ys: ySpeed,
                    rs: rSpeed,
                    ma: mAccel,
                    ra: rAccel
                });
                this.frameObjects.push(updateObject);
            }
        }
    },

    objectAlive: function(args) {
        var removeObject = null;
        this.newObjectList = args;
        this.aliveObjectList = _.difference(this.aliveObjectList, this.newObjectList);

        for (var i = 0, max = this.aliveObjectList.length; i < max; i++) {
            removeObject = this.objectContainerList[this.aliveObjectList[i]];
            if (removeObject) {
                removeObject.remove(this.currentTime);
                this.frameObjects.push(removeObject);
            }
        }
    },

    objectFseq: function(args) {
        var fseq = args[0],
        lateFrame = false,
        tobj = null;

        if (fseq > 0) {
            if (fseq > this.currentFrame) {
                this.currentTime = Tuio.Time.getSessionTime();
            }
            if ((fseq >= this.currentFrame) || ((this.currentFrame - fseq) > 100)) {
                this.currentFrame = fseq;
            } else {
                lateFrame = true;
            }
        } else if (Tuio.Time.getSessionTime().subtractTime(this.currentTime).getTotalMilliseconds() > 100) {
            this.currentTime = Tuio.Time.getSessionTime();
        }

        if (!lateFrame) {
            for (var i = 0, max = this.frameObjects.length; i < max; i++) {
                tobj = this.frameObjects[i];
                switch (tobj.getTuioState()) {
                    case Tuio.TUIO_REMOVED:
                        this.objectRemoved(tobj);
                        break;
                    case Tuio.TUIO_ADDED:
                        this.objectAdded(tobj);
                        break;
                    default:
                        this.objectDefault(tobj);
                        break;
                }
            }

            this.trigger("refresh", Tuio.Time.fromTime(this.currentTime));

            var buffer = this.aliveObjectList;
            this.aliveObjectList = this.newObjectList;
            this.newObjectList = buffer;
        }

        this.frameObjects = [];
    },

    objectRemoved: function(tobj) {
        var removeObject = tobj;
        removeObject.remove(this.currentTime);
        this.trigger("removeTuioObject", removeObject);
        delete this.objectList[removeObject.getSessionId()];
    },

    objectAdded: function(tobj) {
        var addObject = new Tuio.Object({
            ttime: this.currentTime,
            si: tobj.getSessionId(),
            sym: tobj.getSymbolId(),
            xp: tobj.getX(),
            yp: tobj.getY(),
            a: tobj.getAngle()
        });
        this.objectList[addObject.getSessionId()] = addObject;
        this.trigger("addTuioObject", addObject);
    },

    objectDefault: function(tobj) {
        var updateObject = this.objectList[tobj.getSessionId()];
        if (
            (tobj.getX() !== updateObject.getX() && tobj.getXSpeed() === 0) ||
            (tobj.getY() !== updateObject.getY() && tobj.getYSpeed() === 0)) {

            updateObject.update({
                ttime: this.currentTime,
                xp: tobj.getX(),
                yp: tobj.getY(),
                a: tobj.getAngle()
            });
        } else {
            updateObject.update({
                ttime: this.currentTime,
                xp: tobj.getX(),
                yp: tobj.getY(),
                a: tobj.getAngle(),
                xs: tobj.getXSpeed(),
                ys: tobj.getYSpeed(),
                rs: tobj.getRotationSpeed(),
                ma: tobj.getMotionAccel(),
                ra: tobj.getRotationAccel()
            });
        }
        
        this.trigger("updateTuioObject", updateObject);
    },

    cursorSet: function(args) {
        var sid = args[0],
        xPos = args[1],
        yPos = args[2],
        xSpeed = args[3],
        ySpeed = args[4],
        mAccel = args[5];

        if (!_.has(this.cursorList, sid)) {
            var addCursor = new Tuio.Cursor({
                si: sid,
                ci: -1,
                xp: xPos,
                yp: yPos
            });
            this.frameCursors.push(addCursor);
        } else {
            var tcur = this.cursorList[sid];
            if (!tcur) {
                return;
            }
            if (
                (tcur.xPos !== xPos) ||
                (tcur.yPos !== yPos) ||
                (tcur.xSpeed !== xSpeed) ||
                (tcur.ySpeed !== ySpeed) ||
                (tcur.motionAccel !== mAccel)) {

                var updateCursor = new Tuio.Cursor({
                    si: sid,
                    ci: tcur.getCursorId(),
                    xp: xPos,
                    yp: yPos
                });
                updateCursor.update({
                    xp: xPos,
                    yp: yPos,
                    xs: xSpeed,
                    ys: ySpeed,
                    ma: mAccel
                });
                this.frameCursors.push(updateCursor);
            }
        }
    },

    cursorAlive: function(args) {
        var removeCursor = null;
        this.newCursorList = args;
        this.aliveCursorList = _.difference(this.aliveCursorList, this.newCursorList);

        for (var i = 0, max = this.aliveCursorList.length; i < max; i++) {
            removeCursor = this.cursorList[this.aliveCursorList[i]];
            if (removeCursor) {
                removeCursor.remove(this.currentTime);
                this.frameCursors.push(removeCursor);
            }
        }
    },

    cursorFseq: function(args) {
        var fseq = args[0],
        lateFrame = false,
        tcur = null;

        if (fseq > 0) {
            if (fseq > this.currentFrame) {
                this.currentTime = Tuio.Time.getSessionTime();
            }
            if ((fseq >= this.currentFrame) || ((this.currentFrame - fseq) > 100)) {
                this.currentFrame = fseq;
            } else {
                lateFrame = true;
            }
        } else if (Tuio.Time.getSessionTime().subtractTime(this.currentTime).getTotalMilliseconds() > 100) {
            this.currentTime = Tuio.Time.getSessionTime();
        }

        if (!lateFrame) {
            for (var i = 0, max = this.frameCursors.length; i < max; i++) {
                tcur = this.frameCursors[i];
                switch (tcur.getTuioState()) {
                    case Tuio.TUIO_REMOVED:
                        this.cursorRemoved(tcur);
                        break;
                    case Tuio.TUIO_ADDED:
                        this.cursorAdded(tcur);
                        break;
                    default:
                        this.cursorDefault(tcur);
                        break;
                }
            }

            this.trigger("refresh", Tuio.Time.fromTime(this.currentTime));

            var buffer = this.aliveCursorList;
            this.aliveCursorList = this.newCursorList;
            this.newCursorList = buffer;
        }

        this.frameCursors = [];
    },

    cursorRemoved: function(tcur) {
        var removeCursor = tcur;
        removeCursor.remove(this.currentTime);

        this.trigger("removeTuioCursor", removeCursor);

        delete this.cursorList[removeCursor.getSessionId()];

        if (removeCursor.getCursorId() === this.maxCursorId) {
            this.maxCursorId = -1;
            if (_.size(this.cursorList) > 0) {
                var maxCursor = _.max(this.cursorList, function(cur) {
                    return cur.getCursorId();
                });
                if (maxCursor.getCursorId() > this.maxCursorId) {
                    this.maxCursorId = maxCursor.getCursorId();
                }

                this.freeCursorList = _.without(this.freeCursorList, function(cur) {
                    return cur.getCursorId() >= this.maxCursorId;
                });
            } else {
                this.freeCursorList = [];
            }
        } else if (removeCursor.getCursorId() < this.maxCursorId) {
            this.freeCursorList.push(removeCursor);
        }
    },

    cursorAdded: function(tcur) {
        var cid = _.size(this.cursorList),
        testCursor = null;

        if ((cid <= this.maxCursorId) && (this.freeCursorList.length > 0)) {
            var closestCursor = this.freeCursorList[0];
            for (var i = 0, max = this.freeCursorList.length; i < max; i++) {
                testCursor = this.freeCursorList[i];
                if (testCursor.getDistanceToPoint(tcur) < closestCursor.getDistanceToPoint(tcur)) {
                    closestCursor = testCursor;
                }
            }
            cid = closestCursor.getCursorId();
            this.freeCursorList = _.without(this.freeCursorList, function(cur) {
                return cur.getCursorId() === cid;
            });
        } else {
            this.maxCursorId = cid;
        }

        var addCursor = new Tuio.Cursor({
            ttime: this.currentTime,
            si: tcur.getSessionId(),
            ci: cid,
            xp: tcur.getX(),
            yp: tcur.getY()
        });
        this.cursorList[addCursor.getSessionId()] = addCursor;

        this.trigger("addTuioCursor", addCursor);
    },

    cursorDefault: function(tcur) {
        var updateCursor = this.cursorList[tcur.getSessionId()];
        if (
            (tcur.getX() !== updateCursor.getX() && tcur.getXSpeed() === 0) ||
            (tcur.getY() !== updateCursor.getY() && tcur.getYSpeed() === 0)) {

            updateCursor.update({
                ttime: this.currentTime,
                xp: tcur.getX(),
                yp: tcur.getY()
            });
        } else {
            updateCursor.update({
                ttime: this.currentTime,
                xp: tcur.getX(),
                yp: tcur.getY(),
                xs: tcur.getXSpeed(),
                ys: tcur.getYSpeed(),
                ma: tcur.getMotionAccel()
            });
        }
        
        this.trigger("updateTuioCursor", updateCursor);
    }
});
    
if (typeof exports !== "undefined") {
    module.exports = Tuio.Client;
}
    
}(this));
},{"./Tuio":1,"lodash":undefined,"osc/dist/osc-browser":undefined}],3:[function(require,module,exports){
(function(root) {

var Tuio = root.Tuio;

if (typeof require !== "undefined") {
    Tuio = require("./Tuio");
    Tuio.Container = require("./TuioContainer");
}

Tuio.Component = Tuio.Container.extend({
    //reference to the object that contains the pointer
    container: null,
    angle: null,
    rotationSpeed: null,
    rotationAccel: null,
    
    initialize: function(params) {
        params = params || {};
        Tuio.Container.prototype.initialize.call(this, params);
        
        this.container = params.tobj;
        this.angle = params.a;
        this.rotationSpeed = params.rs || 0;
        this.rotationAccel = params.ra || 0;
    },
    
    update: function(params) {
        Tuio.Container.prototype.update.call(this, params);
        
        this.angle = params.a;
        this.rotationSpeed = params.rs;
        this.rotationAccel = params.ra;
    },

    getContainingTuioObject: function() {
        return this.container;
    },
    getSessionId: function() {
        if (typeof this.container !== "undefined") {
            return this.container.getSessionId();
        }
    },
    getAngle: function() {
        return this.angle;
    },
    getRotationSpeed: function() {
        return this.rotationSpeed;
    },
    getRotationAccel: function() {
        return this.rotationAccel;
    },
    
    setTypeUserId: function(tu_id) {
        var arrayBuffer = new ArrayBuffer(4),
            bufferView = new DataView(arrayBuffer);
        
        bufferView.setUint32(0, tu_id);
        this.typeId = bufferView.getUint16(0);
        this.userId = bufferView.getUint16(2);
    },
}, {
});
    
if (typeof exports !== "undefined") {
    module.exports = Tuio.Component;
}
    
}(this));
},{"./Tuio":1,"./TuioContainer":4}],4:[function(require,module,exports){
(function(root) {

var Tuio = root.Tuio;

if (typeof require !== "undefined") {
    Tuio = require("./Tuio");
    Tuio.Point = require("./TuioPoint");
}

Tuio.Container = Tuio.Point.extend({
    sessionId: null,
    xSpeed: null,
    ySpeed: null,
    motionSpeed: null,
    motionAccel: null,
    path: null,
    state: null,

    initialize: function(params) {
        Tuio.Point.prototype.initialize.call(this, params);

        this.sessionId = params.si;
        this.xSpeed = params.xs || 0;
        this.ySpeed = params.ys || 0;
        this.motionSpeed = 0;
        this.motionAccel = params.ma || 0;
        this.path = [new Tuio.Point({
            ttime: this.currentTime,
            xp: this.xPos,
            yp: this.yPos
        })];
        this.state = Tuio.TUIO_ADDED;
    },

    update: function(params) {
        var lastPoint = this.path[this.path.length - 1];
        Tuio.Point.prototype.update.call(this, params);
        
        if (
            params.hasOwnProperty("xs") &&
            params.hasOwnProperty("ys") &&
            params.hasOwnProperty("ma")) {

            this.xSpeed = params.xs;
            this.ySpeed = params.ys;
            this.motionSpeed = Math.sqrt(this.xSpeed * this.xSpeed + this.ySpeed * this.ySpeed);
            this.motionAccel = params.ma;
        } else {
            var diffTime = this.currentTime.subtractTime(lastPoint.getTuioTime()),
            dt = diffTime.getTotalMilliseconds() / 1000,
            dx = this.xPos - lastPoint.getX(),
            dy = this.yPos - lastPoint.getY(),
            dist = Math.sqrt(dx * dx + dy * dy),
            lastMotionSpeed = this.motionSpeed;
            
            this.xSpeed = dx / dt;
            this.ySpeed = dy / dt;
            this.motionSpeed = dist / dt;
            this.motionAccel = (this.motionSpeed - lastMotionSpeed) / dt;
        }
        
        this.updatePathAndState();
    },

    updateContainer: function(tcon) {
        Tuio.Point.prototype.updateToPoint.call(this, tcon);

        this.xSpeed = tcon.getXSpeed();
        this.ySpeed = tcon.getYSpeed();
        this.motionSpeed = tcon.getMotionSpeed();
        this.motionAccel = tcon.getMotionAccel();

        this.updatePathAndState();
    },

    updatePathAndState: function() {
        this.path.push(new Tuio.Point({
            ttime: this.currentTime,
            xp: this.xPos,
            yp: this.yPos
        }));

        if (this.motionAccel > 0) {
            this.state = Tuio.TUIO_ACCELERATING;
        } else if (this.motionAccel < 0) {
            this.state = Tuio.TUIO_DECELERATING;
        } else {
            this.state = Tuio.TUIO_STOPPED;
        }
    },

    stop: function(ttime) {
        this.update({
            ttime: ttime,
            xp: this.xPos,
            yp: this.yPos
        });
    },

    remove: function(ttime) {
        this.currentTime = Tuio.Time.fromTime(ttime);
        this.state = Tuio.TUIO_REMOVED;
    },

    getSessionId: function() {
        return this.sessionId;
    },

    getXSpeed: function() {
        return this.xSpeed;
    },

    getYSpeed: function() {
        return this.ySpeed;
    },

    getPosition: function() {
        return new Tuio.Point(this.xPos, this.yPos);
    },

    getPath: function() {
        return this.path;
    },

    getMotionSpeed: function() {
        return this.motionSpeed;
    },

    getMotionAccel: function() {
        return this.motionAccel;
    },

    getTuioState: function() {
        return this.state;
    },

    isMoving: function() {
        return (
            (this.state === Tuio.TUIO_ACCELERATING) ||
            (this.state === Tuio.TUIO_DECELERATING)
        );
    }
}, {
    fromContainer: function(tcon) {
        return new Tuio.Container({
            xp: tcon.getX(),
            yp: tcon.getY(),
            si: tcon.getSessionID()
        });
    }
});
    
if (typeof exports !== "undefined") {
    module.exports = Tuio.Container;
}
    
}(this));
},{"./Tuio":1,"./TuioPoint":8}],5:[function(require,module,exports){
(function(root) {

var Tuio = root.Tuio;

if (typeof require !== "undefined") {
    Tuio = require("./Tuio");
    Tuio.Container = require("./TuioContainer");
}

Tuio.Cursor = Tuio.Container.extend({
    cursorId: null,

    initialize: function(params) {
        Tuio.Container.prototype.initialize.call(this, params);

        this.cursorId = params.ci;
    },

    getCursorId: function() {
        return this.cursorId;
    }
}, {
    fromCursor: function(tcur) {
        return new Tuio.Cursor({
            si: tcur.getSessionId(),
            ci: tcur.getCursorId(),
            xp: tcur.getX(),
            yp: tcur.getY()
        });
    }
});
    
if (typeof exports !== "undefined") {
    module.exports = Tuio.Cursor;
}
    
}(this));
},{"./Tuio":1,"./TuioContainer":4}],6:[function(require,module,exports){
(function(root) {

var Tuio = root.Tuio;

if (typeof require !== "undefined") {
    Tuio = require("./Tuio");
    Tuio.Container = require("./TuioContainer");
}

Tuio.Object = Tuio.Container.extend({
    symbolId: null,
    angle: null,
    rotationSpeed: null,
    rotationAccel: null,

    initialize: function(params) {
        Tuio.Container.prototype.initialize.call(this, params);

        this.symbolId = params.sym;
        this.angle = params.a;
        this.rotationSpeed = 0;
        this.rotationAccel = 0;
    },

    update: function(params) {
        var lastPoint = this.path[this.path.length - 1];
        Tuio.Container.prototype.update.call(this, params);

        if (
            params.hasOwnProperty("rs") &&
            params.hasOwnProperty("ra")) {

            this.angle = params.a;
            this.rotationSpeed = params.rs;
            this.rotationAccel = params.ra;
        } else {
            var diffTime = this.currentTime.subtractTime(lastPoint.getTuioTime()),
            dt = diffTime.getTotalMilliseconds() / 1000,
            lastAngle = this.angle,
            lastRotationSpeed = this.rotationSpeed;
            this.angle = params.a;

            var da = (this.angle - lastAngle) / (2 * Math.PI);
            if (da > 0.75) {
                da -= 1;
            } else if (da < -0.75) {
                da += 1;
            }
            
            this.rotationSpeed = da / dt;
            this.rotationAccel = (this.rotationSpeed - lastRotationSpeed) / dt;
        }

        this.updateObjectState();
    },

    updateObject: function(tobj) {
        Tuio.Container.prototype.updateContainer.call(this, tobj);

        this.angle = tobj.getAngle();
        this.rotationSpeed = tobj.getRotationSpeed();
        this.rotationAccel = tobj.getRotationAccel();
        
        this.updateObjectState();
    },

    updateObjectState: function() {
        if ((this.rotationAccel !== 0) && (this.state !== Tuio.TUIO_STOPPED)) {
            this.state = Tuio.TUIO_ROTATING;
        }
    },

    stop: function(ttime) {
        this.update({
            ttime: ttime,
            xp: this.xPos,
            yp: this.yPos,
            a: this.angle
        });
    },

    getSymbolId: function() {
        return this.symbolId;
    },

    getAngle: function() {
        return this.angle;
    },

    getAngleDegrees: function() {
        return this.angle / Math.PI * 180;
    },

    getRotationSpeed: function() {
        return this.rotationSpeed;
    },

    getRotationAccel: function() {
        return this.rotationAccel;
    },

    isMoving: function() {
        return (
            (this.state === Tuio.TUIO_ACCELERATING) ||
            (this.state === Tuio.TUIO_DECELERATING) ||
            (this.state === Tuio.TUIO_ROTATING)
        );
    }
}, {

    fromObject: function(tobj) {
        return new Tuio.Object({
            xp: tobj.getX(),
            yp: tobj.getY(),
            si: tobj.getSessionID(),
            sym: tobj.getSymbolId(),
            a: tobj.getAngle()
        });
    }
});
    
if (typeof exports !== "undefined") {
    module.exports = Tuio.Object;
}
    
}(this));
},{"./Tuio":1,"./TuioContainer":4}],7:[function(require,module,exports){
(function(root) {
    
var Tuio = root.Tuio;

if (typeof require !== "undefined") {
    Tuio = require("./Tuio");
}
    
Tuio.ObjectContainer = Tuio.Model.extend({
    
    pointer: null,
    token: null,
    sessionId: null,
    startTime: null,
    currentTime: null,
    source: null,
    state: null,
    
    initialize: function(params) {
        params = params || {};
        
        this.sessionId = params.si;
        this.startTime = params.ttime || Tuio.Time.getSystemTime();
        this.currentTime = this.startTime;
        this.source = params.src;
        this.state = Tuio.TUIO_ADDED;
    },
    
    remove: function(ttime) {
        this.removeTuioPointer(ttime);
        this.removeTuioToken(ttime);
        this.state = Tuio.TUIO_REMOVED;
    },
    
    update: function(ttime) {
        this.currentTime = ttime;
        this.state = Tuio.TUIO_IDLE;
    },
    
    stop: function(ttime) {
        if (this.pointer) {
            this.pointer.stop(ttime);
        }
        if (this.token) {
            this.token.stop(ttime);
        }
        this.currentTime = ttime;
    },
    
    isMoving: function() {
        return (this.containsTuioPointer() &&
                    this.pointer.isMoving()) ||
                (this.containsTuioPointer() &&
                    this.pointer.isMoving());
    },
    
    removeTuioPointer: function(ttime) {
        if (this.pointer) {
            this.pointer.remove(ttime);
        }
        this.currentTime = ttime;
    },
    
    deleteTuioPointer: function() {
        this.pointer = null;
    },
    
    containsTuioPointer: function() {
        return !!this.pointer;
    },
    
    containsNewTuioPointer: function() {
        return this.containsTuioPointer()
                && this.pointer.getTuioState() === Tuio.TUIO_ADDED;
    },
    
    setTuioPointer: function(pointer) {
        this.pointer = pointer;
    },
                                         
    getTuioPointer: function() {
        return this.pointer;
    },
    
    removeTuioToken: function(ttime) {
        if (this.token) {
            this.token.remove(ttime);
        }
        this.currentTime = ttime;
    },
    
    deleteTuioToken: function() {
        this.token = null;
    },
    
    containsTuioToken: function() {
        return !!this.token;
    },
    
    containsNewTuioToken: function() {
        return this.containsTuioToken()
                && this.token.getTuioState() === Tuio.TUIO_ADDED;
    },
                                         
    getTuioToken: function() {
        return this.token;
    },
    
    setTuioToken: function(token) {
        this.token = token;
    },
    
    getSessionId: function() {
        return this.sessionId;
    },
    
    getTuioTime: function() {
        return this.currentTime;
    },
    
    getStartTime: function() {
        return this.startTime;
    },
    
    setTuioSource: function(source) {
        this.source = source;
    },
    
    getTuioSource: function() {
        return this.source;
    },
    
    getTuioState: function() {
        return this.state;
    }
});
    
if (typeof exports !== "undefined") {
    module.exports = Tuio.ObjectContainer;
}
    
})(this);
},{"./Tuio":1}],8:[function(require,module,exports){
(function(root) {

var Tuio = root.Tuio;

if (typeof require !== "undefined") {
    Tuio = require("./Tuio");
}

Tuio.Point = Tuio.Model.extend({
    xPos: null,
    yPos: null,
    currentTime: null,
    startTime: null,

    initialize: function(params) {
        this.xPos = params.xp || 0;
        this.yPos = params.yp || 0;
        this.currentTime = Tuio.Time.fromTime(params.ttime || Tuio.Time.getSessionTime());
        this.startTime = Tuio.Time.fromTime(this.currentTime);
    },

    update: function(params) {
        this.xPos = params.xp;
        this.yPos = params.yp;
        if (params.hasOwnProperty("ttime")) {
            this.currentTime = Tuio.Time.fromTime(params.ttime);
        }
    },

    updateToPoint: function(tpoint) {
        this.xPos = tpoint.getX();
        this.yPos = tpoint.getY();
    },

    getX: function() {
        return this.xPos;
    },

    getY: function() {
        return this.yPos;
    },

    getDistance: function(xp, yp) {
        var dx = this.xPos - xp,
        dy = this.yPos - yp;
        return Math.sqrt(dx * dx + dy * dy);
    },

    getDistanceToPoint: function(tpoint) {
        return this.getDistance(tpoint.getX(), tpoint.getY());
    },

    getAngle: function(xp, yp) {
        var side = this.xPos - xp,
        height = this.yPos - yp,
        distance = this.getDistance(xp, yp),
        angle = Math.asin(side / distance) + Math.PI / 2;

        if (height < 0) {
            angle = 2 * Math.PI - angle;
        }
        
        return angle;
    },

    getAngleToPoint: function(tpoint) {
        return this.getAngle(tpoint.getX(), tpoint.getY());
    },

    getAngleDegrees: function(xp, yp) {
        return (this.getAngle(xp, yp) / Math.PI) * 180;
    },

    getAngleDegreesToPoint: function(tpoint) {
        return (this.getAngleToPoint(tpoint) / Math.PI) * 180;
    },

    getScreenX: function(width) {
        return Math.round(this.xPos * width);
    },

    getScreenY: function(height) {
        return Math.round(this.yPos * height);
    },

    getTuioTime: function() {
        return Tuio.Time.fromTime(this.currentTime);
    },

    getStartTime: function() {
        return Tuio.Time.fromTime(this.startTime);
    }
}, {
    fromPoint: function(tpoint) {
        return new Tuio.Point({
            xp: tpoint.getX(),
            yp: tpoint.getY()
        });
    }
});
    
if (typeof exports !== "undefined") {
    module.exports = Tuio.Point;
}
    
}(this));
},{"./Tuio":1}],9:[function(require,module,exports){
(function(root) {

var Tuio = root.Tuio;

if (typeof require !== "undefined") {
    Tuio = require("./Tuio");
    Tuio.Component = require("./TuioComponent");
}

Tuio.Pointer = Tuio.Component.extend({
    pointerId: null,
    typeId: null,
    userId: null,
    componentId: null,
    shear: null,
    radius: null,
    pressure: null,
    pressureSpeed: null,
    pressureAccel: null,

    initialize: function(params) {
        params = params || {};
        Tuio.Component.prototype.initialize.call(this, params);
        
        this.pointerId = params.pi;
        this.typeId = params.ti
        this.userId = params.ui;
        this.componentId = params.ci;
        this.shear = params.sa;
        this.radius = params.r;
        this.pressure = params.p;
        this.pressureSpeed = params.ps;
        this.pressureAccel = params.pa;
    },
    getPointerId: function() {
        return this.pointerId;
    },
    getTypeId: function() {
        return this.typeId;
    },
    getUserId: function() {
        return this.userId;
    },
    getComponentId: function() {
        return this.componentId;
    },
    getShear: function() {
        return this.shear;
    },
    getRadius: function() {
        return this.radius;
    },
    getPressure: function() {
        return this.pressure;
    },
    getPressureSpeed: function() {
        return this.pressureSpeed;
    },
    getPressureAccel: function() {
        return this.pressureAccel;
    },
        
    update: function(params) {
        params = params || {};
        
        Tuio.Component.prototype.update.call(this, params);
        this.shear = params.sa;
        this.radius = params.r;
        this.pressure = params.p;
        this.pressureSpeed = params.ps;
        this.pressureAccel = params.pa;
    }
}, { 
    fromPointer: function(tptr) {
        return new Tuio.Pointer({
            ti: tptr.getTypeId(),
            ui: tptr.getUserId(),
            pi: tptr.getPointerId(),
            xp: tptr.getX(),
            yp: tptr.getY(),
            ci: tptr.getComponentId(),
            a: tptr.getAngle(),
            sa: tptr.getShear(),
            r: tptr.getRadius(),
            p: tptr.getPressure(),
            tobj: tptr.getContainingTuioObject(),
        });
    }
});
    
if (typeof exports !== "undefined") {
    module.exports = Tuio.Pointer;
}
    
}(this));
},{"./Tuio":1,"./TuioComponent":3}],10:[function(require,module,exports){
(function(root) {

var Tuio = root.Tuio,
    _ = root._;

if (typeof require !== "undefined") {
    Tuio = require("./Tuio");
    _ = require("lodash");
}

Tuio.Source = Tuio.Model.extend({
    sourceId: null,
    sourceName: null,
    sourceInstance: null,
    sourceAddress: null,
    dimension: null,
    dimensionBufferView: null,
    frameTime: null,
    
    initialize: function(params) {
        params = params || {};
        var sourceStringParams = this.setSourceString(params.sourceString),
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
        this.dimensionBufferView = new DataView(new ArrayBuffer(4));
        this.dimensionBufferView.setUint32(0, this.dimension);
        this.frameTime = params.frameTime || new Tuio.Time();
    },
    
    getSourceId: function() {
        return this.sourceId;
    },
    
    setSourceString: function(sourceString) {
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
    
    getSourceString: function() {
        return this.sourceName + ":" + this.sourceInstance +
                    "@" + this.sourceAddress;
    },
    
    getWidth: function() {
        return this.dimensionBufferView.getUint16(0);
    },
    
    getHeight: function() {
        return this.dimensionBufferView.getUint16(2);
    },
    
    getFrameTime: function() {
        return this.frameTime;
    },
    
    setFrameTime: function(ttime) {
        if (typeof ttime !== "undefined")
            this.frameTime = ttime;
    }
}, {
});
    
if (typeof exports !== "undefined") {
    module.exports = Tuio.Source;
}
    
}(this));
},{"./Tuio":1,"lodash":undefined}],11:[function(require,module,exports){
(function(root) {

var Tuio = root.Tuio;

if (typeof require !== "undefined") {
    Tuio = require("./Tuio");
}

Tuio.Time = Tuio.Model.extend({
    seconds: 0,
    microSeconds: 0,
    //tuio2
    frameId: 0,

    initialize: function(sec, usec) {
        this.seconds = sec || 0;
        this.microSeconds = usec || 0;
    },

    add: function(us) {
        return new Tuio.Time(
            this.seconds + Math.floor(us / 1000000),
            this.microSeconds + us % 1000000
        );
    },

    addTime: function(ttime) {
        var sec = this.seconds + ttime.getSeconds(),
        usec = this.microSeconds + ttime.getMicroseconds();
        sec += Math.floor(usec / 1000000);
        usec = usec % 1000000;
        
        return new Tuio.Time(sec, usec);
    },

    subtract: function(us) {
        var sec = this.seconds - Math.floor(us / 1000000),
        usec = this.microSeconds - us % 1000000;
        
        if (usec < 0) {
            usec += 1000000;
            sec = sec - 1;
        }
        
        return new Tuio.Time(sec, usec);
    },

    subtractTime: function(ttime) {
        var sec = this.seconds - ttime.getSeconds(),
        usec = this.microSeconds - ttime.getMicroseconds();

        if (usec < 0) {
            usec += 1000000;
            sec = sec - 1;
        }
        
        return new Tuio.Time(sec, usec);
    },

    equals: function(ttime) {
        return (
            (this.seconds === ttime.getSeconds()) &&
            (this.microSeconds === ttime.getMicroseconds())
        );
    },

    reset: function() {
        this.seconds = 0;
        this.microSeconds = 0;
    },

    getSeconds: function() {
        return this.seconds;
    },

    getMicroseconds: function() {
        return this.microSeconds;
    },

    getTotalMilliseconds: function() {
        return this.seconds * 1000 + Math.floor(this.microSeconds / 1000);
    },
    // tuio2
    getFrameId: function() {
        return this.frameId;
    },
    
    setFrameId: function(frameId) {
        this.frameId = frameId;
    }
}, {
    startSeconds: 0,
    startMicroSeconds: 0,

    fromMilliseconds: function(msec) {
        return new Tuio.Time(
            Math.floor(msec / 1000),
            1000 * (msec % 1000)
        );
    },

    fromTime: function(ttime) {
        return new Tuio.Time(
            ttime.getSeconds(),
            ttime.getMicroseconds()
        );
    },

    initSession: function() {
        var startTime = Tuio.Time.getSystemTime();
        Tuio.Time.startSeconds = startTime.getSeconds();
        Tuio.Time.startMicroSeconds = startTime.getMicroseconds();
    },

    getSessionTime: function() {
        return Tuio.Time.getSystemTime().subtractTime(Tuio.Time.getStartTime());
    },

    getStartTime: function() {
        return new Tuio.Time(
            Tuio.Time.startSeconds,
            Tuio.Time.startMicroSeconds
        );
    },

    getSystemTime: function() {
        var usec = new Date().getTime() * 1000;

        return new Tuio.Time(
            Math.floor(usec / 1000000),
            usec % 1000000
        );
    }
});
    
if (typeof exports !== "undefined") {
    module.exports = Tuio.Time;
}
    
}(this));
},{"./Tuio":1}],12:[function(require,module,exports){
(function(root) {

var Tuio = root.Tuio;

if (typeof require !== "undefined") {
    Tuio = require("./Tuio");
    Tuio.Component = require("./TuioComponent");
}

Tuio.Token = Tuio.Component.extend({
    symbolId: null,
    typeId: null,
    userId: null,
    
    initialize: function(params) {
        params = params || {};
        Tuio.Component.prototype.initialize.call(this, params);
        
        this.symbolId = params.sym;
        this.typeId = params.ti;
        this.userId = params.ui;
    },
    
    getSymbolId: function() {
        return this.symbolId;
    },
    getTypeId: function() {
        return this.typeId;
    },
    getUserId: function() {
        return this.userId;
    },
}, { 
    fromToken: function(ttok) {
        return new Tuio.Token({
            ti: ttok.getTypeId(),
            ui: ttok.getUserId(),
            sym: ttok.getSymbolId(),
            xp: ttok.getX(),
            yp: ttok.getY(),
            rs: ttok.getRotationSpeed(),
            ra: ttok.getRotationAccel(),
            tobj: ttok.getContainingTuioObject(),
            a: ttok.getAngle(),
        });
    }
});
    
if (typeof exports !== "undefined") {
    module.exports = Tuio.Token;
}
    
}(this));
},{"./Tuio":1,"./TuioComponent":3}]},{},[1,2,3,4,5,6,7,8,9,10,11,12]);
