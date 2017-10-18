class Utility {
    calcSumSquaredValue(valueArray) {
        let sum = 0;
        for (let i = 0; i < valueArray.length; i++)
            sum += pow(valueArray[i], 2);
        return sum / valueArray.length;
    }

    calcSumSquareStereo(valueArray) {
        let value = this.calcSumSquaredValue(valueArray);
        return value * valueArray.length;
    }

    calcMean(valueArray) {
        let sum = 0;
        for (let i = 0; i < valueArray.length; i++)
            sum += valueArray[i];
        return sum / valueArray.length;
    }

    calcVariance(valueArray, oldValue) {
        let sum = 0;
        for (let i = 0; i < valueArray.length; i++)
            sum += pow(valueArray[i] - oldValue, 2);
        return sum / valueArray.length;
    }

    shiftBuffer(buffer, value) {
        let newArray = [...buffer];
        newArray.pop();
        newArray.unshift(value);
        return newArray;
    }
}