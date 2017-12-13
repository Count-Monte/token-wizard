import sweetAlert2 from 'sweetalert2';

export function noMetaMaskAlert() {
  sweetAlert2({
    title: "Warning",
    html: "You don't have Metamask installed. Check ICO Wizard GitHub for <a href='https://github.com/oraclesorg/ico-wizard' target='blank'>the instruction</a>.",
    type: "warning"
  });
}

export function noContractDataAlert() {
  sweetAlert2({
    title: "Warning",
    html: "The crowdsale data is empty. There is nothing to deploy. Please, start ICO Wizard from the beginning.",
    type: "warning"
  });
}

export function noContractAlert() {
  sweetAlert2({
    title: "Warning",
    html: "There is no contract at this address",
    type: "warning"
  });
}

export function invalidCrowdsaleAddrAlert() {
  sweetAlert2({
    title: "Warning",
    html: "Invalid crowdsale address is indicated in config and/or in query string.",
    type: "warning"
  });
}

export function invalidNetworkIDAlert() {
  sweetAlert2({
    title: "Warning",
    html: "Invalid network ID is indicated in config and/or in query string.",
    type: "warning"
  });
}

export function successfulInvestmentAlert(tokensToInvest) {
  sweetAlert2({
    title: "Success",
    html: "Congrats! You've successfully bought " + tokensToInvest + " tokens!",
    type: "success"
  }).then(function(result) {
    if (result.value) {
      window.location.reload();
    }
  });
}

export function investmentDisabledAlert(startBlock, curBlock) {
  sweetAlert2({
    title: "Warning",
    html: "Wait, please. Crowdsale company hasn't started yet. It'll start from <b>" + startBlock + "</b> block. Current block is <b>" + curBlock + "</b>.",
    type: "warning"
  });
}

export function investmentDisabledAlertInTime(startTime) {
  sweetAlert2({
    title: "Warning",
    html: "Wait, please. Crowdsale company hasn't started yet. It'll start from <b>" + new Date(startTime) + "</b>.",
    type: "warning"
  });
}

export function incorrectNetworkAlert(correctNetworkName, incorrectNetworkName) {
  sweetAlert2({
    title: "Warning",
    html: "Crowdsale contract is from <b>" + correctNetworkName + " network</b>. But you are connected to <b>" + incorrectNetworkName + " network</b>. Please, change connection in MetaMask/Oracles plugin.",
    type: "warning"
  });
}

export function noDeploymentOnMainnetAlert() {
  sweetAlert2({
    title: "Warning",
    html: "Wizard is under maintenance on Ethereum Mainnet. Please come back later or use Kovan/Rinkeby/Oracles. Follow <a href='https://twitter.com/oraclesorg'>https://twitter.com/oraclesorg</a> for status.",
    type: "warning"
  });
}

export function warningOnMainnetAlert(tiersCount, cb) {
  let n = 100 //fraction to round
  let estimatedCost = 1.0 / n * Math.ceil(n * tiersCount * 0.16)
  let estimatedTxsCount = tiersCount * 12
  sweetAlert2({
    title: "Warning",
    html: "You are about to sign " + estimatedTxsCount + " TXs. You will see an individual Metamask windows for each of it. Please don't open two or more instances of Wizard in one browser. ICO Wizard will create " + tiersCount + "-tier(s) crowdsale for you. The total cost will be around " + estimatedCost + " ETH. Are you sure you want to proceed?",
    type: "warning",
    showCancelButton: true,
    confirmButtonText: 'Yes, I am sure!',
    cancelButtonText: "No, cancel it!",
  }).then(function(result) {
    if (result.value) {
      cb()
    }
  });
}

export function warningOnFinalizeCrowdsale() {
  return sweetAlert2({
    title: "Finalize Crowdsale",
    html: "Are you sure to finalize the crowdsale? After finalization, it's not possible to buy tokens, all tokens will be movable, reserved tokens will be issued. Press <strong>Yes</strong> to finalize, and <strong>NO</strong> to close this dialog.",
    type: "warning",
    showCancelButton: true,
    cancelButtonText: "NO",
    confirmButtonText: "Yes",
    reverseButtons: true
  })
}
