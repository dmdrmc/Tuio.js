(function(root) {

var Tuio = root.Tuio,
    io = root.io,
    _ = root._,
    osc = root.osc;

if (typeof require !== "undefined") {
    Tuio = require("./Tuio");
    Tuio.Time = require('./TuioTime');
    Tuio.Source = require('./TuioSource');
    Tuio.ObjectContainer = require('./TuioObjectContainer');
    Tuio.Pointer = require('./TuioPointer');
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