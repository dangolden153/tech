import React, { Component } from 'react';
import { View, Text, Image, ImageBackground, Alert, ActivityIndicator } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { Item, Label, Input, Button, Icon } from 'native-base';
import { auth } from './../config'
import DialogInput from 'react-native-dialog-input';
import { StackActions, NavigationActions } from 'react-navigation';

export default class LoginScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            pass: '',
            isDialogVisible: false,
            loading: false
        };
        console.disableYellowBox = true;
        
    }

    loginUser = () => {
        const { email, pass, } = this.state;
        if (!email || !pass) {
            Alert.alert("Error", "Incorrect email or password, please try again.")
            return;
        }
        if (this.state.loading) {
            return
        }
        this.setState({
            loading: true
        })

        auth.signInWithEmailAndPassword(email, pass)
            .then(res => {
                const resetAction = StackActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({ routeName: 'CustomNav' })],
                });
                this.props.navigation.dispatch(resetAction);
                this.setState({
                    loading: false
                })
            })
            .catch(err => {
                Alert.alert("Error", "Incorrect email or password, please try again.")
                this.setState({
                    loading: false
                })
            })

    }

    showDialog = (status) => {
        this.setState({
            isDialogVisible: status
        })
    }

    recoverPass = (input) => {
        let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (!emailRegex.test(input)) {
            Alert.alert("Error", "Please enter a valid email");
            return;
        }
        this.showDialog(false)

        auth.sendPasswordResetEmail(input)
            .then(() => {
                Alert.alert("Password Recovery", "Password Recovery Email has been sent successfully.")

            })
            .catch(err => {
                Alert.alert("Error", "There was an error recovering password")

            })
        console.warn(input)

    }
    render() {
        return (
            <ImageBackground style={{ width: '100%', flex: 1, justifyContent: 'center', backgroundColor: 'white', paddingBottom: RFValue(55), }}
                source={require('./../assets/bg.png')}
                resizeMode="cover"
            >
                <View style={{ paddingHorizontal: RFValue(25), paddingTop: RFValue(65) }}>
                    <Image source={require('./../assets/logo.png')}
                        style={{ width: '65%', height: RFValue(45), justifyContent: 'flex-start', alignItems: 'flex-start', }}
                        resizeMode="contain"
                    />
                    <Text style={{ fontWeight: '100', fontSize: RFValue(25), paddingTop: RFValue(40) }}>Proceed with your</Text>
                    <Text style={{ fontWeight: 'bold', fontSize: RFValue(32), paddingTop: RFValue(5) }}>LOGIN</Text>
                </View>


                <View style={{ paddingHorizontal: RFValue(20), paddingBottom: RFValue(35), marginTop: RFValue(55) }}>
                    <Item floatingLabel>
                        <Label>Email Address</Label>
                        <Input onChangeText={(val) => { this.setState({ email: val }) }} />
                        <Icon name="person-outline" type="MaterialIcons" />
                    </Item>
                    <Item floatingLabel style={{ marginTop: RFValue(15) }}>
                        <Label>Password</Label>
                        <Input secureTextEntry={true} onChangeText={(val) => { this.setState({ pass: val }) }} />
                        <Icon name="lock-open" type="MaterialIcons" />

                    </Item>

                    <Button block style={{ marginTop: RFValue(45), backgroundColor: 'rgb(236,161,58)' }}
                        onPress={
                            () => {
                                this.loginUser()
                            }
                        }
                    >
                        {this.state.loading ?
                            (
                                <ActivityIndicator size="small" color="white" />
                            )
                            :
                            (
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>SIGNIN</Text>
                            )
                        }
                    </Button>

                    <Button block transparent onPress={() => { this.showDialog(true) }}>
                        <Text style={{}}>Forgot Password?</Text>
                    </Button>


                    <Button block transparent onPress={() => {
                        this.props.navigation.navigate('Signup');
                    }}>
                        <Text style={{}}>Don't have an account?</Text>
                    </Button>
                </View>

                <DialogInput isDialogVisible={this.state.isDialogVisible}
                    title={"Recover Password"}
                    message={"Please enter your email address"}
                    hintInput={""}
                    submitInput={(inputText) => { this.recoverPass(inputText) }}
                    closeDialog={() => { this.showDialog(false) }}>
                </DialogInput>

            </ImageBackground >
        );
    }
}
