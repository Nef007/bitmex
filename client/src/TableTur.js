import * as React from 'react';
import {useEffect} from 'react';
import {Button, Table, Tag} from 'antd';
import moment from "moment";
import {isEmpty} from "lodash";
import logo from "./img/toor.png"


const {Column, ColumnGroup} = Table;


export const TableTur = (props) => {

    const {
        getUser, users, loading, toors, getToors, arr, setIntervalState, intervalUser, intervalUserAdmin, intervalToor
    } = props

    useEffect(async () => {
        await getToors()
        getUser()
        clearInterval(intervalUser)
        setIntervalState(setInterval(async () =>{
            await getToors()
            getUser()
        }, 10000))

    }, [])


    const onUpdate = () => {
        getUser()
    }
    const onUpdateToor = async () => {
        await getToors()
        getUser()
    }


    return (
        <>
            {!isEmpty(toors) && <Button onClick={onUpdateToor} type="primary">Обновить</Button>}
            {!isEmpty(toors) ?
                <div className="table-box">
                    <Table loading={loading} expandable={{

                        expandedRowRender: toor => {


                            const humans = toor.users && toor.users.filter(user => user.category === "humans")
                            const bot = toor.users && toor.users.filter(user => user.category === "bot")

                            return (
                                <>
                                    <Button onClick={onUpdate} type="primary">Обновить</Button>
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
                                        {/*<Column title="API" dataIndex="api" key="api"/>*/}
                                        <Column title="Статус" dataIndex="status" key="status"

                                                render={(status) => {

                                                    return (
                                                        <Tag
                                                            color={status === "Активный" ? "green" : status === "Завершен" ? "orange" : "magenta"}>
                                                            {status}
                                                        </Tag>

                                                    )

                                                }

                                                }

                                        />
                                        <Column title="Комментарий" dataIndex="comment" key="comment"
                                                render={(text, record) => {

                                                    if(text==="Обновлен:"){
                                                        return (
                                                            <>
                                                                <span> Обновлен: {moment(record.updatedAt).format("HH:mm DD.MM.YYYY")} </span>
                                                            </>

                                                        )
                                                    }else return (
                                                        <span> {text}</span>

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
                                        {/*<Column title="API" dataIndex="api" key="api"/>*/}
                                        <Column title="Статус" dataIndex="status" key="status"

                                                render={(status) => {

                                                    return (
                                                        <Tag
                                                            color={status === "Активный" ? "green" : status === "Завершен" ? "orange" : "magenta"}>
                                                            {status}
                                                        </Tag>

                                                    )

                                                }

                                                }

                                        />
                                        <Column title="Комментарий" dataIndex="comment" key="comment"
                                                render={(text, record) => {

                                                    if(text==="Обновлен:"){
                                                        return (
                                                            <>
                                                                <span> Обновлен: {moment(record.updatedAt).format("HH:mm DD.MM.YYYY")} </span>
                                                            </>

                                                        )
                                                    }else return (
                                                        <span> {text}</span>

                                                    )



                                                }

                                                }

                                        />


                                    </Table>

                                </>
                            )


                        },
                        defaultExpandedRowKeys: arr

                    }}
                           dataSource={toors}
                    >
                        <Column title="Название" dataIndex="name" key="name"/>
                        <Column showSorterTooltip={false} defaultSortOrder='ascend'
                                sorter={(a, b) => new Date(b.start) - new Date(a.start)} title="Начало" dataIndex="start"
                                key="start"
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
                                        <Tag
                                            color={status === "Активный" ? "green" : status === "Завершен" ? "magenta" : "orange"}>
                                            {status}
                                        </Tag>

                                    )

                                }

                                }
                        />

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