import Web3 from 'web3';
import { incorrectNetworkAlert, noMetaMaskAlert, invalidNetworkIDAlert } from './alerts'
import { getEncodedABIClientSide } from './microservices'
import { GAS_PRICE, CHAINS } from './constants'
import { web3Store } from '../stores'
import { toJSON, isObservable, toJS } from 'mobx'

// instantiate new web3 instance
const web3 = web3Store.web3

// get current provider
export function getCurrentProvider() {
	console.log(web3.currentProvider);
  return web3.currentProvider;
}

export function checkWeb3(web3) {
  if (!web3) {
    setTimeout(function() {
      getWeb3((web3) => {
        if (!web3) return noMetaMaskAlert();
        web3.eth.getAccounts().then((accounts) => {
          if (accounts.length === 0) {
            return noMetaMaskAlert();
          }
        });
      });
    }, 500);
  } else {
    web3.eth.getAccounts().then((accounts) => {
      if (accounts.length === 0) {
        return noMetaMaskAlert();
      }
    });
  }
}

export function getWeb3(cb) {
  var web3 = window.web3;
	if (typeof web3 === 'undefined') {
    // no web3, use fallback
    console.error("Please use a web3 browser");
    const devEnvironment = process.env.NODE_ENV === 'development';
    if (devEnvironment) {
      web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    }

    cb(web3, false);
  } else {
    // window.web3 == web3 most of the time. Don't override the provided,
    // web3, just wrap it in your Web3.
    var myWeb3 = new Web3(web3.currentProvider);

    cb(myWeb3, false);
  }
  return myWeb3;
}

export function checkNetWorkByID(web3, _networkIdFromGET) {
  console.log(_networkIdFromGET);
  if (!_networkIdFromGET) {
    return invalidNetworkIDAlert();
  }
  web3.eth.net.getId().then((_networkIdFromNetwork) => {
    let networkNameFromGET = getNetWorkNameById(_networkIdFromGET);
    networkNameFromGET = networkNameFromGET ? networkNameFromGET : CHAINS.UNKNOWN;
    let networkNameFromNetwork = getNetWorkNameById(_networkIdFromNetwork);
    networkNameFromNetwork = networkNameFromNetwork? networkNameFromNetwork : CHAINS.UNKNOWN;
    if (networkNameFromGET !== networkNameFromNetwork) {
      console.log(networkNameFromGET +"!="+ networkNameFromNetwork);
      incorrectNetworkAlert(networkNameFromGET, networkNameFromNetwork);
    }
  });
}

export function getNetWorkNameById(_id) {
  switch (parseInt(_id, 10)) {
    case 1: {
      return CHAINS.MAINNET;
    } break;
    case 2: {
      return CHAINS.MORDEN;
    } break;
    case 3: {
      return CHAINS.ROPSTEN;
    } break;
    case 4: {
      return CHAINS.RINKEBY;
    } break;
    case 42: {
      return CHAINS.KOVAN;
    } break;
     case 12648430: {
       return CHAINS.ORACLES;
    }  break;
    default: {
      return null;
    } break;
  }
}

export function getNetworkVersion(web3) {
  if (web3.eth.net && web3.eth.net.getId) {
    return web3.eth.net.getId();
  }
  return Promise.resolve(null);
}

export function setExistingContractParams(abi, addr, setContractProperty) {
  setTimeout(function() {
    getWeb3((web3) => {
      attachToContract(web3, abi, addr, function(err, crowdsaleContract) {
        let propsCount = 0;
        let cbCount = 0;
        propsCount++;
        crowdsaleContract.token.call(function(err, tokenAddr) {
          cbCount++;
          console.log("tokenAddr: " + tokenAddr);
          // state.contracts.token.addr = tokenAddr;
          setContractProperty('token', 'addr', tokenAddr)
          // if (propsCount === cbCount) {
          //   $this.setState(state);
          // }
        });

        propsCount++;
        crowdsaleContract.multisigWallet.call(function(err, multisigWalletAddr) {
          cbCount++;
          console.log("multisigWalletAddr: " + multisigWalletAddr);
          // state.contracts.multisig.addr = multisigWalletAddr;
          setContractProperty('multisig', 'addr', multisigWalletAddr)
          // if (propsCount === cbCount) {
          //   $this.setState(state);
          // }
        });
      });
    })
  });
}

