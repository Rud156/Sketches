/// <reference path="./star.js" />
/// <reference path="./music-handler.js" />

let stars = [];
let starBurst = [];
let musicHandler = new MusicHandler();
let audio = document.getElementById('audio');

let audioContext = new AudioContext();
let leftAnalyzer = audioContext.createAnalyser();
let rightAnalyzer = audioContext.createAnalyser();

let leftBufferLength = leftAnalyzer.frequencyBinCount;
let rightBufferLength = rightAnalyzer.frequencyBinCount;
let leftDataArray = new Uint8Array(leftBufferLength);
let rightDataArray = new Uint8Array(rightBufferLength);

let source = audioContext.createMediaElementSource(audio);
let splitter = audioContext.createChannelSplitter(2);

source.connect(splitter);
splitter.connect(leftAnalyzer, 0);
splitter.connect(rightAnalyzer, 1);

leftAnalyzer.fftSize = 1024;
rightAnalyzer.fftSize = 1024;
leftAnalyzer.connect(audioContext.destination);
rightAnalyzer.connect(audioContext.destination);
// leftAnalyzer.smoothingTimeConstant = 0.3;
// rightAnalyzer.smoothingTimeConstant = 0.3;
// source.connect(audioContext.destination);


let sensitivity = (-0.0025714 * 1) + 1.5142857;
let previousValue = 0;
let historyBuffer = [];

let inputFile = document.getElementById('media-input');
let mediaInputButton = document.getElementById('media-input-button');
let mediaHolder = document.getElementById('media-holder');

mediaInputButton.addEventListener('click', () => {
    inputFile.click();
});
inputFile.addEventListener('change', (event) => {
    musicHandler.handleFileChange(event);
    buildAudioGraph();
});

let createStarBurst = () => {
    let angleChange = 3.6;
    for (let i = 0; i < 100; i++) {
        starBurst.push(new Star(
            false,
            false,
            10 * cos(angleChange),
            10 * sin(angleChange),
            random(width / 2),
            20
        ));
        angleChange += 3.6;
    }
};

let calcVariance = (valueArray, olderValue) => {
    let sum = 0;
    for (let i = 0; i < valueArray.length; i++)
        sum += pow(valueArray[i] - olderValue, 2);
    return sum / valueArray.length;
};

let calcSumSquaredValue = (valueArray) => {
    let sum = 0;
    for (let i = 0; i < valueArray.length; i++)
        sum += pow(valueArray[i], 2);
    return sum / valueArray.length;
};

let sumStereo = (channelLeft, channelRight) => {
    let sum = 0;
    for (let i = 0; i < channelLeft.length; i++)
        sum += (pow(channelLeft[i], 2) + pow(channelRight[i], 2));

    return sum;
};

let sumLocalEnergy = (valueArray) => {
    let sum = 0;
    for (let i = 0; i < valueArray.length; i++)
        sum += pow(valueArray[i], 2);
    return sum / valueArray.length;
};

let buildAudioGraph = () => {
    if (audio.canPlayType(musicHandler.getFile().type)) {
        audio.src = musicHandler.getFileBlob();
        audio.play();
    } else {
        window.alert('Invalid File Type Selected');
    }
};

let visualize = () => {
    /*
        analyzer.getByteFrequencyData(dataArray);
        let current = getSumSquaredValue(dataArray);
        sensitivity = 1.3;
    */
    leftAnalyzer.getByteTimeDomainData(leftDataArray);
    rightAnalyzer.getByteTimeDomainData(rightDataArray);

    let energy = sumStereo(leftDataArray, rightDataArray);
    let localEnergy = sumLocalEnergy(historyBuffer);
    let variance = calcVariance(historyBuffer, localEnergy);

    sensitivity = (-0.0025714 * variance) + 1.5142857;
    historyBuffer.pop();
    historyBuffer.unshift(energy);

    if (energy > sensitivity * localEnergy)
        createStarBurst();
};

function setup() {
    let canvas = createCanvas(window.innerWidth - 25, window.innerHeight - mediaHolder.offsetHeight - 45);
    canvas.parent('canvas-holder');
    for (let i = 0; i < 500; i++)
        stars.push(new Star(true, true));

    for (let i = 0; i < 43; i++)
        historyBuffer.push(0);
}

function draw() {
    background(0);
    translate(width / 2, height / 2);

    stars.forEach(element => {
        element.update();
        element.show();
        // if (mouseX >= 0 && mouseX <= width)
        //     element.setSpeed();
    });

    starBurst.forEach(element => {
        element.show();
        element.update();
    });

    for (let i = 0; i < starBurst.length; i++) {
        if (starBurst[i].z < 1) {
            starBurst.splice(i, 1);
            i -= 1;
        }
    }

    visualize();
}

// function mousePressed() {
//     createStarBurst();
// }