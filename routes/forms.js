const express = require('express');
const router = express.Router();
const forms = require('../models/formsModel');

/* POST Form I-1 data: Student */
router.post('/form-i-1/student/:studentId', (req, res) => {
    console.log(req.body);
    saveFormI1StudentPersepective(req, res);
});

/* POST Form I-1 data: Supervisor */
router.post('/form-i-1/supervisor/:studentId', (req, res) => {
    console.log("Req.........")
    saveFormI1SupervisorPerspective(req, res);
});

/* GET all Form I-1 */
router.get('/form-i-1', (req, res) => {
    getFormI1('',req, res);
});

/* GET Form I-1 of a specific student */
router.get('/form-i-1/student/:studentId', (req, res) => {
    let studentId = req.params.studentId;
    getFormI1(studentId, req, res);
});

/* GET Form I-1s under specific supervisor */
router.get('/form-i-1/supervisor/:supervisorEmail', (req, res) => {
    let supervisorEmail = req.params.supervisorEmail;
    getAllFormI1UnderSupervisor(supervisorEmail, req, res);
})



/*
 * This will create a new record in the DB under student's registration number and,
 * insert the data filled by the student in the Form I-1.
 * Note that this same record has to be modified when entering data of provided by,
 * the supervisor for this student.
 * 
 * A new record must be created for the student only if all their details are present.
 * 
 * The response(using res object) must be as follows:-
 *      { success: true | false, data: data }
 *      
 *      success will indicate if necessary data was collected successfully or not.
 *      
 *      data will contain any data produced as a result of any execution in the function,
 *      or may contain any error message as well.
 * 
 * @param req:
 *      req object provided by Express's router which contains everything related to the,
 *      API request.
 * 
 * @param res:
 *      res object provided by Express's router which we use to send the response back,
 *      to the caller.
 */ 
function saveFormI1StudentPersepective(req, res) {
    console.log(req.body);
    let studentId = req.params.studentId;
    let allParamsPresent = true;
    let paramKeys = Object.keys(req.body);

    // checking if all parameters are present since all of them are needed,
    // to complete the form I-1 from student's perspective.
    for (let i = 0; i < paramKeys.length; i++) {
        let key = paramKeys[i];
        let param = req.body[key];

        if (param == '' || param == undefined) { allParamsPresent = false; break; }
    }

    if (allParamsPresent) {
        let formI1Student = forms.formI1Model({
            StudentId: req.body.studentId,
            StudentName: req.body.name,
            StudentAddress: req.body.address,
            StudentHomePhone: req.body.homePhone,
            StudentMobilePhone: req.body.mobilePhone,
            StudentEmails: req.body.emailAddresses,
            Year: req.body.year,
            Semester: req.body.semester,
            CGPA: req.body.cgpa,
            AssignedSupervisor: req.body.assignedSupervisor,
            SupervisorEmail: req.body.assignedSupervisor
        });

        formI1Student.save(err => { console.log(err); });
    }

    res.status(200).send({ success: allParamsPresent });
}

/*
 * Update Employee details using _id
 * PUT method is used to update details
 */
function saveFormI1SupervisorPerspective(req, res) {
    getStudentDetailsByStudentId(req.body.studentId).then((data) => {
        forms.formI1Model.update({ StudentId: req.body.studentId }, {
            EmployerName: req.body.employerName,
            EmployerAddress: req.body.employerAddress,
            SupervisorName: req.body.supervisorName,
            SupervisorPhone: req.body.supervisorPhone,
            SupervisorTitle: req.body.supervisorTitle,
            SupervisorEmail: req.body.supervisorEmail,
            InternshipStart: req.body.internshipStart,
            InternshipEnd: req.body.internshipEnd,
            WorkHoursPerWeek: req.body.workHoursPerWeek
        }, (err) => {
            if (err) {
                res.status(500).send({ success: false, message: 'Internal error : ' + err });
            }
            res.status(200).send({ success: true, message: 'Supervisor details added successfully' });
        });
    }).catch((err) => {
        res.status(400).send({ success: false, message: 'Invalid Student Id Provided' });
    });
}

/*
 * This will get all the records or a specific under FormI1 model in the DB.
 * When the studentId is not present, this will find all the records.
 * We remove the _igid and __v attributes from the results since we don't really need them anyways.
 * 
 * @param studentId"
 *      student registration number of the student whose form we are looking for.
 *      leave this as an empty string if all the entries are needed.
 * 
 * @param req:
 *      req object provided by Express's router which contains everything related to the,
 *      API request.
 * 
 * @param res:
 *      res object provided by Express's router which we use to send the response back,
 *      to the caller.
 */
function getFormI1(studentId, req, res) {
    searchCondition = studentId ? { StudentId: studentId } : {};

    forms.formI1Model.find(searchCondition, { _id: 0, __v: 0 }, (err, data) => {
        if (data) {
            res.status(200).send({ success: true, data: studentId ? data[0] : data });
            // if we provide a student id, we expect just one entry. But since we run find(),
            // method, we will get an array even if it's just one record, therefore we respond,
            // with a non-array object if the function caller is expecting a single result by providing,
            // a student id.
        }
        else {
            res.status(400).send({ success: false, data: err });
        }
    });
}

/*
 * A supervisor may have more than one student under him/her,
 * thus we provide his/her email and get all the forms which contains that email,
 * as SupervisorEmail.
 * 
 * @param supervisorEmail:
 *      email of the supervisor.
 *
 * @param req:
 *      req object provided by Express's router which contains everything related to the,
 *      API request.
 * 
 * @param res:
 *      res object provided by Express's router which we use to send the response back,
 *      to the caller.
 */
function getAllFormI1UnderSupervisor(supervisorEmail, req, res) {
    forms.formI1Model.find({ SupervisorEmail: supervisorEmail}, { _id: 0, __v: 0}, (err, data) => {
        if (err) {
            res.status(400).send({ success: false, data: err });
        }
        else {
            res.status(200).send({ success: true, data: data });
        }
    })
}


function getStudentDetailsByStudentId(studentId) {
    return new Promise((resolve, reject) => {
        forms.formI1Model.find({ StudentId: studentId }, { _id: 0, __: 0 }, (err, result) => {
            if (err) {
                reject(err);
            } else {
                if (result.length === 0) {
                    reject('invalid student Id');
                } else {
                    resolve(result);
                }
            }
        });
    });
}


module.exports = router;

// for unit testing.
//module.exports = { getFormI1, saveFormI1StudentPersepective, saveFormI1SupervisorPerspective };
