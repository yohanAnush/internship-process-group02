const express = require('express');
const router = express.Router();
const supervisor = require('../models/supervisorModel');
const randomize = require('randomatic');
const forms = require('../models/formsModel');


router.get('/', function (req, res, next) {
    supervisor.supervisorModel.find().exec().then((data) => {
        res.send(data);
    }).catch((err) => {
        res.send("Error");
    })
});

router.post('/login', function (req, res, next) {
    supervisor.supervisorModel.find({
        SupervisorEmail: req.body.SupervisorEmail,
        SupervisorPassword: req.body.SupervisorPassword
    }, {
        _id: 0,
        __v: 0,
        SupervisorPassword: 0
    }, (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: 'Something went wrong.'
            });
        } else if (data.length === 0) {
            res.status(404).send({
                success: false,
                message: 'Invalid login Credentials provided.'
            });
        } else {
            res.status(200).send({
                success: true,
                data: data
            });
        }
    });
});


router.get('/get-student/:id', function (req, res, next) {
    forms.formI1Model.find({
        StudentId: req.params.id,
    }, {
        _id: 0,
        __v: 0
    }, (err, data) => {
        if (err) {
            res.status(500).send({
                success: false,
                message: 'Something went wrong.'
            });
        } else if (data.length === 0) {
            res.status(404).send({
                success: false,
                message: 'Invalid Student ID provided.'
            });
        } else {
            res.status(200).send({
                success: true,
                data: data
            });
        }
    });
});

/* GET users listing. */
router.post('/add-supervisor', function (req, res) {
    // checking if all parameters are present since all of them are needed,
    // to complete the form I-1 from student's perspective.

    let allParamsPresent = true;
    let paramKeys = Object.keys(req.body);

    for (let i = 0; i < paramKeys.length; i++) {
        let key = paramKeys[i];
        let param = req.body[key];

        if (param == '' || param == undefined) {
            allParamsPresent = false;
            break;
        }
    }


    if (allParamsPresent) {
        let sp = supervisor.supervisorModel({
            SupervisorId: randomize('A0', 5),
            SupervisorName: req.body.SupervisorName,
            SupervisorEmail: req.body.SupervisorEmail,
            SupervisorPassword: req.body.SupervisorPassword,
        });

        sp.save(err => {
            console.log(err);
        })
    }

    res.send({
        success: allParamsPresent
    });
});


module.exports = router;
