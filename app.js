const express = require('express')
const config = require('config')
const path = require('path')
const db = require('./config/db.config');
const Toor = db.toor;
const User = db.user;
const Admin = db.admin;
const Log = db.log;
const moment = require('moment')


const fetch = require('node-fetch');
const crypto = require('crypto');
const qs = require('qs');


const app = express()
app.use(express.json({extended: true}))
db.sequelize.sync({force: true}).then(() => {
    console.log('Drop and Resync with { force: false }');
});
app.use('/auth', require('./routes/auth.routes'))
app.use('/api/user', require('./routes/user.routes'))
app.use('/api/toor', require('./routes/toor.routes'))


app.use('/', express.static(path.join(__dirname, 'client', 'build')))

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
})

const PORT = config.get('port') || 5000

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

async function logger(text){

    await Log.create({text})
}

async function start() {

    try {

        app.listen(PORT, () => console.log(`app has been started on port ${PORT}...`))

        const admin = await Admin.findByPk(1)




        setInterval(async ()=>{

            await Log.destroy({
                where: {},
                truncate: true})

        },  1209600000)



        setInterval(async () => {
            console.log("Cheks turnament..." + new Date())
            await logger("Cheks turnament...")
            const toors = await Toor.findAll({
                raw: true
            })

            for (let toor of toors) {

                //  проверка во время тура
                if (toor.status === "Активный") {
                    console.log("check toor id: " + toor.id )
                    await logger(`Cheks turnament id: ${toor.id}`)

                    const users = await User.findAll({
                        where: {
                            toorId: toor.id
                        }
                    })

                    for (let user of users) {

                        if (user.status === "Активный") {
                            try {
                                const walletSum = await makeRequest(user.apikey, user.apisecret, 'GET', '/user/walletSummary',
                                    {currency: "XBt"}
                                );

                                const wallet = await makeRequest(user.apikey, user.apisecret, 'GET', '/user/wallet',
                                    {currency: "XBt"}
                                );
                                const order = await makeRequest(user.apikey, user.apisecret, 'GET', '/order',
                                    {reverse: true, startTime: new Date(toor.start)}
                                );
                                const apibit = await makeRequest(user.apikey, user.apisecret, 'GET', '/apiKey',
                                    {}
                                );
                                // в сделке
                                const positionBit = await makeRequest(user.apikey, user.apisecret, 'GET', '/position',
                                    {reverse: true}
                                );



                                const {amount} = walletSum.filter(item => item.transactType === "Deposit")[0]


                                // проверка депозита
                                if (amount !== Number(user.deposit)) {
                                    await User.update({status: 'Исключен', comment: "Депозит отличается"}, {
                                        where: {
                                            id: user.id
                                        }
                                    })

                                }else {


                                    let transaction = String(positionBit.map(item => `${item.symbol}: ${item.openingQty}`)  || [])
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
                                    console.log(e)
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
                                await logger(e)


                            }

                        }

                    }

                    console.log("uncheck toor id: " + toor.id )
                    await logger(`uncheck turnament id: ${toor.id}`)
                }  // конец проверки во время тура
                // конец тура


            }

            console.log("Uncheks turnament..." + new Date())
            await logger("Uncheks turnament..." )

        }, admin.timeupdate)

///////////////////////////////////////
        setInterval(async () => {


            const toors = await Toor.findAll({
                raw: true
            })

            for (let toor of toors) {

                // начало тура
                if (new Date(toor.start) <= new Date() && toor.status === "Ожидание") {


                    // активировали тур
                    console.log(`Start active turnament ` + toor.id + " " + new Date() )
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
                                const walletSum = await makeRequest(user.apikey, user.apisecret, 'GET', '/user/walletSummary',
                                    {currency: "XBt"}
                                );

                                const wallet = await makeRequest(user.apikey, user.apisecret, 'GET', '/user/wallet',
                                    {currency: "XBt"}
                                );
                                const order = await makeRequest(user.apikey, user.apisecret, 'GET', '/order',
                                    {reverse: true, startTime: new Date(toor.start)}
                                );
                                const apibit = await makeRequest(user.apikey, user.apisecret, 'GET', '/apiKey',
                                    {}
                                );
                                // в сделке
                                const positionBit = await makeRequest(user.apikey, user.apisecret, 'GET', '/position',
                                    {reverse: true}
                                );

                                const {amount} = walletSum.filter(item => item.transactType === "Deposit")[0]

                               // console.log({...walletSum.filter(item => item.transactType === "Deposit")})

                                //Проверка баланса
                                let balance = parseInt(wallet.amount / 10000) / 10000

                                if (balance !== Number(toor.balance)) {
                                    await User.update({
                                        status: 'Исключен',
                                        comment: "Стартовый баланс не соответствует"
                                    }, {
                                        where: {
                                            id: user.id
                                        }
                                    })

                                } else {
                                    //  сохранения депозита

                                    let transaction = String(positionBit.map(item => `${item.symbol}: ${item.openingQty}`)  || [])
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

                                }


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

                                console.log(e)
                                await logger(e)

                            }

                        }


                    }

                    console.log("Finish active turnament.")
                    await logger(`Finish active turnament ${toor.id}`)

                }  // конец активации тура
                //  проверка во время тура

                // конец тура
                if (new Date(toor.end) <= new Date() && toor.status === "Активный") {
                    console.log(`Close turnament ${new Date()}`)
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
                                const wallet = await makeRequest(user.apikey, user.apisecret, 'GET', '/user/wallet',
                                    {currency: "XBt"}
                                );
                                const order = await makeRequest(user.apikey, user.apisecret, 'GET', '/order',
                                    {reverse: true, startTime: new Date(toor.start)}
                                );
                                const api = await makeRequest(user.apikey, user.apisecret, 'GET', '/apiKey',
                                    {}
                                );

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


                    console.log("Finish close turnament")
                    await logger(`Finish close turnament ${toor.id}`)

                }

            }


        }, 10000)


    } catch (e) {
        console.log('Server Error', e.message)
        process.exit(1)
    }

}

// новое изменение 2

start()
