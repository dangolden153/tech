import React, { Component } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Switch } from 'react-native';
import ChatCard from '../Components/ChatCard';
import { db, auth } from './../config'
import { RFValue } from 'react-native-responsive-fontsize';

export default class ChatMain extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            loading: true,
            chatList: [],
            showDeleted: false,
            hasDeleted: false
        };
    }


    componentDidMount() {
        auth.onAuthStateChanged(user => {
            console.warn(user)
            if (user) {
                this.setState({ user: user })
                this.fetchConvos()
            }
        })
    }

    getMonth = (month) => {
        if (month === 0) {
            return "Jan"
        }
        else if (month === 1) {
            return "Feb"
        }
        else if (month === 2) {
            return "Mar"
        }
        else if (month === 3) {
            return "Apr"
        }
        else if (month === 4) {
            return "May"
        }
        else if (month === 5) {
            return "June"
        }
        else if (month === 6) {
            return "July"
        }
        else if (month === 7) {
            return "Aug"
        }
        else if (month === 8) {
            return "Sept"
        }
        else if (month === 9) {
            return "Oct"
        }
        else if (month === 10) {
            return "Nov"
        }
        else if (month === 11) {
            return "Dec"
        }
    }

    fetchConvos = () => {
        //Sort by time
        db.ref('/tradeRequests/' + this.state.user.uid).orderByChild("updateTime").on('value', (snap) => {

            let chatList = []
            snap.forEach(request => {
                let startDate = new Date(request.val().startDate);
                let datePersonalized = startDate.getDate() + " " + this.getMonth(startDate.getMonth()) + " " + startDate.getFullYear()
                console.warn("REQUEST", request)

                console.warn(request.val().messages)
                let lastMessage = ""
                if (request.val().messages) {
                    const messageKeys = Object.keys(request.val().messages)
                    lastMessage = request.val().messages[messageKeys[messageKeys.length - 1]].message
                }

                chatList.push({
                    name: request.val().cardName ? request.val().cardName : "Withdrawal",
                    status: request.val().status,
                    color: request.val().color,
                    logo: { uri: request.val().logoImage },
                    cost: request.val().cost,
                    date: datePersonalized,
                    unread: !request.val().read,
                    cardValue: request.val().cardValue,
                    dailyRate: request.val().dailyRate,
                    chatKey: request.key,
                    message: lastMessage ? lastMessage : "",
                    deleted: request.val().deleted
                })
                console.warn(chatList)
                if (request.val().deleted === true) {
                    this.setState({ hasDeleted: true })
                }
            })
            chatList = chatList.reverse()
            this.setState({
                loading: false,
                chatList: chatList
            }, () => {
                console.warn(this.state.chatList)
            })

        })
    }


    render() {
        return (
            <ScrollView>

                {this.state.loading ?
                    (
                        <View style={{ padding: 20 }}>
                            <ActivityIndicator size="large" color="black" />
                            <Text style={{ textAlign: 'center', padding: 15, }}>Please wait while we fetch chats for you</Text>
                        </View>
                    )
                    :
                    this.state.chatList.length < 1 ?
                        (
                            <Text style={{ textAlign: 'center', padding: 15, }}>You have no existing chats</Text>

                        )
                        :
                        null
                }
                {this.state.chatList.length > 0 && this.state.hasDeleted === true ?
                    (
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', flex: 1, paddingVertical: RFValue(8), paddingRight: RFValue(15) }}>
                            <Text style={{ paddingRight: RFValue(10), fontSize: RFValue(12) }}>Show Deleted?</Text>
                            <Switch value={this.state.showDeleted} onValueChange={(val) => { this.setState({ showDeleted: val }, () => { console.warn(this.state.showDeleted) }) }} />
                        </View>
                    )
                    :
                    null}

                {this.state.chatList.map((chat, index) => {
                    if (!chat.deleted) {
                        return (
                            <ChatCard
                                company={chat.name}
                                status={chat.status}
                                cost={chat.cost}
                                date={chat.date}
                                message={chat.message}
                                logo={chat.logo}
                                unread={chat.unread}
                                cardValue={chat.cardValue}
                                dailyRate={chat.dailyRate}
                                color={chat.color}
                                chatKey={chat.chatKey}
                            />
                        )
                    }
                    else if (this.state.showDeleted === true) {
                        // <ChatCard
                        //     company={chat.name}
                        //     status={"Deleted"}
                        //     cost={chat.cost}
                        //     date={chat.date}
                        //     message={chat.message}
                        //     logo={chat.logo}
                        //     unread={chat.unread}
                        //     cardValue={chat.cardValue}
                        //     dailyRate={chat.dailyRate}
                        //     color={chat.color}
                        //     chatKey={chat.chatKey}
                        // />
                        return (
                            <ChatCard
                                company={chat.name}
                                status={"Deleted"}
                                cost={chat.cost}
                                date={chat.date}
                                message={chat.message}
                                logo={chat.logo}
                                unread={chat.unread}
                                cardValue={chat.cardValue}
                                dailyRate={chat.dailyRate}
                                color={chat.color}
                                chatKey={chat.chatKey}
                            />
                        )
                    }

                })}


                {/* <ChatCard
                    company="Amazon"
                    status="Pending"
                    cost="242.00"
                    date="20 Aug 2019"
                    message="Hello, are you still there? "
                    logo={require('./../assets/amazon.png')}
                    unread={true} />


                <ChatCard
                    company="Apple"
                    status="Success"
                    cost="300.00"
                    date="19 Aug 2019"
                    message="Your Payment has been processed. "
                    logo={require('./../assets/apple.png')}
                />

                <ChatCard
                    company="Apple"
                    status="Failed"
                    cost="300.00"
                    date="19 Aug 2019"
                    message="Sorry,your Payment can't been processed. "
                    logo={require('./../assets/apple.png')}
                    unread={true} /> */}


            </ScrollView>
        );
    }
}
