import React, { Component } from 'react';
import { keystore } from 'eth-lightwallet';
import {
  StyleSheet,
  Text,
  View,
  AsyncStorage,
  Modal,
  Button,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Web3 from 'web3';

const web3 = new Web3(`https://ropsten.infura.io/3umTwfTvyW6CcVZ3hmN7`);
export default class Test extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      address: null,
      seed: null,
      key: null,
    };
  }

  createVault() {
    return new Promise(resolve => {
      let addr;
      let key;
      const randomSeed = keystore.generateRandomSeed();
      this.setState({ seed: randomSeed });
      keystore.createVault(
        {
          password: '',
          seedPhrase: randomSeed,
          hdPathString: "m/44'/60'/0'/0/0",
        },
        function(err, ks) {
          console.log(err, ks);
          ks.keyFromPassword('', function(err, pwDerivedKey) {
            if (err) throw err;
            ks.generateNewAddress(pwDerivedKey);
            addr = ks.getAddresses();
            ks.passwordProvider = function(callback) {
              callback(null, '');
            };
            key = ks.exportPrivateKey(addr[0], pwDerivedKey);
            resolve([addr[0], key]);
          });
        }
      );
    });
  }

  handleCreate() {
    this.setState({ loading: true });
    this.createVault().then((r) =>
      this.setState({ address: r[0], key: r[1], loading: false })
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <Button
          disabled={this.state.loading}
          title="criar carteira"
          onPress={this.handleCreate.bind(this)}
        />
        <ActivityIndicator animating={this.state.loading} size="large" />
        <Text>
          Anote sua frase-chave. ela é essencial para recuperar a carteira no
          futuro: {this.state.seed}
        </Text>
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
  textInput: {
    width: 200,
  },
  icon: {
    margin: 6,
  },
  text: {
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
});
