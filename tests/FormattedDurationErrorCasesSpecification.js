let assert = require("assert");
let fs = require('fs');
let should = require('should');
let chai = require('chai');

/* how to 'import' class from file
https://stackoverflow.com/questions/39298985/using-eval-method-to-get-class-from-string-in-firefox
 */


let content = fs.readFileSync(__dirname + '/../src/FormattedDuration.js') + '';
let contentToEval = "(" + content + ")";
let FormattedDuration = eval(contentToEval);


describe('FormattedDuration class tests - failure scenarios (validations)', function(){

    let d;
    beforeEach('', ()=>{
        d = new FormattedDuration();
    });

    it('should throw an error if hour unit string is empty', function () {

        /*
        hoursUnitString: ":",
        minutesUnitString: ":",
        secondsUnitString: ""
         */

        chai.expect(function () {
            d = new FormattedDuration(
                config = {
                hoursUnitString: ""
            })
        }).to.throw("hour unit cannot be empty");
    });

    it('should throw an error if minute unit string is empty', function () {
        chai.expect(function () {
            d = new FormattedDuration(
                config = {
                    minutesUnitString: ""
                })
        }).to.throw("minute unit cannot be empty");
    });

    describe("should throw an error if hour unit string does not conform to format", function(){
        let invalidValues = [
            "1", // cannot be digit
            "1a", // cannot start with digit
            "a1", // cannot end with digit
        ];

        invalidValues.forEach(function (item, _) {
            it("should throw when hour unit string is: '" + item + "'", ()=>{

                chai.expect(function () {
                    d = new FormattedDuration(
                        config = {
                            hoursUnitString: item
                        })
                }).to.throw("invalid hour unit");
            });
        });
    });

    describe("should throw an error if minute unit string does not conform to format", function(){
        let invalidValues = [
            "1", // cannot be digit
            "1a", // cannot start with digit
            "a1", // cannot end with digit
        ];

        invalidValues.forEach(function (item, _) {
            it("should throw when minute unit string is: '" + item + "'", ()=>{

                chai.expect(function () {
                    d = new FormattedDuration(
                        config = {
                            minutesUnitString: item
                        })
                }).to.throw("invalid minute unit");
            });
        });
    });


});

