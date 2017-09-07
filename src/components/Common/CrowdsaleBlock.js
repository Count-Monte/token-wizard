import React from 'react'
import '../../assets/stylesheets/application.css';
import { WhitelistInputBlock } from './WhitelistInputBlock'
import { getOldState, defaultCompanyEndDate } from '../../utils/utils'
import { InputField } from './InputField'
import { RadioInputField } from './RadioInputField'
import { defaultState, VALIDATION_MESSAGES, VALIDATION_TYPES, TEXT_FIELDS } from '../../utils/constants'
const { EMPTY, VALID, INVALID } = VALIDATION_TYPES
const { START_TIME, END_TIME, RATE, SUPPLY, WALLET_ADDRESS, CROWDSALE_SETUP_NAME, ALLOWMODIFYING } = TEXT_FIELDS

export class CrowdsaleBlock extends React.Component {

  constructor(props) {
    super(props);
    //props.onChange.bind(this);
    let oldState = getOldState(props, defaultState)
    this.state = Object.assign({}, oldState)
    let state = this.state
    state.crowdsale[props.num].tier = "Tier " + (this.props.num + 1)
    state.crowdsale[props.num].updatable = "off"
    //state.crowdsale[props.num].startTime = state.crowdsale[props.num - 1].endTime;
    //state.crowdsale[props.num].endTime = defaultCompanyEndDate(state.crowdsale[props.num].startTime);
    //this.setState(newState);
    this.setState(state);
    console.log('333 validations', this.state.validations)
  }

  componentDidMount() {
    let newState = this.state
    newState.crowdsale[this.props.num].startTime = newState.crowdsale[this.props.num - 1].endTime;
    newState.crowdsale[this.props.num].endTime = defaultCompanyEndDate(newState.crowdsale[this.props.num].startTime);
    this.setState(newState);
  }

	render() {
    const { validations } = this.state
    let { crowdsale } = this.state
    let { pricingStrategy } = this.state
    let { num } = this.props
    let { onChange } = this.props
    let whitelistInputBlock = <div>
      <div className="white-list-title">
          <p className="title">Whitelist</p>
        </div>
        <WhitelistInputBlock
          num = {num}
          onChange={(e, cntrct, num, prop) => onChange(e, cntrct, num, prop)}
        ></WhitelistInputBlock>
    </div>
    return (<div key={num.toString()} style={{"marginTop": "40px"}} className="steps-content container">
        <div className="hidden">
          <InputField 
            side='left' 
            type='text' 
            title={CROWDSALE_SETUP_NAME} 
            value={crowdsale[num].tier}
            onChange={(e) => onChange(e, 'crowdsale', num, 'tier')}
            description={`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veni.`}
          />
          {/*<InputField 
            side='right' 
            type='text' 
            title={WALLET_ADDRESS} 
            value={crowdsale[num].walletAddress} 
            onChange={(e) => onChange(e, 'crowdsale', num, 'walletAddress')}
            description={`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veni.`}
          />*/}
          <InputField 
            side='right' 
            type='number' 
            title={RATE} 
            value={pricingStrategy[num].rate} 
            onChange={(e) => onChange(e, 'pricingStrategy', num, 'rate')}
            description={`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veni.`}
          />
          <InputField 
            side='left' 
            type='datetime-local' 
            title={START_TIME} 
            value={crowdsale[num].startTimeTemp} 
            defaultValue={this.state.crowdsale[this.props.num - 1].endTime}
            onChange={(e) => onChange(e, 'crowdsale', num, 'startTime')}
            description={`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veni.`}
          />
          <InputField 
            side='right' 
            type='datetime-local' 
            title={END_TIME} 
            value={crowdsale[num].endTimeTemp} 
            defaultValue={defaultCompanyEndDate(this.state.crowdsale[this.props.num - 1].endTime)}
            onChange={(e) => onChange(e, 'crowdsale', num, 'endTime')}
            description={`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veni.`}
          />
          <InputField 
            side='left' 
            type='number' 
            title={SUPPLY} 
            value={crowdsale[num].supply} 
            onChange={(e) => onChange(e, 'crowdsale', num, 'supply')}
            description={`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veni.`}
          />
          <RadioInputField 
            side='right' 
            title={ALLOWMODIFYING}
            items={["on", "off"]}
            vals={["on", "off"]}
            state={this.state}
            target={this.state.crowdsale[num].updatable}
            name={'crowdsale-updatable-' + num}
            onChange={(e) => onChange(e, 'crowdsale', num, 'updatable')}
            description={`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veni.`}
          />
        </div>
        {this.state.crowdsale[0].whitelistdisabled === "yes"?"":whitelistInputBlock}
      </div>)
  }
}