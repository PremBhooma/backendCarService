const express = require("express")
const cors = require("cors")
const Razorpay = require('razorpay');
var crypto = require("crypto")

const { connection } = require("./config/db")
const { PaymentModel } = require("./model/payment.model")

require("dotenv").config()

const app = express()
app.use(express.json())
app.use(cors({
    origin: "*"
}))

app.get("/", (req, res) => {
    res.send("HomeRoute")
})

app.get("/getDetails", async (req, res) => {
    const paymentDetails = await PaymentModel.find()
    res.send({ paymentDetails })
})

app.post("/postDetails", async (req, res) => {
    let { name, serviceType, price } = req.body
    const new_payment = new PaymentModel({
        name,
        serviceType,
        price
    })
    try {
        await new_payment.save()
        res.send({ msg: "Service Details Successfull" })
    } catch (error) {
        console.log(error)
        res.status(500).send({ msg: "Service Details Failed" })
    }
})


app.post("/orders", (req, res) => {
    var instance = new Razorpay({ key_id: process.env.KEY_ID, key_secret: process.env.KEY_SECRET })

    var options = {
        amount: req.body.amount * 100,  // amount in the smallest currency unit
        currency: "INR",
    };

    instance.orders.create(options, function (err, order) {
        if (err) {
            return res.send({ code: 500, mes: "Server Err" })
        }
        return res.send({ code: 200, mes: "order created", data: order })
    });
})

app.post("/verify", (req, res) => {
    let body = req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;

    var expectedSignature = crypto.createHmac('sha256', process.env.KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === req.body.response.razorpay_signature) {
        res.send({ code: 200, mes: "Sign Valid" })
    } else {
        res.send({ code: 500, mes: "Sign Invalid" })

    }
})


const PORT = process.env.PORT || 8060

app.listen(PORT, async () => {
    try {
        await connection
        console.log("DB Success to Connected")
    } catch (err) {
        console.log("DB Failed to Connect")
        console.log(err)
    }
    console.log("Listening on 8060 Port")
})