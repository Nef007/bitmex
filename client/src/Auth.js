import * as React from 'react';
import {useEffect, useState} from 'react';
import {connect} from "react-redux";
import { isEmptyAdmin, login, register} from "./redux/auth-reducer";
import {Button, Form, Input} from "antd";
import { LoopCircleLoading } from 'react-loadingg';



const Auth = (props) => {

    const {
         login, loading,  isAdmin, register, isEmptyAdmin
    } = props



    useEffect( () => {
        isEmptyAdmin()
    },[isEmptyAdmin])



const onRegister=(value)=>{
    register(value)
}

const onLogin=(value)=>{
    login(value)
}

if(loading){
    return  <LoopCircleLoading color="#960000" />
}
    return (

        <div className="wrapper">
            <header>
                <div className="container">
                    <div className="head">




                    </div>


                </div>
            </header>
            <section>

                <div className='container'>
                    <div className='content'>
                        {isAdmin ?
                            <div>
                                <h2 className="center">Авторизация</h2>
                                <Form
                                    name="basic"
                                    labelCol={{ span: 11 }}
                                    wrapperCol={{ span: 5 }}
                                    initialValues={{ remember: true }}
                                    onFinish={onLogin}

                                    autoComplete="off"
                                >
                                    <Form.Item
                                        label="Username"
                                        name="email"
                                        rules={[{ required: true, message: 'Please input your username!' }]}
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        label="Password"
                                        name="password"
                                        rules={[{ required: true, message: 'Please input your password!' }]}
                                    >
                                        <Input.Password />
                                    </Form.Item>

                                    <Form.Item wrapperCol={{ offset: 11, span: 5 }}>
                                        <Button type="primary" htmlType="submit">
                                          Войти
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </div>
                            :
                            <div>
                                <h2 className="center">Регистрация</h2>

                                <Form
                                    name="basic"
                                    labelCol={{ span: 11 }}
                                    wrapperCol={{ span: 5}}
                                    initialValues={{ remember: true }}
                                    onFinish={onRegister}

                                    autoComplete="off"
                                >
                                    <Form.Item
                                        label="Username"
                                        name="email"
                                        rules={[{ required: true, message: 'Please input your username!' }]}
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item
                                        label="Password"
                                        name="password"
                                        rules={[{ required: true, message: 'Please input your password!' }]}
                                    >
                                        <Input.Password />
                                    </Form.Item>

                                    <Form.Item wrapperCol={{ offset: 11, span: 5 }}>
                                        <Button type="primary" htmlType="submit">
                                           Регистрация
                                        </Button>
                                    </Form.Item>
                                </Form>

                            </div>}
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
        isAdmin: state.authState.isAdmin,
        loading: state.authState.loading,
    }
}
export default connect(mapStateToProps, {register, isEmptyAdmin, login})(Auth)