export function deployContract(i, web3, abi, bin, params, state, cb) {
  abi = abi.slice()
  //console.log('web3.eth.accounts[0]', web3.eth.accounts[0], 'bin', bin)
  getEncodedABIClientSide(web3, abi, params, i, (ABIencoded) => {
    console.log(ABIencoded);
    let binFull = bin + ABIencoded.substr(2);
    web3.eth.getAccounts().then(function(accounts) {
      web3.eth.estimateGas({
        from: accounts[0],
        data: binFull
      }, function(err, estimatedGas) {
        if (err) console.log('errrrrrrrrrrrrrrrrr', err);
        console.log('gas is estimated', estimatedGas, 'err', err)
        let estimatedGasMax = 3716260;
        if (!estimatedGas) estimatedGas = estimatedGasMax;
        if (estimatedGas > estimatedGasMax) estimatedGas = estimatedGasMax;
        else estimatedGas += 100000;
        console.log('abi', abi)
        const objAbi = JSON.parse(JSON.stringify(abi))
        let contractInstance = new web3.eth.Contract(objAbi);

        let deployOpts = {
          data: "0x" + bin,
          arguments: params,
        };

        let sendOpts = {
          from: accounts[0],
          gas: estimatedGas,
          gasPrice: GAS_PRICE
        };

        let isMined = false;

        contractInstance.deploy(deployOpts).send(sendOpts)
        .on('error', function(error) {
          console.log(error);
          return cb(error, null);
        })
        .on('transactionHash', function(transactionHash){
          console.log("contract deployment transaction: " + transactionHash);

          checkTxMined(web3, transactionHash, function txMinedCallback(receipt) {
            if (isMined) return;

            if (receipt) {
              if (receipt.blockNumber) {
                console.log("Contract deployment is mined from polling of tx receipt");
                isMined = true;
                console.log(receipt.contractAddress) // instance with the new contract address
                return cb(null, receipt.contractAddress);
              } else {
                console.log("Still mining... Polling of transaction once more");
                setTimeout(function() {
                  checkTxMined(web3, transactionHash, txMinedCallback)
                }, 5000);
              }
            } else {
              console.log("Still mining... Polling of transaction once more");
              setTimeout(function() {
                checkTxMined(web3, transactionHash, txMinedCallback)
              }, 5000);
            }
          })
        })
        .on('confirmation', function(confirmationNumber, receipt) { })
        .then(function(newContractInstance){
          if (!isMined) {
            console.log("Contract deployment is mined from Promise");
            isMined = true;
            console.log(newContractInstance.options.address) // instance with the new contract address
            cb(null, newContractInstance.options.address);
          }
        });
      });
    });
  });
}

export function sendTXToContract(web3, method, cb) {
  let isMined = false

  method
    .on('error', error => {
      return cb(error)
    })
    .on('transactionHash', transactionHash => {
      console.log("contract method transaction: " + transactionHash);

      // This additional polling of tx receipt was made, because users had problems on mainnet: wizard hanged on random
      // transaction, because there wasn't response from it, no receipt. Especially, if you switch between tabs when
      // wizard works.
      // https://github.com/oraclesorg/ico-wizard/pull/364/files/c86c3e8482ef078e0cb46b8bebf57a9187f32181#r152277434
      checkTxMined(web3, transactionHash, function txMinedCallback(receipt) {
        if (isMined) return

        if (receipt) {
          if (receipt.blockNumber) {
            console.log("Sending tx to contract is mined from polling of tx receipt");
            isMined = true

            if (0 !== +receipt.status) {
              return cb()
            }

            return cb({ message: 0 })
          } else {
            console.log("Still mining... Polling of transaction once more");
            setTimeout(() => {
              checkTxMined(web3, transactionHash, txMinedCallback)
            }, 5000)
          }
        } else {
          console.log("Still mining... Polling of transaction once more");
          setTimeout(() => {
            checkTxMined(web3, transactionHash, txMinedCallback)
          }, 5000)
        }
      })
    })
    .on('receipt', receipt => {
      if (isMined) return
      isMined = true

      if (0 !== +receipt.status) {
        return cb()
      }

      return cb({ message: 0 })
    })
}

export function checkTxMined(web3, txhash, cb) {
  web3.eth.getTransactionReceipt(txhash, function(err, receipt) {
    if (receipt)
      console.log(receipt);
    cb(receipt);
  });
}

export function attachToContract(web3, abi, addr, cb) {
  web3.eth.getAccounts().then((accounts) => {
    web3.eth.defaultAccount = accounts[0];
		console.log("web3.eth.defaultAccount:" + web3.eth.defaultAccount);

		const objAbi = JSON.parse(JSON.stringify(abi))
		let contractInstance = new web3.eth.Contract(objAbi, addr, {
      from: web3.eth.defaultAccount
    });

		if (cb) cb(null, contractInstance);
  });
}

// export web3 object instance
export default web3;
