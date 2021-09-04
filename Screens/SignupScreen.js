import React, { Component } from 'react';
import { View, Text, Image, ImageBackground, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Item, Label, Input, Button, Icon } from 'native-base';
import { db, auth } from './../config'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import { StackActions, NavigationActions } from 'react-navigation';

export default class SignupScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            number: '',
            email: '',
            pass: '',
            pass2: '',
            referral: '',
            loading: false

        };
    }


    registerAccount = () => {
        const { name, number, email, pass, pass2, referral } = this.state;

        let refId = parseInt(Date.now() + Math.random()).toString()
        refId = refId.substring(refId.length - 5, refId.length - 1)
        refId = refId.trim()
        let nameWithoutSpace = name.replace(/\s/g, '');
        refId = (nameWithoutSpace + refId)
        console.warn(refId)

        if (this.state.loading) {
            return
        }

        let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

        if (name.length < 2) {
            Alert.alert("Error", "Please enter a valid name");
            return;
        }
        else if (number.length < 2) {
            Alert.alert("Error", "Please enter a valid number");
            return;
        }
        else if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email");
            return;
        }
        else if (pass.length < 6 || pass2.length < 6) {
            Alert.alert("Error", "Password should be of minimum 6 character");
            return;
        }
        else if (pass !== pass2) {
            Alert.alert("Error", "The entered passwords don't match");
            return;
        }

        this.setState({
            loading: true
        })

        auth.createUserWithEmailAndPassword(email, pass)
            .then(res => {
                res.user.sendEmailVerification();

                console.warn(res.user.uid)
                db.ref("users/" + res.user.uid)
                    .update({
                        referralid: refId.toLowerCase(),
                        name: name,
                        number: number,
                        email: email
                    })
                    .then(() => {

                        //CHECK IF THIS USER WAS REFERRED BY SOMEONE
                        if (referral) {
                            //find user with referral code
                            db.ref('referralCodes/' + referral.toLowerCase()).once('value')
                                .then((snap) => {
                                    if (snap.exists()) {
                                        console.warn("ReferralExists")
                                        var ref1 = db.ref('users/' + snap.val() + '/rewardTokens');
                                        ref1.transaction(function (currentClicks) {
                                            return (currentClicks || 0) + 10;
                                        });

                                        db.ref("users/" + res.user.uid)
                                            .update({
                                                rewardTokens: 10
                                            })
                                    }


                                })
                        }


                        db.ref("referralCodes")
                            .update({
                                [refId.toLowerCase()]: res.user.uid
                            })
                            .then(() => {
                                Alert.alert("Account Created", "Your account has been created succsessfully.");

                                this.setState({
                                    loading: false
                                })
                                const resetAction = StackActions.reset({
                                    index: 0,
                                    actions: [NavigationActions.navigate({ routeName: 'CustomNav' })],
                                });
                                this.props.navigation.dispatch(resetAction);


                            })
                            .catch(err => {
                                Alert.alert("Account Created", "Your account has been created succsessfully.");
                                const resetAction = StackActions.reset({
                                    index: 0,
                                    actions: [NavigationActions.navigate({ routeName: 'CustomNav' })],
                                });
                                this.props.navigation.dispatch(resetAction);
                                this.setState({
                                    loading: false
                                })

                            })
                    })
                    .catch(err => {
                        Alert.alert("Error", "Failed to create a new account, please try again later.");
                        this.setState({
                            loading: false
                        })

                    })

            })
            .catch(err => {
                Alert.alert("Error", "Failed to create a new account, please try again later.");
                this.setState({
                    loading: false
                })

            })




    }

    render() {
        return (
            <ImageBackground style={{ width: '100%', flex: 1, justifyContent: 'center', backgroundColor: 'white', }}
                source={require('./../assets/bg.png')}
                resizeMode="cover"
            >
                <View style={{ paddingHorizontal: RFValue(25), paddingTop: RFValue(65) }}>
                    <Image source={require('./../assets/logo.png')}
                        style={{ width: '65%', height: RFValue(45), justifyContent: 'flex-start', alignItems: 'flex-start', }}
                        resizeMode="contain"
                    />
                    {/* <Text style={{ fontWeight: '100', fontSize: RFValue(25), paddingTop: RFValue(30) }}>Proceed with your</Text>
                    <Text style={{ fontWeight: 'bold', fontSize: RFValue(32), paddingTop: RFValue(5) }}>SIGNUP</Text> */}
                </View>


                <KeyboardAwareScrollView
                    contentContainerStyle={{ paddingHorizontal: RFValue(20), paddingBottom: RFValue(35), marginTop: RFValue(30) }}
                    style={{}}>

                    <Item floatingLabel>
                        <Label>Name</Label>
                        <Input onChangeText={(val) => { this.setState({ name: val }) }} />
                        <Icon name="person-outline" type="MaterialIcons" />
                    </Item>
                    <Item floatingLabel style={{ marginTop: RFValue(15) }}>
                        <Label>Contact Number</Label>
                        <Input keyboardType="number-pad" onChangeText={(val) => { this.setState({ number: val }) }} />
                        <Icon name="smartphone" type="MaterialIcons" />
                    </Item>
                    <Item floatingLabel style={{ marginTop: RFValue(15) }}>
                        <Label>Referral Code</Label>
                        <Input keyboardType="number-pad" onChangeText={(val) => { this.setState({ referral: val }) }} />
                        <Icon name="fingerprint" type="MaterialIcons" />
                    </Item>
                    <Item floatingLabel style={{ marginTop: RFValue(15) }}>
                        <Label>Email Address</Label>
                        <Input keyboardType="email-address" onChangeText={(val) => { this.setState({ email: val }) }} />
                        <Icon name="email" type="MaterialIcons" />
                    </Item>
                    <Item floatingLabel style={{ marginTop: RFValue(15) }}>
                        <Label>Password</Label>
                        <Input secureTextEntry={true} onChangeText={(val) => { this.setState({ pass: val }) }} />
                        <Icon name="lock-open" type="MaterialIcons" />
                    </Item>
                    <Item floatingLabel style={{ marginTop: RFValue(15) }}>
                        <Label>Repeat Password</Label>
                        <Input secureTextEntry={true} onChangeText={(val) => { this.setState({ pass2: val }) }} />
                        <Icon name="lock-open" type="MaterialIcons" />
                    </Item>

                    <Button block
                        onPress={() => { this.registerAccount() }}
                        style={{ marginTop: RFValue(35), backgroundColor: 'rgb(236,161,58)' }}>
                        {this.state.loading ?
                            (
                                <ActivityIndicator size="small" color="white" />
                            )
                            :
                            (
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>SIGNUP</Text>

                            )
                        }
                    </Button>
                    <Button block transparent onPress={() => {
                        this.props.navigation.goBack()
                    }}>
                        <Text>Already have an account?</Text>
                    </Button>
                </KeyboardAwareScrollView>



            </ImageBackground >
        );
    }
}
