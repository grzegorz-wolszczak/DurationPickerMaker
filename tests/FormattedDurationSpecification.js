var assert = require("assert");
var should = require('should');

let fs = require('fs');
let chai = require('chai');


let content = fs.readFileSync(__dirname + '/../src/FormattedDuration.js') + '';
let contentToEval = "(" + content + ")";
let FormattedDuration = eval(contentToEval);


let secondsChunkId = "seconds";
let minutesChunkId = "minutes";
let hoursChunkId = "hours";
let outOfRangeChunkId = "OutOfRange";

describe('FormattedDuration class tests - successful scenarios', function () {

    let d;
    beforeEach('', () => {
        d = new FormattedDuration();
    });


    it("should print duration with default hour/mintute/seconds field separators", function () {
        // GIVEN
        let d = new FormattedDuration();

        // WHEN
        let s = d.ToFormattedString();

        // THEN
        s.should.be.equal("00:00:00")
    });

    it("should print duration with defined hour/mintute/seconds field separators", function () {
        // GIVEN
        let d1 = new FormattedDuration(config = {
            hoursUnitString: "h ",
            minutesUnitString: "m ",
            secondsUnitString: "s"
        });

        // WHEN
        let s = d1.ToFormattedString();

        // THEN
        s.should.be.equal("00h 00m 00s")
    });

    it("should return default values on creation", function () {

        // WHEN
        let totalSeconds = d.ToTotalSeconds();

        // THEN
        totalSeconds.should.be.equal(0);
    });

    it("should update seconds to value less than 10", () => {

        // WHEN
        d.AddSeconds(1);

        // THEN
        d.ToTotalSeconds().should.be.equal(1);
        d.ToFormattedString().should.be.equal("00:00:01")

    });

    describe("Should update formatted string from seconds", function () {
        let dict = {
            0: "00:00:00",
            1: "00:00:01",
            59: "00:00:59",
            60: "00:01:00",
            61: "00:01:01",
            3599: "00:59:59",
            3600: "01:00:00",
            3601: "01:00:01",
            3661: "01:01:01",
        };

        for (let secondsValue in dict) {
            let stringValue = dict[secondsValue];

            it("should update seconds to value: " + secondsValue, () => {

                // WHEN
                d.SetTotalSeconds(secondsValue);

                // THEN
                d.ToTotalSeconds().should.be.equal(secondsValue);
                d.ToFormattedString().should.be.equal(stringValue)

            });
        }
    });

    describe("Should update totalSeconds from formatted", function () {
        let dict = {
            "00:00:00": 0,
            "01:02:03": 3600 + (2 * 60) + 3,
            "00:00:59": 59,
            "00:01:00": 60,
            "00:01:01": 61,
            "00:59:59": 3599,
            "01:00:00": 3600,
            "01:00:01": 3601,
            "01:01:01": 3661,
        };

        for (let formattedString in dict) {
            let totalSecondValue = dict[formattedString];

            it(`should update total seconds from '${formattedString}' to value: ` + totalSecondValue, () => {

                // WHEN
                d.FromFormattedString(formattedString);

                // THEN
                d.ToTotalSeconds().should.be.equal(totalSecondValue);
                d.ToFormattedString().should.be.equal(formattedString)

            });
        }
    });


    describe("Should validate formatted string", function(){
        let d = new FormattedDuration();

        dict = { // input, expected output
            "1:2:3": true,
            "0:0:0": true,
            "0000:00:00": true,
            "9999:59:59": true,

            "1:59:60": false,
            "1:60:59": false,
            "-1:1:1": false,
            "1:-1:1": false,
            "1:1:-1": false,

            "1:2:": false,
            "1:2:dfg": false,
            "1::3": false,
            "1:adfg:3": false,
            "1:adfg:asdf": false,
            "1::": false,
            "::": false,
            ":asdf:": false,
            ":asdf:asdf": false,
            ":2:asdf": false,
            ":Nan:3": false,
            ":5:3": false,
            "": false,
            "1:2:60": false,

        };
        for (let formattedString in dict) {
            let expectedResult = dict[formattedString];

            it("input: '"+formattedString+"', expected output: "+expectedResult, () => {

                // WHEN
                let resultArray = d.IsFormattedStringValid(formattedString);

                // THEN
                resultArray.should.be.equal(expectedResult);
            });
        }
    });

    describe("Should extract time chunks from formatted value", function(){
        let d = new FormattedDuration();

        dict = { // input, expected output
            "1:2:3": [1, 2, 3],
            "1:2:": [1, 2, NaN],
            "1:2:dfg": [1, 2, NaN],
            "1::3": [1, NaN, 3],
            "1:adfg:3": [1, NaN, 3],
            "1:adfg:asdf": [1, NaN, NaN],
            "1::": [1, NaN, NaN],
            "::": [NaN, NaN, NaN],
            ":asdf:": [NaN, NaN, NaN],
            ":asdf:asdf": [NaN, NaN, NaN],
            ":2:asdf": [NaN, 2, NaN],
            ":Nan:3": [NaN, NaN, 3],
            ":5:3": [NaN, 5, 3],

            "": [NaN, NaN, NaN],
            //":10": [NaN, 10, NaN], todo: fix this test


        };

        for (let formattedString in dict) {
            let expectedArray = dict[formattedString];

            it("input: '"+formattedString+"', expected output: "+expectedArray, () => {

                // WHEN
                let resultArray = d._ExtractTimeValuesFromFormattedString(formattedString);

                // THEN
                resultArray.should.be.a.Array();
                resultArray.length.should.be.equal(3);

                resultArray.forEach(function (item, index) {
                    let resultObject = resultArray[index];
                    let expectedObject = expectedArray[index];
                    Object.is(resultObject,expectedObject)
                        .should.be
                        .true(`expected '${expectedObject}' is not equal to result: '${resultObject}'`)
                });
            });
        }

    });

    describe("Should identify selected time part (hours|minutes|seconds)", function () {
        let d1 = new FormattedDuration(config = {
            hoursUnitString: ":",
            minutesUnitString: ":",
            secondsUnitString: ""
        });



        // for string '00:00:00" selection of hours part is evaluated as
        // all digits and entire hour 'unit' combined, that is '00:' string
        // all other selections are counted the same way

        /*
        that is when cursor is BEFORE character such as:
        0           hoursPartId          (index 0)
         0          hoursPartId          (index 1)
          :         hoursPartId          (index 2)
           0        minutesChunkId        (index 3)
            0       minutesChunkId        (index 4)
             :      minutesChunkId        (index 5)
              0     secondsChunkId         (index 6)
               0    secondsChunkId         (index 7)
                    secondsChunkId         (index 8)  (cursor is AFTER last character)
                    outOfRangeChunkId (when user gives cursor position bigger than formattedString lenght
         */


        it("should return outOfRange when selection index is less than zero", () => {
            // WHEN
            result = d1.GetSelectedTimeChunk(-1);

            // THEN
            result.should.be.equal(outOfRangeChunkId);
        });

        let dict = {

            0: hoursChunkId,
            1: hoursChunkId,
            2: hoursChunkId,
            3: minutesChunkId,
            4: minutesChunkId,
            5: minutesChunkId,
            6: secondsChunkId,
            7: secondsChunkId,
            8: secondsChunkId,
            9: outOfRangeChunkId,

        };

        for (let selectionIndex in dict) {
            let expectedSelectionChunkId = dict[selectionIndex];

            it("should return '" + expectedSelectionChunkId + "' when for string index: " + selectionIndex, () => {

                result = d1.GetSelectedTimeChunk(selectionIndex);

                // THEN
                result.should.be.equal(expectedSelectionChunkId);

            });
        }
    });

    describe("Should returned index range for time parts (default units) (hours|minutes|seconds)", function () {
        let d1 = new FormattedDuration(config = {
            hoursUnitString: ":",
            minutesUnitString: ":",
            secondsUnitString: ""
        });

        let secondPartId = "seconds";
        let minutesPartId = "minutes";
        let hoursPartId = "hours";


        // for string '00:00:00"  index range should :
        // hours : [0,2]
        // minutes: [3,5]
        // seconds: [6,8]

        it("should return index range for hour time part selection", () => {
            // WHEN
            result = d1.GetIndexRangeForTimeChunk(hoursPartId);

            // THEN
            result.startIndex.should.be.equal(0);
            result.endIndex.should.be.equal(2);
        });

        it("should return index range for minute time part selection", () => {
            // WHEN
            result = d1.GetIndexRangeForTimeChunk(minutesPartId);

            // THEN
            result.startIndex.should.be.equal(3);
            result.endIndex.should.be.equal(5);
        });

        it("should return index range for second time part selection", () => {
            // WHEN
            result = d1.GetIndexRangeForTimeChunk(secondPartId);

            // THEN
            result.startIndex.should.be.equal(6);
            result.endIndex.should.be.equal(8);
        });

    });

    describe("Should returned index range for time parts (custom units) (hours|minutes|seconds)", function () {
        let d1 = new FormattedDuration(config = {
            hoursUnitString: "--h--",
            minutesUnitString: "--m--",
            secondsUnitString: "--s--"
        });
        d1.SetTotalSeconds(3600 * 1234 + 60 * 12 + 12);

        let secondPartId = "seconds";
        let minutesPartId = "minutes";
        let hoursPartId = "hours";


        // for string '1234--h--12--m--12--s--"  index range should be:
        // hours : [0,4]
        // minutes: [9,11]
        // seconds: [16,18]

        it("should return index range for hour time part selection", () => {
            // WHEN
            result = d1.GetIndexRangeForTimeChunk(hoursPartId);

            // THEN
            result.startIndex.should.be.equal(0);
            result.endIndex.should.be.equal(4);
        });

        it("should return index range for minute time part selection", () => {
            // WHEN
            result = d1.GetIndexRangeForTimeChunk(minutesPartId);

            // THEN
            result.startIndex.should.be.equal(9);
            result.endIndex.should.be.equal(11);
        });

        it("should return index range for second time part selection", () => {
            // WHEN
            result = d1.GetIndexRangeForTimeChunk(secondPartId);

            // THEN
            result.startIndex.should.be.equal(16);
            result.endIndex.should.be.equal(18);
        });
    });

    describe("Should increment/decrement values for time chunk", function(){

        describe("Should increment hours", ()=>{

            let d1 = new FormattedDuration();

            tests = {
                "00:00:00" : "01:00:00",
                "01:00:00" : "02:00:00",
                "00:10:00" : "01:10:00",
                "00:01:00" : "01:01:00",
                "00:00:01" : "01:00:01",
                "00:01:01" : "01:01:01",
                "99:00:00" : "100:00:00",
            };
            for(let fromTimeString in tests)
            {
                let toTimeString = tests[fromTimeString];
                it(`should increment from '${fromTimeString}' to ${toTimeString}`, ()=>{
                    // GIVEN
                    d1.FromFormattedString(fromTimeString);

                    // WHEN
                    d1.IncrementValueForTimeChunk(hoursChunkId);

                    // THEN
                    let result = d1.ToFormattedString();
                    result.should.be.equal(toTimeString);
                })
            }
        });

        describe("Should increment minutes", ()=>{

            let d1 = new FormattedDuration();

            tests = {
                "00:00:00" : "00:01:00",
                "00:01:00" : "00:02:00",
                "00:09:00" : "00:10:00",
                "00:59:00" : "01:00:00",
                "00:00:01" : "00:01:01",
                "01:59:00" : "02:00:00",
                "99:59:00" : "100:00:00",
            };
            for(let fromTimeString in tests)
            {
                let toTimeString = tests[fromTimeString];
                it(`should increment from '${fromTimeString}' to ${toTimeString}`, ()=>{
                    // GIVEN
                    d1.FromFormattedString(fromTimeString);

                    // WHEN
                    d1.IncrementValueForTimeChunk(minutesChunkId);

                    // THEN
                    let result = d1.ToFormattedString();
                    result.should.be.equal(toTimeString);
                })
            }
        });

        describe("Should increment seconds", ()=>{

            let d1 = new FormattedDuration();

            tests = {
                "00:00:00" : "00:00:01",
                "00:00:01" : "00:00:02",
                "00:01:00" : "00:01:01",
                "00:09:59" : "00:10:00",
                "00:59:59" : "01:00:00",
                "01:59:59" : "02:00:00",
                "99:59:59" : "100:00:00",
            };

            for(let fromTimeString in tests)
            {
                let toTimeString = tests[fromTimeString];
                it(`should increment from '${fromTimeString}' to ${toTimeString}`, ()=>{
                    // GIVEN
                    d1.FromFormattedString(fromTimeString);

                    // WHEN
                    d1.IncrementValueForTimeChunk(secondsChunkId);

                    // THEN
                    let result = d1.ToFormattedString();
                    result.should.be.equal(toTimeString);
                })
            }
        });


        describe("Should decrement hours", ()=>{

            let d1 = new FormattedDuration();

            tests = {
                "00:00:00" : "00:00:00",
                "01:00:00" : "00:00:00",
                "01:59:00" : "00:59:00",
                "01:59:59" : "00:59:59",
                "00:59:59" : "00:59:59",

                "02:00:00" : "01:00:00",
                "99:00:00" : "98:00:00",
                "100:00:00" : "99:00:00",
            };
            for(let fromTimeString in tests)
            {
                let toTimeString = tests[fromTimeString];
                it(`should decrement from '${fromTimeString}' to ${toTimeString}`, ()=>{
                    // GIVEN
                    d1.FromFormattedString(fromTimeString);

                    // WHEN
                    d1.DecrementValueTimeChunk(hoursChunkId);

                    // THEN
                    let result = d1.ToFormattedString();
                    result.should.be.equal(toTimeString);
                })
            }
        });


        describe("Should decrement minutes", ()=>{

            let d1 = new FormattedDuration();

            tests = {
                "00:00:00" : "00:00:00",
                "00:00:01" : "00:00:01",
                "00:01:00" : "00:00:00",
                "01:00:00" : "00:59:00",
                "01:59:00" : "01:58:00",
                "01:59:59" : "01:58:59",
                "00:59:59" : "00:58:59",

                "02:00:00" : "01:59:00",
                "99:00:00" : "98:59:00",
                "100:00:00" : "99:59:00",
            };
            for(let fromTimeString in tests)
            {
                let toTimeString = tests[fromTimeString];
                it(`should decrement from '${fromTimeString}' to ${toTimeString}`, ()=>{
                    // GIVEN
                    d1.FromFormattedString(fromTimeString);

                    // WHEN
                    d1.DecrementValueTimeChunk(minutesChunkId);

                    // THEN
                    let result = d1.ToFormattedString();
                    result.should.be.equal(toTimeString);
                })
            }
        });



        describe("Should decrement seconds", ()=>{

            let d1 = new FormattedDuration();

            tests = {
                "00:00:00" : "00:00:00",
                "00:00:01" : "00:00:00",
                "00:01:00" : "00:00:59",
                "01:00:00" : "00:59:59",
                "01:59:00" : "01:58:59",
                "01:59:59" : "01:59:58",
                "00:59:59" : "00:59:58",

                "02:00:00" : "01:59:59",
                "99:00:00" : "98:59:59",
                "100:00:00" : "99:59:59",
            };
            for(let fromTimeString in tests)
            {
                let toTimeString = tests[fromTimeString];
                it(`should decrement from '${fromTimeString}' to ${toTimeString}`, ()=>{
                    // GIVEN
                    d1.FromFormattedString(fromTimeString);

                    // WHEN
                    d1.DecrementValueTimeChunk(secondsChunkId);

                    // THEN
                    let result = d1.ToFormattedString();
                    result.should.be.equal(toTimeString);
                })
            }
        });

    });
});
