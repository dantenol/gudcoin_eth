import React from 'react';
import { createStackNavigator } from 'react-navigation';
import Home from './home';
import SignIn from './signIn';
import Wallet from './wallet';

const RootStack = createStackNavigator(
  {
    Home,
    SignIn,
    Wallet,
  },
  {
    initialRouteName: 'Home',
  },
);

const App = () => <RootStack />;

export default App;
