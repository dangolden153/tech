import React, { Component } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ImageBackground, Dimensions, AsyncStorage } from 'react-native';
import { Item, Input, Icon } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import Card from '../Components/Card';
import { withNavigation } from 'react-navigation';
import { auth, db } from './../config'
import firebase from 'react-native-firebase'

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            giftCards: true,
            loading: true,
            giftCardList: [],
            cryptocurrencyList: [],

            user: null,

            featuredCard: null,

            searchKeyword: ""
        };
        this.cardScroll = React.createRef();

    }
    screenWidth = Dimensions.get('window').width
    xOffset = 0;

    handleScroll = (event) => {
        console.warn("event.nativeEvent.contentOffset.x", event.nativeEvent.contentOffset.x);
    }


    componentDidMount() {
        AsyncStorage.getItem("cards")
            .then((val) => {
                console.warn("cards", val)
                this.setState(JSON.parse(val), () => {
                    console.warn("STATE:", this.state)
                })
            })
            .catch(err => {
                //display error
                console.warn("ERROR:", err.message)
            })

        auth.onAuthStateChanged(user => {
            if (user) {
                this.setState({
                    user: user
                }, () => {
                    this.getCards()
                })
            }
        })

        // this.checkPermission();
        this.createNotificationListeners(); //add this line
    }



    async checkPermission() {
        const enabled = await firebase.messaging().hasPermission();
        if (enabled) {
            this.getToken();
        } else {
            this.requestPermission();
        }
    }

    //3
    async getToken() {
        let fcmToken = await AsyncStorage.getItem('fcmToken');
        console.warn("fcmToken", fcmToken)
        if (!fcmToken) {
            fcmToken = await firebase.messaging().getToken();
            if (fcmToken) {
                console.warn("fcmToken", fcmToken)

                // user has a device token
                await AsyncStorage.setItem('fcmToken', fcmToken);
            }
        }
    }

    //2
    async requestPermission() {
        try {
            await firebase.messaging().requestPermission();
            // User has authorised
            this.getToken();
        } catch (error) {
            // User has rejected permissions
            console.log('permission rejected');
        }
    }


    createNotificationListeners = async () => {
        console.warn("Listeners attached")
        /*
        * Triggered when a particular notification has been received in foreground
        * */
        this.notificationListener = firebase.notifications().onNotification((notification) => {
            const { title, body } = notification;
            console.warn("NOTIFICATION:", title, body)
            // this.showAlert(title, body);
        });

        /*
        * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
        * */
        this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
            const { title, body } = notificationOpen.notification;
            //this.showAlert(title, body);
            console.warn("NOTIFICATION:", title, body)

        });

        /*
        * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
        * */
        const notificationOpen = await firebase.notifications().getInitialNotification();
        if (notificationOpen) {
            const { title, body } = notificationOpen.notification;
            // this.showAlert(title, body);
            console.warn("NOTIFICATION:", title, body)


        }
        /*
        * Triggered for data only payload in foreground
        * */
        this.messageListener = firebase.messaging().onMessage((message) => {
            //process data message
            console.log(JSON.stringify(message));
        });
    }


    // componentWillUnmount() {
    //     this.notificationListener();
    //     this.notificationOpenedListener();
    // }

    getCards = () => {
        db.ref("cards").on('value', (snap) => {

            let cardsArr = []
            let cryptoArr = []
            console.warn("snap.val()", snap.val())
            let cardArray = []
            snap.forEach(card => {

                let currCard = card.val()

                if (currCard.types) {
                    let cardMax = 0;
                    let cardMin = 99999999999;
                    const typeKeys = Object.keys(currCard.types)
                    console.warn("TYPE KEYS:", typeKeys)
                    let typeArray = []
                    for (let i = 0; i < typeKeys.length; i++) {
                        console.warn("Rate:", currCard.types[typeKeys[i]].rate)
                        if (parseInt(currCard.types[typeKeys[i]].rate) > cardMax) {
                            cardMax = currCard.types[typeKeys[i]].rate;
                        }
                        if (parseInt(currCard.types[typeKeys[i]].rate) < cardMin) {
                            cardMin = currCard.types[typeKeys[i]].rate;
                        }
                        typeArray.push(currCard.types[typeKeys[i]])
                    }
                    currCard.minRate = cardMin;
                    currCard.maxRate = cardMax;
                    currCard.types = typeArray

                }
                currCard.cardKey = card.key




                if (card.val().category === "gift-card") {
                    cardsArr.push(currCard)
                }
                else {
                    cryptoArr.push(currCard)

                }

                // if (card.val().types) {
                console.warn("Types exist", card.val())
                cardArray.push(card.val())

                // }
                // else {
                //     console.warn("Types don't exist")

                // }
            })

            cardsArr.sort((a, b) => a.name.localeCompare(b.name));
            cryptoArr.sort((a, b) => a.name.localeCompare(b.name));

            const cardsObj = {
                giftCardList: cardsArr,
                cryptocurrencyList: cryptoArr
            }
            this.setState({
                giftCardList: cardsArr,
                cryptocurrencyList: cryptoArr
            }, () => {
                let maxRate = 0
                for (let i = 0; i < this.state.giftCardList.length; i++) {
                    console.warn("CARD", this.state.giftCardList[i].maxRate)
                    if (this.state.giftCardList[i].maxRate > maxRate) {
                        maxRate = this.state.giftCardList[i].maxRate
                        this.setState({
                            featuredCard: this.state.giftCardList[i]
                        })
                    }


                }

            })
            console.warn("Cardsobj:", cardsObj)

            AsyncStorage.setItem("cards", JSON.stringify(cardsObj))
                .then(() => {
                    this.setState({
                        cards: cardArray
                    })
                })
                .catch(err => {
                    console.warn("err", err)
                })

        })
    }

    getMonth = (month) => {
        if (month === 0) {
            return "January"
        }
        else if (month === 1) {
            return "February"
        }
        else if (month === 2) {
            return "March"
        }
        else if (month === 3) {
            return "April"
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
            return "August"
        }
        else if (month === 8) {
            return "September"
        }
        else if (month === 9) {
            return "October"
        }
        else if (month === 10) {
            return "November"
        }
        else if (month === 11) {
            return "December"
        }
    }

    render() {
        return (
            <View style={{ flex: 1, width: '100%', }}>
                <View style={{ padding: RFValue(20) }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: RFValue(22), fontWeight: 'bold', paddingBottom: RFValue(10) }}>{this.state.giftCards ? "GIFT CARDS" : "BITCOIN"}</Text>
                        <TouchableOpacity onPress={() => { this.setState({ giftCards: !this.state.giftCards }) }}>
                            <Text style={{ fontSize: RFValue(14), fontWeight: 'bold', paddingBottom: RFValue(10), opacity: 0.4 }}>{!this.state.giftCards ? "GIFT CARDS" : "BITCOIN"}</Text>
                        </TouchableOpacity>
                    </View>
                    <Item regular style={{ borderRadius: RFValue(7), }}>
                        <Input placeholder='Search Here' placeholderTextColor="rgba(0,0,0,0.4)" style={{ color: 'black' }}
                            onChangeText={(e) => { this.setState({ searchKeyword: e }) }}
                        />
                    </Item>
                </View>

                <ScrollView
                    contentContainerStyle={{ paddingRight: 0 }}
                    showsHorizontalScrollIndicator={false}

                    style={{ flex: 1, marginTop: 5 }}>


                    {this.state.giftCards ?
                        (
                            <ScrollView horizontal={true} ref={this.cardScroll}
                                scrollEventThrottle={160}
                                onScroll={event => {
                                    this.xOffset = event.nativeEvent.contentOffset.x;
                                }}
                                onScrollEndDrag={event => {
                                    this.xOffset = event.nativeEvent.contentOffset.x;

                                }}
                                onMomentumScrollEnd={(event) => {
                                    // scroll animation ended
                                    this.xOffset = event.nativeEvent.contentOffset.x;

                                }}
                            >
                                {this.state.giftCardList.map((card, index) => {
                                    if (this.state.searchKeyword.length < 1 || card.name.toLowerCase().search(this.state.searchKeyword.toLowerCase()) !== -1)
                                        return (
                                            <Card key={"gift_" + index} name={card.name}
                                                cardType="giftcard"
                                                cost={card.minRate ?
                                                    card.minRate != card.maxRate ? (card.minRate + "-" + card.maxRate) : card.minRate
                                                    : null} color={card.color}
                                                logoImage={{ uri: card.logo }}
                                                cardKey={card.cardKey}
                                                type={card.category}
                                                switchToChat={() => { this.props.switchToChat() }}
                                            />

                                        )
                                })}

                                {/* <Card name="Amazon" cost="100" color="rgb(242,157,56)" logoImage={require('./../assets/amazon.png')} />
                                <Card name="Apple" cost="20" color="rgb(40,40,40)" logoImage={require('./../assets/apple.png')} />
                                <Card name="Filmhouse" cost="250" color="rgb(15,15,15)" logoImage={require('./../assets/filmhouse.png')} />
                                <Card name="Google" cost="150" color="rgb(59, 204, 255)" logoImage={require('./../assets/gplay.png')} />
                                <Card name="iTunes" cost="200" color="rgb(30,30,30)" logoImage={require('./../assets/apple.png')} />
                                <Card name="JCPenney" cost="200" color="rgb(188,38,26)" logoImage={require('./../assets/jcp.png')} />
                                <Card name="Samsung" cost="200" color="rgb(12,77,162)" logoImage={require('./../assets/samsung.png')} />
                                <Card name="Sephora" cost="200" color="rgb(35,35,35)" logoImage={require('./../assets/sephora.png')} />
                                <Card name="Shoprite" cost="50" color="rgb(219, 55, 56)" logoImage={require('./../assets/shoprite.png')} />
                                <Card name="SPAR" cost="250" color="rgb(222,78,74)" logoImage={require('./../assets/spar.png')} />
                                <Card name="Steam" cost="400" color="rgb(0, 173, 238)" logoImage={require('./../assets/steam.png')} />
                                <Card name="Target" cost="100" color="rgb(232, 0, 24)" logoImage={require('./../assets/target.png')} />
                                <Card name="Walmart" cost="120" color="rgb( 0, 76, 145)" logoImage={require('./../assets/walmart.png')} /> */}

                            </ScrollView>
                        )
                        :
                        (
                            <ScrollView horizontal={true} ref={this.cardScroll}
                                scrollEventThrottle={160}
                                onScroll={event => {
                                    this.xOffset = event.nativeEvent.contentOffset.x;
                                }}
                                onScrollEndDrag={event => {
                                    this.xOffset = event.nativeEvent.contentOffset.x;

                                }}
                                onMomentumScrollEnd={(event) => {
                                    // scroll animation ended
                                    this.xOffset = event.nativeEvent.contentOffset.x;

                                }}
                            >
                                {this.state.cryptocurrencyList.map((card, index) => {
                                    if (this.state.searchKeyword.length < 1 || card.name.toLowerCase().search(this.state.searchKeyword.toLowerCase()) !== -1)

                                        return (
                                            <Card key={"gift_" + index} name={card.name}
                                                cardType="crypto"
                                                cost={card.minRate ?
                                                    card.minRate != card.maxRate ? (card.minRate + "-" + card.maxRate) : card.minRate
                                                    : null} color={card.color}
                                                logoImage={{ uri: card.logo }}
                                                cardKey={card.cardKey}
                                                type={card.category}
                                                switchToChat={() => { this.props.switchToChat() }}

                                            />


                                        )
                                })}
                                {/* <Card
                                    name="Bitcoin"
                                    cost="420"
                                    color="rgb(227,146,59)"
                                    logoImage={require('./../assets/bitcoin.png')}
                                /> */}

                            </ScrollView>
                        )
                    }



                    <View style={{ marginTop: RFValue(20), flexDirection: 'row', alignItems: 'center', }}>
                        <View style={{
                            borderTopColor: 'rgba(0,0,0,0.2)',
                            borderTopWidth: 1,
                            flex: 5
                        }}></View>
                        <View style={{ flex: 2, flexDirection: 'row', justifyContent: 'space-around', }}>
                            <TouchableOpacity onPress={() => {
                                this.cardScroll.current.scrollTo({ x: this.xOffset - this.screenWidth + 50, y: 0, animated: true })
                            }}>
                                <Icon type="Ionicons" name="arrow-back"
                                    style={{ fontSize: RFValue(25), color: 'rgb(165,165,165)' }}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                this.cardScroll.current.scrollTo({ x: this.xOffset + this.screenWidth - 50, y: 0, animated: true })
                            }}>
                                <Icon type="Ionicons" name="arrow-forward"
                                    style={{ fontSize: RFValue(25), color: 'rgb(165,165,165)' }}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={{ marginTop: RFValue(25), paddingHorizontal: RFValue(20) }}>
                        <Text style={{ fontSize: RFValue(15), fontWeight: 'bold' }}>Hot Rate for {new Date().getDate()} {this.getMonth(new Date().getMonth())}</Text>

                        {this.state.featuredCard ?
                            (
                                <TouchableOpacity style={[styles.bestSeller, { backgroundColor: this.state.featuredCard.color }]}
                                    onPress={
                                        () => {
                                            console.warn("Called")
                                            this.props.navigation.navigate('CardDetails', {
                                                name: this.state.featuredCard.name,
                                                color: this.state.featuredCard.color,
                                                cost: this.state.featuredCard.minRate ?
                                                    this.state.featuredCard.minRate != this.state.featuredCard.maxRate ? (this.state.featuredCard.minRate + "-" + this.state.featuredCard.maxRate) : this.state.featuredCard.minRate
                                                    : null,
                                                logoImage: { uri: this.state.featuredCard.logo },
                                                cardKey: this.state.featuredCard.cardKey,
                                                type: this.state.featuredCard.category,
                                                switchToChat: () => this.props.switchToChat()

                                            })
                                        }
                                    }
                                >
                                    <View
                                        style={{ padding: RFValue(17) }}>
                                        <Image source={{ uri: this.state.featuredCard.logo }} style={{ height: 30, width: 30 }}
                                            resizeMode="contain" />

                                        <View style={{ paddingTop: RFValue(33) }}>
                                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: RFValue(15) }}>{this.state.featuredCard.name}</Text>
                                            <View style={{ width: 20, borderBottomColor: 'rgba(255,255,255,0.3)', borderBottomWidth: 1, paddingTop: RFValue(3) }}></View>
                                            <Text style={{ paddingTop: RFValue(7), color: 'white', fontSize: RFValue(11) }}>
                                                {this.state.featuredCard.minRate ?
                                                    this.state.featuredCard.minRate != this.state.featuredCard.maxRate ? (this.state.featuredCard.minRate + "-" + this.state.featuredCard.maxRate) : this.state.featuredCard.minRate
                                                    : null}/$
                                            </Text>
                                        </View>
                                    </View>
                                    <Image
                                        source={{ uri: this.state.featuredCard.logo }}
                                        style={{ flex: 1, height: '100%', opacity: 0.1 }} />

                                </TouchableOpacity>
                            )
                            :
                            null
                        }

                    </View>

                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    bestSeller: {
        margin: RFValue(10),
        backgroundColor: 'rgb(242,157,56)',
        borderRadius: RFValue(10),
        marginHorizontal: RFValue(17),
        flexDirection: 'row'
    }
})

export default withNavigation(Dashboard)