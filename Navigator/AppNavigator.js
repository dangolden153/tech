import { createStackNavigator, createAppContainer } from 'react-navigation';

import CustomNavigation from './CustomNavigation';
import CardDetailsScreen from '../Screens/CardDetailsScreen';
import ChatScreen from '../Screens/ChatScreen';
import LoginScreen from '../Screens/LoginScreen';
import SignupScreen from '../Screens/SignupScreen';
import SplashScreen from '../Screens/SplashScreen';
import ChatMain from '../Screens/ChatMain'

// Stack Navigator
const AppStackNavigator = createStackNavigator(
    {
        
        Splash: {
            screen: SplashScreen,
            navigationOptions: {
                header: null
            }
        },
        Signup: {
            screen: SignupScreen,
            navigationOptions: {
                header: null
            }
        },
        Login: {
            screen: LoginScreen,
            navigationOptions: {
                header: null
            }
        },
        CustomNav: {
            screen: CustomNavigation,
            navigationOptions: {
                header: null
            }
        },
        CardDetails: {
            screen: CardDetailsScreen,
            navigationOptions: {
                header: null
            }
        },
        Chat: {
            screen: ChatScreen,
            navigationOptions: {
                header: null
            }
        },
        ChatMain: {
            screen: ChatMain,
            navigationOptions: {
                header: null
            }
        },
    },
    {
        initialRouteName: 'Splash'
    });

// Main Application Navigator
const AppNavigator = createAppContainer(AppStackNavigator);

export default AppNavigator;