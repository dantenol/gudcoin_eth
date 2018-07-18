import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  AsyncStorage,
  Modal,
  Dimensions,
  FlatList,
  RefreshControl,
  Alert
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { Contract } from '../configs/contract.json';
import Web3 from 'web3';
import etherscan from 'etherscan-api';
import moment from 'moment';
import WalletReceive from './walletReceive';
import WalletSend from './walletSend';

const web3 = new Web3(`https://ropsten.infura.io/3umTwfTvyW6CcVZ3hmN7`);
const api = etherscan.init('', 'ropsten');

export default class Wallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      balance: undefined,
      pubKey: undefined,
      transactions: [],
      modal: false,
      type: undefined,
      refreshing: false,
    };
  }

  static navigationOptions = {
    headerLeft: null,
    title: 'Carteira',
  };

  componentDidMount() {
    this.getAddressInfo();
  }

  componentWillUnmount() {
    this.setState({ modal: false });
  }

  async getAddressInfo() {
    const contractAddress = '0x42420095D2E00F9013D415E85B13eA6f0a7d325F';
    let pubKey;
    try {
      pubKey = await AsyncStorage.getItem('pubKey');
    } catch (error) {
      console.log(error);
    }
    console.log(pubKey);
    const contract = new web3.eth.Contract(Contract, contractAddress, {
      from: pubKey,
    });
    const balance = await contract.methods.balanceOf(pubKey).call();
    const transactions = await api.account.tokentx(
      pubKey,
      contractAddress,
      0,
      'latest',
      'desc'
    );
    this.setState({
      balance,
      pubKey,
      transactions: transactions.result,
      refreshing: false,
    });
  }

  handleFinishTransaction(data) {
    console.log(data);
    Alert.alert(
      'Envio de gudcoins',
      data.logs[0] ? 'Sucesso!' : 'Falhou'
    );
  }

  handleToggleModal(type) {
    this.setState({ modal: !this.state.modal, type });
  }

  _onRefresh = () => {
    this.setState({ refreshing: true });
    this.getAddressInfo();
  };

  renderTransaction = ({ item }) => (
    <View style={styles.transaction}>
      <View style={styles.transactionData}>
        <Text>{moment(Number(item.timeStamp) * 1000).format('D/M/YY')} </Text>
        <Text numberOfLines={1}>
          {item.from === this.state.pubKey.toLowerCase() ? item.to : item.from}
        </Text>
      </View>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{item.value}</Text>
      </View>
      <View style={styles.arrow}>
        {item.from === this.state.pubKey.toLowerCase() ? (
          <Icon name="arrow-bold-right" type="entypo" color="red" size={16} />
        ) : (
          <Icon name="arrow-bold-left" type="entypo" color="blue" size={16} />
        )}
      </View>
    </View>
  );

  render() {
    console.log(this.state);
    return (
      <View style={styles.container}>
        <Modal
          transparent
          animationType="fade"
          onRequestClose={this.handleToggleModal.bind(this)}
          visible={this.state.modal}
        >
          {this.state.type === 'recieve' ? (
            <WalletReceive
              handleToggleModal={this.handleToggleModal.bind(this)}
              pubKey={this.state.pubKey}
            />
          ) : (
            <WalletSend
              handleToggleModal={this.handleToggleModal.bind(this)}
              handleUpdate={this.getAddressInfo.bind(this)}
              finishMessage={this.handleFinishTransaction.bind(this)}
            />
          )}
        </Modal>
        <Text>{this.state.pubKey}</Text>
        <Text>{this.state.balance}</Text>
        <View style={styles.transactions}>
          <FlatList
            data={this.state.transactions}
            renderItem={this.renderTransaction}
            keyExtractor={item => item.hash}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._onRefresh}
              />
            }
          />
        </View>
        <View style={styles.actionButtons}>
          <Button
            buttonStyle={styles.button}
            title="RECEBER"
            onPress={this.handleToggleModal.bind(this, 'recieve')}
          />
          <Button
            buttonStyle={styles.button}
            title="ENVIAR"
            onPress={this.handleToggleModal.bind(this, 'send')}
          />
        </View>
      </View>
    );
  }
}

const lightGray = '#999';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    justifyContent: 'space-around',
    flexDirection: 'row',
    position: 'absolute',
    bottom: 32,
    width: Dimensions.get('window').width,
  },
  button: {
    width: Dimensions.get('window').width * 0.4,
  },
  transactions: {
    height: 300,
  },
  transaction: {
    flexDirection: 'row',
    width: Dimensions.get('window').width,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: lightGray,
  },
  transactionData: {
    marginLeft: 16,
    flexDirection: 'column',
    flex: 6,
  },
  value: {
    fontSize: 18,
  },
  valueContainer: {
    alignItems: 'center',
    flex: 1,
  },
  arrow: {
    flex: 1,
  },
});
