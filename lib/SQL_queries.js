const mysql = require("mysql");
const connection = require("./SQL_login");
const asTable = require('as-table').configure({ delimiter: ' | ', dash: '-' });


class SQLqueries {

    constructor(query, values) {

        this.query = query;
        this.values = values;
    }

    //query to console log user input into a table
    generalTableQuery(nextStep) {

        connection.query(this.query, this.values, function (err, res) {
            if (err) throw err
            // console.table(res);
            // res.end()
            console.log("\n");
            console.log(asTable(res));
            console.log("\n");
            nextStep();
        })
    }

    //for loop for creating an array of roles
    getQueryNoRepeats(nextStep, parameterToPassToNextStep) {

        connection.query(this.query, this.values, function (err, res) {
            if (err) throw err
            let titleArr = []
            for (let i = 0; i < res.length; i++) {
                if (!titleArr.includes(res[i].title)) {
                    titleArr.push(res[i].title)
                }
            }
            nextStep(titleArr, parameterToPassToNextStep);
        })
    }

   //console log for delete
    delete(nextStep) {

        connection.query(this.query, this.values, function (err, res) {
            if (err) throw err
            
            console.log("Delete Successful!");

            nextStep();
        })
    }

    //query for updating roles
    update(nextStep, message) {

        connection.query(this.query, this.values, function (err, res) {
            if (err) throw err
            console.log(message);

            nextStep();
        })

    };

    //query to deliver query as function
    queryReturnResult(nextStep) {
        connection.query(this.query, this.values, function (err, res) {
            if (err) throw err
            
            nextStep(res);
        })
    }
}


module.exports = SQLqueries;

