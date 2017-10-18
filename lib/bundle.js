"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Utility = function () {
    function Utility() {
        _classCallCheck(this, Utility);
    }

    _createClass(Utility, [{
        key: "calcSumSquaredValue",
        value: function calcSumSquaredValue(valueArray) {
            var sum = 0;
            for (var i = 0; i < valueArray.length; i++) {
                sum += pow(valueArray[i], 2);
            }return sum / valueArray.length;
        }
    }, {
        key: "calcSumSquareStereo",
        value: function calcSumSquareStereo(valueArray) {
            var value = this.calcSumSquaredValue(valueArray);
            return value * valueArray.length;
        }
    }, {
        key: "calcMean",
        value: function calcMean(valueArray) {
            var sum = 0;
            for (var i = 0; i < valueArray.length; i++) {
                sum += valueArray[i];
            }return sum / valueArray.length;
        }
    }, {
        key: "calcVariance",
        value: function calcVariance(valueArray, oldValue) {
            var sum = 0;
            for (var i = 0; i < valueArray.length; i++) {
                sum += pow(valueArray[i] - oldValue, 2);
            }return sum / valueArray.length;
        }
    }, {
        key: "shiftBuffer",
        value: function shiftBuffer(buffer, value) {
            var newArray = [].concat(_toConsumableArray(buffer));
            newArray.pop();
            newArray.unshift(value);
            return newArray;
        }
    }]);

    return Utility;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Star = function () {
    function Star(reset, autoColor, x, y, z, speed) {
        _classCallCheck(this, Star);

        this.x = x === undefined ? random(-width / 2, width / 2) : x;
        this.y = y === undefined ? random(-height / 2, height / 2) : y;

        this.z = z === undefined ? random(width / 2) : z;
        this.size = 0;
        this.speed = speed === undefined ? random(0, 20) : speed;
        this.alpha = 0;

        this.previousZ = this.z;
        this.reset = reset;

        this.color = autoColor ? null : random([235, 115, 0]);
        this.autoColor = autoColor;
    }

    _createClass(Star, [{
        key: "setStartPositions",
        value: function setStartPositions(x, y, z, speed) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.speed = speed;
            this.previousZ = this.z;
        }
    }, {
        key: "show",
        value: function show() {
            if (this.autoColor) this.color = parseInt(map(this.z, 0, width / 2, 0, 359));
            var fillColor = color("hsl(" + this.color + ", 100%, 50%)");

            var positionX = map(this.x / this.z, 0, 1, 0, width / 2);
            var positionY = map(this.y / this.z, 0, 1, 0, height / 2);

            this.size = map(this.z, 0, width / 2, 16, 0);
            fill(fillColor);
            noStroke();
            ellipse(positionX, positionY, this.size);

            var previousX = map(this.x / this.previousZ, 0, 1, 0, width / 2);
            var previousY = map(this.y / this.previousZ, 0, 1, 0, height / 2);

            stroke(fillColor);
            line(previousX, previousY, positionX, positionY);
        }
    }, {
        key: "update",
        value: function update() {
            this.previousZ = this.z;
            this.z -= this.speed;

            if (this.z < 1 && this.reset) {
                this.x = random(-width / 2, width / 2);
                this.y = random(-height / 2, height / 2);
                this.z = width / 2;
                this.size = 0;
                this.previousZ = this.z;
            } else if (this.z >= width / 2 && this.reset) {
                this.z = 2;
                this.x = random(-width / 2, width / 2);
                this.y = random(-height / 2, height / 2);
                this.previousZ = this.z;
                this.size = 16;
            }
        }
    }, {
        key: "setSpeed",
        value: function setSpeed() {
            this.speed = map(mouseX, 0, width, -60, 60);
        }
    }]);

    return Star;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MusicHandler = function () {
    function MusicHandler() {
        _classCallCheck(this, MusicHandler);

        this.mediaFile = null;
        this.fileSelected = false;
        this.fileBlobURL = null;
    }

    _createClass(MusicHandler, [{
        key: "handleFileChange",
        value: function handleFileChange(event) {
            this.mediaFile = event.target.files[0];
            this.fileSelected = true;
            var fileURL = window.URL.createObjectURL(this.mediaFile);
            this.fileBlobURL = fileURL;
        }
    }, {
        key: "getFileBlob",
        value: function getFileBlob() {
            return this.fileBlobURL;
        }
    }, {
        key: "getFile",
        value: function getFile() {
            return this.mediaFile;
        }
    }]);

    return MusicHandler;
}();
'use strict';

