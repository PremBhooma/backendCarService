const mongoose = require("mongoose")

const PaymentScheme = new mongoose.Schema({
    name: { type: String },
    serviceType: { type: String },
    price: { type: Number }
})

const PaymentModel = mongoose.model("payment", PaymentScheme)

module.exports = {
    PaymentModel
}