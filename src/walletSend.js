import React, { Component } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  Clipboard,
  TouchableWithoutFeedback,
  Keyboard,
  Vibration,
  AsyncStorage,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RNCamera } from 'react-native-camera';
import { Button } from 'react-native-elements';
import Web3 from 'web3';
import Tx from 'ethereumjs-tx';
import safeStorage from 'react-native-safe-storage/SafeStorage';
import { Contract } from '../configs/contract.json';

const web3 = new Web3(`https://ropsten.infura.io/3umTwfTvyW6CcVZ3hmN7`);

const DismissKeyboard = ({ children }) => (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
);

const Loading = () => (
  <React.Fragment>
    <ActivityIndicator size="large" />
    <Text>Processando a transação</Text>
  </React.Fragment>
);

const hexRegex = /0[xX][0-9a-fA-F]{40}/g;

export default class WalletSend extends Component {
  constructor(props) {
    super(props);
    this.state = {
      address: '',
      readAddress: '',
      loading: false,
    };
  }

  handleBarCodeRead(e) {
    Vibration.vibrate();
    const { data } = e;
    let hexCode = data.match(hexRegex);

    if (hexCode) {
      this.setState({ readAddress: hexCode[0], address: hexCode[0] });
    } else {
      alert('Endereço inválido!');
    }
  }

  async handleSend() {
    const contractAddress = '0x42420095D2E00F9013D415E85B13eA6f0a7d325F';
    let privKey;
    let pubKey;
    try {
      pubKey = await AsyncStorage.getItem('pubKey');
      privKey = await safeStorage.getEntryAsync('privKey', 'empty');
    } catch (error) {
      console.log(error);
    }
    const count = await web3.eth.getTransactionCount(pubKey);
    this.setState({ loading: true });

    const contract = new web3.eth.Contract(Contract, contractAddress, {
      from: pubKey,
    });
    const rawTransaction = {
      from: pubKey,
      nonce: '0x' + count.toString(16),
      gasPrice: '0x33450',
      gasLimit: '0x33450',
      to: contractAddress,
      value: '0x0',
      data: contract.methods
        .transfer(this.state.address, this.state.value)
        .encodeABI(),
      chainId: 0x03,
    };

    privKey = privKey.slice(2);
    const bufdPrivKey = new Buffer(privKey, 'hex');

    let tx = new Tx(rawTransaction);
    tx.sign(bufdPrivKey);
    const serializedTx = tx.serialize();
    var receipt = await web3.eth.sendSignedTransaction(
      '0x' + serializedTx.toString('hex')
    );
    console.log(`Receipt info:  ${JSON.stringify(receipt, null, '\t')}`);
    this.props.handleUpdate();
    this.props.finishMessage(receipt);
    this.props.handleToggleModal();
  }

  async handlePasteClipboard() {
    var address = await Clipboard.getString();
    this.setState({ address });
  }

  render() {
    return (
      <DismissKeyboard>
        <View elevation={2} style={styles.container}>
          {!this.state.loading ? (
            <React.Fragment>
              <Icon
                name="close"
                size={32}
                color="#555"
                style={styles.closeButton}
                onPress={this.props.handleToggleModal}
              />
              {!this.state.readAddress ? (
                <RNCamera
                  ref={ref => {
                    this.camera = ref;
                  }}
                  style={styles.preview}
                  type={RNCamera.Constants.Type.back}
                  onBarCodeRead={e => this.handleBarCodeRead(e)}
                />
              ) : (
                <Text style={styles.text}>
                  Endereço encontrado: {this.state.readAddress}
                </Text>
              )}
              <View style={styles.inputContainer}>
                <TextInput
                  multiline
                  style={styles.addressInput}
                  value={this.state.address}
                  placeholder="Endereço de destino"
                  onChangeText={address => this.setState({ address })}
                />
                <Icon
                  name="content-copy"
                  size={24}
                  color="#555"
                  onPress={this.handlePasteClipboard.bind(this)}
                />
              </View>
              <TextInput
                style={styles.valueInput}
                value={this.state.value}
                placeholder="Valor"
                keyboardType="numeric"
                onChangeText={value => this.setState({ value })}
              />
              <Button
                title="ENVIAR"
                iconRight
                icon={{ name: 'send', size: 24, color: '#fff' }}
                onPress={this.handleSend.bind(this)}
              />
            </React.Fragment>
          ) : (
            <Loading />
          )}
        </View>
      </DismissKeyboard>
    );
  }
}

const white = '#FFF';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: white,
    marginHorizontal: 15,
    marginVertical: 50,
  },
  inputContainer: {
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressInput: {
    width: 232,
  },
  valueInput: {
    width: 256,
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  preview: {
    width: 300,
    height: 300,
  },
  text: {
    textAlign: 'center',
  },
});
