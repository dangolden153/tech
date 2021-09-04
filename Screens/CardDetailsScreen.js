import React, { Component } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, AsyncStorage, Alert, Platform, Picker as PickerAndroid } from 'react-native';
import IosHeaderFix from './../Components/IosheaderFix'
import { RFValue } from 'react-native-responsive-fontsize';
import { Item, Picker, Icon, Label, Input } from 'native-base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { db, auth } from './../config'

export default class CardDetailsScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: "physical",
            currency: undefined,
            range: undefined,
            dailyRate: 0,
            cardValue: 1.00,
            name: '',
            color: 'white',
            cost: '0',
            logoImage: require('./../assets/amazon.png'),
            cardTypeSelected: false,
            cardCountrySelected: false,
            cardRangeSelected: false,
            types: [],
            typePicker: ["physical"],
            countriesPicker: ["USD"],
            rangePicker: ["100"],

            user: null,
            userDp: null
        };
    }

    componentDidMount() {
        auth.onAuthStateChanged(user => {
            console.warn(user)
            if (user) {
                this.setState({ user: user }, () => {
                    this.getUserDP()
                })

            }
        })
        console.warn("params are", this.props.navigation.state.params)
        this.setState(this.props.navigation.state.params, () => {
            AsyncStorage.getItem("cards")
                .then((val) => {
                    let cardObj = JSON.parse(val);
                    if (this.state.type === "gift-card") {
                        cardObj = cardObj["giftCardList"];
                    }
                    else {
                        cardObj = cardObj["cryptocurrencyList"];
                    }
                    // console.warn("CARDS:", cardObj)
                    for (let i = 0; i < cardObj.length; i++) {
                        if (cardObj[i].cardKey === this.state.cardKey) {
                            console.warn("Current Card", cardObj[i])
                            this.setState({ selectedCard: cardObj[i], types: cardObj[i].types ? cardObj[i].types : [] })

                            if (cardObj[i].types) {
                                let typeObj = []
                                for (let j = 0; j < cardObj[i].types.length; j++) {
                                    if (typeObj.indexOf(cardObj[i].types[j].type) < 0) {
                                        typeObj.push(cardObj[i].types[j].type)
                                    }
                                }
                                this.setState({
                                    typePicker: typeObj
                                }, () => {
                                    console.warn("TYPEPICKER", this.state.typePicker)
                                })
                            }



                        }
                    }

                })
                .catch(err => {
                    //display error
                    console.warn("ERROR:", err.message)
                })
        })

    }

    // setValuesAndroid = () => {

    //     const { types } = this.state

    //     this.setState({ type: this.state.typePicker[0], cardTypeSelected: true }, () => {
    //         let countryList = []

    //         for (let i = 0; i < types.length; i++) {
    //             if (types[i].type.toLowerCase() === this.state.typePicker[0].toLowerCase()) {
    //                 if (countryList.indexOf(types[i].currency) < 0) {
    //                     countryList.push(types[i].currency)
    //                 }
    //             }
    //         }

    //         this.setState({
    //             countriesPicker: countryList,
    //         }, () => {


    //             let rangeList = []

    //             for (let i = 0; i < types.length; i++) {
    //                 if (types[i].currency === this.state.countriesPicker[0] && types[i].type.toLowerCase() === this.state.type.toLowerCase()) {
    //                     if (rangeList.indexOf(types[i].range) < 0) {
    //                         rangeList.push(types[i].range)
    //                     }
    //                 }
    //             }


    //             this.setState({
    //                 currency: this.state.countriesPicker[0],
    //                 cardCountrySelected: true,
    //                 rangePicker: rangeList,

    //             }, () => {


    //                 let dailyRate = 0;

    //                 for (let i = 0; i < types.length; i++) {
    //                     if (types[i].range === this.state.rangePicker[0] && types[i].currency === this.state.currency && types[i].type.toLowerCase() === this.state.type.toLowerCase()) {
    //                         dailyRate = types[i].rate
    //                     }
    //                 }



    //                 this.setState({
    //                     range: this.state.rangePicker[0],
    //                     cardRangeSelected: true,
    //                     dailyRate: dailyRate,
    //                     cardValue: 1
    //                 })
    //             })

    //         })
    //     })


    // }

    getUserDP = () => {
        db.ref("/users/" + this.state.user.uid + "/dp").once('value')
            .then(res => {
                this.setState({
                    userDp: res.val()
                }, () => {
                    console.warn(this.state.userDp)
                })
            })
    }


    onValueChange2(value) {
        console.log("here it is", value)
        const { types } = this.state
        let countryList = []

        for (let i = 0; i < types.length; i++) {
            if (types[i].type.toLowerCase() === value.toLowerCase()) {
                if (countryList.indexOf(types[i].currency) < 0) {
                    countryList.push(types[i].currency)
                }
            }
        }

        console.warn(value)


        this.setState({
            type: value,
            cardTypeSelected: true,
            countriesPicker: countryList,
            cardCountrySelected: false,
            cardRangeSelected: false,
            dailyRate: 0,
            currency: undefined,
            range: undefined,
            cardValue: 1
        });
    }

    onValueChange3 = (value) => {
        const { types } = this.state
        let rangeList = []
        console.warn(this.state.type)

        for (let i = 0; i < types.length; i++) {
            if (types[i].currency === value && types[i].type.toLowerCase() === this.state.type.toLowerCase()) {
                if (rangeList.indexOf(types[i].range) < 0) {
                    rangeList.push(types[i].range)
                }
            }
        }

        console.warn(value)

        this.setState({
            currency: value,
            cardCountrySelected: true,
            rangePicker: rangeList,
            cardRangeSelected: false,
            dailyRate: 0,
            range: undefined,
            cardValue: 1

        });
    }

    onValueChange4 = (value) => {
        let dailyRate = 0;
        const { types } = this.state

        for (let i = 0; i < types.length; i++) {

            if (this.state.cardType === "crypto") {
                dailyRate = types[i].rate
            }
            else if (types[i].range === value && types[i].currency === this.state.currency && types[i].type.toLowerCase() === this.state.type.toLowerCase()) {
                dailyRate = types[i].rate
            }
        }
        this.setState({
            range: value,
            cardRangeSelected: true,
            dailyRate: dailyRate,
            cardValue: 1
        });
    }

    getCardType = (check) => {
        if (this.state.types.length > 0) {
            if (Platform.OS === "ios")
                return (
                    <View>
                        <Text style={{ fontSize: RFValue(11), fontWeight: '300' }}>Card Type</Text>
                        <Item picker style={{ marginTop: RFValue(8) }}>
                            <Picker
                                mode="dropdown"
                                iosIcon={<Icon name="arrow-down" />}
                                style={{ width: undefined }}
                                placeholder="Select Card Type"
                                placeholderStyle={{ color: "rgb(110,110,110)" }}
                                placeholderIconColor="rgb(20,20,20)"
                                iosHeader="Card Type"
                                selectedValue={this.state.type}
                                onValueChange={
                                    this.onValueChange2.bind(this)}
                            >
                                {this.state.typePicker.map(value => (<Picker.Item key={value} label={value} value={value} />))}
                            </Picker>
                        </Item>
                    </View>
                )
            else {

                return (
                    <View
                        style={{ width: '100%', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.17)' }}>
                        <Text style={{ fontSize: RFValue(11), fontWeight: '300' }}>Card Type</Text>

                        <Picker
                            selectedValue={this.state.type}
                            style={{ width: '100%', }}
                            onValueChange={this.onValueChange2.bind(this)}

                        >
                            <Picker.Item label={"Select Card Type"} value={null} />
                            {this.state.typePicker.map(value => (<Picker.Item key={value} label={value} value={value} />))}

                        </Picker>
                    </View>
                )
            }
        }
        else {
            return (
                <Text style={{ fontSize: RFValue(11), fontWeight: '300' }}>Card Unavailable at the moment</Text>

            )
        }

    }

    getCardCountry = () => {
        if (Platform.OS === "ios")

            return (
                <View>
                    <Text style={{ fontSize: RFValue(11), fontWeight: '300', marginTop: RFValue(20) }}>Card Country</Text>
                    <Item picker style={{ marginTop: RFValue(8) }}>
                        <Picker
                            mode="dropdown"
                            iosIcon={<Icon name="arrow-down" />}
                            style={{ width: undefined }}
                            placeholder="Select Card Currency"
                            placeholderStyle={{ color: "rgb(110,110,110)" }}
                            placeholderIconColor="rgb(20,20,20)"
                            iosHeader="Currency"
                            selectedValue={this.state.currency}
                            onValueChange={this.onValueChange3.bind(this)}
                        >
                            {this.state.countriesPicker.map(value => (<Picker.Item key={value} label={value} value={value} />))}

                            {/* <Picker.Item label="USD" value="usd" />
                        <Picker.Item label="CAD" value="cad" />
                        <Picker.Item label="UK" value="uk" />
                        <Picker.Item label="AUD" value="aud" /> */}

                        </Picker>
                    </Item>
                </View>
            )
        else {

            return (
                <View
                    style={{ width: '100%', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.17)', marginTop: RFValue(20) }}>
                    <Text style={{ fontSize: RFValue(11), fontWeight: '300' }}>Card Country</Text>

                    <Picker
                        selectedValue={this.state.currency}
                        style={{ width: '100%', }}
                        onValueChange={this.onValueChange3.bind(this)}

                    >
                        <Picker.Item label={"Select Card Currency"} value={null} />

                        {this.state.countriesPicker.map(value => (<Picker.Item key={value} label={value} value={value} />))}

                    </Picker>
                </View>

            )
        }
    }

    getCardRange = () => {
        if (Platform.OS === "ios")
            return (
                <View>
                    <Text style={{ fontSize: RFValue(11), fontWeight: '300', marginTop: RFValue(20) }}>
                        {this.state.cardType === "crypto" ? "Bitcoin" : "Card"} Range
                        </Text>
                    <Item picker style={{ marginTop: RFValue(8) }}>
                        <Picker
                            mode="dropdown"
                            iosIcon={<Icon name="arrow-down" />}
                            style={{ width: undefined }}
                            placeholder="Select Card Range"
                            placeholderStyle={{ color: "rgb(110,110,110)" }}
                            placeholderIconColor="rgb(20,20,20)"
                            iosHeader="Card Range"
                            selectedValue={this.state.range}
                            onValueChange={this.onValueChange4.bind(this)}
                        >

                            {this.state.rangePicker.map(value => (<Picker.Item key={value} label={value} value={value} />))}

                            {/* <Picker.Item label="0-100" value="0-100" />
                        <Picker.Item label="100-200" value="100-200" />
                        <Picker.Item label="200-500" value="200-500" />
                        <Picker.Item label="500-Above" value="500-above" /> */}

                        </Picker>
                    </Item>
                </View>
            )
        else {

            return (
                <View
                    style={{ width: '100%', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.17)', marginTop: RFValue(20) }}>
                    <Text style={{ fontSize: RFValue(11), fontWeight: '300' }}>
                        {/* Card Range */}
                        {this.state.cardType === "crypto" ? "Bitcoin" : "Card"} Range

                        </Text>

                    <Picker
                        selectedValue={this.state.range}
                        style={{ width: '100%', }}
                        onValueChange={this.onValueChange4.bind(this)}

                    >
                        <Picker.Item label={"Select Card Range"} value={null} />

                        {this.state.rangePicker.map(value => (<Picker.Item key={value} label={value} value={value} />))}

                    </Picker>
                </View>
            )
        }
    }

    getCardValue = () => {
        return (
            <View>
                <Text style={{ fontSize: RFValue(11), fontWeight: '300', marginTop: RFValue(20) }}>
                    {/* Card Value */}
                    {this.state.cardType === "crypto" ? "Bitcoin" : "Card"} Value

                    </Text>
                <Item>
                    <Input placeholder="Amount"
                        placeholderTextColor="rgb(110,110,110)"
                        style={{ paddingLeft: RFValue(20) }}
                        keyboardType="numeric"
                        returnKeyType="done"
                        value={this.state.cardValue}
                        onChangeText={(e) => { this.setState({ cardValue: e }) }}
                    />
                </Item>
            </View>
        )
    }


    startTrade = () => {
        const { type, currency, range, cardValue } = this.state;

        if (this.state.cardType === "crypto") {
            if (!range || cardValue < 0 || !cardValue) {
                Alert.alert("Error", "Please fill all the fields correctly.");
                return;
            }
        }
        else if (!type || !currency || !range || cardValue < 0 || !cardValue) {
            Alert.alert("Error", "Please fill all the fields correctly.");
            return;
        }

        let calculatedValue = "N" + parseFloat(Math.round((this.state.cardValue * this.state.dailyRate) * 100) / 100).toFixed(2);

        Alert.alert(
            'Confirmation',
            'Are you sure you want to trade ' + this.state.name + " card for " + calculatedValue + "?",
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                { text: 'OK', onPress: () => this.executeTrade() },
            ],
        );
    }

    executeTrade = () => {
        db.ref('/tradeRequests/' + this.state.user.uid).push({
            startDate: new Date().toISOString(),
            readByAdmin: false,
            read: true,
            requestType: 'trade',
            cardName: this.state.name,
            status: 'Pending',
            color: this.state.color,
            logoImage: this.state.logoImage.uri,
            cost: parseFloat(Math.round((this.state.cardValue * this.state.dailyRate) * 100) / 100).toFixed(2),
            type: this.state.type,
            currency: this.state.cardType === "crypto" ? "USD" : this.state.currency,
            range: this.state.range,
            cardValue: this.state.cardValue,
            updateTime: new Date().getTime(),
            dp: this.state.userDp ? this.state.userDp : null,
            dailyRate: this.state.dailyRate ? this.state.dailyRate : 0

        }).then(res => {
            console.warn(res.key)
            let chatKey = res.key

            db.ref('/requestLists/' + res.key)
                .update({
                    lastUpdateTime: new Date().getTime(),
                    status: "Pending",
                    unreadMessages: 1,
                    uid: this.state.user.uid,
                    type: "trade"
                }).then(res => {
                    Alert.alert("Success", "Trade Request has been generated successfully. Kindly check chats to continue with the request.")
                    // this.state.switchToChat()

                    // this.props.navigation.goBack()
                    console.warn("Here is the Key after trade", res);
                    // this.props.navigation.navigate('Chat', {
                    //     chatKey: chatKey,

                    // })
                    this.props.navigation.navigate('Chat', {
                        status: "pending",
                        company: this.state.name,
                        cost: parseFloat(Math.round((this.state.cardValue * this.state.dailyRate) * 100) / 100).toFixed(2),
                        logo: this.state.logoImage.uri,
                        cardValue: this.state.cardValue,
                        chatKey: chatKey,
                        color: this.state.color,
                        dailyRate: this.state.dailyRate ? this.state.dailyRate : 0

                    })
                    this.setState({
                        type: "physical",
                        currency: undefined,
                        range: undefined,
                        dailyRate: 0,
                        cardValue: 1.00,
                        name: '',
                        color: 'white',
                        cost: '0',
                        logoImage: require('./../assets/amazon.png'),
                        cardTypeSelected: false,
                        cardCountrySelected: false,
                        cardRangeSelected: false,
                        types: [],
                        typePicker: ["physical"],
                        countriesPicker: ["USD"],
                        rangePicker: ["100"],
                        user: null,
                        userDp: null
                    })
                })
                .catch(err => {
                    console.warn("err", err.message)
                    Alert.alert("Error", "Failed to generate trade request, please try again later.")

                })

        })
            .catch(err => {
                console.warn(err.message)

                Alert.alert("Error", "Failed to generate trade request, please try again later.")
            })

    }

    render() {
        return (
            <View style={{ flex: 1, width: '100%' }}>
                <IosHeaderFix />
                <View style={{ width: '100%', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)', paddingBottom: RFValue(10), paddingTop: RFValue(3), marginBottom: RFValue(10) }}>
                    <Image source={require('./../assets/logo.png')} style={{ height: 35, width: '100%', }} resizeMode="contain"
                    />
                </View>
                <View style={{ flexDirection: 'row', paddingHorizontal: RFValue(20), paddingTop: RFValue(17), justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: RFValue(13) }}>Trade {this.state.cardType === "crypto" ? "bitcoin" : "gift cards"}</Text>
                    <TouchableOpacity onPress={
                        () => {
                            this.props.navigation.goBack();
                        }
                    }>
                        <Icon name="close" />
                    </TouchableOpacity>
                </View>
                <View style={[styles.card, { backgroundColor: this.state.color, shadowColor: this.state.color }]}>
                    <View style={{ padding: RFValue(19) }}>
                        <Image source={this.state.logoImage} style={{ height: 30, width: 30 }}
                            resizeMode="contain" />

                        <View style={{ paddingTop: RFValue(37) }}>
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: RFValue(15) }}>{this.state.name}</Text>
                            <View style={{ width: 20, borderBottomColor: 'rgba(255,255,255,0.3)', borderBottomWidth: 1, paddingTop: RFValue(3) }}></View>
                            <Text style={{ paddingTop: RFValue(7), color: 'white', fontSize: RFValue(11) }}>{this.state.cost ? this.state.cost + "/$" : ""}</Text>
                        </View>
                    </View>
                    <Image
                        source={this.state.logoImage}
                        style={{ flex: 1, height: '100%', opacity: 0.1 }} />

                </View>
                <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                    <View style={{ width: RFValue(70) }}>
                        <Text style={styles.detailsText}>{this.state.cardType === "crypto" ? "Bitcoin" : "Card"} Details</Text>
                    </View>
                    <KeyboardAwareScrollView
                        contentContainerStyle={{ padding: RFValue(15), paddingRight: 0 }}
                        style={{ flex: 1, }}>

                        {this.state.cardType === "crypto" ? this.state.cardTypeSelected = true : this.getCardType()}

                        {this.state.cardType === "crypto" ? this.state.cardCountrySelected = true : this.state.cardTypeSelected ? this.getCardCountry() : null}

                        {this.state.cardCountrySelected ? this.getCardRange() : null}

                        {this.state.cardRangeSelected ? this.getCardValue() : null}

                    </KeyboardAwareScrollView>

                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: RFValue(25), paddingLeft: RFValue(20), }}>
                    <View>
                        <Text>Cost</Text>
                        <Text style={{ fontWeight: 'bold', fontSize: RFValue(19), paddingTop: RFValue(2) }}>
                            N{parseFloat(Math.round((this.state.cardValue * this.state.dailyRate) * 100) / 100).toFixed(2)}
                        </Text>
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={[styles.purchaseButton, { backgroundColor: this.state.color, opacity: this.state.cardRangeSelected ? 1 : 0.3 }]}
                        disabled={this.state.cardRangeSelected ? false : true}
                        onPress={() => { this.startTrade() }}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: RFValue(13) }} >TRADE</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    card: {
        margin: RFValue(25),
        backgroundColor: 'rgb(242,157,56)',
        borderRadius: RFValue(10),
        marginHorizontal: RFValue(40),
        flexDirection: 'row',


        shadowColor: "rgba(242,157,56,0.8)",
        shadowOffset: {
            width: 0,
            height: 11,
        },
        shadowOpacity: 0.57,
        shadowRadius: 15.19,

        elevation: 23,
    },
    purchaseButton: {
        padding: RFValue(20),
        backgroundColor: 'red',
        paddingHorizontal: RFValue(40),
        borderTopLeftRadius: 7,
        borderBottomLeftRadius: 7
    },
    detailsText: {
        transform: [{ rotate: '270deg' }],
        width: RFValue(85),
        fontWeight: '400',
        opacity: 0.3

    }
})