import express, { raw } from 'express'
import debug from 'debug'
import mysql from 'mysql'
import Stripe from 'stripe'
const debugServer = debug('server')
const debugDB = debug('db')
const v1 = express()
const stripePublic = process.env.STRIPE_PUBLIC || "mock"
const stripeSecret = process.env.STRIPE_SECRET || "mock"
const stripeEPSecret = process.env.STRIPE_ENDPOINT_SECRET || 'mock'
const stripe = new Stripe(stripeSecret, { apiVersion: '2020-08-27' })

const sql = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'stripe'
})

sql.connect((err) => {
    if (err) {
        debugDB(err.message)
    } else {
        debugDB('connection ok')
    }
})

v1.get('/', (req, res, next) => {
    debugServer(req.url)
    res.send({ version: "1", pk: stripePublic})
})

v1.post('/webhook', raw({ type: 'application/json' }), (req, res, next) => {
    debugServer(JSON.stringify(req.body))
    const sig = req.headers['stripe-signature'] || ""
    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, stripeEPSecret)
    } catch (err: any) {
        res.status(400).send(err.message)
        return
    }

    sql.query('INSERT INTO events SET ?', { data: JSON.stringify(event) }, (error, response) => {
        if (error) {
            debugDB(error.message)
        } else {
            debugDB(JSON.stringify(response))
        }
    })

    res.send({ code: "ok" })
})

export default v1