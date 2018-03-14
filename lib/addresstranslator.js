var Bitcore_ = {
  btc: require('bitcore-lib'),
  bch: require('bitcore-lib-cash')
};

var _ = require('lodash');

function AddressTranslator() {
};


AddressTranslator.getAddressCoin = function (address) {
  try {
    new Bitcore_['btc'].Address(address);
    return 'btc';
  } catch (e) {
    try {
      new Bitcore_['bch'].Address(address);
      return 'bch';
    } catch (e) {
      return;
    }
  }
};

AddressTranslator.translate = function (addresses, coin, origCoin) {
  var wasArray = true;
  if (!_.isArray(addresses)) {
    wasArray = false;
    addresses = [addresses];
  }
  origCoin = origCoin || AddressTranslator.getAddressCoin(addresses[0]);
  var ret = _.map(addresses, function (x) {
    var orig = new Bitcore_[origCoin].Address(x).toObject();
    return Bitcore_[coin].Address.fromObject(orig).toString();
  });

  if (wasArray)
    return ret;
  else
    return ret[0];

};

AddressTranslator.translateInput = function (addresses) {
  return this.translate(addresses, 'btc', 'bch');
}

AddressTranslator.translateOutput = function (addresses) {
  legacyAddr = this.translateLegacyAddress(addresses);
  copayAddr = this.translateCopayAddress(legacyAddr);
  return this.translateCashAddress(copayAddr);
}


AddressTranslator.translateCashAddress= function (addressToTranslate) {
  var origAddress = new Bitcore_['btc'].Address(addressToTranslate);
  var origObj = origAddress.toObject();
  var resultAddress = Bitcore_['bch'].Address.fromObject(origObj).toCashAddress().replace('bitcoincash:','');
  return resultAddress;
}

AddressTranslator.translateCopayAddress= function(addressToTranslate) {
  var origAddress = new Bitcore_['btc'].Address(addressToTranslate);
  var origObj = origAddress.toObject();
  var resultAddress = Bitcore_['bch'].Address.fromObject(origObj);
  return resultAddress;
}

AddressTranslator.translateLegacyAddress = function (addressToTranslate) {
  var origCoin = this.getAddressCoin(addressToTranslate);
  if (origCoin == 'btc') return addressToTranslate;

  var origAddress = new Bitcore_['bch'].Address(addressToTranslate);
  var origObj = origAddress.toObject();
  var resultAddress = Bitcore_['btc'].Address.fromObject(origObj);
  return resultAddress;
}




module.exports = AddressTranslator;
