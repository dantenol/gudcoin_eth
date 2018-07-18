import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Clipboard,
  ToastAndroid,
  Share,
} from 'react-native';
import { Icon } from 'react-native-elements';
import QRCode from 'react-native-qrcode';

export default class WalletReceive extends Component {
  handlecopyAddress() {
    Clipboard.setString(this.props.pubKey);
    ToastAndroid.show('Endereço copiado', ToastAndroid.SHORT);
  }

  handleShare() {
    Share.share({ message: this.props.pubKey, title: 'Gudcoins' });
  }

  render() {
    return (
      <View elevation={2} style={styles.container}>
        <Icon
          name="close"
          size={32}
          color="#555"
          containerStyle={styles.closeButton}
          onPress={this.props.handleToggleModal}
        />
        <QRCode
          value={this.props.pubKey}
          size={250}
          fgColor="white"
          bgColor="black"
        />
        <Text style={styles.addressContainer}>{this.props.pubKey}</Text>
        <View style={styles.addressContainer}>
          <Icon
            name="content-copy"
            size={32}
            style={styles.icon}
            color="#555"
            onPress={this.handlecopyAddress.bind(this)}
          />
          <Icon
            name="share"
            size={32}
            style={styles.icon}
            color="#555"
            onPress={this.handleShare.bind(this)}
          />
        </View>
      </View>
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
    marginVertical: 80,
  },
  addressContainer: {
    marginTop: 32,
    flexDirection: 'row',
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  icon: {
    marginLeft: 16,
  },
});
