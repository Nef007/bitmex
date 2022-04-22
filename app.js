const express = require('express')
const path = require('path')
const db = require('./db.config');
const dotenv = require("dotenv").config();
const Toor = db.toor;
const User = db.user;
const Log = db.log;
const Admin = db.admin;



const fetch = require('node-fetch');
const crypto = require('crypto');
const qs = require('qs');


const app = express()
app.use(express.json({extended: true}))
db.sequelize.sync({force: false}).then(() => {
    console.log('Drop and Resync with { force: false }');
});


app.use('/auth', require('./routes/auth.routes'))
app.use('/api/user', require('./routes/user.routes'))
app.use('/api/toor', require('./routes/toor.routes'))


app.use('/', express.static(path.join(__dirname, 'client', 'build')))

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
})

const PORT = process.env.PORT || 5000

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

async function logger(str){

    let text = String(str)

    await Log.create({text})
}

async function start() {

    try {

        app.listen(PORT, () => console.log(`app has been started on port ${PORT}...`))






        setInterval(async ()=>{

            await Log.destroy({
                where: {},
                truncate: true})

        },  1209600000)



        setInterval(async () => {
            const toors = await Toor.findAll({
                raw: true
            })



            for (let toor of toors) {

                // начало тура
                if (new Date(toor.start) <= new Date() && toor.status === "Ожидание") {


                    // активировали тур

                    await logger(`Start active turnament ${toor.id}`)
                    await Toor.update({status: 'Активный'}, {
                        where: {
                            id: toor.id
                        }
                    })
                    // проверка пользователей
                    const users = await User.findAll({
                        where: {
                            toorId: toor.id
                        }
                    })

                    for (let user of users) {

                        if (user.status === "Активный") {
                            try {

                                //
                                // const walletSum = await makeRequest(user.apikey, user.apisecret, 'GET', '/user/walletSummary',
                                //     {currency: "XBt"}
                                // );
                                //
                                // const wallet = await makeRequest(user.apikey, user.apisecret, 'GET', '/user/wallet',
                                //     {currency: "XBt"}
                                // );
                                // const order = await makeRequest(user.apikey, user.apisecret, 'GET', '/order',
                                //     {reverse: true, startTime: new Date(toor.start)}
                                // );
                                // const apibit = await makeRequest(user.apikey, user.apisecret, 'GET', '/apiKey',
                                //     {}
                                // );
                                // // в сделке
                                // const positionBit = await makeRequest(user.apikey, user.apisecret, 'GET', '/position',
                                //     {reverse: true}
                                // );



                                let wallet = ''
                                let apibit = ''
                                let positionBit = []
                                let order = ''
                                let walletSum = ''


                                const arr = [
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
                                    await makeRequest(user.apikey, user.apisecret, 'GET', '/user/walletSummary',
                                        {currency: "XBt"}
                                    )


                                ]



                                await Promise.all(arr)
                                    .then(([response1, response2, response3, response4, response5  ]) => {

                                        wallet=response1
                                        apibit=response2
                                        positionBit=response3
                                        order=response4
                                        walletSum=response5


                                    })
                                    .catch(error => {
                                        console.log('Ошибка получения данных')
                                        throw error
                                    })


                                const {amount} = walletSum.filter(item => item.transactType === "Deposit")[0] || -1



                                let transaction = String(positionBit.filter(item=> item.avgEntryPrice && item.liquidationPrice  ).map(item => `${item.symbol}: ${item.currentQty}/${item.avgEntryPrice}/${item.liquidationPrice}/${item.unrealisedPnl}/${item.markPrice}`)  || '')
                                let balance = parseInt(wallet.amount / 10000) / 10000
                                let trade = order.length
                                let api = apibit.length



                                await User.update({
                                    deposit: amount,
                                    balance,
                                    trade,
                                    transaction,
                                    api,
                                    comment: `Обновлен:`

                                }, {
                                    where: {
                                        id: user.id
                                    }
                                })

                                // }


                            } catch (e) {
                                if (e.code === 429) {
                                    // console.log("Превышен интервал запросов, тур начнется позже")
                                    // await Toor.update({ status: 'Ожидание'}, {
                                    //     where:{
                                    //         id: toor.id
                                    //     }
                                    // })

                                    await User.update({status: 'Исключен', comment: "Превышен интервал запросов 429"}, {
                                        where: {
                                            id: user.id
                                        }
                                    })


                                } else if (e.code === 403) {
                                    await User.update({status: 'Исключен', comment: "Ошибка доступа 403"}, {
                                        where: {
                                            id: user.id
                                        }
                                    })

                                } else {
                                    await User.update({status: 'Исключен', comment: "Ошибка получения данных"}, {
                                        where: {
                                            id: user.id
                                        }
                                    })

                                }

                                //   console.log(e)


                                await logger(e.code || "Ошибка получения данных")

                            }

                        }

                    }


                    await logger(`Finish active turnament ${toor.id}`)

                }  // конец активации тура
                //  проверка во время тура

                // конец тура
                if (new Date(toor.end) <= new Date() && toor.status === "Активный") {
                    await logger(`Close turnament ${toor.id}`)
                    // закрыли тур тур
                    await Toor.update({status: 'Завершен'}, {
                        where: {
                            id: toor.id
                        }
                    })
                    // закрыть пользователей
                    const users = await User.findAll({
                        where: {
                            toorId: toor.id
                        }
                    })


                    for (let user of users) {

                        if (user.status === "Активный") {
                            try {


                                // const wallet = await makeRequest(user.apikey, user.apisecret, 'GET', '/user/wallet',
                                //     {currency: "XBt"}
                                // );
                                // const order = await makeRequest(user.apikey, user.apisecret, 'GET', '/order',
                                //     {reverse: true, startTime: new Date(toor.start)}
                                // );
                                // const api = await makeRequest(user.apikey, user.apisecret, 'GET', '/apiKey',
                                //     {}
                                // );






                                let wallet = ''
                                let api = ''
                                let order = ''


                                const arr = [
                                    await makeRequest(user.apikey, user.apisecret, 'GET', '/user/wallet',
                                        {currency: "XBt"}
                                    ),
                                    await makeRequest(user.apikey, user.apisecret, 'GET', '/apiKey',
                                        {}
                                    ),
                                    await makeRequest(user.apikey, user.apisecret, 'GET', '/order',
                                        {reverse: true, startTime: new Date(user.starttoor)}
                                    ),


                                ]



                                await Promise.all(arr)
                                    .then(([response1, response2, response3 ]) => {

                                        wallet=response1
                                        api=response2
                                        order=response3


                                    })
                                    .catch(error => {
                                        console.log('Ошибка получения данных')
                                        throw error
                                    })



                                let balance = parseInt(wallet.amount / 10000) / 10000
                                let trade = order.length

                                //записывает баланс, трайды, апи
                                await User.update({
                                    status: 'Завершен',
                                    balance,
                                    trade,
                                    api: api.length,
                                    comment: "Данные сохранены"
                                }, {
                                    where: {
                                        id: user.id
                                    }
                                })


                            } catch (e) {
                                if (e.code === 429) {
                                    // console.log("Превышен интервал запросов, тур закроется позже")
                                    // await Toor.update({ status: 'Активный'}, {
                                    //     where:{
                                    //         id: toor.id
                                    //     }
                                    // })

                                    await User.update({status: 'Исключен', comment: "Превышен интервал запросов 429"}, {
                                        where: {
                                            id: user.id
                                        }
                                    })

                                } else if (e.code === 403) {
                                    await User.update({status: 'Завершен', comment: "Ошибка доступа"}, {
                                        where: {
                                            id: user.id
                                        }
                                    })

                                } else {
                                    await User.update({status: 'Завершен', comment: "Ошибка получения данных"}, {
                                        where: {
                                            id: user.id
                                        }
                                    })

                                }
                                await logger(e)

                            }

                        }


                    }



                    await logger(`Finish close turnament ${toor.id}`)

                }

            }


        },  10000)

///////////////////////////////////////



        async function checkUser(){

            await logger("Cheks turnament...")
            const toors = await Toor.findAll({
                raw: true
            })

            const time =  (await Admin.findOne({
                where: {
                    id: 1,
                }
            })).timeupdate || 60


            for (let toor of toors) {

                //  проверка во время тура
                if (toor.status === "Активный") {

                    await logger(`Cheks turnament id: ${toor.id}`)

                    const users = await User.findAll({
                        where: {
                            toorId: toor.id
                        }
                    })

                    for (let user of users) {

                        if (user.status === "Активный") {
                            try {
                                // const walletSum = await makeRequest(user.apikey, user.apisecret, 'GET', '/user/walletSummary',
                                //     {currency: "XBt"}
                                // );
                                //
                                // const wallet = await makeRequest(user.apikey, user.apisecret, 'GET', '/user/wallet',
                                //     {currency: "XBt"}
                                // );
                                // const order = await makeRequest(user.apikey, user.apisecret, 'GET', '/order',
                                //     {reverse: true, startTime: new Date(toor.start)}
                                // );
                                // const apibit = await makeRequest(user.apikey, user.apisecret, 'GET', '/apiKey',
                                //     {}
                                // );
                                // // в сделке
                                // const positionBit = await makeRequest(user.apikey, user.apisecret, 'GET', '/position',
                                //     {reverse: true}
                                // );
                                //


                                let wallet = ''
                                let apibit = ''
                                let positionBit = []
                                let order = ''
                                let walletSum = ''


                                const arr = [

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
                                    await makeRequest(user.apikey, user.apisecret, 'GET', '/user/walletSummary',
                                        {currency: "XBt"}
                                    )



                                ]



                                await Promise.all(arr)
                                    .then(([response1, response2, response3, response4, response5 ]) => {

                                        wallet=response1
                                        apibit=response2
                                        positionBit=response3
                                        order=response4
                                        walletSum=response5



                                    })
                                    .catch(error => {
                                        console.log('Ошибка получения данных')
                                        throw error
                                    })





                                const {amount} = walletSum.filter(item => item.transactType === "Deposit")[0] || -2


                                // проверка депозита
                                if (amount !== Number(user.deposit)) {
                                    await User.update({status: 'Исключен', comment: "Депозит отличается"}, {
                                        where: {
                                            id: user.id
                                        }
                                    })

                                }else {


                                    let transaction = String(positionBit.filter(item=> item.avgEntryPrice && item.liquidationPrice  ).map(item => `${item.symbol}: ${item.currentQty}/${item.avgEntryPrice}/${item.liquidationPrice}/${item.unrealisedPnl}/${item.markPrice}`)  || '')
                                    let balance = parseInt(wallet.amount / 10000) / 10000
                                    let trade = order.length
                                    let api = apibit.length


                                    //записывает баланс, трайды, апи
                                    await User.update({
                                        balance,
                                        trade,
                                        transaction,
                                        api,
                                        comment: `Обновлен:`
                                    }, {
                                        where: {
                                            id: user.id
                                        }
                                    })



                                }


                            } catch (e) {
                                if (e.code === 429) {

                                    await logger(e)
                                }
                                if (e.code === 403) {
                                    await User.update({
                                        status: 'Исключен',
                                        comment: "Ошибка получения депозита: Ошибка доступа 403"
                                    }, {
                                        where: {
                                            id: user.id
                                        }
                                    })

                                }


                                console.log(e)

                                await logger(`${e.code} ${user.username}` || `Неизвестная ошибка пользователь ${user.username}`)


                            }

                        }

                    }


                    await logger(`uncheck turnament id: ${toor.id}`)
                }  // конец проверки во время тура
                // конец тура


            }


            await logger("Uncheks turnament..." )



            setTimeout(()=>checkUser(), time*60000)


        }


        checkUser()


    } catch (e) {

        process.exit(1)
    }

}


// новое изменение 2

start()
