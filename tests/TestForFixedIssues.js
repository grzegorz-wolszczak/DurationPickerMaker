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

describe('FormattedDuration class tests - tests that verifies fixes for bugs', function () {


    it("should convert from string", function () {
        // GIVEN
        let d= new FormattedDuration(config={
            hoursUnitString: " hours ",
            minutesUnitString: " minutes ",
            secondsUnitString: " seconds ",
        });

        // WHEN
        d.FromFormattedString("01 hours 12 minutes 00 seconds ");

        // THEN
        d._hours.should.be.equal(1);
        d._minutes.should.be.equal(12);
        d._seconds.should.be.equal(0);
    });


});

