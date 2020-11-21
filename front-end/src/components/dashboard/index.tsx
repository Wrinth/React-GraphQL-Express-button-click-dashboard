import React from "react";
import axios from 'axios';
import {
	Chart,
	Tooltip,
	Interval,
	Interaction
} from "bizcharts";

const scale = {
	datetime: {
		alias: '时间',
        // type: 'log',
        min: 0,
        max: 8
	},
	count: {
		alias: '点击量',
        // type: 'log',
        min: 0,
        max: 8
    }
}

interface IMyComponentState {
    clicks: Array<{color: string, datetime: string, count: number}>,
    curTime: String
}

class Dashboard extends React.Component<{}, IMyComponentState> {
    constructor(props: any) {
        super(props);
        this.state = {
            clicks: [
                { color: 'red', datetime: '11/21/2020, 3:19:21 PM.', count: 0 },
                { color: 'blue', datetime: '11/21/2020, 3:19:21 PM.', count: 0 },
                { color: 'red', datetime: '11/21/2020, 3:19:22 PM.', count: 0 },
                { color: 'blue', datetime: '11/21/2020, 3:19:22 PM.', count: 0 },
                { color: 'red', datetime: '11/21/2020, 3:19:23 PM.', count: 0 },
                { color: 'blue', datetime: '11/21/2020, 3:19:23 PM.', count: 0 },
                { color: 'red', datetime: '11/21/2020, 3:19:24 PM.', count: 0 },
                { color: 'blue', datetime: '11/21/2020, 3:19:24 PM.', count: 0 },
                { color: 'red', datetime: '11/21/2020, 3:19:25 PM.', count: 0 },
                { color: 'blue', datetime: '11/21/2020, 3:19:25 PM.', count: 0 },
                { color: 'red', datetime: '11/21/2020, 3:19:26 PM.', count: 0 },
                { color: 'blue', datetime: '11/21/2020, 3:19:26 PM.', count: 0 },
                { color: 'red', datetime: '11/21/2020, 3:19:27 PM.', count: 0 },
                { color: 'blue', datetime: '11/21/2020, 3:19:27 PM.', count: 0 },
                { color: 'red', datetime: '11/21/2020, 3:19:28 PM.', count: 0 },
                { color: 'blue', datetime: '11/21/2020, 3:19:28 PM.', count: 0 },
                { color: 'red', datetime: '11/21/2020, 3:19:29 PM.', count: 0 },
                { color: 'blue', datetime: '11/21/2020, 3:19:29 PM.', count: 0 },
                { color: 'red', datetime: '11/21/2020, 3:19:30 PM.', count: 0 },
                { color: 'blue', datetime: '11/21/2020, 3:19:30 PM.', count: 0 },
                { color: 'red', datetime: '11/21/2020, 3:19:31 PM.', count: 0 },
                { color: 'blue', datetime: '11/21/2020, 3:19:31 PM.', count: 0 },
                { color: 'red', datetime: '11/21/2020, 3:19:32 PM.', count: 0 },
                { color: 'blue', datetime: '11/21/2020, 3:19:32 PM.', count: 0 },
                { color: 'red', datetime: '11/21/2020, 3:19:33 PM.', count: 0 },
                { color: 'blue', datetime: '11/21/2020, 3:19:33 PM.', count: 0 },
                { color: 'red', datetime: '11/21/2020, 3:19:34 PM.', count: 0 },
                { color: 'blue', datetime: '11/21/2020, 3:19:34 PM.', count: 0 },
                { color: 'red', datetime: '11/21/2020, 3:19:35 PM.', count: 0 },
                { color: 'blue', datetime: '11/21/2020, 3:19:35 PM.', count: 0 },
            ],
            curTime : ""
        };
    }

    async loadClickRecords() {
        const axiosInstance = axios.create({
            timeout: 10000,
            withCredentials: true,
            headers: {
              Accept: "application/json",
              "Access-Control-Allow-Origin": "*",
              "Content-Type": "application/json",
            },
        });

        const query = "query ListButtonClicks { listBottonClicks { id color clickTime } }";

        const response = await axiosInstance({
            url: "/graphql",
            method: "post",
            data: {
                query
            },
        });

        if (response.data && response.data.data && response.data.data.listBottonClicks) {
            const last10SecsClickRecords = [];
            for (let count = 14; count >= 0; count--) {
                const tempTimeString = (new Date(Date.now() - (count * 1000))).toLocaleString();
                const foundRed = response.data.data.listBottonClicks.filter(
                    (click: { clickTime: string; color: string; }) => {
                        return new Date(click.clickTime).toLocaleString() === tempTimeString && click.color === "red";
                    }
                )
                last10SecsClickRecords.push({
                    color: "red",
                    datetime: tempTimeString,
                    count: foundRed ? foundRed.length : 0
                })
                const foundBlue = response.data.data.listBottonClicks.filter(
                    (click: { clickTime: string; color: string; }) => {
                        return new Date(click.clickTime).toLocaleString() === tempTimeString && click.color === "blue"
                    }
                )
                last10SecsClickRecords.push({
                    color: "blue",
                    datetime: tempTimeString,
                    count: foundBlue ? foundBlue.length : 0
                })
            }
            this.setState({
                clicks: last10SecsClickRecords
            });
        }
    }
    
    async componentDidMount() {
        this.setState({ curTime: new Date().toLocaleString() })
        await this.loadClickRecords()

        await setInterval(async () => {
            this.setState({
                curTime : new Date().toLocaleString()
            })
            await this.loadClickRecords()
        },2000);
    }
  
    render() {
        return (
            <>
                <h2>Click Dashboard</h2>
                <Chart animate={false} height={400} padding="auto" data={this.state.clicks} scale={scale} autoFit filter={[
                    ['count', (val: null) => val != null]
                ]}>
                    <Interval
                        adjust={[
                            {
                                type: 'dodge',
                                marginRatio: 0,
                            },
                        ]}
                        color={["color", ['#FF0000', '#0000FF']]}
                        position="datetime*count"
                    />
                    <Tooltip shared />
                    <Interaction type="active-region"/>
                </Chart>
            </>
        );
    }
}

export default Dashboard;