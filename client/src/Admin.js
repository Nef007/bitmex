import * as React from 'react';
import {useEffect, useState} from 'react';
import {connect} from "react-redux";
import {useHistory} from "react-router-dom";
import {auth, logout, reset, setTimeUpdate} from "./redux/auth-reducer";
import {
    Button,
    DatePicker,
    Empty,
    Form,
    Input,
    InputNumber,
    Modal,
    Select,
    Space,
    Table,
    Tabs,
    Tag,
    Tooltip
} from "antd";

import {useToggle} from "react-use";

import locale from "antd/es/date-picker/locale/ru_RU";
import {
    changeStatusToor,
    deleteToor,
    deleteUser,
    disqvalUser,
    getToors, getUser,
    getUserAdmin,
    registerTurnament,
    setActiveUser,
    setIntervalState, setReversToorActions, updateTurnament
} from "./redux/toor-reducer";
import 'moment/locale/ru';
import moment from 'moment';
import {isEmpty} from "lodash";
import logo from "./img/toor.png";
import {deleteLog, getLog, registerUser} from "./redux/user-reducer";
import PauseOutlined from "@ant-design/icons/lib/icons/PauseOutlined";
import CaretRightOutlined from "@ant-design/icons/lib/icons/CaretRightOutlined";
import EditOutlined from "@ant-design/icons/lib/icons/EditOutlined";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import ReloadOutlined from "@ant-design/icons/lib/icons/ReloadOutlined";
import {sanitizeParam} from "express-validator";
import PoweroffOutlined from "@ant-design/icons/lib/icons/PoweroffOutlined";
import LoadingOutlined from "@ant-design/icons/lib/icons/LoadingOutlined";
import ExclamationCircleOutlined from "@ant-design/icons/lib/icons/ExclamationCircleOutlined";
import SwapOutlined from "@ant-design/icons/lib/icons/SwapOutlined";
import UserAddOutlined from "@ant-design/icons/lib/icons/UserAddOutlined";
import Highlighter from 'react-highlight-words';
import SearchOutlined from "@ant-design/icons/lib/icons/SearchOutlined";
import {LoopCircleLoading} from "react-loadingg";

const {TabPane} = Tabs;
const {RangePicker} = DatePicker;
const {Option} = Select;


