import React, { Component } from 'react';
import { Button, View, Text, StyleSheet, Image, ImageBackground, ActivityIndicator, TouchableOpacity, Dimensions, Clipboard } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import ImageViewer from 'react-native-image-zoom-viewer';
// import { Modal } from 'react-native';
import { Icon } from 'native-base';
import Modal from 'react-native-modal';
import { auth, db, firebase } from './../config'

export default class ChatBubble extends Component {
    state = {
        isModalVisible: false,
    }
    constructor(props) {
        super(props);
        this.state = {
            msgTime: "",
            openImageModal: false,
            textCopied: false
            // isModalVisible: false,

        };
    }
    deleteMessage = () => {
        let user = firebase.auth().currentUser;
        console.warn("I am inside delete function");
        console.warn(
            "data",
            user.uid,
            " ",
            this.props.conversationKey,
            " messages ",
            this.props.ID
        );
        firebase
            .database()
            .ref(
                "/tradeRequests/" +
                user.uid +
                "/" +
                this.props.conversationKey +
                "/" +
                "messages" +
                "/" +
                this.props.ID
            )
            .update({
                deletedUser: true,
            })
            .then(() => {
                console.log("Deleted");
            })
            .catch((err) => {
                console.log(err.message);
            }).finally(() => {
                this.toggleModal()
            });
    }

