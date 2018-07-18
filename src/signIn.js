import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  Button,
  Clipboard,
  Alert,
  AsyncStorage,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import safeStorage from 'react-native-safe-storage/SafeStorage';
import Web3 from 'web3';

const DismissKeyboard = ({ children }) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
);

const web3 = new Web3(`https://ropsten.infura.io/3umTwfTvyW6CcVZ3hmN7`);

export default class SignIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      privKey: '',
      message: 'Digite sua chave privada',
    };
  }

  static navigationOptions = {
    title: 'Adicionar carteira',
  };

  async handlePasteClipboard() {
    var content = await Clipboard.getString();
    this.setState({ privKey: content });
  }

  handleClearInput() {
    this.setState({ privKey: '' });
  }

  async handleSetKey(key) {
    const account = web3.eth.accounts.privateKeyToAccount(key);
    this.setState({ message: `Sua chave pública é:\n${account.address}` });
    try {
      await AsyncStorage.setItem('pubKey', account.address);
      await safeStorage.getEntryAsync('privKey', account.privateKey);
    } catch (error) {
      console.log(error);
    }
    // Clipboard.setString('');
    this.props.navigation.navigate('Wallet');
  }

  handleCheckKey() {
    const { privKey } = this.state;

    if (privKey.length === 66) {
      this.handleSetKey(privKey);
    } else if (privKey.length === 64) {
      this.setState({ privKey: '0x' + privKey }, () =>
        this.handleSetKey('0x' + privKey)
      );
    } else {
      Alert.alert('Erro', 'A chave inserida é inválida. Tente novamente', [
        {
          text: 'OK',
        },
      ]);
    }
  }

  // async handleCheckStore() {
  //   let priv;
  //   let pub;
  //   try {
  //     priv = await safeStorage.getEntryAsync('privKey', 'empty');
  //     pub = await AsyncStorage.getItem('pubKey');
  //     alert('priv: ' + priv + 'pub: ' + pub);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  render() {
    return (
      <DismissKeyboard>
        <View style={styles.container}>
          <Text style={styles.text}>{this.state.message}</Text>
          <View style={styles.inputContainer}>
            <TextInput
              multiline
              style={styles.textInput}
              value={this.state.privKey}
              placeholder="Chave privada"
              onChangeText={privKey => this.setState({ privKey })}
            />
            <Icon
              name="content-copy"
              size={24}
              style={styles.icon}
              color="#900"
              onPress={this.handlePasteClipboard.bind(this)}
            />
            <Icon
              name="backspace"
              size={24}
              style={styles.icon}
              color="#606"
              onPress={this.handleClearInput.bind(this)}
            />
          </View>
          <Button title="Continuar" onPress={this.handleCheckKey.bind(this)} />
          {/* <Button title="Continuar" onPress={this.handleCheckStore.bind(this)} /> */}
        </View>
      </DismissKeyboard>
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
