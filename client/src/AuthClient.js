
import * as React from 'react';
import {Button, Form, Input, Select} from "antd";
const {Option} = Select;


export const AuthClient = (props) => {

    const {
        registerUser, toors, loadingUser
    } = props

    const onFinish = (values) => {
        registerUser(values);
    };


        return (
            <Form
                name="basic"
                labelCol={{ span: 11 }}
                wrapperCol={{ span: 5}}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                autoComplete="off"
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

        );


};