    componentDidMount() {
        console.disableYellowBox = true

        const { time } = this.props;
        const msgTime = new Date(time);
        let hours = msgTime.getHours()
        if (hours < 10) {
            hours = "0" + hours;

        }

        let min = msgTime.getMinutes()
        if (min < 10) {
            min = "0" + min;
        }

        const timeAdjusted = hours + ":" + min + "   " + msgTime.getDate() + " " + this.getMonth(msgTime.getMonth())
        this.setState({ msgTime: timeAdjusted })
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

    toggleModal = () => {

        this.setState({ isModalVisible: !this.state.isModalVisible });
    };

    textCopy() {
        Clipboard.setString(this.props.content)
        this.setState({
            textCopied: true
        })

        this.toggleModal()
        setTimeout(() => {
            this.setState({ isModalVisible: false })
        }, 1000)
        setTimeout(() => {
            this.setState({ textCopied: false })
        }, 1200)

    }
    getContent = () => {
        if (this.props.image) {
            return (
                <View style={{ flexDirection: this.props.recieved ? 'row-reverse' : 'row', width: '100%' }}>
                    <View style={{ flex: 1 }}>
                        {/* <Button title="Show modal" 
                    onPress={() => this.toggleModal()}

                    /> */}

                    </View>
                    <View style={this.props.recieved ? styles.bubbleRecieve : styles.bubbleSend}>
                        <TouchableOpacity style={{ width: '100%', height: 'auto' }} onPress={() => {
                            this.setState({ openImageModal: true })
                        }}
                            onLongPress={() => this.toggleModal()}

                        >
                            <ImageBackground source={{ uri: this.props.image }}
                                imageStyle={{ borderRadius: RFValue(10), backgroundColor: 'rgba(255,255,255,0.7)' }}
                                style={{ height: RFValue(100), width: RFValue(160), marginTop: RFValue(15), borderRadius: RFValue(10), justifyContent: 'center', }}
                                resizeMode="cover"
                            >
                                {this.props.processing ?
                                    (
                                        <ActivityIndicator size="large" color="white" />

                                    )
                                    :
                                    (
                                        null
                                    )
                                }

                            </ImageBackground>
                        </TouchableOpacity>
                        <Text style={{
                            fontSize: RFValue(8), paddingTop: RFValue(7),
                            textAlign: this.props.recieved ? 'right' : 'left',
                            color: this.props.recieved ? 'white' : 'black'
                        }}
                        >{this.state.msgTime}</Text>
                    </View>
                </View>
            )
        }
        else if (this.props.card) {
            return (
                <View style={{ flexDirection: this.props.recieved ? 'row-reverse' : 'row', width: '100%' }}>
                    <View style={{ flex: 1 }}></View>
                    <View style={this.props.recieved ? styles.bubbleRecieve : styles.bubbleSend}>

                        <View style={[styles.card, { backgroundColor: this.props.color }]}>
                            <View style={{ padding: RFValue(19) }}>
                                <Image source={this.props.logo} style={{ height: 30, width: 30 }}
                                    resizeMode="contain" />

                                <View style={{ paddingTop: RFValue(37) }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: RFValue(15) }}>{this.props.company}</Text>
                                    <View style={{ width: 20, borderBottomColor: 'rgba(255,255,255,0.3)', borderBottomWidth: 1, paddingTop: RFValue(3) }}></View>
                                    <Text style={{ paddingTop: RFValue(7), color: 'white', fontSize: RFValue(11) }}>{this.props.dailyRate ? this.props.dailyRate : this.props.cardValue}/$</Text>
                                </View>
                            </View>

                            <ImageBackground
                                source={this.props.logo ? this.props.logo : null}
                                imageStyle={{ opacity: 0.1 }}
                                style={{ flex: 1, height: '100%', alignItems: 'center' }} >

                            </ImageBackground>

                        </View>
                    </View>
                </View>
            )
        }
        else {
            return (
                <View style={{ flexDirection: this.props.recieved ? 'row-reverse' : 'row', width: '100%' }}>
                    <View style={{ flex: 1 }}></View>

                    <TouchableOpacity
                        onLongPress={() => this.toggleModal()}
                        onPress={() =>
                            this.textCopy()
                        }
                    >
                        <View style={this.props.recieved ? styles.bubbleRecieve : styles.bubbleSend}>
                            <Text style={{ color: this.props.recieved ? 'white' : 'black' }}> {this.props.content} </Text>
                            <Text style={{
                                fontSize: RFValue(8), paddingTop: RFValue(7),
                                textAlign: this.props.recieved ? 'right' : 'left',
                                color: this.props.recieved ? 'white' : 'black'
                            }}
                            >{this.state.msgTime}</Text>
                        </View>

                    </TouchableOpacity>
                </View>
            )
        }
    }
    render() {


        const images = [{
            // Simplest usage.
            url: this.props.image ? this.props.image : "",
            props: {
                // headers: ...
            }
        }]
        return (
            <View style={{ flexDirection: 'row', marginTop: RFValue(10) }}>
                {this.getContent()}
                <Modal visible={this.state.openImageModal} transparent={true}>
                    {/* <ImageViewer imageUrls={images} enableSwipeDown={true} /> */}
                    <View style={{ position: 'absolute', bottom: 0, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => { this.setState({ openImageModal: false }) }}
                            onLongPress={() => this.toggleModal()}

                            style={{
                                height: RFValue(40), width: RFValue(40),
                                borderRadius: RFValue(20), backgroundColor: 'white',
                                marginBottom: RFValue(10), justifyContent: 'center', alignItems: 'center'
                            }}>
                            <Icon type="MaterialIcons" name="close" style={{ padding: RFValue(5), color: 'black' }} />
                        </TouchableOpacity>
                    </View>
                </Modal>
                <Modal
                    isVisible={this.state.isModalVisible}
                    onBackdropPress={() => this.setState({ isModalVisible: false })}
                    onSwipeComplete={() => this.setState({ isModalVisible: false })}
                    animationOut={'fadeOutDown'}
                    hasBackdrop={this.state.textCopied ? false : true}
                    style={{
                        marginBottom: 0,
                        marginRight: 0,
                        marginLeft: 0,
                        marginTop: Dimensions.get('screen').height / 1.15,
                        backgroundColor: 'white',
                    }}
                >

                    {this.state.textCopied ?
                        (<View style={styles.button}
                        >
                            <Text style={{ textAlign: 'center', padding: 10, fontSize: 18 }}>Text copied to Clipboard</Text>
                        </View>

                        )
                        :
                        <Button
                            onPress={() =>
                                // console.warn("Here")
                                this.deleteMessage()
                            }
                            color={"#9575CD"}
                            title={"Delete"}

                        >
                        </Button>


                    }


                </Modal>


            </View >
        );
    }
}

const styles = StyleSheet.create({
    bubbleRecieve: {
        backgroundColor: '#9575CD',
        width: 'auto',
        padding: RFValue(12),
        marginLeft: RFValue(10),
        borderRadius: RFValue(20),
        borderTopLeftRadius: 0
    },
    bubbleSend: {
        backgroundColor: '#EEEEEE',
        width: 'auto',
        padding: RFValue(12),
        marginRight: RFValue(10),
        borderRadius: RFValue(20),
        borderTopRightRadius: 0
    },
    card: {
        margin: RFValue(5),
        backgroundColor: 'rgb(242,157,56)',
        borderRadius: RFValue(10),
        marginHorizontal: RFValue(10),
        flexDirection: 'row',
        minWidth: '75%',
    },
    button: {
        alignItems: "center",
        backgroundColor: "#DDDDDD",
        padding: 10,
        bottom: 30,
    },
})