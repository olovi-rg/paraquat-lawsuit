const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors');
const { parsePhoneNumber } = require("libphonenumber-js");
const { phone } = require('phone');

const axios = require('axios')

const countryCode = '+1'

const allowedOrigins = ['http://localhost:5500', 'http://127.0.0.1:5500/', 'http://192.168.0.107:5500', 'https://publicjusticeadvocates.com', 'https://www.publicjusticeadvocates.com'];

app.use(cors({
    origin: function (origin, callback) {
        // Check if the request origin is included in the allowedOrigins array
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,POST',
    credentials: true,
    optionsSuccessStatus: 204,
}));


app.use(express.json())
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require('twilio')(accountSid, authToken);

const sid = 'VA093d2a8a0366db89f97301894f4e20a1'

app.post('/send-otp', async (req, res) => {
    const number = countryCode + req.body.number

    if (isUSPhoneNumber(number)) {

        try {
            await client.verify.v2.services(sid)
                .verifications
                .create({ to: number, channel: 'sms' })
                .then(() => {
                    res.status(200).send({ 'message': 'OTP SENT' })
                    console.log({
                        'message': 'OTP SENT'
                    })
                });
        } catch (e) {
            console.log(e.code)
            res.status(400).send({ 'message': e.code })
        }
    } else {
        res.status(200).send({ 'message': 'Please Enter A Valid U.S.A. Number' })
    }

})

app.post('/verify-otp', async (req, res) => {
    const otp = req.body.otp;
    const number = countryCode + req.body.number
    const formData = req.body.formData
    console.log('formData :', formData);



    if (isUSPhoneNumber(number)) {

        try {
            await client.verify.v2.services(sid)
                .verificationChecks
                .create({ to: number, code: otp })
                .then(async verification_check => {
                    console.log(verification_check.status)
                    if (verification_check.status == 'approved') {
                        await submitHBFormNoOTP(formData)  //no otp has different form but the same functionality
                    }
                    res.send({ 'message': verification_check.status })
                })
        } catch (e) {
            console.log(e)
            if (parseInt(e.code) == parseInt(20404)) {
                res.send({ 'message': 'Request for an OTP by clicking on Send OTP' })
            } else {
                res.send({ 'message': 'Error Occured, Please Refresh & Try Again' })
            }

        }
    } else {
        res.status(200).send({ 'message': 'Please Enter A Valid U.S.A. Number' })
    }
})

app.post('/verify-otp-nec-otp', async (req, res) => {
    const otp = req.body.otp;
    const number = countryCode + req.body.number
    const formData = req.body.formData
    console.log('formData :', formData);

    if (isUSPhoneNumber(number)) {

        try {
            await client.verify.v2.services(sid)
                .verificationChecks
                .create({ to: number, code: otp })
                .then(async verification_check => {
                    console.log(verification_check.status)
                    if (verification_check.status == 'approved') {
                        await submitNECBabyLawsuitOTP(formData)  //no otp has different form but the same functionality
                    }
                    res.send({ 'message': verification_check.status })
                })
        } catch (e) {
            console.log(e)
            if (parseInt(e.code) == parseInt(20404)) {
                res.send({ 'message': 'Request for an OTP by clicking on Send OTP' })
            } else {
                res.send({ 'message': 'Error Occured, Please Refresh & Try Again' })
            }
        }

    } else {
        res.status(200).send({ 'message': 'Please Enter A Valid U.S.A. Number' })
    }
})

app.post('/verify-otp-roundup-new', async (req, res) => {
    const otp = req.body.otp;
    const number = countryCode + req.body.number
    const formData = req.body.formData
    console.log('formData :', formData);

    if (isUSPhoneNumber(number)) {

        try {
            await client.verify.v2.services(sid)
                .verificationChecks
                .create({ to: number, code: otp })
                .then(async verification_check => {
                    console.log(verification_check.status)
                    if (verification_check.status == 'approved') {
                        await submitRoundupNewOTP(formData)  //no otp has different form but the same functionality
                    }
                    res.send({ 'message': verification_check.status })
                })
        } catch (e) {
            console.log(e)
            if (parseInt(e.code) == parseInt(20404)) {
                res.send({ 'message': 'Request for an OTP by clicking on Send OTP' })
            } else {
                res.send({ 'message': 'Error Occured, Please Refresh & Try Again' })
            }
        }

    } else {
        res.status(200).send({ 'message': 'Please Enter A Valid U.S.A. Number' })
    }
})

app.post('/check-if-us-and-submit', async (req, res) => {
    const number = countryCode + req.body.number
    const formData = req.body.formData
    const otp = req.body.otp


    if (isUSPhoneNumber(number)) {

        if (!validateFormData(formData.fields)) {
            res.status(400).send({ 'message': 'Error Submitting Form' })
        }

        try {
            let formUploaded;
            if (otp == undefined || otp == null || otp == '')
                formUploaded = await submitHBFormNoOTP(formData) //submit form to hubspot
            else
                formUploaded = await submitHBFormOTP(formData) //submit form to hubspot


            if (!formUploaded) //if form upload failed
                res.status(400).send({ 'message': 'Form Submission Failed, Please Retry' })
        } catch (e) {
            //if form upload failed
            res.status(400).send({ 'message': 'Form Submission Failed, Please Retry' })
        }
        res.status(200).send({ 'message': 'OK' })
    } else {
        res.status(400).send({ 'message': 'Please Enter a Valid USA Number' })
    }
})



app.post('/check-if-us-and-submit-paraquat', async (req, res) => {
    const number = countryCode + req.body.number
    const formData = req.body.formData
    const otp = req.body.otp


    if (isUSPhoneNumber(number)) {

        if (!validateFormData(formData.fields)) {
            res.status(400).send({ 'message': 'Error Submitting Form' })
        }

        try {

            const formUploaded = await submitHBFormParaquat(formData) //submit form to hubspot

            if (!formUploaded) //if form upload failed
                res.status(400).send({ 'message': 'Form Submission Failed, Please Retry' })
        } catch (e) {
            //if form upload failed
            res.status(400).send({ 'message': 'Form Submission Failed, Please Retry' })
        }
        res.status(200).send({ 'message': 'OK' })
    } else {
        res.status(400).send({ 'message': 'Please Enter a Valid USA Number' })
    }
})

app.post('/submit-roundup-new-no-otp', async (req, res) => {
    const number = countryCode + req.body.number;
    const formData = req.body.formData;
    const otp = req.body.otp;

    if (isUSPhoneNumber(number)) {

        if (!validateFormData(formData.fields)) {
            return res.status(400).send({ 'message': 'Error Submitting Form' });
        }

        try {
            const formUploaded = await submitRoundupNewNoOTP(formData); //submit form to hubspot

            if (!formUploaded) { //if form upload failed
                return res.status(400).send({ 'message': 'Form Submission Failed, Please Retry' });
            }
            return res.status(200).send({ 'message': 'OK' });
        } catch (e) {
            //if form upload failed
            return res.status(400).send({ 'message': 'Form Submission Failed, Please Retry' });
        }
    } else {
        return res.status(400).send({ 'message': 'Please Enter a Valid USA Number' });
    }
});



app.post('/submit-nec-baby-lawsuit', async (req, res) => {
    const number = countryCode + req.body.number
    const formData = req.body.formData
    // const otp = req.body.otp


    if (isUSPhoneNumber(number)) {

        if (!validateFormData(formData.fields)) {
            res.status(400).send({ 'message': 'Error Submitting Form' })
        }
        let formUploaded;

        try {
            // if (otp == undefined || otp == null || otp == '')
            //     formUploaded = await submitHBFormNoOTP(formData) //submit form to hubspot
            // else
            formUploaded = await submitNECBabyLawsuit(formData) //submit form to hubspot



        } catch (e) {
            //if form upload failed
            res.status(400).send({ 'message': 'Form Submission Failed, Please Retry' })
        }
        if (!formUploaded) //if form upload failed
            res.status(400).send({ 'message': 'Form Submission Failed, Please Retry' })
        else
            res.status(200).send({ 'message': 'OK' })

    } else {
        res.status(400).send({ 'message': 'Please Enter a Valid USA Number' })
    }
})

app.post('/new-test-submission', async (req, res) => {
    const number = countryCode + req.body.number
    const formData = req.body.formData
    // const otp = req.body.otp


    if (isUSPhoneNumber(number)) {

        if (!validateFormData(formData.fields)) {
            res.status(400).send({ 'message': 'Error Submitting Form' })
        }
        let formUploaded;

        try {
            // if (otp == undefined || otp == null || otp == '')
            //     formUploaded = await submitHBFormNoOTP(formData) //submit form to hubspot
            // else
            formUploaded = await newTestSubmission(formData) //submit form to hubspot

        } catch (e) {
            //if form upload failed
            res.status(400).send({ 'message': 'Form Submission Failed, Please Retry' })
        }
        if (!formUploaded) //if form upload failed
            res.status(400).send({ 'message': 'Form Submission Failed, Please Retry' })
        else
            res.status(200).send({ 'message': 'OK' })

    } else {
        res.status(400).send({ 'message': 'Please Enter a Valid USA Number' })
    }
})


function validateFormData(fields) {
    // Validation function for firstname (alphabets and numbers only)
    function validateFirstName(value) {
        return /^[a-zA-Z0-9\s]*$/.test(value);
    }

    // Validation function for email format
    function validateEmail(value) {
        return /\S+@\S+\.\S+/.test(value);
    }

    // Validation function for phone number (10 digits)
    function validatePhone(value) {
        return /^\d{10}$/.test(value);
    }

    // Validation function for yes/no fields
    function validateYesNo(value) {
        return ['yes', 'no'].includes(value.toLowerCase());
    }

    // Validation function for consent_d2 (accepted)
    function validateConsent(value) {
        return value.trim().toLowerCase() === 'accepted';
    }

    // Iterate through the fields and apply validation functions
    for (let field of fields) {
        const { name, value } = field;

        switch (name) {
            case 'firstname':
                if (!validateFirstName(value)) return false;
                break;
            case 'email':
                if (!validateEmail(value)) return false;
                break;
            case 'phone':
                if (!validatePhone(value)) return false;
                break;
            case 'exposed_to_roundup_d2':
            case 'diagnosed_with_non_hodgkins_lymphoma':
                if (!validateYesNo(value)) return false;
                break;
            case 'consent_d2':
                if (!validateConsent(value)) return false;
                break;
            default:
                // Handle other fields if needed
                break;
        }
    }

    return true; // All fields are valid
}


async function postData(url, data) {
    console.log('url, data :', url, data);
    // Default options are marked with *
    let response;
    try {

        response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
    } catch (e) {
        console.log(e, response)
    }

    return response.json() // parses JSON response into native JS objects
}


function submitHSForm(hsFormURL, data) {
    // console.log('hsFormURL, data :', hsFormURL, data);
    return new Promise((resolve, reject) => {
        postData(hsFormURL, data)
            .then(data => {
                console.log('data submit baby nec form ', data)
                console.log('Form Submitted');
                resolve(true);
            })
            .catch((e) => {
                console.error(e);

                reject(false);
            });
    });
}


async function submitHBFormNoOTP(formData) {

    var baseSubmitURL = 'https://api.hsforms.com/submissions/v3/integration/submit'
    // Add the HubSpot portalID where the form should submit
    var portalId = '42660938'
    // Add the HubSpot form GUID from your HubSpot portal
    var formGuid = '3e7885b0-a0df-4a52-9144-fe05d07cdb38' //replace with the formGUID copied from the form created inside HubSpot Forms
    var submitURL = `${baseSubmitURL}/${portalId}/${formGuid}`
    try {
        const submitted = await submitHSForm(submitURL, formData);
        console.log('Form submitted successfully', submitted);
        return submitted
        // Handle success
    } catch (error) {
        console.error(error);
        return false
        // Handle failure
    }
}


async function submitHBFormOTP(formData) {

    var baseSubmitURL = 'https://api.hsforms.com/submissions/v3/integration/submit'
    // Add the HubSpot portalID where the form should submit
    var portalId = '42660938'
    // Add the HubSpot form GUID from your HubSpot portal
    var formGuid = 'fb6308cb-097d-4ffe-b815-eb3718117ea9' //replace with the formGUID copied from the form created inside HubSpot Forms
    var submitURL = `${baseSubmitURL}/${portalId}/${formGuid}`
    try {
        const submitted = await submitHSForm(submitURL, formData);
        console.log('submitURL, formData :', submitURL, formData);
        console.log('Form submitted successfully', submitted);
        return submitted
        // Handle success
    } catch (error) {
        console.error(error);
        return false
        // Handle failure
    }
}

async function submitHBFormParaquat(formData) {

    var baseSubmitURL = 'https://api.hsforms.com/submissions/v3/integration/submit'
    // Add the HubSpot portalID where the form should submit
    var portalId = '42660938'
    // Add the HubSpot form GUID from your HubSpot portal
    var formGuid = '869530b3-d9e2-4b78-b397-2762e61cd7aa' //replace with the formGUID copied from the form created inside HubSpot Forms
    var submitURL = `${baseSubmitURL}/${portalId}/${formGuid}`
    try {
        const submitted = await submitHSForm(submitURL, formData);
        console.log('submitURL, formData :', submitURL, formData);
        console.log('Form submitted successfully', submitted);
        return submitted
        // Handle success
    } catch (error) {
        console.error(error);
        return false
        // Handle failure
    }
}

async function submitNECBabyLawsuit(formData) {

    var baseSubmitURL = 'https://api.hsforms.com/submissions/v3/integration/submit'
    // Add the HubSpot portalID where the form should submit
    var portalId = '42660938'
    // Add the HubSpot form GUID from your HubSpot portal
    var formGuid = '4e54b4ad-9373-4e60-9aa0-8b9851b4cc96' //replace with the formGUID copied from the form created inside HubSpot Forms
    var submitURL = `${baseSubmitURL}/${portalId}/${formGuid}`
    try {
        const submitted = await submitHSForm(submitURL, formData);
        console.log('submitURL, formData :', submitURL, formData);
        console.log('Form submitted successfully', submitted);
        return submitted
        // Handle success
    } catch (error) {
        console.error(error);
        return false
        // Handle failure
    }
}


async function newTestSubmission(formData) {

    var baseSubmitURL = 'https://api.hsforms.com/submissions/v3/integration/submit'
    // Add the HubSpot portalID where the form should submit
    var portalId = '42660938'
    // Add the HubSpot form GUID from your HubSpot portal
    var formGuid = 'b4b147b1-e1a5-4a40-a477-63882389d71c' //replace with the formGUID copied from the form created inside HubSpot Forms
    var submitURL = `${baseSubmitURL}/${portalId}/${formGuid}`
    try {
        const submitted = await submitHSForm(submitURL, formData);
        console.log('submitURL, formData :', submitURL, formData);
        console.log('Form submitted successfully', submitted);
        return submitted
        // Handle success
    } catch (error) {
        console.error(error);
        return false
        // Handle failure
    }
}

async function submitNECBabyLawsuitOTP(formData) {

    var baseSubmitURL = 'https://api.hsforms.com/submissions/v3/integration/submit'
    // Add the HubSpot portalID where the form should submit
    var portalId = '42660938'
    // Add the HubSpot form GUID from your HubSpot portal
    var formGuid = 'ae407a32-0755-4d74-ae41-90c3710f3ac6' //replace with the formGUID copied from the form created inside HubSpot Forms
    var submitURL = `${baseSubmitURL}/${portalId}/${formGuid}`
    try {
        const submitted = await submitHSForm(submitURL, formData);
        console.log('submitURL, formData :', submitURL, formData);
        console.log('Form submitted successfully', submitted);
        return submitted
        // Handle success
    } catch (error) {
        console.error(error);
        return false
        // Handle failure
    }
}

async function submitRoundupNewOTP(formData) {

    var baseSubmitURL = 'https://api.hsforms.com/submissions/v3/integration/submit'
    // Add the HubSpot portalID where the form should submit
    var portalId = '42660938'
    // Add the HubSpot form GUID from your HubSpot portal
    var formGuid = '59832ae6-72d7-49ea-9a5f-99c001d1bc1a' //replace with the formGUID copied from the form created inside HubSpot Forms
    var submitURL = `${baseSubmitURL}/${portalId}/${formGuid}`
    try {
        const submitted = await submitHSForm(submitURL, formData);
        console.log('submitURL, formData :', submitURL, formData);
        console.log('Form submitted successfully', submitted);
        return submitted
        // Handle success
    } catch (error) {
        console.error(error);
        return false
        // Handle failure
    }
}

async function submitRoundupNewNoOTP(formData) {

    var baseSubmitURL = 'https://api.hsforms.com/submissions/v3/integration/submit'
    // Add the HubSpot portalID where the form should submit
    var portalId = '42660938'
    // Add the HubSpot form GUID from your HubSpot portal
    var formGuid = '59832ae6-72d7-49ea-9a5f-99c001d1bc1a' //replace with the formGUID copied from the form created inside HubSpot Forms
    var submitURL = `${baseSubmitURL}/${portalId}/${formGuid}`
    try {
        const submitted = await submitHSForm(submitURL, formData);
        console.log('submitURL, formData :', submitURL, formData);
        console.log('Form submitted successfully', submitted);
        return submitted
        // Handle success
    } catch (error) {
        console.error(error);
        return false
        // Handle failure
    }
}
function isUSPhoneNumber(phoneNumberToVerify) {

    let phoneNumber = phoneNumberToVerify.replace(/-/g, '');

    const res = phone(phoneNumber, { country: 'USA' })
    console.log(phoneNumber)
    return res.isValid

}


app.get('/', (req, res) => {
    res.send('Illegal Access')
})

app.listen(process.env.PORT || 6969, () => {
    console.log('Listening')
})