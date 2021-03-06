const {Router} = require('express')
const auth = require('../middleware/auth.middleware')
const router = Router()
const db = require('../db.config.js');
const User = db.user;
const Toor = db.toor;
const Log = db.log;
const { Op } = require("sequelize");
const moment = require('moment')
const fetch = require('node-fetch');
const crypto = require('crypto');
const qs = require('qs');

// const apiKey = 'cbE3LfNhBlv4C1tSuH2ZNMDu';
// const apiSecret = '-fkPgTfQK__WBRW09hTQzTBqZTNnglTtxT84zqjru8c9IQl2';

async function makeRequest(apiKey, apiSecret, verb, endpoint, data = {}) {
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

        throw ({
            message: obj.error.message,
            code: response.status
        })
    }

    return obj
}


router.post('/create', async (req, res) => {
    try {


        let userBit

        const { isAdmin, toorid, ...user} = req.body

        const toor = await Toor.findByPk(toorid)

        try {

            userBit = await makeRequest(user.apikey, user.apisecret, 'GET', '/user',
                {}
            );


        } catch (e) {


            return res.status(400).json({message: 'Ошибка получения данных c BitMex'})
        }



        const repit = await User.findAll({
            where: {
                [Op.and]: [{ toorId: toorid}, {idbitmex: userBit.id}]
            },
            raw: true
        })

        if(repit.length){
            return res.status(400).json({message: `Пользователь уже существует в этом турнире`})
        }

        if(!isAdmin){
            if(toor.status==="Активный" || toor.status==="Завершен" ){
                return res.status(400).json({message: `Регистрация невозможна! турнир уже начался или завершен`})
            }
        }




        toor.createUser({...user, starttoor: toor.start, idbitmex: userBit.id})

        res.status(201).json({message: 'Зарегистрирован'})

    } catch (e) {
        console.log(e)
        res.status(500).json({message: 'Что то пошло не так попробуйте снова'})
    }


})

router.get('/', async (req, res) => {
    try {

        const users = await User.findAll({
            order: [['balance', 'DESC'] ],
            raw: true
        })
        res.json(users)

    } catch (e) {
        console.log(e)
        res.status(500).json({message: 'Что то пошло не так попробуйте снова'})
    }
})

// router.get('/admin', auth, async (req, res) => {
//     try {
//
//
//         const users = await User.findAll({raw: true})
//
//         res.json(users)
//
//     } catch (e) {
//         console.log(e)
//         res.status(500).json({message: 'Что то пошло не так попробуйте снова'})
//     }
// })


router.get('/:id', auth, async (req, res) => {
    try {


        const id = req.params.id

        const user = await User.findByPk(id)


                try {
                    // const wallet = await makeRequest(user.apikey, user.apisecret, 'GET', '/user/wallet',
                    //     {currency: "XBt"}
                    // );
                    //
                    //
                    // // количество api
                    // const api = await makeRequest(user.apikey, user.apisecret, 'GET', '/apiKey',
                    //     {}
                    // );
                    //
                    //
                    // // в сделке
                    // const positionBit = await makeRequest(user.apikey, user.apisecret, 'GET', '/position',
                    //     {reverse: true}
                    // );
                    //
                    //
                    // ///  трейды  выводить по дате
                    // const order = await makeRequest(user.apikey, user.apisecret, 'GET', '/order',
                    //     {reverse: true, startTime: new Date(user.starttoor)}
                    // );

                    let wallet = ''
                    let api = ''
                    let positionBit = []
                    let order = ''


                    const arr = [
                        // await makeRequest(user.apikey, user.apisecret, 'GET', '/user/wallet',
                        //     {currency: "XBt"}
                        // ),
                        await makeRequest(user.apikey, user.apisecret, 'GET', '/user/wallet',
                            {currency: "XBt"}
                        ),
                        await makeRequest(user.apikey, user.apisecret, 'GET', '/apiKey',
                            {}
                        ),
                        await makeRequest(user.apikey, user.apisecret, 'GET', '/position',
                            {reverse: true}
                        ),
                        await makeRequest(user.apikey, user.apisecret, 'GET', '/order',
                            {reverse: true, startTime: new Date(user.starttoor)}
                        ),


                    ]



                   await Promise.all(arr)
                        .then(([response1, response2, response3, response4  ]) => {

                            wallet=response1
                            console.log(wallet)
                            api=response2
                            positionBit=response3
                            order=response4


                        })
                        .catch(error => {
                            console.log('Ошибка получения данных')
                           throw error
                        })





                    user.balance = wallet.amount
                    user.trade = order.length
                    user.transaction = String(positionBit.filter(item=>  item.avgEntryPrice!==null && item.liquidationPrice!==null ).map(item => `${item.symbol}: ${item.currentQty.toFixed(2)}/${item.avgEntryPrice.toFixed(2)}/${item.liquidationPrice.toFixed(2)}/${item.unrealisedPnl.toFixed(2)}/${item.markPrice.toFixed(2)}`)  || '')
                    user.api = api.length
                    user.comment = `Обновлен# ${new Date}`

                    await User.update({
                       // deposit: amount,
                        balance:  user.balance,
                        trade:  user.trade,
                        transaction: user.transaction,
                        api: user.api,
                        comment: `Обновлен:`

                    }, {
                        where: {
                            id: user.id
                        }
                    })

                } catch (e) {
                    if (e.code === 403) {
                        user.balance = "H/В"
                        user.trade = "-"
                        user.transaction = ''
                    }

                    console.log(e)

                    return  res.status(500).json({message: 'Не могу получить свежие данные'})


                }


        res.json(user)

    } catch (e) {
        console.log(e)
        res.status(500).json({message: 'Что то пошло не так попробуйте снова'})
    }
})




router.delete('/:id', auth, async (req, res) => {
    try {


        await User.destroy({
            where:
                {
                    id: req.params.id
                },

        })

        res.status(201).json({message: 'Пользователь удален'})


    } catch (e) {
        res.status(500).json({message: 'Что то пошло не так попробуйте снова'})
    }

})
router.put('/:id', auth, async (req, res) => {
    try {


        let comment = req.body.text

        await User.update({status: "Исключен", comment}, {
            where:
                {
                    id: req.params.id
                },

        })

        res.status(201).json({message: 'Пользователь исключен'})


    } catch (e) {
        res.status(500).json({message: 'Что то пошло не так попробуйте снова'})
    }

})
router.put('/active/:id', auth, async (req, res) => {
    try {


        let comment = req.body.text

        await User.update({status: "Активный", comment}, {
            where:
                {
                    id: req.params.id
                },

        })

        res.status(201).json({message: 'Пользователь активирован'})


    } catch (e) {
        res.status(500).json({message: 'Что то пошло не так попробуйте снова'})
    }

})
router.get('/log/get', auth, async (req, res) => {
    try {


      const logs= await Log.findAll({
          order: [['createdAt', 'DESC'] ],
          raw: true
      })

        res.status(201).json(logs)


    } catch (e) {
        res.status(500).json({message: 'Что то пошло не так попробуйте снова'})
    }

})
router.delete('/log/del', auth, async (req, res) => {
    try {

      await Log.destroy({
          where: {},
          truncate: true})

        res.status(201).json({message: 'Лог отчищен'})


    } catch (e) {
        res.status(500).json({message: 'Что то пошло не так попробуйте снова'})
    }

})




module.exports = router