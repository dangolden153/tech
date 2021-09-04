import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { withNavigation } from 'react-navigation';
import Swipeout from 'react-native-swipeout';
import { Icon } from 'native-base';
import { db, auth } from './../config'
class ChatCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    deleteChat = () => {
        console.warn("Delete called for " + this.props.chatKey)
        let user = auth.currentUser;
        db.ref('/tradeRequests/' + user.uid + "/" + this.props.chatKey).update({
            deleted: true
        })
            .then(() => {
                Alert.alert("Success", "The chat has been deleted successfully.")

            })
            .catch(err => {
                Alert.alert("Error", "There was an error deleting this chat,please try again later.")
            })
        // db.ref('/tradeRequests/' + user.uid + "/" + this.props.chatKey).once('value')
        //     .then(res => {
        //         console.warn(res.val())
        //     })
        //     .catch(err => {
        //         Alert.alert("Error", "There was an error deleting this chat,please try again later.")
        //     })
    }

    render() {
        var swipeoutBtns = [
            {
                // text: 'Delete',
                backgroundColor: '#f44336',
                component:
                    <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <Icon type="EvilIcons" name="trash"
                            style={{ fontSize: RFValue(38), color: 'white' }}
                        />
                    </View>,
                type: "delete",
                onPress: () => { this.deleteChat() }
            }
        ]
        return (
            <View style={{
                marginVertical: RFValue(12),
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,

                elevation: 3,

            }}>
                <Swipeout right={swipeoutBtns} autoClose={true} disabled={this.props.status === "Deleted" ? true : false} >

                    <TouchableOpacity style={styles.container} activeOpacity={0.7} onPress={() => {
                        this.props.navigation.navigate('Chat', {
                            status: this.props.status,
                            company: this.props.company,
                            cost: this.props.cost,
                            logo: this.props.logo,
                            cost: this.props.cost,
                            cardValue: this.props.cardValue,
                            chatKey: this.props.chatKey,
                            color: this.props.color,
                            dailyRate: this.props.dailyRate

                        })
                    }}>

                        <View style={[styles.circle, { backgroundColor: this.props.status === "Pending" ? '#00bcd4' : this.props.status === "Successful" ? '#4caf50' : '#f44336' }]}>
                            <Image source={this.props.logo} style={{ height: 20, width: 20, }}
                                resizeMode="contain"
                            />
                            {this.props.unread ? (<View style={styles.unreadCircle}></View>) : (null)}
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                                <Text numberOfLines={1} ellipsizeMode="tail" style={{ fontWeight: 'bold', flex: 1, paddingRight: RFValue(10), }}>{this.props.company} ({this.props.status})</Text>
                                <Text style={{ fontWeight: 'bold', color: this.props.status === "Pending" ? '#00bcd4' : this.props.status === "Successful" ? '#4caf50' : '#f44336' }}>{this.props.cost ? ("N " + this.props.cost) : ""}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingTop: RFValue(4) }}>
                                <Text numberOfLines={1} ellipsizeMode="tail" style={{ flex: 1, paddingRight: RFValue(10), fontSize: RFValue(10) }}>{this.props.message}</Text>
                                <Text style={{ fontSize: RFValue(10) }}>{this.props.date}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Swipeout >
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        padding: RFValue(8),
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    circle: {
        height: RFValue(40),
        width: RFValue(40),
        borderRadius: RFValue(20),
        // backgroundColor: 'rgba(45, 48, 71,0.1)',
        margin: RFValue(10),
        alignItems: 'center',
        justifyContent: 'center',
    },
    unreadCircle: {
        position: 'absolute',
        right: RFValue(1),
        bottom: RFValue(1),
        height: RFValue(10),
        width: RFValue(10),
        borderRadius: RFValue(5),
        backgroundColor: '#607D8B'
    }
})


export default withNavigation(ChatCard)