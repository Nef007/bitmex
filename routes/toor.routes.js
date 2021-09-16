const {Router} = require('express')
const config = require('config')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = Router()

const db = require('../config/db.config.js');
const Toor = db.toor;
const User = db.user;
const fetch = require('node-fetch');
const crypto = require('crypto');
const qs = require('qs');

const auth = require('../middleware/auth.middleware')

async function  makeRequest(apiKey, apiSecret, verb, endpoint, data = {})  {
    const apiRoot = '/api/v1/';

    const expires = Math.round(new Date().getTime() / 1000) + 60; // 1 min in the future

    let query = '', postBody = '';
    if (verb === 'GET')
        query = '?' + qs.stringify(data);
    else
        // Pre-compute the reqBody so we can be sure that we're using *exactly* the same body in the request
        // and in the signature. If you don't do this, you might get differently-sorted keys and blow the signature.
        postBody = JSON.stringify(data);

    const signature = crypto.createHmac('sha256', apiSecret)
        .update(verb + apiRoot + endpoint + query + expires + postBody).digest('hex');

    const headers = {
        'content-type': 'application/json',
        'accept': 'application/json',
        // This example uses the 'expires' scheme. You can also use the 'nonce' scheme. See
        // https://www.bitmex.com/app/apiKeysUsage for more details.
        'api-expires': expires,
        'api-key': apiKey,
        'api-signature': signature,
    };

    const requestOptions = {
        method: verb,
        headers,
    };
    if (verb !== 'GET') requestOptions.body = postBody;  // GET/HEAD requests can't have body

    const url = 'https://www.bitmex.com' + apiRoot + endpoint + query;

    const response = await fetch(url, requestOptions)

    const obj = await response.json()

    if (!response.ok) {

        throw ({ message: obj.error.message,
            code: response.status})
    }

    return obj
}

router.post('/create', auth, async (reg, res) => {
        try {


            const {name, balance, ...date} = reg.body
             let status


            const candidate = await Toor.findOne({
                where:
                    {
                        name
                    },
                raw: true
            })
            if (candidate) {
                res.status(400).json({message: 'Такой турнир уже существует'})
            }

            if(new Date(date.date[0])<new Date() &&  new Date(date.date[1])> new Date() ){
                status="Активный"
            } else if (new Date(date.date[0])> new Date()) {
                status="Ожидание"
            }else status="Завершен"

            await Toor.create({
                name, balance, start: date.date[0], end: date.date[1], status
            })


            res.status(201).json({message: 'Турнир создан'})

        } catch (e) {
            console.log(e)
            res.status(500).json({message: 'Что то пошло не так попробуйте снова'})
        }

    })

router.get('/',  async (reg, res) => {
        try {

            const toors = await Toor.findAll({
              raw: true
            })

            res.json(toors)
        } catch (e) {
            console.log(e)
            res.status(500).json({message: 'Что то пошло не так попробуйте снова'})
        }

    })

router.delete('/:id', auth, async (req, res) => {
        try {

            const id = req.params.id

           await Toor.destroy({
             where:{
                 id
             }
            })



            res.status(201).json({message: 'Турнир удален'})
        } catch (e) {
            console.log(e)
            res.status(500).json({message: 'Что то пошло не так попробуйте снова'})
        }

    })


module.exports = router