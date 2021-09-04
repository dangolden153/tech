import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated, TouchableOpacity, Image } from 'react-native';
import { Icon } from 'native-base';
import Dashboard from '../Screens/Dashboard';
import ChatMain from '../Screens/ChatMain';
import IosHeaderFix from './../Components/IosheaderFix'
import TransactionScreen from '../Screens/TransactionScreen';
import ProfileScreen from '../Screens/ProfileScreen';


export default class CustomNavigation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            options: [
                { name: "Dashboard", iconName: 'dashboard', iconType: 'MaterialIcons', color: '#F4511E', bg: '#FFCCBC', screenBg: 'rgba(255, 204, 188, 0.1)', id: 0, bgAnim: new Animated.Value(255), fontAnim: new Animated.Value(1), screen: <Dashboard switchToChat={() => { this.changeIndex(1) }} /> },
                { name: "Chat", iconName: 'comments', iconType: 'FontAwesome', color: '#7CB342', bg: '#DCEDC8', screenBg: 'rgba(220, 237, 200, 0.1)', id: 1, bgAnim: new Animated.Value(0), fontAnim: new Animated.Value(0), screen: <ChatMain /> },
                { name: "Profile", iconName: 'user', iconType: 'FontAwesome', color: '#FBC02D', bg: '#FFF9C4', screenBg: 'rgba(255, 249, 196, 0.1)', id: 2, bgAnim: new Animated.Value(0), fontAnim: new Animated.Value(0), screen: <ProfileScreen switchToChat={() => { this.changeIndex(1) }} /> },
                { name: "Transactions", iconName: 'cash', iconType: 'Ionicons', color: '#00ACC1', bg: '#B2EBF2', screenBg: 'rgba(178, 235, 242, 0.1)', id: 3, bgAnim: new Animated.Value(0), fontAnim: new Animated.Value(0), screen: <TransactionScreen /> },

            ],
            currentId: 0,
            previousId: 0,
            screenFader: new Animated.Value(1)
        };
    }

    changeIndex = (index) => {
        this.setState({ screenFader: new Animated.Value(0) })
        for (let i = 0; i < this.state.options.length; i++) {
            if (i !== this.state.currentId) {
                this.state.options[this.state.currentId].bgAnim = new Animated.Value(0)
                this.state.options[this.state.currentId].fontAnim = new Animated.Value(0)
            }
            //  animationArr.push(anim)
        }



        this.setState({ currentId: index }, () => {
            Animated.parallel([
                Animated.timing(this.state.options[index].bgAnim, {
                    toValue: 255,
                    duration: 300
                }),
                Animated.timing(this.state.options[index].fontAnim, {
                    toValue: 1,
                    duration: 300
                }),
                Animated.timing(this.state.screenFader, {
                    toValue: 1,
                    duration: 300
                })

            ]).start()
        });
        // Animated.parallel(animationArr).start()
    }

    render() {

        const interpolateColor = this.state.options[this.state.currentId].bgAnim.interpolate({
            inputRange: [0, 250],
            outputRange: ['rgb(255,255,255)', this.state.options[this.state.currentId].bg]
        })



        return (
            <View style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center', }}>
                <Animated.View style={[styles.contentHolder, { opacity: this.state.screenFader, backgroundColor: this.state.options[this.state.currentId].screenBg }]}>
                    {this.state.currentId !== 3 ?
                        (
                            <View>
                                <IosHeaderFix />
                                <View style={{ width: '100%', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)', paddingBottom: 10, paddingTop: 3 }}>
                                    <Image source={require('./../assets/logo.png')} style={{ height: 35, width: '100%', }}
                                        resizeMode="contain"
                                    />
                                </View>
                            </View>
                        )
                        :
                        (null)
                    }


                    {this.state.options[this.state.currentId].screen}

                </Animated.View>




                <View style={styles.footerArea}>
                    {this.state.options.map((option, index) => {
                        return (
                            this.state.currentId === option.id ?
                                (
                                    <Animated.View key={index} style={[styles.selectedIcon, { backgroundColor: interpolateColor }]}>
                                        {/* <Icon
                                            name={option.iconName}
                                            type={option.iconType}
                                            color={option.color}
                                            style={styles.navIcon}
                                            size={30}
                                        /> */}
                                        <Icon type={option.iconType} name={option.iconName}
                                            style={[styles.navIcon, { color: option.color }]} />

                                        <Animated.Text style={[styles.selectedText, { color: option.color, opacity: option.fontAnim, flexShrink: 1, }]}>{option.name}</Animated.Text>
                                    </Animated.View>
                                ) :
                                (

                                    <TouchableOpacity onPress={() => {
                                        this.changeIndex(index)
                                    }}
                                        key={index}

                                    >
                                        {/* <Icon
                                            name={option.iconName}
                                            type={option.iconType}
                                            color='black'
                                            style={styles.navIconUnclicked}
                                            size={30}
                                        /> */}
                                        <Icon type={option.iconType} name={option.iconName}
                                            style={[styles.navIconUnclicked, { color: 'black' }]} />
                                    </TouchableOpacity>
                                )

                        )
                    })}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    contentHolder: {
        flex: 15,
        backgroundColor: '#FFCCBC',
        width: '100%'
    },
    footerArea: {
        width: '100%',
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingTop: 15,
        paddingBottom: 25,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,

        elevation: 3,

    },
    navIconUnclicked: {
        padding: 5,
        fontSize: 20
    },
    selectedIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        paddingRight: 19,
        paddingLeft: 9,
        borderRadius: 18
    },
    selectedText: {
        paddingLeft: 3,
    },
    navIcon: {
        fontSize: 20,
        marginRight: 5
    }
})
