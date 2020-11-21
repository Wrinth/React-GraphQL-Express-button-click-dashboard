import React from "react";
import axios from 'axios';
import { Button } from 'antd';

class Buttons extends React.Component {
    async handleButtonClick(color: String) {
        const axiosInstance = axios.create({
            timeout: 10000,
            withCredentials: true,
            headers: {
              Accept: "application/json",
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json",
            },
        });

        const query = `query SendButtonClick { addBottonClick(input: { color: "${color}" }) { id color clickTime } }`;
        await axiosInstance({
            url: "/graphql",
            method: "post",
            data: {
                query
            },
        });
    }

    render() {
        return (
            <>
                <Button type="primary" onClick={() => this.handleButtonClick("blue")}>Blue Button</Button>
                <Button type="primary" onClick={() => this.handleButtonClick("red")} danger>Red Button</Button>
            </>
        );
    }
}

export default Buttons;