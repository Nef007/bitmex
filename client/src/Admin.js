import * as React from 'react';
import {useEffect, useState} from 'react';
import {connect} from "react-redux";
import 'moment/locale/ru';
import {useHistory} from "react-router-dom";
import {logout, reset} from "./redux/auth-reducer";
import {Button, Collapse, DatePicker, Form, Input, InputNumber, Modal, Table, Tabs, Tag} from "antd";

import locale from "antd/es/date-picker/locale/ru_RU";
import {
    deleteToor,
    deleteUser,
    disqvalUser,
    getToors,
    getUserAdmin,
    registerTurnament, setActiveUser,
    setIntervalState
} from "./redux/toor-reducer";
import 'moment/locale/ru';
import moment from 'moment';
import {isEmpty} from "lodash";
import logo from "./img/toor.png";


const {Column, ColumnGroup} = Table;
const {TabPane} = Tabs;
const {Panel} = Collapse;
const {RangePicker} = DatePicker;






const Admin = (props) => {

    const {
        logout, userAdmin, getUserAdmin, registerTurnament, getToors, toors, deleteToor, loading,
        arr, deleteUser, disqvalUser, reset, setIntervalState, intervalUser, intervalUserAdmin, intervalToor, setActiveUser
    } = props
    const history = useHistory();
    useEffect(async () => {
      await  getToors()
        getUserAdmin()
        clearInterval(intervalUser)
       // setIntervalState(null, setInterval(()=> getUserAdmin(), 60000), setInterval(()=> getToors(), 60000))


        ///интервал
    }, [])

    const [active, setActive] = useState(false)


    const onUpdate =()=>{
        getUserAdmin()
    }



    const onSaveTurnament = async (value) => {
       await registerTurnament(value)
        setActive(false)
        getToors()

    }
    const onDelete = async (id) => {
      await  deleteToor(id)
        getToors()

    }
    const onDeleteUser = async (id) => {
        if(window.confirm("Удалить пользователя?")){
            await  deleteUser(id)
            getUserAdmin()
        }


    }
    const onDisqvaleUser = async (id) => {
        let text = window.prompt('Комментарий?',"Нарушение правил")
      await  disqvalUser(id, text)
        getUserAdmin()

    }
    const onActive = async (id) => {
        let text = window.prompt('Комментарий?',"")
      await  setActiveUser(id, text)
        getUserAdmin()

    }
    const onReset =  (form) => {
        reset(form)

    }

    const onUpdateToor = async () => {
        await  getToors()
        getUserAdmin()
    }



    return (
        <div className="wrapper">
            <header>
                <div className="container">
                    <div className="head">
                        <div onClick={event => {
                            history.push('/tournament')
                        }} className='btn'>
                            Турнир
                        </div>
                        <div>
                            Администрирование
                        </div>
                        <div onClick={logout} className="btn">
                            Выход
                        </div>

                    </div>


                </div>
            </header>
            <section>

                <div className='container'>
                    <div className='content'>
                        <Tabs type="card">
                            <TabPane tab="Турниры" key="1">
                                <Modal
                                    title="Создать турнир"
                                    visible={active}
                                    footer={null}
                                    onCancel={(e) => setActive(false)}
                                >
                                    <Form
                                        name="basic"
                                        labelCol={{span: 8}}
                                        wrapperCol={{span: 12}}
                                        initialValues={{remember: true}}
                                        onFinish={onSaveTurnament}

                                        autoComplete="off"
                                    >
                                        <Form.Item
                                            label="Название"
                                            name="name"
                                            rules={[{required: true, message: 'Введите значение'}]}
                                        >
                                            <Input/>
                                        </Form.Item>
                                        <Form.Item
                                            label="Депозит"
                                            name="balance"

                                            rules={[{required: true, message: 'Введите значение'}]}
                                        >
                                            <InputNumber style={{width: "100%"}}/>
                                        </Form.Item>

                                        <Form.Item
                                            label="Дата"
                                            name="date"
                                            rules={[{required: true, message: 'Введите значение'}]}
                                        >
                                            <RangePicker
                                                locale={locale}
                                                showTime={{format: "HH:mm"}}
                                                format="YYYY-MM-DD HH:mm"

                                                //  onChange={onChangeInput('data_active')}
                                                // onChange={onChange}
                                                // onOk={onOk}
                                            />
                                        </Form.Item>


                                        <Form.Item wrapperCol={{offset: 11, span: 5}}>
                                            <Button type="primary" htmlType="submit">
                                                Создать
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </Modal>

                                <Button type="primary" onClick={event => setActive(true)}>Создать турнир</Button> {!isEmpty(toors) && <Button onClick={onUpdateToor} type="primary">Обновить</Button>}

                                { !isEmpty(toors) ?   <Table loading={loading} expandable={{
                                    expandedRowRender: toor => {


                                        const humans = toor.users && toor.users.filter(user=> user.category==="humans")
                                        const bot = toor.users && toor.users.filter(user=> user.category==="bot")

                                        return(
                                            <>
                                                <Button onClick={onUpdate} type="primary" >Обновить</Button>
                                                <h2>Люди</h2>
                                                <Table dataSource={humans} loading={loading}>
                                                    <Column title="Позиция" dataIndex="username" key="username"
                                                            render={(text, row, index) => (
                                                                <>
                                                                    {index + 1}

                                                                </>
                                                            )}

                                                    />
                                                    <Column title="Никнейм" dataIndex="username" key="username"/>
                                                   {/*<Column title="Стартовый депозит XBT" dataIndex="deposit" key="deposit"/>*/}
                                                    <Column title="Текущий депозит" dataIndex="balance" key="balance"/>
                                                    <Column title="Позиции" dataIndex="transaction" key="transaction"
                                                            render={text => {



                                                                return (
                                                                    <>
                                                                        {/*{text.map(item=> <div>{item.map(i=> <span>{i} </span>)}</div>)}*/}
                                                                        {text && text.split(',').map(item=> <div className="position">{item}</div>)}


                                                                    </>
                                                                )


                                                            }

                                                            }/>
                                                    <Column title="Ордеры" dataIndex="trade" key="trade"/>
                                                    <Column title="API" dataIndex="api" key="api"/>
                                                    <Column title="@Telegram" dataIndex="connection" key="connection"/>
                                                    <Column title="Статус" dataIndex="status" key="status"

                                                            render={(status) => {

                                                                return (
                                                                    <Tag color={status === "Активный" ? "green" : status === "Завершен" ? "orange" : "magenta"}>
                                                                        {status}
                                                                    </Tag>

                                                                )

                                                            }

                                                            }

                                                    />
                                                    <Column title="Комментарий" dataIndex="comment" key="comment"/>
                                                    <Column title="Действие" key="action"
                                                            render={(text, record) => {

                                                                return (
                                                                    <>
                                                                    <a onClick={event => onDeleteUser(record.id)} >
                                                                        Удалить
                                                                    </a> <a onClick={event => onDisqvaleUser(record.id)} >
                                                                        Исключить
                                                                    </a> <a onClick={event => onActive(record.id)} >
                                                                        Активировать
                                                                    </a>
                                                                    </>

                                                                )

                                                            }

                                                            }
                                                    />
                                                </Table>

                                                <h2>Роботы</h2>
                                                <Table dataSource={bot} loading={loading}>
                                                    <Column title="Позиция" dataIndex="username" key="username"
                                                            render={(text, row, index) => (
                                                                <>
                                                                    {index + 1}

                                                                </>
                                                            )}

                                                    />
                                                    <Column title="Никнейм" dataIndex="username" key="username"/>
                                                    {/*<Column title="Стартовый депозит XBT" dataIndex="deposit" key="deposit"/>*/}
                                                    <Column title="Текущий депозит" dataIndex="balance" key="balance"/>
                                                    <Column title="Позиции" dataIndex="transaction" key="transaction"
                                                            render={text => {



                                                                return (
                                                                    <>
                                                                        {/*{text.map(item=> <div>{item.map(i=> <span>{i} </span>)}</div>)}*/}
                                                                        {text && text.split(',').map(item=> <div className="position">{item}</div>)}


                                                                    </>
                                                                )


                                                            }

                                                            }/>
                                                    <Column title="Ордеры" dataIndex="trade" key="trade"/>
                                                    <Column title="API" dataIndex="api" key="api"/>
                                                    <Column title="Статус" dataIndex="status" key="status"

                                                            render={(status) => {

                                                                return (
                                                                    <Tag color={status === "Активный" ? "green" : status === "Завершен" ? "orange" : "magenta"}>
                                                                        {status}
                                                                    </Tag>

                                                                )

                                                            }

                                                            }

                                                    />
                                                    <Column title="Комментарий" dataIndex="comment" key="comment"/>
                                                    <Column title="Действие" key="action"
                                                            render={(text, record) => {

                                                                return (
                                                                    <>
                                                                        <a onClick={event => onDeleteUser(record.id)} >
                                                                            Удалить
                                                                        </a> <a onClick={event => onDisqvaleUser(record.id)} >
                                                                        Исключить
                                                                    </a> <a onClick={event => onActive(record.id)} >
                                                                        Активировать
                                                                    </a>
                                                                    </>

                                                                )

                                                            }

                                                            }
                                                    />

                                                </Table>

                                            </>
                                        )


                                    } ,
                                    defaultExpandedRowKeys: arr

                                }}
                                       dataSource={toors}
                                >
                                    <Column title="Название" dataIndex="name" key="name"/>
                                    <Column title="Начало" dataIndex="start" key="start"
                                            render={(start) => {
                                                    return (
                                                        <span>
                                                             {moment(start).format("HH:mm DD.MM.YYYY")}
                                                        </span>


                                                    )

                                            }

                                            }

                                    />
                                    <Column title="Конец" dataIndex="end" key="end"
                                            render={(end) => {
                                                return (
                                                    <span>
                                                             {moment(end).format("HH:mm DD.MM.YYYY")}
                                                        </span>


                                                )

                                            }

                                            }
                                    />
                                    <Column title="Стартовый депозит" dataIndex="balance" key="balance"/>
                                    <Column title="Статус" dataIndex="status" key="status"
                                            render={(status) => {

                                                return (
                                                    <Tag color={status === "Активный" ? "green" : status === "Завершен" ? "magenta" : "orange"}>
                                                        {status}
                                                    </Tag>

                                                )

                                            }

                                            }
                                    />  <Column title="Действие"  key="action"
                                            render={(text, record) => {

                                                return (
                                                    <a onClick={event => onDelete(record.id)} >
                                                        Удалить
                                                    </a>

                                                )

                                            }

                                            }
                                    />

                                </Table> :  <div className="imgBox">
                                    <img className="img" src={logo} alt="Картинка"/>
                                    <h1>Нет турниров</h1>
                                </div>}


                            </TabPane>
                            <TabPane tab="Настройки" key="2">
                                <h2> Сменить пароль</h2>
                                <Form
                                    name="basic"
                                    labelCol={{ span: 11 }}
                                    wrapperCol={{ span: 5}}
                                    initialValues={{ remember: true }}
                                    onFinish={onReset}

                                    autoComplete="off"
                                >
                                    <Form.Item
                                        label="Пароль"
                                        name="password"
                                        rules={[{ required: true, message: 'Please input your password!' }]}
                                    >
                                        <Input.Password />
                                    </Form.Item>

                                    <Form.Item
                                        label="Повторить пароль"
                                        name="confirm"
                                        rules={[{ required: true, message: 'Please input your password!' }]}
                                    >
                                        <Input.Password />
                                    </Form.Item>

                                    <Form.Item wrapperCol={{ offset: 11, span: 5 }}>
                                        <Button type="primary" htmlType="submit">
                                            Изменить
                                        </Button>
                                    </Form.Item>
                                </Form>

                            </TabPane>

                        </Tabs>

                    </div>
                </div>

            </section>
            <footer>
                <div>
                    2021
                </div>

            </footer>

        </div>
    )
};

let mapStateToProps = (state) => {

    return {
        userAdmin: state.userState.userAdmin,
        toors: state.toorState.toors,
        arr: state.toorState.arr,
        intervalToor: state.toorState.intervalToor,
        intervalUser: state.toorState.intervalUser,
        intervalUserAdmin: state.toorState.intervalUserAdmin,
        loading: state.authState.loading

    }

}

export default connect(mapStateToProps, {logout, getUserAdmin, registerTurnament,
    getToors, deleteToor, deleteUser, disqvalUser, reset, setIntervalState, setActiveUser
})(Admin)