const Admin = (props) => {

    const {
        logout, deleteLog, log, getUserAdmin, registerTurnament, getToors, toors, deleteToor, loading, auth,
        arr, deleteUser, disqvalUser, reset, setTimeUpdate, getLog, setActiveUser, currentUser, changeStatusToor, updateTurnament, getUser,
        loadingIndexUser, loadingToors, loadingUser, registerUser, setReversToorActions
    } = props
    const history = useHistory();
    useEffect(async () => {
        await getToors()
        getUser()
        getLog()

        // setIntervalState(null, setInterval(()=> getUserAdmin(), 60000), setInterval(()=> getToors(), 60000))
        ///интервал
    }, [])

    const [active, setActive] = useToggle(false)
   // const [revers, setRevers] = useToggle(false)
    const [activeAddUser, setActiveAddUser] = useToggle(false)




    const [form] = Form.useForm();

    const onEdit = async (id) => {
        //await servers.getServer(id)

        const toor= {
            ...toors.filter(item=>item.id===id)[0]
        }

        console.log(toor.start)

        // console.log(servers.server.sendmail.split(',').map(item=>({value: item, label: item})))
        form.setFieldsValue({
            ...toor, date: [moment(Date.parse(toor.start)), moment(Date.parse(toor.end))]
        })
        setActive()

    };
    const onCancel = () => {
        form.resetFields();
        setActive()

    };

    const onFinish = (values) => {
        registerUser(values);
    };

    const onUpdate = () => {
        getUser()
    }


    const onSaveTurnament = async () => {
        // await registerTurnament(value)
        // setActive(false)
        // getToors()


        const value = await form.validateFields()

        if (value.id) {
            await updateTurnament(value)
        } else await registerTurnament(value)

        setActive(false)
        getToors()


    }
    const onDelete = async (id) => {
        if (window.confirm("Удалить турнир?")) {
            await deleteToor(id)
            getToors()
        }

    }
    const onDeleteUser = async (id) => {
        if (window.confirm("Удалить пользователя?")) {
            await deleteUser(id)
            getUser()
        }
    }
    const onDisqvaleUser = async (id) => {
        let text = window.prompt('Комментарий?', "Нарушение правил")
        if(text){
            await disqvalUser(id, text)
            getUser()
        }


    }
    const onActive = async (id) => {
        let text = window.prompt('Комментарий?', "")
        if(text) {
            await setActiveUser(id, text)
            getUser()
        }

    }
    const onReset = (form) => {
        reset(form)


    }
    const onSetTime = (form) => {
        setTimeUpdate(form)
        auth()

    }

    const onUpdateToor = async () => {
        await getToors()
        getUser()
    }
    const ondeleteLog = async () => {
        if (window.confirm("Удалить лог?")) {
            await deleteLog()
            getLog()
        }


    }


//////////////////////////////////ПОИСК///////
    let searchInput = React.createRef()
    const [searchText, setSearchText] = useState('')
    const [searchedColumn, setSearchedColumn] = useState('')

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0])
        setSearchedColumn(dataIndex)

    };
    const handleReset = clearFilters => {
        clearFilters();
        setSearchText('')
    };
    const getColumnSearchProps = dataIndex => ({

        filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}) => (
            <div style={{padding: 8}}>
                <Input
                    ref={node => {
                        searchInput = node;
                    }}
                    placeholder={`Что искать?`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{marginBottom: 8, display: 'block'}}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined/>}
                        size="small"
                        style={{width: 90}}
                    >
                        Поиск
                    </Button>
                    <Button onClick={() => handleReset(clearFilters)} size="small" style={{width: 90}}>
                        Сброс
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{color: filtered ? '#1890ff' : undefined}}/>,
        onFilter: (value, record) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => searchInput.select(), 100);
            }
        },
        render: text =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{backgroundColor: '#ffc069', padding: 0}}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });






    const columns = [

        {
            title: "Название",
            dataIndex: "name",
            //  render: (text) => moment(text).format('HH:mm DD:MM:YYYY')
            // ...getColumnSearchProps('connect'),

        },
        {
            title: "Начало",
            dataIndex: "start",
            // ...getColumnSearchProps('name'),
            render: (start) => {
                return (
                    <span>
         {moment(start).format("HH:mm DD.MM.YYYY")}
          </span>
                )

            }


        }, {
            title: "Конец",
            dataIndex: "end",
            // ...getColumnSearchProps('name'),
            render: (end) => {
                return (
                    <span>
                {moment(end).format("HH:mm DD.MM.YYYY")}
              </span>
                )
            }

        },
        {
            title: "Стартовый депозит",
            dataIndex: 'balance',
            // render: (record) => record.user.family,
            // filters: [
            //     {text: 'WEB', value: 'WEB'},
            //     {text: 'БД', value: 'БД'},
            // ],


        },
        {
            title: "Оборот",
            dataIndex: "turn",
            // render: (text) => text && moment(+text).format("HH:mm DD.MM.YYYY"),

        },

        {
            title: "Состояние",
            dataIndex: "status",
            //  render: (record) => record.user.division,
            // filters: [
            //     {text: 'Работает', value: 'Работает'},
            //     {text: 'Нет сигнала', value: 'Нет сигнала'},
            // ],

            // render: (text) =>
            //     <Space size="middle">
            //         <Tag color={text === "Работает" ? "green" : text === "Ожидание" ? "blue" : "red"}>
            //             {text}
            //         </Tag>
            //     </Space>,

            render: (status) => {

                return (
                    <Tag color={status === "Активный" ? "green" : status === "Завершен" ? "magenta" : "orange"}>
                        {status}
                    </Tag>

                )

            }
        },

        {
            title: "Действие",
            render: (record) => (
                <>
                    <Space size="middle">

                        {record.status === "Активный" ? <Tooltip title="Пауза">

                                <Button shape="circle"
                                      onClick={() => changeStatusToor(record.id, "Ожидание")}
                                        icon={<PauseOutlined/>}
                                        size="small"/>
                            </Tooltip> :
                            <Tooltip title="Старт">

                                <Button shape="circle"
                                        onClick={() => changeStatusToor(record.id, "Активный")}

                                        icon={<CaretRightOutlined style={{color: '#4bdc0c'}}/>}
                                        size="small"/>
                            </Tooltip>}

                        <Tooltip title="Завершить">

                            <Button shape="circle"
                                    onClick={() => changeStatusToor(record.id, "Завершен")}

                                    icon={<PoweroffOutlined />}
                                    size="small"/>
                        </Tooltip>

                        <Tooltip title="Редактировать">
                            {/*<NavLink to={`/request/${record.id}`}>*/}
                            <Button shape="circle"
                                    icon={<EditOutlined/>}
                                   onClick={() => onEdit(record.id)}
                                    size="small"/>
                            {/*</NavLink>*/}

                        </Tooltip>
                        <Tooltip title="Удалить">
                            {/*<NavLink to={`/request/${record.id}`}>*/}
                            <Button shape="circle"
                                    icon={<DeleteOutlined/>}
                                    onClick={() => onDelete(record.id)}
                                    size="small"/>
                            {/*</NavLink>*/}

                        </Tooltip>

                    </Space>
                </>)
        },

    ]

    const subcolumns = [

        {
            title: "Позиция",
            render: (text, row, index) => (
                <>
                    {index + 1}

                </>
            )

        },
        {
            title: "Никнейм",
            dataIndex: "username",
            // ...getColumnSearchProps('name'),
            ...getColumnSearchProps('username'),


        }, {
            title: "Текущий депозит",
            dataIndex: "balance",
        },
        {
            title: "Тикет/позиции/откр./ликвид./PNL",
            dataIndex: 'transaction',
            align: 'left',
             render: (text) =>
                 text &&
                 <table className="minitable">

                     {text.split(',').map(item=> (
                         <tr>
                             <td>{item.split(':')[0]}</td>
                             <td>{item.split(':')[1].split('/')[0]}</td>
                             <td>{item.split(':')[1].split('/')[1]}</td>
                             <td>{item.split(':')[1].split('/')[2]}</td>
                             <td>{item.split(':')[1].split('/')[3]}</td>
                         </tr>

                 ))}
                 </table>

        },
        {
            title: "Ордеры",
            dataIndex: "trade",
            // render: (text) => text && moment(+text).format("HH:mm DD.MM.YYYY"),

        },

        {
            title: "API",
            dataIndex: "api",


        },
        {
            title: "@Telegram",
            dataIndex: "connection",

        },
        {
            title: "Статус",
            dataIndex: "status",
            render: (status) => {

                return (
                    <Tag
                        color={status === "Активный" ? "green" : status === "Завершен" ? "orange" : "magenta"}>
                        {status}
                    </Tag>

                )

            }


        },
        {
            title: "События",
            dataIndex: "comment",
            render: (text, record) => {

                if (text === "Обновлен:") {
                    return (
                        <>
                            <span> Обновлен: {moment(record.updatedAt).format("HH:mm DD.MM.YYYY")} </span>
                        </>

                    )
                } else return (
                    <span> {text}</span>

                )


            }


        },

        {
            title: "Действие",
            render: (record) => (
                <>
                    <Space size="middle">
                        <Tooltip title="Обновить">
                            {/*<NavLink to={`/request/${record.id}`}>*/}
                            <Button shape="circle"
                                   // icon={<ReloadOutlined />}
                                    icon={(loadingIndexUser.load && loadingIndexUser.idUser===record.id)? <LoadingOutlined /> : <ReloadOutlined /> }
                                    onClick={event => getUserAdmin(record.id)}
                                    size="small"/>
                            {/*</NavLink>*/}

                        </Tooltip>


                        {record.status === "Активный" ? <Tooltip title="Исключить из мониторинга">

                                <Button shape="circle"
                                    //  onClick={() => onChange(record.id, {status: 'pause'})}
                                        onClick={event => onDisqvaleUser(record.id)}
                                        icon={<PauseOutlined/>}
                                        size="small"/>
                            </Tooltip> :
                            <Tooltip title="Активировать">

                                <Button shape="circle"
                                    // onClick={() => onChange(record.id, {status: 'play'})}
                                        onClick={event => onActive(record.id)}
                                        icon={<CaretRightOutlined style={{color: '#4bdc0c'}}/>}
                                        size="small"/>
                            </Tooltip>}

                        <Tooltip title="Удалить">
                            {/*<NavLink to={`/request/${record.id}`}>*/}
                            <Button shape="circle"
                                    icon={<DeleteOutlined/>}
                                    onClick={event => onDeleteUser(record.id)}
                                    size="small"/>
                            {/*</NavLink>*/}

                        </Tooltip>

                    </Space>
                </>)
        },

    ]

    const subcolumnsRevers = [

        {
            title: "Позиция",
            render: (text, row, index) => (
                <>
                    {index + 1}

                </>
            )

        },
        {
            title: "Никнейм",
            dataIndex: "username",
            // ...getColumnSearchProps('name'),
            ...getColumnSearchProps('username'),


        },
        {
            title: "Текущий депозит",
            dataIndex: "balance",
            sorter: (a, b) => +a.balance - +b.balance,
        }, {
            title: "Тикет",
            dataIndex: "tiket",
            sorter: (a, b) =>{
                if(a.tiket && b.tiket ){
                    let nameA=a.tiket.toLowerCase(), nameB=b.tiket.toLowerCase()
                    if (nameA < nameB)
                        return -1
                    if (nameA > nameB)
                        return 1
                    return 0
                }

            },
        }, {
            title: "Позиции",
            dataIndex: "poz",
            sorter: (a, b) => +a.poz - +b.poz,
        }, {
            title: "Откр",
            dataIndex: "open",
            sorter: (a, b) => +a.open - +b.open,
        }, {
            title: "Ликвид",
            dataIndex: "lic",
            sorter: (a, b) => +a.lic - +b.lic,
        },
        {
            title: "PNL",
            dataIndex: "pnl",
            sorter: (a, b) => +a.pnl - +b.pnl,
        },
        {
            title: "Рынок",
            dataIndex: "mark",
            sorter: (a, b) => +a.mark - +b.mark,
        },
        {
            title: "Рынок-Ликвид",
           // dataIndex: "mark",
            render: (record) => Math.floor(Number(record.mark)-Number(record.lic)),
            sorter: (a, b) => Math.floor(Number(a.mark)-Number(a.lic)) - Math.floor(Number(b.mark)-Number(b.lic))

        },
        // {
        //     title: "Тикет/позиции/откр./ликвид./PNL",
        //     dataIndex: 'transaction',
        //     align: 'left',
        //      render: (text) =>
        //          text &&
        //          <table className="minitable">
        //
        //              {text.split(',').map(item=> (
        //                  <tr>
        //                      <td>{item.split(':')[0]}</td>
        //                      <td>{item.split(':')[1].split('/')[0]}</td>
        //                      <td>{item.split(':')[1].split('/')[1]}</td>
        //                      <td>{item.split(':')[1].split('/')[2]}</td>
        //                      <td>{item.split(':')[1].split('/')[3]}</td>
        //                  </tr>
        //
        //          ))}
        //          </table>
        //
        // },
        {
            title: "Ордеры",
            dataIndex: "trade",
            // render: (text) => text && moment(+text).format("HH:mm DD.MM.YYYY"),

        },

        {
            title: "API",
            dataIndex: "api",


        },
        {
            title: "@Telegram",
            dataIndex: "connection",

        },
        {
            title: "Статус",
            dataIndex: "status",
            render: (status) => {

                return (
                    <Tag
                        color={status === "Активный" ? "green" : status === "Завершен" ? "orange" : "magenta"}>
                        {status}
                    </Tag>

                )

            }


        },
        {
            title: "События",
            dataIndex: "comment",
            render: (text, record) => {

                if (text === "Обновлен:") {
                    return (
                        <>
                            <span> Обновлен: {moment(record.updatedAt).format("HH:mm DD.MM.YYYY")} </span>
                        </>

                    )
                } else return (
                    <span> {text}</span>

                )


            }


        },

        {
            title: "Действие",
            render: (record) => (
                <>
                    <Space size="middle">
                        <Tooltip title="Обновить">
                            {/*<NavLink to={`/request/${record.id}`}>*/}
                            <Button shape="circle"
                                   // icon={<ReloadOutlined />}
                                    icon={(loadingIndexUser.load && loadingIndexUser.idUser===record.id) ? <LoadingOutlined /> : <ReloadOutlined />  }
                                    onClick={event => getUserAdmin(record.id)}
                                    size="small"/>
                            {/*</NavLink>*/}

                        </Tooltip>


                        {record.status === "Активный" ? <Tooltip title="Исключить из мониторинга">

                                <Button shape="circle"
                                    //  onClick={() => onChange(record.id, {status: 'pause'})}
                                        onClick={event => onDisqvaleUser(record.id)}
                                        icon={<PauseOutlined/>}
                                        size="small"/>
                            </Tooltip> :
                            <Tooltip title="Активировать">

                                <Button shape="circle"
                                    // onClick={() => onChange(record.id, {status: 'play'})}
                                        onClick={event => onActive(record.id)}
                                        icon={<CaretRightOutlined style={{color: '#4bdc0c'}}/>}
                                        size="small"/>
                            </Tooltip>}

                        <Tooltip title="Удалить">
                            {/*<NavLink to={`/request/${record.id}`}>*/}
                            <Button shape="circle"
                                    icon={<DeleteOutlined/>}
                                    onClick={event => onDeleteUser(record.id)}
                                    size="small"/>
                            {/*</NavLink>*/}

                        </Tooltip>

                    </Space>
                </>)
        },

    ]











    const textLod = log.map(item => `${item.text}---- ${moment(item.createdAt).format("HH:mm:ss DD.MM.YYYY")}`).join("\n")


    return (
        <div className="wrapper">
            <header>
                <div className="container">
                    <div className="head">
                        <div onClick={event => {
                            history.push('/tournament')
                        }} className='btn'>
                            Турнир(вид пользователя)
                        </div>
                        <div  className="title">
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
                                    okText="Create"
                                    onCancel={onCancel}
                                    footer={[
                                        <Button key="submit" type="primary" onClick={onSaveTurnament}>
                                            Сохранить
                                        </Button>,
                                    ]}
                                >
                                    <Form
                                        labelCol={{span: 6}}
                                        wrapperCol={{span: 15}}
                                        form={form}
                                    >

                                        <Form.Item
                                           // label="Название"
                                            name="id"
                                            noStyle
                                          //  rules={[{required: true, message: 'Введите значение'}]}
                                        >

                                        </Form.Item>
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


                                        {/*<Form.Item wrapperCol={{offset: 11, span: 5}}>*/}
                                        {/*    <Button type="primary" htmlType="submit">*/}
                                        {/*        Создать*/}
                                        {/*    </Button>*/}
                                        {/*</Form.Item>*/}
                                    </Form>
                                </Modal>


                                <Modal
                                    title="Добавить участника"
                                    visible={activeAddUser}
                                    footer={null}
                                    onCancel={()=>setActiveAddUser()}

                                >
                                    <Form
                                         labelCol={{ span: 13 }}
                                        wrapperCol={{ span: 10}}
                                        onFinish={onFinish}


                                    >
                                        <Form.Item
                                            label="Никнейм(Имя)"
                                            name="username"
                                            rules={[{ required: true, message: 'Введите никнейм' }]}
                                        >
                                            <Input />
                                        </Form.Item>

                                        <Form.Item
                                            label="Выбор категории"
                                            name="category"
                                            rules={[{ required: true, message: 'Выберите категорию!' }]}
                                        >
                                            <Select placeholder="Выбрать">
                                                <Option value="humans">Люди</Option>
                                                <Option value="bot">Роботы</Option>

                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            label="Выбор турнира"
                                            name="toorid"
                                            rules={[{ required: true, message: 'Выберите категорию!' }]}
                                        >
                                            <Select placeholder="Выбрать">
                                                {toors.map(toor=> { if( toor.status==='Ожидание'){
                                                    return  <Option value={toor.id}>{toor.name}</Option>
                                                }  })}


                                            </Select>
                                        </Form.Item>
                                        <Form.Item
                                            label="Никнейм в телеграмме для связи"
                                            name="connection"
                                            rules={[{ required: true, message: 'Введите никнейм телеграмма!' }]}
                                        >
                                            <Input  prefix="@" />
                                        </Form.Item> <Form.Item
                                        label="Api key (ключ с правами на чтение)"
                                        name="apikey"
                                        rules={[{ required: true, message: 'Вставьте API Key' }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                        <Form.Item
                                            label="Api Secret (секрет от ключа)"
                                            name="apisecret"
                                            rules={[{ required: true, message: 'Вставьте API Secret' }]}
                                        >
                                            <Input />
                                        </Form.Item>

                                        <Form.Item wrapperCol={{ offset: 11, span: 5 }}>
                                            <Button disabled={loadingUser} type="primary" htmlType="submit">
                                                Регистрация
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </Modal>

                                <Button type="primary" onClick={event => setActive(true)}>Создать
                                    турнир</Button >  <Tooltip title="Добавить">
                                <Button  onClick={()=>setActiveAddUser()} type="primary">
                                    <UserAddOutlined />
                                </Button>

                            </Tooltip> {!isEmpty(toors) &&
                            <Button onClick={onUpdateToor} type="primary">Обновить все</Button>}

                                {!isEmpty(toors) ?
                                    <div className="table-box">
                                        <Table
                                            scroll={{x: 700}}
                                            loading={loadingToors}
                                               expandable={{
                                            expandedRowRender: toor => {
                                                const humans = toor.users && toor.users.filter(user => user.category === "humans")
                                                const bot = toor.users && toor.users.filter(user => user.category === "bot")

                                                const humansRevers = []
                                                const botRevers = [];

                                                humans && toor.isRevers &&  humans.map(item=>{


                                                    item.transaction &&  item.transaction.split(',').map(tranz=>{
                                                        humansRevers.push({
                                                            tiket: tranz.split(':')[0],
                                                            poz: tranz.split(':')[1].split('/')[0],
                                                            open: tranz.split(':')[1].split('/')[1],
                                                            lic: tranz.split(':')[1].split('/')[2],
                                                            pnl: tranz.split(':')[1].split('/')[3],
                                                            mark: tranz.split(':')[1].split('/')[4],
                                                            username: item.username,
                                                            comment: item.comment,
                                                            status: item.status,
                                                            api: item.api,
                                                            trade: item.trade,
                                                            connection: item.connection,
                                                            balance: item.balance,
                                                            id: item.id,


                                                        })

                                                    })
                                                })

                                                bot && toor.isRevers && bot.map(item=>{

                                                    item.transaction &&   item.transaction.split(',').map(tranz=>{

                                                        botRevers.push({
                                                            tiket: tranz.split(':')[0],
                                                            poz: tranz.split(':')[1].split('/')[0],
                                                            open: tranz.split(':')[1].split('/')[1],
                                                            lic: tranz.split(':')[1].split('/')[2],
                                                            pnl: tranz.split(':')[1].split('/')[3],
                                                            mark: tranz.split(':')[1].split('/')[4],
                                                            username: item.username,
                                                            comment: item.comment,
                                                            status: item.status,
                                                            api: item.api,
                                                            trade: item.trade,
                                                            connection: item.connection,
                                                            balance: item.balance,
                                                            id: item.id,


                                                        })

                                                    })
                                                })



                                                return (
                                                    <React.Fragment key={toor.id}>
                                                        <Button onClick={onUpdate} type="primary">Обновить</Button>  <Tooltip title="Развернуть">
                                                            <Button  onClick={()=>setReversToorActions(toor.id)}  >
                                                                <SwapOutlined />
                                                            </Button>

                                                        </Tooltip>
                                                        <h2>Люди</h2>
                                                        <Table
                                                            size="small"
                                                            dataSource={toor.isRevers ? humansRevers : humans}
                                                               loading={loading}
                                                               columns={ toor.isRevers ? subcolumnsRevers :subcolumns}
                                                        >

                                                        </Table>

                                                        <h2>Роботы</h2>
                                                        <Table
                                                            size="small"
                                                            dataSource={toor.isRevers ? botRevers : bot}
                                                               loading={loading}
                                                            columns={ toor.isRevers ? subcolumnsRevers :subcolumns}
                                                        >
                                                        </Table>

                                                    </React.Fragment>
                                                )
                                            },
                                            defaultExpandedRowKeys: arr

                                        }}
                                               dataSource={toors}
                                               columns={columns}
                                        >


                                        </Table>

                                    </div>

                                    :  loadingToors ? <LoopCircleLoading color="#960000" /> :  <div className="imgBox">
                                        <img className="img" src={logo} alt="Картинка"/>
                                        <h1>Нет турниров</h1>
                                    </div>
                                }


                            </TabPane>
                            <TabPane tab="Настройки" key="2">
                                <h2> Сменить пароль</h2>
                                <Form
                                    name="pass"
                                    labelCol={{span: 11}}
                                    wrapperCol={{span: 5}}
                                    initialValues={{remember: true}}
                                    onFinish={onReset}

                                    autoComplete="off"
                                >
                                    <Form.Item
                                        label="Пароль"
                                        name="password"
                                        rules={[{required: true, message: 'Please input your password!'}]}
                                    >
                                        <Input.Password/>
                                    </Form.Item>

                                    <Form.Item
                                        label="Повторить пароль"
                                        name="confirm"
                                        rules={[{required: true, message: 'Please input your password!'}]}
                                    >
                                        <Input.Password/>
                                    </Form.Item>

                                    <Form.Item wrapperCol={{offset: 11, span: 5}}>
                                        <Button type="primary" htmlType="submit">
                                            Изменить
                                        </Button>
                                    </Form.Item>
                                </Form>

                                <h2> Частота обновления</h2>
                                <Form

                                    name="time"
                                    labelCol={{span: 11}}
                                    wrapperCol={{span: 5}}
                                    initialValues={{timeupdate: currentUser.timeupdate}}
                                    onFinish={onSetTime}

                                >
                                    <Form.Item
                                        label="Частота(минуты)"
                                        name="timeupdate"
                                        rules={[{required: true, message: 'Введите время!'}]}
                                    >
                                        <InputNumber min={5}/>

                                    </Form.Item>
                                    <div className="center">
                                        <div>1 час = 60 минут</div>
                                        <div>1 день = 1440 минут</div>
                                    </div>


                                    <Form.Item wrapperCol={{offset: 11, span: 5}}>
                                        <Button type="primary" htmlType="submit">
                                            Сохранить
                                        </Button>
                                    </Form.Item>
                                </Form>


                            </TabPane>
                            <TabPane tab="Log" key="3">
                                <h2> Работа приложения</h2>
                                <Button onClick={ondeleteLog} type="primary">
                                    Отчистить лог
                                </Button>  <Button onClick={()=>getLog()} type="primary">
                                   Обновить
                                </Button> Строк: {log.length}

                                <Input.TextArea rows={15} value={textLod}/>

                            </TabPane>

                        </Tabs>

                    </div>
                </div>

            </section>
            <footer>
                <div>
                    2021-2022
                </div>

            </footer>

        </div>
    )
};

let mapStateToProps = (state) => {

    return {
        userAdmin: state.userState.userAdmin,
        log: state.userState.log,
        toors: state.toorState.toors,
        loadingIndexUser: state.toorState.loadingIndexUser,
        arr: state.toorState.arr,
        intervalToor: state.toorState.intervalToor,
        intervalUser: state.toorState.intervalUser,
        intervalUserAdmin: state.toorState.intervalUserAdmin,
        loading: state.authState.loading,
        currentUser: state.authState.currentUser,
        loadingUser: state.userState.loadingUser,
        loadingToors: state.toorState.loadingToors,

    }

}

export default connect(mapStateToProps, {
    logout,
    getUserAdmin,
    registerTurnament,
    getToors,
    deleteToor,
    deleteUser,
    changeStatusToor,
    updateTurnament,
    disqvalUser,
    reset,
    setIntervalState,
    setActiveUser,
    setTimeUpdate,
    auth,
    getUser,
    getLog,
    deleteLog,
    registerUser,
    setReversToorActions
})(Admin)