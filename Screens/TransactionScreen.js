import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import IosHeaderFix from './../Components/IosheaderFix'
import TransactionCard from '../Components/TransactionCard';
import { db, auth } from './../config'

export default class TransactionScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: 0,
            fetching: true,
            transactions: [
                // { name: 'Amazon', cost: '413.00', date: '22 Aug 2019', logo: require('./../assets/amazon.png'), success: true },
                // { name: 'Apple', cost: '2413.00', date: '21 Aug 2019', logo: require('./../assets/apple.png'), success: false },
                // { name: 'Bitcoin', cost: '213.00', date: '19 Aug 2019', logo: require('./../assets/bitcoin.png'), success: true },
                // { name: 'iTunes', cost: '2133.00', date: '17 Aug 2019', logo: require('./../assets/apple.png'), success: true },
                // { name: 'SPAR', cost: '3322.00', date: '16 Aug 2019', logo: require('./../assets/spar.png'), success: false },
            ],
            successful: 0,
            failed: 0,
            userName: "",
            userBalance: 0,
            userTokens: 0,

            user: null

        };
    }
    componentDidMount() {
        auth.onAuthStateChanged(user => {
            if (user !== null) {
                this.setState({
                    user: user
                }, () => {
                    this.getUserDetails();
                    this.getTransactions();
                })
            }
        })
    }

    getUserDetails = () => {
        db.ref('/users/' + this.state.user.uid).on('value', (snap) => {
            console.warn(snap.val())
            this.setState({
                userName: snap.val().name,
                userBalance: snap.val().walletAmount ? snap.val().walletAmount : 0,
                userTokens: snap.val().rewardTokens ? snap.val().rewardTokens : 0
            })

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

    getDate(date) {
        let d = new Date(date)
        let dd = d.getDate();
        let mm = this.getMonth(d.getMonth())
        let yy = d.getFullYear()

        //return d.getHours() + ":" + d.getMinutes() + "   " + dd + " " + mm + " " + yy
        return dd + " " + mm + " " + yy

    }

    getTransactions = () => {
        db.ref('/tradeRequests/' + this.state.user.uid).orderByChild('updateTime').on('value', (snap) => {
            let transactions = []
            let successCount = 0;
            let failCount = 0;
            snap.forEach(transaction => {
                console.warn(transaction.val())
                if (transaction.val().status !== "Pending") {
                    transactions.push({
                        name: transaction.val().cardName ? transaction.val().cardName : "Withdrawal",
                        cost: transaction.val().cost ?
                            transaction.val().cost
                            :
                            (
                                (transaction.val().walletAmount ?
                                    (transaction.val().walletAmount)
                                    :
                                    "0"
                                )
                                + "   " + (transaction.val().rewardTokens ?
                                    transaction.val().rewardTokens + "tk"
                                    :
                                    "0tk"
                                )
                            ),
                        date: this.getDate(transaction.val().updateTime),
                        logo: { uri: transaction.val().logoImage },
                        success: transaction.val().status === "Successful" ? true : false,
                        transactionKey: transaction.key,
                        deletedTransaction: transaction.val().deletedTransaction
                    })
                    if (transaction.val().status === "Successful") {
                        successCount++;
                    }
                    else {
                        failCount++;
                    }
                }
            })
            transactions = transactions.reverse()
            this.setState({
                transactions: transactions,
                successful: successCount,
                failed: failCount
            })
            console.warn(snap.val())
            this.setState({
                fetching: false
            })
        })
    }

    deleteTransaction = (key) => {
        console.warn(key)
        console.warn("Delet clicked")
        let user = auth.currentUser;
        // db.ref('/tradeRequests/' + user.uid + "/" + key).once('value')
        //     .then(snap => {
        //         console.warn(snap.val())
        //     })
        db.ref('/tradeRequests/' + user.uid + "/" + key).update({
            deletedTransaction: true
        })
            .then(() => {
                Alert.alert("Success", "The transaction has been deleted successfully.")

            })
            .catch(err => {
                Alert.alert("Error", "There was an error deleting this transaction,please try again later.")
            })
    }

    render() {
        return (
            <View style={{ flex: 1, width: '100%', }}>
                <View style={styles.card}>
                    <View style={{ flex: 1 }}>
                        <IosHeaderFix />

                        <Image source={require('./../assets/logo.png')} style={{ height: 32, width: '100%', tintColor: 'white' }}
                            resizeMode="contain"

                        />
                        <View style={{ paddingTop: RFValue(30), }}>
                            <View style={{ justifyContent: 'space-between', width: '100%', flexDirection: 'row' }}>
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: RFValue(15) }}>{this.state.userName}</Text>
                            </View>
                            <View style={{ justifyContent: 'space-between', width: '100%', flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: 20, borderBottomColor: 'rgba(255,255,255,0.4)', borderBottomWidth: 1, paddingTop: RFValue(3) }}></View>
                                <Text style={{ color: 'white', fontSize: RFValue(9) }}>Successful Transactions: {this.state.successful}</Text>
                            </View>
                            <View style={{ justifyContent: 'space-between', width: '100%', flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ paddingTop: RFValue(7), color: 'white', fontSize: RFValue(11) }}>N {this.state.userBalance}</Text>
                                <View>
                                    <Text style={{ color: 'white', fontSize: RFValue(9) }}>Failed Transactions: {this.state.failed}</Text>
                                    <Text style={{ color: 'white', fontSize: RFValue(9), textAlign: 'right' }}>Reward Tokens: {this.state.userTokens}</Text>

                                </View>
                            </View>
                        </View>
                    </View>
                    {/* <Image
                        source={require('./../assets/logo.png')}
                        style={{
                            flex: 1, height: '60%', opacity: 0.05, tintColor: 'white', transform: [{ rotate: '20deg' }, { translateY: 15 }, { translateX: 40 }],
                        }} resizeMode="contain" /> */}

                </View>
                <View style={{ backgroundColor: '#E8E9F3', flexDirection: 'row', borderRadius: RFValue(3), marginHorizontal: RFValue(25), marginTop: RFValue(-15), zIndex: 10000 }}>
                    <TouchableOpacity
                        onPress={() => {
                            this.setState({ selected: 0 })
                        }}
                        style={{ flex: 1, borderRadius: RFValue(3), justifyContent: 'center', alignItems: 'center', paddingVertical: RFValue(8), backgroundColor: this.state.selected === 0 ? "#D1CCDC" : "transparent" }}>
                        <Text>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            this.setState({ selected: 1 })
                        }}
                        style={{ flex: 1, borderRadius: RFValue(3), justifyContent: 'center', alignItems: 'center', paddingVertical: RFValue(8), backgroundColor: this.state.selected === 1 ? "#D1CCDC" : "transparent" }}>
                        <Text>Successful</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            this.setState({ selected: 2 })
                        }}
                        style={{ flex: 1, borderRadius: RFValue(3), justifyContent: 'center', alignItems: 'center', paddingVertical: RFValue(8), backgroundColor: this.state.selected === 2 ? "#D1CCDC" : "transparent" }}>
                        <Text>Failed</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView
                    contentContainerStyle={{ padding: RFValue(40) }}
                    style={{ margin: RFValue(-20), zIndex: 1 }}>
                    {this.state.transactions.length < 1 ?
                        (
                            this.state.fetching ? (
                                <View>
                                    <ActivityIndicator size="large" color="black" style={{ marginTop: 20 }} />
                                    <Text style={{ padding: 15, textAlign: 'center' }}>Please wait while we fetch your transactions</Text>
                                </View>
                            )
                                :
                                (
                                    <View>
                                        <Text style={{ padding: 15, textAlign: 'center' }}>You have no transactions at the moment</Text>
                                    </View>
                                )
                        )
                        :
                        null
                    }
                    {this.state.transactions.map((transaction, index) => {
                        if (this.state.selected === 0 || (this.state.selected === 1 && transaction.success === true) || (this.state.selected === 2 && transaction.success === false)) {
                            if (!transaction.deletedTransaction) {

                                return (
                                    <TransactionCard success={transaction.success} company={transaction.name} cost={transaction.cost} date={transaction.date} logo={transaction.logo}
                                        deleteTransaction={() => { this.deleteTransaction(transaction.transactionKey) }} />

                                )
                            }
                        }


                    })}

                </ScrollView>
            </View >
        );
    }
}

const styles = StyleSheet.create({
    card: {
        padding: RFValue(15),
        backgroundColor: '#2D3047',
        flexDirection: 'row',
        paddingBottom: RFValue(40),
        zIndex: 10000,

        // borderRadius: RFValue(4)

    }
})
