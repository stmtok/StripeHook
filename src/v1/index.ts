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

const pool = mysql.createPool({
    connectionLimit: 5,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'stripe'
})

async function getSqlConnection(): Promise<mysql.PoolConnection> {
    return new Promise((resolve, reject) => {
        pool.getConnection((error, connection) => {
            if (error) reject(error)
            resolve(connection)
        })
    })
}

v1.get('/', (req, res, next) => {
    debugServer(req.url)
    res.send({ version: "1", pk: stripePublic })
})

v1.post('/webhook', raw({ type: 'application/json' }), async (req, res, next) => {
    debugServer(JSON.stringify(req.body))
    const sig = req.headers['stripe-signature'] || ""
    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, stripeEPSecret)
    } catch (err: any) {
        res.status(400).send(err.message)
        return
    }
    const sql = await getSqlConnection()
    sql.query('INSERT INTO events SET ?', { data: JSON.stringify(event) }, (error, response) => {
        if (error) {
            debugDB(error.message)
        } else {
            debugDB(JSON.stringify(response))
        }
    })
    sql.commit()
    sql.release()
    res.send({ code: "ok" })
})

export default v1