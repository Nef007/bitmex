import * as React from 'react';
import {useEffect, useState} from 'react';
import {Button, Input, Space, Table, Tag, Tooltip} from 'antd';
import moment from "moment";
import {isEmpty} from "lodash";
import logo from "./img/toor.png"
import PauseOutlined from "@ant-design/icons/lib/icons/PauseOutlined";
import CaretRightOutlined from "@ant-design/icons/lib/icons/CaretRightOutlined";
import PoweroffOutlined from "@ant-design/icons/lib/icons/PoweroffOutlined";
import EditOutlined from "@ant-design/icons/lib/icons/EditOutlined";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import LoadingOutlined from "@ant-design/icons/lib/icons/LoadingOutlined";
import ReloadOutlined from "@ant-design/icons/lib/icons/ReloadOutlined";
import SearchOutlined from "@ant-design/icons/lib/icons/SearchOutlined";
import Highlighter from "react-highlight-words";


const {Column} = Table;


export const TableTur = (props) => {

    const {
        getUser, loading, toors, getToors, arr, loadingToors
    } = props

    useEffect(async () => {
        await getToors()
        getUser()

    }, [getToors, getUser])


    const onUpdate = () => {
        getUser()
    }
    const onUpdateToor = async () => {
        await getToors()
        getUser()
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


    ]


    return (
        <>
            {!isEmpty(toors) && <Button onClick={onUpdateToor} type="primary">Обновить</Button>}
            {!isEmpty(toors) ?
                <div className="table-box">
                    <Table loading={loadingToors} expandable={{

                        expandedRowRender: toor => {


                            const humans = toor.users && toor.users.filter(user => user.category === "humans")
                            const bot = toor.users && toor.users.filter(user => user.category === "bot")

                            return (
                                <React.Fragment>
                                    <Button onClick={onUpdate} type="primary">Обновить</Button>
                                    <h2>Люди</h2>
                                    <Table dataSource={humans}
                                           loading={loading}
                                           columns={ subcolumns}
                                    >


                                    </Table>

                                    <h2>Роботы</h2>
                                    <Table dataSource={bot}
                                           loading={loading}
                                           columns={subcolumns}
                                    >

                                    </Table>

                                </React.Fragment>
                            )


                        },
                        defaultExpandedRowKeys: arr

                    }}
                           dataSource={toors}
                           columns={ columns}

                    >


                    </Table>
                </div>


                :
                <div className="imgBox">
                    <img className="img" src={logo} alt="Картинка"/>
                    <h1>Нет турниров</h1>
                </div>


            }

        </>
    );


};