/// <reference path="./star.js" />
/// <reference path="./music-handler.js" />
/// <reference path="./utility.js" />

var stars = [];
var starBurst = [];
var musicHandler = new MusicHandler();
var utility = new Utility();
var audio = document.getElementById('audio');

var sampleSize = 1024;
var audioContext = new AudioContext();
var analyzer = audioContext.createAnalyser();
analyzer.fftSize = sampleSize;
var bufferLength = analyzer.frequencyBinCount;
var dataArray = new Float32Array(bufferLength);
var source = audioContext.createMediaElementSource(audio);
source.connect(analyzer);
analyzer.connect(audioContext.destination);

var sensitivity = -0.0025714 * 0 + 1.5142857; // TODO: Make some formula for the beats
var historyBuffer = [];

var inputFile = document.getElementById('media-input');
var mediaInputButton = document.getElementById('media-input-button');
var mediaHolder = document.getElementById('media-holder');

mediaInputButton.addEventListener('click', function () {
    inputFile.click();
});
inputFile.addEventListener('change', function (event) {
    musicHandler.handleFileChange(event);
    buildAudioGraph();
});

var createStarBurst = function createStarBurst() {
    var angleChange = 3.6;
    for (var i = 0; i < 100; i++) {
        starBurst.push(new Star(false, false, 10 * cos(angleChange), 10 * sin(angleChange), random(width / 2), 20));
        angleChange += 3.6;
    }
};

var buildAudioGraph = function buildAudioGraph() {
    if (audio.canPlayType(musicHandler.getFile().type)) {
        audio.src = musicHandler.getFileBlob();
        audio.play();
    } else {
        window.alert('Invalid File Type Selected');
    }
};

var visualize = function visualize() {
    analyzer.getFloatTimeDomainData(dataArray);
    var instantSpec = utility.calcSumSquareStereo(dataArray);
    var averageSpec = sampleSize / historyBuffer.length * utility.calcSumSquareStereo(historyBuffer);
    var variance = utility.calcVariance(historyBuffer, averageSpec);

    sensitivity = -0.0025714 * variance + 1.5142857;
    historyBuffer = utility.shiftBuffer(historyBuffer, instantSpec);

    if (instantSpec > sensitivity * averageSpec) createStarBurst();
};

function setup() {
    var canvas = createCanvas(window.innerWidth - 25, window.innerHeight - mediaHolder.offsetHeight - 45);
    canvas.parent('canvas-holder');
    for (var i = 0; i < 500; i++) {
        stars.push(new Star(true, true));
    }for (var _i = 0; _i < 43; _i++) {
        historyBuffer.push(0);
    }
}

