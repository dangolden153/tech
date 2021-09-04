import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { withNavigation } from 'react-navigation'
class Card extends Component {
    constructor(props) {
        super(props);
        let name = props.name;
        name = name.toString()


        var splitString = name.split("");

        var reverseArray = splitString.reverse();

        this.state = {
            reversedName: reverseArray
        };
    }

    getRotatedString = () => {
        let name = this.props.name;
        name = name.toString()


        var splitString = name.split(""); // var splitString = "hello".split("");
        // ["h", "e", "l", "l", "o"]

        // Step 2. Use the reverse() method to reverse the new created array
        var reverseArray = splitString.reverse(); // var reverseArray = ["h", "e", "l", "l", "o"].reverse();
        // ["o", "l", "l", "e", "h"]

        // Step 3. Use the join() method to join all elements of the array into a string
        var reversed = reverseArray.join("");
        // "olleh"



        return <Text>{component}</Text>
    }

    switchToChat=()=> {
        console.warn("Switch to chat called")
        this.props.switchToChat()

    }
    render() {
        return (
            <TouchableOpacity
                activeOpacity={0.7}
                style={{ backgroundColor: this.props.color, borderRadius: RFValue(10), height: RFValue(230), marginLeft: RFValue(5), marginRight: RFValue(5), width: RFValue(70) }}
                onPress={() => {
                    this.props.navigation.navigate('CardDetails', {
                        name: this.props.name,
                        color: this.props.color,
                        cost: this.props.cost,
                        logoImage: this.props.logoImage,
                        cardKey: this.props.cardKey,
                        type: this.props.type,
                        switchToChat: ()=>this.switchToChat(),
                        cardType:this.props.cardType
                    })
                }}
            >
                {/* {this.getRotatedString()} */}
                <ImageBackground
                    style={{ height: '100%', width: '100%', borderRadius: RFValue(10), justifyContent: 'space-between', alignItems: 'center', }}
                    source={this.props.logoImage}
                    imageStyle={{ opacity: 0.1, marginTop: 100 }}

                    resizeMode="cover"
                >
                    <Image
                        resizeMode="contain"
                        source={this.props.logoImage} style={{ height: 40, width: 40, marginTop: RFValue(10), padding: RFValue(14) }} />
                    <Text style={{
                        transform: [
                            { rotate: "270deg" },
                        ],
                        color: 'white', fontWeight: 'bold', fontSize: RFValue(17),
                        width: RFValue(110)
                    }}> {this.props.name} </Text>

                    <View style={styles.costHolder}>
                        <Text style={{ paddingTop: RFValue(10), color: 'rgba(255,255,255,0.7)', fontSize: RFValue(11) }}>{this.props.cost ? this.props.cost + "/$" : ""}</Text>
                    </View>

                    {/* {this.state.reversedName.map((character, index) => {
                    return (
                        <Text style={styles.character}> {character} </Text>

                    )
                })} */}
                </ImageBackground>

            </TouchableOpacity >
        );
    }
}


const styles = StyleSheet.create({
    character: {
        transform: [{ rotate: '270deg' }],
        color: 'white', fontWeight: 'bold',
        padding: 0, margin: 0, lineHeight: 0
    },
    costHolder: {
        borderTopColor: 'rgba(255,255,255,0.5)',
        borderTopWidth: 1,
        marginBottom: RFValue(10)
    }
})


export default withNavigation(Card)