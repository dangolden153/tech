import React, { Component } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableHighlight, ImageBackground, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { Icon, Input, Item } from 'native-base';
import { RFValue } from 'react-native-responsive-fontsize';
import { auth, db, firebase } from './../config'
import ImagePicker from 'react-native-image-picker';
import { StackActions, NavigationActions, withNavigation } from 'react-navigation';
import Share from 'react-native-share';

const options = {
    title: 'Change Display Picture',
    storageOptions: {
        skipBackup: true,
        path: 'images',
        quality: 0.5
    },
};

class ProfileScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            edit: false,
            uploadLoader: false,
            numberUpdated: '',

            successful: 0,
            failed: 0,

            userName: "",
            email: "",
            number: "",
            userBalance: 0,
            userTokens: 0,
            dp: require('./../assets/avatar.jpg'),
            referralId: ""
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
                email: snap.val().email,
                number: snap.val().number,
                userBalance: snap.val().walletAmount ? snap.val().walletAmount : 0,
                userTokens: snap.val().rewardTokens ? snap.val().rewardTokens : 0,
                dp: snap.val().dp ? { uri: snap.val().dp } : require('./../assets/avatar.jpg'),
                referralId: snap.val().referralid ? snap.val().referralid : ""
            })

        })
    }


    getTransactions = () => {
        db.ref('/tradeRequests/' + this.state.user.uid).orderByChild('updateTime').on('value', (snap) => {
            let successCount = 0;
            let failCount = 0;
            snap.forEach(transaction => {
                if (transaction.val().status !== "Pending") {
                    if (transaction.val().status === "Successful") {
                        successCount++;
                    }
                    else {
                        failCount++;
                    }
                }
            })
            this.setState({
                successful: successCount,
                failed: failCount
            })
            console.warn(snap.val())
        })
    }


    uploadDp = () => {
        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);

            this.setState({
                uploadLoader: true,
                edit: false
            })

            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {

                // You can also display the image using data:
                // const source = { uri: 'data:image/jpeg;base64,' + response.data };



                const storage = firebase.storage();
                let imageId = parseInt(Date.now() + Math.random()).toString()
                console.warn(response.uri)
                const imageRef = storage.ref(`dp/${this.state.user.uid}`).child(`rclabs`);
                this.uriToBlob(response.uri)
                    .then(blob => {
                        imageRef.put(blob)
                            .then(() => {
                                imageRef.getDownloadURL().then((url) => {
                                    console.warn(url)
                                    let newUrl = url.replace("rclabs", "thumb_rclabs")
                                    db.ref('/users/' + this.state.user.uid)
                                        .update({
                                            dp: newUrl
                                        })
                                        .then(() => {
                                            this.setState({
                                                uploadLoader: false
                                            })
                                        })
                                        .catch(err => {
                                            Alert.alert("Error", "There was an error uploading dp, please try again.")
                                        })
                                })
                            })
                    })
                    .catch((err) => {
                        console.warn(err.message)
                        Alert.alert("Error", "There was an error uploading dp, please try again.")
                    });


            }
        });
    }

    uriToBlob = (uri) => {

        return new Promise((resolve, reject) => {

            const xhr = new XMLHttpRequest();

            xhr.onload = function () {
                // return the blob
                resolve(xhr.response);
            };

            xhr.onerror = function () {
                console.warn("ERROR with blob")
                // something went wrong
                reject(new Error('uriToBlob failed'));
            };

            // this helps us get a blob
            xhr.responseType = 'blob';

            xhr.open('GET', uri, true);
            xhr.send(null);

        });

    }

    changeNumber = () => {
        if (this.state.numberUpdated.length < 3 || this.state.numberUpdated === this.state.number) {
            console.warn("Clicked")
            this.setState({
                edit: false
            })
        }
        else {
            db.ref('/users/' + this.state.user.uid)
                .update({
                    number: this.state.numberUpdated
                })
                .then(() => {
                    this.setState({
                        edit: false
                    })
                })
                .catch(() => {
                    Alert.alert("Error", "There was an error updating number, please try again later.")
                    this.setState({
                        edit: false
                    })
                })
        }

    }

    requestWithdrawal = () => {
        console.warn("Withdrawal")
        db.ref('/tradeRequests/' + this.state.user.uid).push({
            startDate: new Date().toISOString(),
            readByAdmin: false,
            read: true,
            requestType: 'withdraw',
            cardName: '',
            status: 'Pending',
            color: '',
            logoImage: '',
            cost: '',
            type: '',
            currency: '',
            range: '',
            cardValue: '',
            updateTime: new Date().getTime(),
            dp: this.state.dp.uri ? this.state.dp.uri : null


        }).then(res => {
            db.ref('/requestLists/' + res.key)
                .update({
                    lastUpdateTime: new Date().getTime(),
                    status: "Pending",
                    unreadMessages: 1,
                    uid: this.state.user.uid,
                    type: "withdraw"
                }).then(res => {
                    Alert.alert("Success", "Withdraw Request has been generated successfully. Kindly check chats to continue with the request.")
                    this.props.switchToChat();
                })
                .catch(err => {
                    Alert.alert("Error", "There was an error generating withdraw request")

                })
        })
            .catch(err => {
                Alert.alert("Error", "There was an error generating withdraw request")
            })
    }

    logout = () => {
        auth.signOut();
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'Login' })],
        });
        this.props.navigation.dispatch(resetAction);
    }

    shareWithFriend = () => {
        Share.open({
            url: "http://roundcubelabs.com",//replace with playstore link
            message: "Download Tech2Smart app, use my referral code '" + this.state.referralId + "' to register and get 10 free reward tokens",
            title: "Free Reward Tokens",
            subject: "Free Reward Tokens"
        })
            .then((res) => { console.log(res) })
            .catch((err) => { err && console.log(err); });
    }

    render() {
        return (
            <View style={{ width: '100%', flex: 1, paddingTop: RFValue(20) }}>
                <View style={{ width: '100%', alignItems: 'flex-end', paddingHorizontal: RFValue(20) }}>
                    <TouchableOpacity onPress={() => {
                        this.setState({
                            edit: !this.state.edit
                        })
                    }}>
                        {this.state.edit ?
                            (
                                <Icon name="close" type="MaterialIcons" style={{ fontSize: RFValue(20) }} />
                            )
                            :
                            (
                                <Icon name="edit" type="MaterialIcons" style={{ fontSize: RFValue(20) }} />
                            )
                        }
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', paddingHorizontal: RFValue(5), alignItems: 'center', paddingHorizontal: RFValue(20) }}>
                    <View style={styles.avatar}>
                        <ImageBackground
                            imageStyle={styles.avatar}
                            source={this.state.dp} style={styles.avatar} >
                            {this.state.edit ?
                                (
                                    <TouchableOpacity
                                        onPress={() => this.uploadDp()}
                                        style={[styles.editCircle, { justifyContent: 'center', alignItems: 'center' }]}
                                        activeOpacity={0.85}
                                    >
                                        <Icon name="edit" type="MaterialIcons" style={{ fontSize: RFValue(12), color: 'white' }} />

                                    </TouchableOpacity>
                                )
                                :
                                this.state.uploadLoader ?
                                    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                        <ActivityIndicator size="small" color="white" />
                                    </View>
                                    :
                                    null
                            }


                        </ImageBackground>
                    </View>
                    <View style={{ paddingLeft: RFValue(16), flex: 1 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: RFValue(18), }}>{this.state.userName}</Text>
                        <Text style={{ fontSize: RFValue(12), color: 'rgb(100,100,100)', paddingTop: RFValue(5), fontWeight: '500' }}>Total Transaction: {this.state.successful + this.state.failed}</Text>
                    </View>
                </View>
                <View style={{ paddingVertical: RFValue(20), borderBottomColor: 'rgb(225,225,225)', borderBottomWidth: 10, paddingHorizontal: RFValue(20) }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon type="FontAwesome5" name="mobile-alt" style={{ color: 'rgb(100,100,100)', fontSize: RFValue(25), paddingLeft: RFValue(5) }} />
                        {this.state.edit ?
                            (
                                <Item style={{ marginLeft: RFValue(17) }}>
                                    <Input style={{ flex: 1, color: 'rgb(100,100,100)', fontWeight: '500', fontSize: RFValue(12) }}
                                        defaultValue={this.state.number}
                                        type="number"
                                        keyboardType="number-pad"
                                        onChangeText={(e) => { this.setState({ numberUpdated: e }) }}
                                    />
                                    <TouchableOpacity
                                        activeOpacity={0.55}
                                        onPress={() => {
                                            this.changeNumber()

                                        }}
                                    >
                                        <Icon name="check" type="MaterialIcons" style={{ fontSize: RFValue(18), color: 'rgb(100,100,100)', }} />

                                    </TouchableOpacity>
                                </Item>
                            )
                            :
                            (
                                <Text style={{ paddingLeft: RFValue(17), color: 'rgb(100,100,100)', fontWeight: '500', fontSize: RFValue(12) }}>{this.state.number}</Text>

                            )
                        }
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: RFValue(7) }}>
                        <Icon type="EvilIcons" name="envelope" style={{ color: 'rgb(100,100,100)', fontSize: RFValue(25) }} />
                        <Text style={{ paddingLeft: RFValue(15), color: 'rgb(100,100,100)', fontWeight: '500', fontSize: RFValue(12) }}>{this.state.email}</Text>
                    </View>
                </View>

                <View style={{ padding: RFValue(10), paddingVertical: RFValue(25), borderBottomColor: 'rgb(225,225,225)', borderBottomWidth: 10, flexDirection: 'row' }}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: RFValue(17) }}>N {this.state.userBalance}</Text>
                        <Text style={{
                            paddingTop: RFValue(6), color: 'rgb(170,170,170)', fontWeight: 'bold', fontSize: RFValue(11)
                        }}>Wallet</Text>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: RFValue(17) }}>{this.state.userTokens}</Text>
                        <Text style={{
                            paddingTop: RFValue(6), color: 'rgb(170,170,170)', fontWeight: 'bold', fontSize: RFValue(11)
                        }}>Reward Tokens</Text>
                    </View>
                </View>
                <ScrollView style={{ flex: 1, width: '100%', }}
                    contentContainerStyle={{ justifyContent: 'space-between', paddingBottom: 10, }}
                >
                    <View>
                        <TouchableHighlight underlayColor="rgb(245,245,245)"
                            activeOpacity={0.9}
                            style={{ paddingHorizontal: RFValue(35), paddingVertical: RFValue(15), marginTop: RFValue(10), }}
                            onPress={() => { this.requestWithdrawal() }}>
                            <View
                                style={{ flexDirection: 'row', width: '100%', alignItems: 'center' }}
                            >
                                <Icon type="MaterialIcons" name="credit-card" style={{ fontSize: RFValue(25) }} />

                                <Text style={{ fontWeight: '500', paddingLeft: RFValue(20) }}>Request Withdrawal</Text>
                            </View>
                        </TouchableHighlight>

                        <TouchableHighlight underlayColor="rgb(245,245,245)"
                            activeOpacity={0.9}
                            style={{ paddingHorizontal: RFValue(35), paddingVertical: RFValue(15), marginTop: RFValue(10), }}
                            onPress={() => { this.shareWithFriend() }}>
                            <View
                                style={{ flexDirection: 'row', width: '100%', alignItems: 'center' }}
                            >
                                <Icon type="MaterialIcons" name="share" style={{ fontSize: RFValue(25) }} />

                                <Text style={{ fontWeight: '500', paddingLeft: RFValue(20) }}>Tell Your Friends </Text>
                            </View>
                        </TouchableHighlight>

                        <TouchableHighlight underlayColor="rgb(245,245,245)"
                            activeOpacity={0.9}
                            style={{ paddingHorizontal: RFValue(35), paddingVertical: RFValue(15), marginTop: RFValue(10), }}
                            onPress={() => {
                                let cellNumber = "+2348141224609"
                                const url = `whatsapp://send?phone=${cellNumber}`;
                                Linking.canOpenURL(url).then(supported => {
                                    if (supported) {
                                        Linking.openURL(url);
                                    } else {
                                        Alert.alert(
                                            'Alert',
                                            'WhatsApp is not installed',
                                        )
                                    }
                                });

                            }}>
                            <View
                                style={{ flexDirection: 'row', width: '100%', alignItems: 'center' }}
                            >
                                <Icon type="FontAwesome" name="whatsapp" style={{ fontSize: RFValue(25) }} />

                                <Text style={{ fontWeight: '500', paddingLeft: RFValue(20) }}>Reach Us On Whatsapp</Text>
                            </View>
                        </TouchableHighlight>
                    </View>


                    <TouchableHighlight underlayColor="rgb(245,245,245)"
                        activeOpacity={0.9}
                        style={{
                            paddingHorizontal: RFValue(35),
                            paddingVertical: RFValue(15),
                            marginTop: RFValue(10),
                            borderTopColor: 'rgb(245,245,245)',
                            borderTopWidth: 1
                        }}
                        onPress={() => { this.logout() }}>
                        <View
                            style={{ flexDirection: 'row', width: '100%', alignItems: 'center' }}
                        >
                            <Icon name="power" style={{ fontSize: RFValue(25), color: '#f44336' }} />
                            <Text style={{ fontWeight: '500', paddingLeft: RFValue(20), color: '#f44336' }}>Logout</Text>
                        </View>
                    </TouchableHighlight>
                </ScrollView>
            </View >
        );
    }
}


const styles = StyleSheet.create({
    avatar: {
        height: RFValue(80),
        width: RFValue(80),
        borderRadius: RFValue(40),
        backgroundColor: 'rgba(0,0,0,0.05)',

    },
    editCircle: {
        height: RFValue(24),
        width: RFValue(24),
        borderRadius: RFValue(12),
        backgroundColor: 'rgb(236,161,59)'
    }
})

export default withNavigation(ProfileScreen);