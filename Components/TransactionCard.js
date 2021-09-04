import React, { Component } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Swipeout from 'react-native-swipeout';
import { Icon } from 'native-base';

export default class TransactionCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    deleteTransaction = () => {
        this.props.deleteTransaction()
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
                onPress: () => { this.deleteTransaction() }
            }
        ]
        return (
            <View style={{
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 1,
                },
                shadowOpacity: 0.22,
                shadowRadius: 2.22,

                elevation: 3,
                marginTop: RFValue(12)
            }}>
                <Swipeout right={swipeoutBtns} autoClose={true} disabled={this.props.status === "Deleted" ? true : false} >

                    <View style={styles.container}>
                        <View style={[styles.circle, { backgroundColor: this.props.success ? '#4caf50' : '#f44336' }]}>
                            <Image source={this.props.logo} style={{ height: 20, width: 20, }}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                                <Text numberOfLines={1} ellipsizeMode="tail" style={{ fontWeight: 'bold', flex: 1, paddingRight: RFValue(10), }}>{this.props.company}</Text>
                                <Text style={{ fontWeight: 'bold', color: this.props.success ? '#4caf50' : '#f44336' }}>N {this.props.cost}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingTop: RFValue(4) }}>
                                <Text numberOfLines={1} ellipsizeMode="tail" style={{ flex: 1, paddingRight: RFValue(10), fontSize: RFValue(10) }}></Text>
                                <Text style={{ fontSize: RFValue(10) }}>{this.props.date}</Text>
                            </View>
                        </View>
                    </View>
                </Swipeout>
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
    }
})