function draw() {
    background(0);
    translate(width / 2, height / 2);

    stars.forEach(function (element) {
        element.update();
        element.show();
    });

    starBurst.forEach(function (element) {
        element.show();
        element.update();
    });

    for (var i = 0; i < starBurst.length; i++) {
        if (starBurst[i].z < 1) {
            starBurst.splice(i, 1);
            i -= 1;
        }
    }

    visualize();
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWxpdHkuanMiLCJzdGFyLmpzIiwibXVzaWMtaGFuZGxlci5qcyIsImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSgpO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIFV0aWxpdHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gVXRpbGl0eSgpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFV0aWxpdHkpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhVdGlsaXR5LCBbe1xuICAgICAgICBrZXk6IFwiY2FsY1N1bVNxdWFyZWRWYWx1ZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY2FsY1N1bVNxdWFyZWRWYWx1ZSh2YWx1ZUFycmF5KSB7XG4gICAgICAgICAgICB2YXIgc3VtID0gMDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWVBcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHN1bSArPSBwb3codmFsdWVBcnJheVtpXSwgMik7XG4gICAgICAgICAgICB9cmV0dXJuIHN1bSAvIHZhbHVlQXJyYXkubGVuZ3RoO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6IFwiY2FsY1N1bVNxdWFyZVN0ZXJlb1wiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY2FsY1N1bVNxdWFyZVN0ZXJlbyh2YWx1ZUFycmF5KSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLmNhbGNTdW1TcXVhcmVkVmFsdWUodmFsdWVBcnJheSk7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWUgKiB2YWx1ZUFycmF5Lmxlbmd0aDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcImNhbGNNZWFuXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBjYWxjTWVhbih2YWx1ZUFycmF5KSB7XG4gICAgICAgICAgICB2YXIgc3VtID0gMDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWVBcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHN1bSArPSB2YWx1ZUFycmF5W2ldO1xuICAgICAgICAgICAgfXJldHVybiBzdW0gLyB2YWx1ZUFycmF5Lmxlbmd0aDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcImNhbGNWYXJpYW5jZVwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gY2FsY1ZhcmlhbmNlKHZhbHVlQXJyYXksIG9sZFZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgc3VtID0gMDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWVBcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHN1bSArPSBwb3codmFsdWVBcnJheVtpXSAtIG9sZFZhbHVlLCAyKTtcbiAgICAgICAgICAgIH1yZXR1cm4gc3VtIC8gdmFsdWVBcnJheS5sZW5ndGg7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJzaGlmdEJ1ZmZlclwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2hpZnRCdWZmZXIoYnVmZmVyLCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIG5ld0FycmF5ID0gW10uY29uY2F0KF90b0NvbnN1bWFibGVBcnJheShidWZmZXIpKTtcbiAgICAgICAgICAgIG5ld0FycmF5LnBvcCgpO1xuICAgICAgICAgICAgbmV3QXJyYXkudW5zaGlmdCh2YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3QXJyYXk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gVXRpbGl0eTtcbn0oKTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9jcmVhdGVDbGFzcyA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0oKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIFN0YXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU3RhcihyZXNldCwgYXV0b0NvbG9yLCB4LCB5LCB6LCBzcGVlZCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgU3Rhcik7XG5cbiAgICAgICAgdGhpcy54ID0geCA9PT0gdW5kZWZpbmVkID8gcmFuZG9tKC13aWR0aCAvIDIsIHdpZHRoIC8gMikgOiB4O1xuICAgICAgICB0aGlzLnkgPSB5ID09PSB1bmRlZmluZWQgPyByYW5kb20oLWhlaWdodCAvIDIsIGhlaWdodCAvIDIpIDogeTtcblxuICAgICAgICB0aGlzLnogPSB6ID09PSB1bmRlZmluZWQgPyByYW5kb20od2lkdGggLyAyKSA6IHo7XG4gICAgICAgIHRoaXMuc2l6ZSA9IDA7XG4gICAgICAgIHRoaXMuc3BlZWQgPSBzcGVlZCA9PT0gdW5kZWZpbmVkID8gcmFuZG9tKDAsIDIwKSA6IHNwZWVkO1xuICAgICAgICB0aGlzLmFscGhhID0gMDtcblxuICAgICAgICB0aGlzLnByZXZpb3VzWiA9IHRoaXMuejtcbiAgICAgICAgdGhpcy5yZXNldCA9IHJlc2V0O1xuXG4gICAgICAgIHRoaXMuY29sb3IgPSBhdXRvQ29sb3IgPyBudWxsIDogcmFuZG9tKFsyMzUsIDExNSwgMF0pO1xuICAgICAgICB0aGlzLmF1dG9Db2xvciA9IGF1dG9Db2xvcjtcbiAgICB9XG5cbiAgICBfY3JlYXRlQ2xhc3MoU3RhciwgW3tcbiAgICAgICAga2V5OiBcInNldFN0YXJ0UG9zaXRpb25zXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRTdGFydFBvc2l0aW9ucyh4LCB5LCB6LCBzcGVlZCkge1xuICAgICAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgICAgICB0aGlzLnogPSB6O1xuICAgICAgICAgICAgdGhpcy5zcGVlZCA9IHNwZWVkO1xuICAgICAgICAgICAgdGhpcy5wcmV2aW91c1ogPSB0aGlzLno7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJzaG93XCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBzaG93KCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuYXV0b0NvbG9yKSB0aGlzLmNvbG9yID0gcGFyc2VJbnQobWFwKHRoaXMueiwgMCwgd2lkdGggLyAyLCAwLCAzNTkpKTtcbiAgICAgICAgICAgIHZhciBmaWxsQ29sb3IgPSBjb2xvcihcImhzbChcIiArIHRoaXMuY29sb3IgKyBcIiwgMTAwJSwgNTAlKVwiKTtcblxuICAgICAgICAgICAgdmFyIHBvc2l0aW9uWCA9IG1hcCh0aGlzLnggLyB0aGlzLnosIDAsIDEsIDAsIHdpZHRoIC8gMik7XG4gICAgICAgICAgICB2YXIgcG9zaXRpb25ZID0gbWFwKHRoaXMueSAvIHRoaXMueiwgMCwgMSwgMCwgaGVpZ2h0IC8gMik7XG5cbiAgICAgICAgICAgIHRoaXMuc2l6ZSA9IG1hcCh0aGlzLnosIDAsIHdpZHRoIC8gMiwgMTYsIDApO1xuICAgICAgICAgICAgZmlsbChmaWxsQ29sb3IpO1xuICAgICAgICAgICAgbm9TdHJva2UoKTtcbiAgICAgICAgICAgIGVsbGlwc2UocG9zaXRpb25YLCBwb3NpdGlvblksIHRoaXMuc2l6ZSk7XG5cbiAgICAgICAgICAgIHZhciBwcmV2aW91c1ggPSBtYXAodGhpcy54IC8gdGhpcy5wcmV2aW91c1osIDAsIDEsIDAsIHdpZHRoIC8gMik7XG4gICAgICAgICAgICB2YXIgcHJldmlvdXNZID0gbWFwKHRoaXMueSAvIHRoaXMucHJldmlvdXNaLCAwLCAxLCAwLCBoZWlnaHQgLyAyKTtcblxuICAgICAgICAgICAgc3Ryb2tlKGZpbGxDb2xvcik7XG4gICAgICAgICAgICBsaW5lKHByZXZpb3VzWCwgcHJldmlvdXNZLCBwb3NpdGlvblgsIHBvc2l0aW9uWSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJ1cGRhdGVcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgICAgIHRoaXMucHJldmlvdXNaID0gdGhpcy56O1xuICAgICAgICAgICAgdGhpcy56IC09IHRoaXMuc3BlZWQ7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnogPCAxICYmIHRoaXMucmVzZXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnggPSByYW5kb20oLXdpZHRoIC8gMiwgd2lkdGggLyAyKTtcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSByYW5kb20oLWhlaWdodCAvIDIsIGhlaWdodCAvIDIpO1xuICAgICAgICAgICAgICAgIHRoaXMueiA9IHdpZHRoIC8gMjtcbiAgICAgICAgICAgICAgICB0aGlzLnNpemUgPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMucHJldmlvdXNaID0gdGhpcy56O1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnogPj0gd2lkdGggLyAyICYmIHRoaXMucmVzZXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnogPSAyO1xuICAgICAgICAgICAgICAgIHRoaXMueCA9IHJhbmRvbSgtd2lkdGggLyAyLCB3aWR0aCAvIDIpO1xuICAgICAgICAgICAgICAgIHRoaXMueSA9IHJhbmRvbSgtaGVpZ2h0IC8gMiwgaGVpZ2h0IC8gMik7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2aW91c1ogPSB0aGlzLno7XG4gICAgICAgICAgICAgICAgdGhpcy5zaXplID0gMTY7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJzZXRTcGVlZFwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gc2V0U3BlZWQoKSB7XG4gICAgICAgICAgICB0aGlzLnNwZWVkID0gbWFwKG1vdXNlWCwgMCwgd2lkdGgsIC02MCwgNjApO1xuICAgICAgICB9XG4gICAgfV0pO1xuXG4gICAgcmV0dXJuIFN0YXI7XG59KCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbnZhciBNdXNpY0hhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTXVzaWNIYW5kbGVyKCkge1xuICAgICAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTXVzaWNIYW5kbGVyKTtcblxuICAgICAgICB0aGlzLm1lZGlhRmlsZSA9IG51bGw7XG4gICAgICAgIHRoaXMuZmlsZVNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZmlsZUJsb2JVUkwgPSBudWxsO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhNdXNpY0hhbmRsZXIsIFt7XG4gICAgICAgIGtleTogXCJoYW5kbGVGaWxlQ2hhbmdlXCIsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBoYW5kbGVGaWxlQ2hhbmdlKGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLm1lZGlhRmlsZSA9IGV2ZW50LnRhcmdldC5maWxlc1swXTtcbiAgICAgICAgICAgIHRoaXMuZmlsZVNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBmaWxlVVJMID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwodGhpcy5tZWRpYUZpbGUpO1xuICAgICAgICAgICAgdGhpcy5maWxlQmxvYlVSTCA9IGZpbGVVUkw7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogXCJnZXRGaWxlQmxvYlwiLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0RmlsZUJsb2IoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maWxlQmxvYlVSTDtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiBcImdldEZpbGVcIixcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldEZpbGUoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tZWRpYUZpbGU7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gTXVzaWNIYW5kbGVyO1xufSgpOyIsIid1c2Ugc3RyaWN0JztcblxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vc3Rhci5qc1wiIC8+XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9tdXNpYy1oYW5kbGVyLmpzXCIgLz5cbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3V0aWxpdHkuanNcIiAvPlxuXG52YXIgc3RhcnMgPSBbXTtcbnZhciBzdGFyQnVyc3QgPSBbXTtcbnZhciBtdXNpY0hhbmRsZXIgPSBuZXcgTXVzaWNIYW5kbGVyKCk7XG52YXIgdXRpbGl0eSA9IG5ldyBVdGlsaXR5KCk7XG52YXIgYXVkaW8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXVkaW8nKTtcblxudmFyIHNhbXBsZVNpemUgPSAxMDI0O1xudmFyIGF1ZGlvQ29udGV4dCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcbnZhciBhbmFseXplciA9IGF1ZGlvQ29udGV4dC5jcmVhdGVBbmFseXNlcigpO1xuYW5hbHl6ZXIuZmZ0U2l6ZSA9IHNhbXBsZVNpemU7XG52YXIgYnVmZmVyTGVuZ3RoID0gYW5hbHl6ZXIuZnJlcXVlbmN5QmluQ291bnQ7XG52YXIgZGF0YUFycmF5ID0gbmV3IEZsb2F0MzJBcnJheShidWZmZXJMZW5ndGgpO1xudmFyIHNvdXJjZSA9IGF1ZGlvQ29udGV4dC5jcmVhdGVNZWRpYUVsZW1lbnRTb3VyY2UoYXVkaW8pO1xuc291cmNlLmNvbm5lY3QoYW5hbHl6ZXIpO1xuYW5hbHl6ZXIuY29ubmVjdChhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuXG52YXIgc2Vuc2l0aXZpdHkgPSAtMC4wMDI1NzE0ICogMCArIDEuNTE0Mjg1NzsgLy8gVE9ETzogTWFrZSBzb21lIGZvcm11bGEgZm9yIHRoZSBiZWF0c1xudmFyIGhpc3RvcnlCdWZmZXIgPSBbXTtcblxudmFyIGlucHV0RmlsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtZWRpYS1pbnB1dCcpO1xudmFyIG1lZGlhSW5wdXRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWVkaWEtaW5wdXQtYnV0dG9uJyk7XG52YXIgbWVkaWFIb2xkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWVkaWEtaG9sZGVyJyk7XG5cbm1lZGlhSW5wdXRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgaW5wdXRGaWxlLmNsaWNrKCk7XG59KTtcbmlucHV0RmlsZS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBtdXNpY0hhbmRsZXIuaGFuZGxlRmlsZUNoYW5nZShldmVudCk7XG4gICAgYnVpbGRBdWRpb0dyYXBoKCk7XG59KTtcblxudmFyIGNyZWF0ZVN0YXJCdXJzdCA9IGZ1bmN0aW9uIGNyZWF0ZVN0YXJCdXJzdCgpIHtcbiAgICB2YXIgYW5nbGVDaGFuZ2UgPSAzLjY7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxMDA7IGkrKykge1xuICAgICAgICBzdGFyQnVyc3QucHVzaChuZXcgU3RhcihmYWxzZSwgZmFsc2UsIDEwICogY29zKGFuZ2xlQ2hhbmdlKSwgMTAgKiBzaW4oYW5nbGVDaGFuZ2UpLCByYW5kb20od2lkdGggLyAyKSwgMjApKTtcbiAgICAgICAgYW5nbGVDaGFuZ2UgKz0gMy42O1xuICAgIH1cbn07XG5cbnZhciBidWlsZEF1ZGlvR3JhcGggPSBmdW5jdGlvbiBidWlsZEF1ZGlvR3JhcGgoKSB7XG4gICAgaWYgKGF1ZGlvLmNhblBsYXlUeXBlKG11c2ljSGFuZGxlci5nZXRGaWxlKCkudHlwZSkpIHtcbiAgICAgICAgYXVkaW8uc3JjID0gbXVzaWNIYW5kbGVyLmdldEZpbGVCbG9iKCk7XG4gICAgICAgIGF1ZGlvLnBsYXkoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB3aW5kb3cuYWxlcnQoJ0ludmFsaWQgRmlsZSBUeXBlIFNlbGVjdGVkJyk7XG4gICAgfVxufTtcblxudmFyIHZpc3VhbGl6ZSA9IGZ1bmN0aW9uIHZpc3VhbGl6ZSgpIHtcbiAgICBhbmFseXplci5nZXRGbG9hdFRpbWVEb21haW5EYXRhKGRhdGFBcnJheSk7XG4gICAgdmFyIGluc3RhbnRTcGVjID0gdXRpbGl0eS5jYWxjU3VtU3F1YXJlU3RlcmVvKGRhdGFBcnJheSk7XG4gICAgdmFyIGF2ZXJhZ2VTcGVjID0gc2FtcGxlU2l6ZSAvIGhpc3RvcnlCdWZmZXIubGVuZ3RoICogdXRpbGl0eS5jYWxjU3VtU3F1YXJlU3RlcmVvKGhpc3RvcnlCdWZmZXIpO1xuICAgIHZhciB2YXJpYW5jZSA9IHV0aWxpdHkuY2FsY1ZhcmlhbmNlKGhpc3RvcnlCdWZmZXIsIGF2ZXJhZ2VTcGVjKTtcblxuICAgIHNlbnNpdGl2aXR5ID0gLTAuMDAyNTcxNCAqIHZhcmlhbmNlICsgMS41MTQyODU3O1xuICAgIGhpc3RvcnlCdWZmZXIgPSB1dGlsaXR5LnNoaWZ0QnVmZmVyKGhpc3RvcnlCdWZmZXIsIGluc3RhbnRTcGVjKTtcblxuICAgIGlmIChpbnN0YW50U3BlYyA+IHNlbnNpdGl2aXR5ICogYXZlcmFnZVNwZWMpIGNyZWF0ZVN0YXJCdXJzdCgpO1xufTtcblxuZnVuY3Rpb24gc2V0dXAoKSB7XG4gICAgdmFyIGNhbnZhcyA9IGNyZWF0ZUNhbnZhcyh3aW5kb3cuaW5uZXJXaWR0aCAtIDI1LCB3aW5kb3cuaW5uZXJIZWlnaHQgLSBtZWRpYUhvbGRlci5vZmZzZXRIZWlnaHQgLSA0NSk7XG4gICAgY2FudmFzLnBhcmVudCgnY2FudmFzLWhvbGRlcicpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTAwOyBpKyspIHtcbiAgICAgICAgc3RhcnMucHVzaChuZXcgU3Rhcih0cnVlLCB0cnVlKSk7XG4gICAgfWZvciAodmFyIF9pID0gMDsgX2kgPCA0MzsgX2krKykge1xuICAgICAgICBoaXN0b3J5QnVmZmVyLnB1c2goMCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmF3KCkge1xuICAgIGJhY2tncm91bmQoMCk7XG4gICAgdHJhbnNsYXRlKHdpZHRoIC8gMiwgaGVpZ2h0IC8gMik7XG5cbiAgICBzdGFycy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIGVsZW1lbnQudXBkYXRlKCk7XG4gICAgICAgIGVsZW1lbnQuc2hvdygpO1xuICAgIH0pO1xuXG4gICAgc3RhckJ1cnN0LmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudC5zaG93KCk7XG4gICAgICAgIGVsZW1lbnQudXBkYXRlKCk7XG4gICAgfSk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0YXJCdXJzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc3RhckJ1cnN0W2ldLnogPCAxKSB7XG4gICAgICAgICAgICBzdGFyQnVyc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgaSAtPSAxO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmlzdWFsaXplKCk7XG59Il19
