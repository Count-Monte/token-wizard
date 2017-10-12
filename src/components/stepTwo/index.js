import React from 'react'
import '../../assets/stylesheets/application.css';
import { Link } from 'react-router-dom'
import { checkWeb3, getWeb3, getNetworkVersion } from '../../utils/blockchainHelpers'
import { getOldState, stepsAreValid, validateValue, allFieldsAreValid } from '../../utils/utils'
import { StepNavigation } from '../Common/StepNavigation'
import { InputField } from '../Common/InputField'
import { ReservedTokensInputBlock } from '../Common/ReservedTokensInputBlock'
import { NAVIGATION_STEPS, VALIDATION_MESSAGES, VALIDATION_TYPES, defaultState, TEXT_FIELDS, intitialStepTwoValidations } from '../../utils/constants'
import { noDeploymentOnMainnetAlert } from '../../utils/alerts'
const { TOKEN_SETUP } = NAVIGATION_STEPS
const { EMPTY, VALID, INVALID } = VALIDATION_TYPES
const { NAME, TICKER, DECIMALS } = TEXT_FIELDS

export class stepTwo extends React.Component {
  constructor(props) {
    super(props);
    window.scrollTo(0, 0);
    console.log('props', props)
    let oldState = getOldState(props, defaultState)
    console.log('oldState', oldState)
    this.state = Object.assign({}, defaultState, oldState, intitialStepTwoValidations )
  }

  componentDidMount() {
    checkWeb3(this.state.web3);

    //emergency alert
    /*setTimeout(() => {
      getWeb3((web3) => {
        getNetworkVersion(web3, (_networkID) => {
          console.log(_networkID);
          if (_networkID == 1) {
            return noDeploymentOnMainnetAlert();
          }
        })
      })
    }, 500);*/
  }

  getNewParent (property, parent, value) {
    let newParent = { ...this.state[`${parent}`] }
    newParent[property] = value
    return newParent
  }

  showErrorMessages = (parent) => {
    this.validateAllFields(parent)
  }

  changeState = (event, parent, key, property) => {
    let value = event.target.value
    console.log("parent: " + parent, "key: " + key, "property: " + property, "value: " + value);
    let newState = { ...this.state }
    console.log(newState);
    if (property === "startTime" || property === "endTime") {
      let targetTime = new Date(value);
      let targetTimeTemp = targetTime.setHours(targetTime.getHours() - targetTime.getTimezoneOffset()/60);//.setUTCHours(new Date(targetTime).getHours());
      if (property === "startTime") {
        console.log("property == startTime");
        if (targetTimeTemp)
          newState.crowdsale[key].startTime = new Date(targetTimeTemp).toISOString().split(".")[0];
        else
          newState.crowdsale[key].startTime = null;
      } else if (property === "endTime") {
        if (targetTimeTemp)
          newState.crowdsale[key].endTime = new Date(targetTimeTemp).toISOString().split(".")[0];
        else 
          newState.crowdsale[key].endTime = null
        if (newState.crowdsale[key + 1]) {
          newState.crowdsale[key + 1].startTime = newState.crowdsale[key].endTime;
          let newEndDate = new Date(newState.crowdsale[key].endTime);
          newEndDate = newEndDate.setDate(new Date(newState.crowdsale[key].endTime).getDate() + 4);;
          newState.crowdsale[key + 1].endTime = new Date(newEndDate).toISOString().split(".")[0];
        }
      }
    } else if (property.indexOf("whitelist_") === 0) {
      let prop = property.split("_")[1];
      newState.crowdsale[key][`whiteListInput`][prop] = value
    } else if (property.indexOf("reservedtokens_") === 0) {
      console.log(newState);
      let prop = property.split("_")[1];
      newState.token[`reservedTokensInput`][prop] = value
    } else {
      if( Object.prototype.toString.call( newState[parent] ) === '[object Array]' ) {
        newState[parent][key][property] = value;//this.getNewParent(property, parent, key, value)
      } else {
        newState[parent][property] = value;//this.getNewParent(property, parent, key, value)
      }
    }
    if (property.indexOf("whitelist") === -1 && property.indexOf("reservedtokens") === -1) {

      if ( Object.prototype.toString.call( newState[`validations`] ) === '[object Array]' ) {
        newState[`validations`][key][property] = validateValue(value, property, newState)
      } else {
        newState[`validations`][property] = validateValue(value, property, newState)
      }
      //console.log('property', property)
      //console.log('newState[`validations`][property]',  newState[`validations`], validateValue(value, property, newState), 'newState', newState)
    }
    console.log('newState', newState)
    this.setState(newState)
  }

  handleInputBlur (parent, property, key) {
    //console.log(parent, property, key);
    let newState = { ...this.state }
    let value
    if (property === 'rate') {
      value = newState[parent][key][property]
    } else {
      value = key === undefined ? newState[parent][property] : newState[parent][key][property]
    }

    if ( Object.prototype.toString.call( newState[`validations`] ) === '[object Array]' ) {
      if (!key) {
        newState[`validations`][property] = validateValue(value, property, newState)
      } else {
        newState[`validations`][key][property] = validateValue(value, property, newState)
      }
    } else {
      newState[`validations`][property] = validateValue(value, property, newState)
    }
    this.setState(newState)
  }

  renderLink () {
    return <Link className="button button_fill" to={{ pathname: '/3', query: { state: this.state, changeState: this.changeState } }}>Continue</Link>
  }
  
  validateAllFields (parent ) {
    let newState = { ...this.state }
    //let properties = Object.keys(newState[parent])
    //let values = Object.values(newState[parent])

    let properties = []
    let values = []
    let inds = []
    if( Object.prototype.toString.call( newState[parent] ) === '[object Array]' ) {
      if (newState[parent].length > 0) {
        for (let i = 0; i < newState[parent].length; i++) {
          Object.keys(newState[parent][i]).map(property => {
            values.push(newState[parent][i][property])
            properties.push(property);
            inds.push(i);
          })
        }
      }
    } else {
      properties = Object.keys(newState[parent])
      values = Object.values(newState[parent])
    }

    //console.log(properties);
    //console.log(values);

    properties.forEach((property, index) => {
      if ( Object.prototype.toString.call( newState[`validations`] ) === '[object Array]' ) {
        newState[`validations`][inds[index]][property] = validateValue(values[index], property)
      } else {
        newState[`validations`][property] = validateValue(values[index], property)
      }
    })
    this.setState(newState)
  }

  renderLinkComponent () {
    // console.log(`stepsAreValid(this.state.validations) || allFieldsAreValid('token', this.state)`, stepsAreValid(this.state.validations), allFieldsAreValid('token', this.state))
    if(stepsAreValid(this.state.validations) || allFieldsAreValid('token', this.state)){
      return this.renderLink()
    }
    return <div onClick={this.showErrorMessages.bind(this, 'token')} className="button button_fill"> Continue</div>
  }

  render() {
    const { token, validations } = this.state
    console.log('step 2', this.state)
    return (
    	<section className="steps steps_crowdsale-contract" ref="two">
        <StepNavigation activeStep={TOKEN_SETUP}/>
        <div className="steps-content container">
          <div className="about-step">
            <div className="step-icons step-icons_token-setup"></div>
            <p className="title">Token setup</p>
            <p className="description">
              Configure properties of your token. Created token contract will be ERC-20 compatible. 
            </p>
          </div>
          <div className="hidden">
            <InputField side='left' type='text' 
              errorMessage={VALIDATION_MESSAGES.NAME} 
              valid={validations.name} 
              title={NAME} 
              value={token.name} 
              onBlur={() => this.handleInputBlur('token', 'name')}
              onChange={(e) => this.changeState(e, 'token', 0, 'name')}
              description={`The name of your token. Will be used by Etherscan and other token browsers. Be afraid of trademarks.`}
            />
            <InputField 
              side='right' type='text' 
              errorMessage={VALIDATION_MESSAGES.TICKER} 
              valid={validations.ticker} 
              title={TICKER} 
              value={token.ticker} 
              onBlur={() => this.handleInputBlur('token', 'ticker')}
              onChange={(e) => this.changeState(e, 'token', 0, 'ticker')}
              description={`The three letter ticker for your token. There are 17,576 combinations for 26 english letters. Be hurry. `}
            />
            <InputField 
              side='left' type='number'
              errorMessage={VALIDATION_MESSAGES.DECIMALS} 
              valid={validations.decimals} 
              title={DECIMALS}
              value={token.decimals} 
              onBlur={() => this.handleInputBlur('token', 'decimals')}
              onChange={(e) => this.changeState(e, 'token', 0, 'decimals')}
              description={`Refers to how divisible a token can be, from 0 (not at all divisible) to 18 (pretty much continuous).`}
            />
          </div>
          <div className="reserved-tokens-title">
            <p className="title">Reserved tokens</p>
          </div>
          <ReservedTokensInputBlock
            state={this.state}
            onChange={(e, cntrct, num, prop) => this.changeState(e, 'token', 0, prop)}
          ></ReservedTokensInputBlock>
        </div>
        <div className="button-container">
          {this.renderLinkComponent()}
        </div>
      </section>
  )}
}