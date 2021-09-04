import React, { Component } from 'react';
import { View, Text, ImageBackground, Image, AsyncStorage } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize'
import { db, auth } from './../config'
import { StackActions, NavigationActions } from 'react-navigation';
import firebase from 'react-native-firebase'
export default class SplashScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            cards: null,
            sortCount: 0
        };
    }

    //INTERNET VALIDATION
    componentDidMount() {
        console.disableYellowBox = true

        // this.checkPermission();
        // this.createNotificationListeners(); //add this line

        auth.onAuthStateChanged(user => {
            console.warn(user)
            if (user) {
                this.setState({ user: user })
            }
        })
        db.ref("cards").on('value', (snap) => {
            console.log("dadad::");
            let cardsArr = []
            let cryptoArr = []
            console.warn(snap.val())
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
            console.warn("Cardsobj:", cardsObj)

            AsyncStorage.setItem("cards", JSON.stringify(cardsObj))
                .then(() => {
                    console.log("dddd:::");
                    this.setState({
                        cards: cardArray
                    })
                })
                .catch(err => {
                    console.warn(err)
                })

        })




        setTimeout(() => {
            this.redirect()
        }, 800)
        //  console.disableYellowBox = true
    }



    redirect = () => {
        console.warn("REDIRECT CALLED")
        const { user, cards } = this.state;
        console.log("cards",cards);
        //if (cards) {
            if (user) {
                //  this.props.navigation.navigate('CustomNav');
                const resetAction = StackActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({ routeName: 'CustomNav' })],
                });
                this.props.navigation.dispatch(resetAction);
            }
            else {
                this.props.navigation.navigate('Login');
            }

        // }
        // else {
        //     console.warn("Calling again")
        //     setTimeout(() => { this.redirect() }, 200)
        // }

    }

    render() {
        return (
            <ImageBackground style={{ width: '100%', flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', paddingBottom: RFValue(55), }}
                source={require('./../assets/bg.png')}
                resizeMode="cover"
            >
                <Image source={require('./../assets/logo.png')}
                    style={{ width: '80%', height: RFValue(200), justifyContent: 'flex-start', alignItems: 'flex-start', }}
                    resizeMode="contain"
                />

            </ImageBackground >
        );
    }
}
