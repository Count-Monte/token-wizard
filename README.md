![ICO Wizard DApp](https://forum.oracles.org/uploads/default/original/1X/4defd4c248825a9216a247ab3c5cb1f613d7e5ef.png)

# ICO Wizard DApp

[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/hyperium/hyper/master/LICENSE)
[![Build Status](https://travis-ci.org/oraclesorg/ico-wizard.svg?branch=master)](https://travis-ci.org/oraclesorg/ico-wizard)
[![Waffle.io - Columns and their card count](https://badge.waffle.io/oraclesorg/ico-wizard.svg?columns=all)](http://waffle.io/oraclesorg/ico-wizard)
[![Join the chat at https://gitter.im/oraclesorg/ico-wizard](https://badges.gitter.im/oraclesorg/ico-wizard.svg)](https://gitter.im/oraclesorg/ico-wizard?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

### **_Attention_!**
#### __Please, read the wiki or watch demo before you start to create crowdsales using ICO Wizard. Consider deploying on the Mainnet after testing on Kovan testnet.__

_A Quote_

> ICO tools should be available for non-coders for free. Raising funds from a crowd is our basic human right.

ICO wizard is a tool to create token and crowdsale contracts in five simple steps. Wizard is based on TokenMarket contracts. Wizard is baked how we like it: decentralized, client side, serverless, open source, free, awesome.

ICOs usually have two or more contracts. One token contract and one or more crowdsale contract plus supplemental contracts, e.g., safe math, pricing strategy, etc. Most token contracts are the same (ERC-20); most crowdsale contracts are different. Token implementation should be stable for compatibility, and it is crucial to connect token to exchanges and wallets. Crowdsale contracts on another side should follow fashion and differentiate a project from others, e.g., create a new type of FOMO, fear of missing out.

This tool is free to use and open source. Although the tool is free to use, deploying contracts to the Ethereum network requires GAS in the form of ETHER. See "Deployment Time & Gas" part of Wiki for estimates. It is recommended to test the ICO Wizard on Kovan testnet before deploying to the main network. See below for links to Kovan Test Ether Faucets:

 [Kovan Testnet/faucet - Gitter](https://gitter.im/kovan-testnet/faucet)

 [Find out other ways to obtain kETH](https://github.com/kovan-testnet/faucet)


## ICO Wizard DApp Wiki
- [Introduction](https://github.com/oraclesorg/ico-wizard/wiki/ICO-Wizard-Introduction)
- [Demo](https://github.com/oraclesorg/ico-wizard/wiki/ICO-Wizard-Demo)
- [Requirements](https://github.com/oraclesorg/ico-wizard/wiki/ICO-Wizard-Requirements)
- [Strategy](https://github.com/oraclesorg/ico-wizard/wiki/ICO-Wizard-Strategy)
- [How to run](https://github.com/oraclesorg/ico-wizard/wiki/ICO-Wizard-How-to-run)
- [Deployment Time & Gas](https://github.com/oraclesorg/ico-wizard/wiki/ICO-Wizard-Deployment-Stats)
- [Verifying Smart-Contracts](https://github.com/oraclesorg/ico-wizard/wiki/ICO-Wizard-Verifying-Contracts)
- [Projects on ICO Wizard](https://github.com/oraclesorg/ico-wizard/wiki/ICO-Wizard-Projects)
- [Notable Contributors](https://github.com/oraclesorg/ico-wizard/wiki/ICO-Wizard-Notable-Contributors)
- [Support](https://github.com/oraclesorg/ico-wizard/wiki/ICO-Wizard-Support)
- [Disclaimer](https://github.com/oraclesorg/ico-wizard/wiki/ICO-Wizard-Disclaimer)
### Policies
- [Pull Request Policy](https://github.com/oraclesorg/ico-wizard/wiki/Pull-Request-Policy)
### Managing your Crowdsale
- [Methods for Management](https://github.com/oraclesorg/ico-wizard/wiki/ICO-Wizard-Managing-Crowdsale)


## Support

If you are having any issues while using the ICO Wizard DApp, please create a "New Issue" on it's [Github Issues section](https://github.com/oraclesorg/ico-wizard/issues). 

Join the Oracles.org Forum at [https://forum.oracles.org/](https://forum.oracles.org/)

## ICO Wizard Pull Request (PR) Policy

Rationale: The project is moving forward. Our users start ICOs with real value on the platform. I'd like to introduce a pull request policy. 

### General rules 

Each PR should have:

- (Mandatory) Description
  - a human-readable description of changes
  - a human-readable description of the purpose of the PR
- (Mandatory) What is it: (Fix), (Feature), or (Refactor) in Title, e.g., "(Fix) price of 1 token in Wei > 18 decimals"
- (Recommended) Each PR should have one commit message and therefore should only contain one specific fix or feature. Otherwise, multiple PRs should be made
- (Optional) Any additional concerns or comments 

Merge policy:
- Fix can be merged to master by approval of 1 approver
- Feature/Refactor can be merged by approval of min 2 approvers

Current approvers:
- Franco Victorio
- Viktor Baranov
- Igor Barinov

Inactive approvers:
- Stephan Zharkov 
- Jeff Christian

_Inactive approvers used to be approvers but not active currently._


_Important_. Each of the required approvers cannot have authored or submitted the PR.

### Emergency fixes

Emergency fixes without approval should be deployed to the `stage` branch.
CI will deploy the staging branch to [https://wizard-stage.oracles.org](https://wizard-stage.oracles.org) automatically.

If a fix pushed without approvers it should have "Emergency" in title, e.g., "Emergency: (Fix) price of 1 token in wei > 18 decimals"

## Contributors guide

Issues which are looking for a handsome contributors are marked as _LookingForContributor_ label in [Issues](https://github.com/oraclesorg/ico-wizard/issues?q=is%3Aissue+is%3Aopen+label%3ALookingForContributor)  section of the GitHub.

### Notable Contributors

Brought to you by [Oracles Network](https://oracles.org/team) team.

We appreciate contributors from the community:

- Jeff Christian
- Roman Storm
- Stephen Arsenault

## Disclaimer

The software is in Beta stage. 
ICO Wizard is constantly under active development. The “Beta” labelling implies that while the core features of the software have been implemented, bugs and issues may still remain undiscovered until this phase of testing is complete. As such, ICO Wizard may experience the following issues, but not limited to, during usage:

- lost of tokens/funds from incorrect configuration;
- unexpected delays;
- unexpected visual artifacts.
 