import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  Button,
  AsyncStorage,
} from 'react-native';

export default class Home extends Component {
  constructor(props) {
    super(props);
  }

  static navigationOptions = {
    header: null,
  };

  componentDidMount() {
    this.checkWallet();
  }

  async checkWallet() {
    var pubKey;
    try {
      pubKey = await AsyncStorage.getItem('pubKey');
    } catch (error) {
      console.log(error);
    }
    if (pubKey) {
      this.props.navigation.navigate('Wallet');
      console.log(pubKey);
    }
  }

  handlePress(e) {
    this.props.navigation.navigate(e);
  }

  render() {
    return (
      <View style={styles.container}>
        <Image
          style={styles.image}
          resizeMode="contain"
          source={require('../assets/GUDCOIN.png')}
        />
        <View style={styles.buttonContainer}>
          <Button
            onPress={this.handlePress.bind(this, 'SignIn')}
            title="Já tenho uma conta"
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            onPress={this.handlePress.bind(this, 'signup')}
            title="Não tenho uma conta"
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 24,
  },
  image: {
    flexBasis: Dimensions.get('window').width / 2,
    flexGrow: 0,
  },
});
