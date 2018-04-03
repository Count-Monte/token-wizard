import React from "react";
import "../../assets/stylesheets/application.css";
import { Field, Form, FormSpy } from 'react-final-form'
import arrayMutators from 'final-form-arrays'
import { FieldArray } from 'react-final-form-arrays'
import { OnChange } from 'react-final-form-listeners'
import { Link } from "react-router-dom";
import { setExistingContractParams, getNetworkVersion, getNetWorkNameById } from "../../utils/blockchainHelpers";
import { gweiToWei } from "../../utils/utils";
import { StepNavigation } from "../Common/StepNavigation";
import { WhenFieldChanges } from '../Common/WhenFieldChanges'
import { InputField2 } from "../Common/InputField2";
import { CrowdsaleBlock } from "./CrowdsaleBlock";
import { WhitelistInputBlock } from '../Common/WhitelistInputBlock'
import GasPriceInput from './GasPriceInput'
import { defaultCompanyStartDate, defaultCompanyEndDate } from './utils'
import {
  NAVIGATION_STEPS,
  VALIDATION_TYPES,
  TEXT_FIELDS,
  CHAINS,
  DESCRIPTION,
  defaultTier,
  defaultTierValidations
} from '../../utils/constants'
import { inject, observer } from "mobx-react";
import { Loader } from '../Common/Loader'
import { noGasPriceAvailable, warningOnMainnetAlert } from '../../utils/alerts'
import {
  isAddress,
  isDecimalPlacesNotGreaterThan,
  isNonNegative,
  isLessOrEqualThan,
  isPositive,
  isRequired,
  composeValidators,
  isInteger,
  isGreaterOrEqualThan,
} from '../../utils/validations'
import update from 'immutability-helper'
import classnames from 'classnames'

const { CROWDSALE_SETUP } = NAVIGATION_STEPS;
const { VALID, INVALID } = VALIDATION_TYPES;
const {
  ALLOWMODIFYING,
  CROWDSALE_SETUP_NAME,
  MINCAP,
  WALLET_ADDRESS,
  ENABLE_WHITELISTING,
  START_TIME,
  END_TIME,
  RATE,
  SUPPLY
} = TEXT_FIELDS;

@inject(
  "contractStore",
  "web3Store",
  "tierStore",
  "generalStore",
  "gasPriceStore",
  "reservedTokenStore",
  "deploymentStore",
  "tokenStore"
)
@observer
export class stepThree extends React.Component {
  constructor(props) {
    super(props);

    const { contractStore } = props;

    if (contractStore.crowdsale.addr.length > 0) {
      contractStore.setContractProperty("pricingStrategy", "addr", []);
      setExistingContractParams(contractStore.abi, contractStore.addr[0], contractStore.setContractProperty);
    }

    this.state = {
      loading: true,
      minCap: props.tierStore.globalMinCap || '',
      walletAddress: '',
      validation: {
        minCap: {
          pristine: true,
          valid: VALID
        },
        walletAddress: {
          pristine: true,
          valid: INVALID
        }
      }
    }
  }

  componentWillMount () {
    const { gasPriceStore, tierStore } = this.props

    if (tierStore.tiers.length === 0) {
      this.addCrowdsale()
      this.initialTiers = JSON.parse(JSON.stringify(tierStore.tiers))
    }

    window.scrollTo(0, 0)

    gasPriceStore.updateValues()
      .catch(() => noGasPriceAvailable())
      .then(() => {
        this.setState({ loading: false })
    //     this.updateWalletAddress({
    //       address: tierStore.tiers[0].walletAddress,
    //       pristine: true,
    //       valid: VALID,
    //     })
    //     window.scrollTo(0, 0)
      })
  }

  showErrorMessages = () => {
    const { tierStore } = this.props

    tierStore.invalidateToken()
  }

  updateTierStore = (event, property, index) => {
    const { tierStore } = this.props
    const value = event.target.value

    tierStore.setTierProperty(value, property, index)
    tierStore.validateTiers(property, index)
  }

  addCrowdsale() {
    const { tierStore, web3Store } = this.props
    const { curAddress } = web3Store

    const num = tierStore.tiers.length
    const newTier = Object.assign({}, defaultTier)
    const newTierValidations = Object.assign({}, defaultTierValidations)

    newTier.tier = `Tier ${num + 1}`

    if (num === 0) {
      newTier.whitelistEnabled = "no"
      newTier.walletAddress = curAddress
    }

    tierStore.addTier(newTier, newTierValidations)
    this.setTierDates(num)
  }

  setTierDates(num) {
    const { tierStore } = this.props
    const defaultStartTime = 0 === num ? defaultCompanyStartDate() : this.tierEndTime(num - 1)
    const defaultEndTime = 0 === num ? defaultCompanyEndDate(defaultStartTime) : defaultCompanyEndDate(this.tierEndTime(num - 1))

    const startTime = tierStore.tiers[num].startTime || defaultStartTime
    const endTime = tierStore.tiers[num].endTime || defaultEndTime

    tierStore.setTierProperty(startTime, 'startTime', num)
    tierStore.setTierProperty(endTime, 'endTime', num)
  }

  tierEndTime = (index) => this.props.tierStore.tiers[index].endTime

  goToDeploymentStage = () => {
    this.props.history.push('/4')
  }

  beforeNavigate = () => {
    const { tierStore } = this.props
    const isMinCapLessThanMaxSupply = tierStore.globalMinCap <= tierStore.maxSupply
    const isMinCapValid = this.state.validation.minCap.valid === VALID

    for (let index = 0; index < tierStore.tiers.length; index++) {
      tierStore.validateTiers('endTime', index)
      tierStore.validateTiers('startTime', index)
    }

    if (!isMinCapLessThanMaxSupply) {
      this.setState(update(this.state, {
        validation: {
          minCap: {
            valid: { $set: INVALID }
          }
        }
      }))
    }

    if (tierStore.areTiersValid /* && gasPriceIsValid */ && isMinCapValid && isMinCapLessThanMaxSupply) {
      const { reservedTokenStore, deploymentStore } = this.props
      const tiersCount = tierStore.tiers.length
      const reservedCount = reservedTokenStore.tokens.length
      const hasWhitelist = tierStore.tiers[0].whitelistEnabled === 'yes'

      deploymentStore.initialize(!!reservedCount, hasWhitelist, tiersCount)

      getNetworkVersion()
        .then(networkID => {
          if (getNetWorkNameById(networkID) === CHAINS.MAINNET) {
            const { generalStore } = this.props
            const priceSelected = generalStore.gasPrice

            let whitelistCount = 0

            if (hasWhitelist) {
              whitelistCount = tierStore.tiers.reduce((total, tier) => {
                total += tier.whitelist.length
                return total
              }, 0)
            }

            return warningOnMainnetAlert(tiersCount, priceSelected, reservedCount, whitelistCount, this.goToDeploymentStage)
          }
          this.goToDeploymentStage()
        })
        .catch(error => {
          console.error(error)
        })
    }
  }

  updateWalletAddress = ({ address, pristine, valid }) => {
    const newState = update(this.state, {
      walletAddress: { $set: address },
      validation: {
        walletAddress: {
          $set: {
            pristine,
            valid,
          },
        },
      },
    })

    this.setState(newState)
    this.props.tierStore.updateWalletAddress(address, valid)
  }

  updateMinCap = ({ value, pristine, valid }) => {
    const newState = update(this.state, {
      validation: {
        minCap: {
          $set: {
            pristine: pristine,
            valid: valid
          }
        }
      }
    })
    newState.minCap = value

    this.setState(newState)
    this.props.tierStore.setGlobalMinCap(value)
  }

  updateWhitelistEnabled = (e) => {
    this.updateMinCap({ value: '', valid: VALID, pristine: false })
    this.updateTierStore(e, "whitelistEnabled", 0)
  }

  inputErrorStyle = {
    color: 'red',
    fontWeight: 'bold',
    fontSize: '12px',
    width: '100%',
    height: '20px',
  }

  render() {
    const { generalStore, tierStore, gasPriceStore, tokenStore } = this.props

    return (
      <section className="steps steps_crowdsale-contract" ref="three">
        <StepNavigation activeStep={CROWDSALE_SETUP}/>
        <Form
          onSubmit={this.beforeNavigate}
          mutators={{ ...arrayMutators }}
          initialValues={{
            walletAddress: tierStore.tiers[0].walletAddress,
            minCap: '',
            gasPrice: gasPriceStore.gasPricesInGwei[0],
            whitelistEnabled: "no",
            tiers: this.initialTiers
          }}
          render={({ handleSubmit, values, invalid, errors, pristine, mutators: { push } }) => {
            const submitButtonClass = classnames('button', 'button_fill', {
              button_disabled: pristine || invalid
            })

            return (
              <form onSubmit={handleSubmit}>
                <WhenFieldChanges
                  field="whitelistEnabled"
                  becomes={'yes'}
                  set="minCap"
                  to={0}
                />
                <div>
                  <div className="steps-content container">
                    <div className="about-step">
                      <div className="step-icons step-icons_crowdsale-setup"/>
                      <p className="title">Crowdsale setup</p>
                      <p className="description">The most important and exciting part of the crowdsale process. Here you can
                        define parameters of your crowdsale campaign.</p>
                    </div>
                    <div className="section-title">
                      <p className="title">Global settings</p>
                    </div>
                    <div className="input-block-container">
                      <Field
                        name="walletAddress"
                        component={InputField2}
                        validate={isAddress()}
                        errorStyle={this.inputErrorStyle}
                        side="left"
                        label={WALLET_ADDRESS}
                        description="Where the money goes after investors transactions. Immediately after each transaction. We
                        recommend to setup a multisig wallet with hardware based signers."
                      />

                      <Field
                        name="gasPrice"
                        component={GasPriceInput}
                        side="right"
                        gasPrices={gasPriceStore.gasPricesInGwei}
                        validate={(value) => composeValidators(
                          isDecimalPlacesNotGreaterThan("Should not have more than 9 decimals")(9),
                          isGreaterOrEqualThan("Should be greater than 0.1")(0.1)
                        )(value.price)}
                      />
                    </div>
                    <div className="input-block-container">
                      <Field
                        name="minCap"
                        component={InputField2}
                        validate={composeValidators(
                          isNonNegative(),
                          isDecimalPlacesNotGreaterThan()(tokenStore.decimals),
                          isLessOrEqualThan('Should be less or equal than the supply of some tier')(tierStore.maxSupply)
                        )}
                        disabled={values.whitelistEnabled === 'yes'}
                        errorStyle={this.inputErrorStyle}
                        type="number"
                        side="left"
                        label={MINCAP}
                        description="Minimum amount of tokens to buy. Not the minimal amount for every transaction: if minCap is 1 and a user already has 1 token from a previous transaction, they can buy any amount they want."
                      />
                      <Field
                        name="whitelistEnabled"
                        render={({ input }) => (
                          <div className='right'>
                            <label className="label">Enable whitelisting</label>
                            <div className='radios-inline'>
                              <label className='radio-inline'>
                                <input
                                  type='radio'
                                  checked={input.value === 'yes'}
                                  value='yes'
                                  onChange={() => input.onChange('yes')}
                                />
                                <span className='title'>yes</span>
                              </label>
                              <label className='radio-inline'>
                                <input
                                  type='radio'
                                  checked={input.value === 'no'}
                                  value='no'
                                  onChange={() => input.onChange('no')}
                                />
                                <span className='title'>no</span>
                              </label>
                            </div>
                            <p className='description'>Enables whitelisting. If disabled, anyone can participate in the crowdsale.</p>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <FieldArray name="tiers">
                  {({ fields }) => (
                    <div>
                      {fields.map((name, index) => (
                        <div style={{ marginTop: '40px' }} className='steps-content container' key={index}>
                          <div className="hidden">
                            <div className="input-block-container">
                              <Field
                                name={`${name}.tier`}
                                validate={isRequired('Please enter a valid tier name between 1-30 characters')}
                                errorStyle={this.inputErrorStyle}
                                component={InputField2}
                                type="text"
                                side="left"
                                label={CROWDSALE_SETUP_NAME}
                                description={DESCRIPTION.CROWDSALE_SETUP_NAME}
                              />
                              <Field
                                name={`${name}.updatable`}
                                render={({ input }) => (
                                  <div className='right'>
                                    <label className="label">{ALLOWMODIFYING}</label>
                                    <div className='radios-inline'>
                                      <label className='radio-inline'>
                                        <input
                                          type='radio'
                                          checked={input.value === 'on'}
                                          onChange={() => input.onChange('on')}
                                          value='on'
                                        />
                                        <span className='title'>on</span>
                                      </label>
                                      <label className='radio-inline'>
                                        <input
                                          type='radio'
                                          checked={input.value === 'off'}
                                          value='off'
                                          onChange={() => input.onChange('off')}
                                        />
                                        <span className='title'>off</span>
                                      </label>
                                    </div>
                                    <p className='description'>{DESCRIPTION.ALLOW_MODIFYING}</p>
                                  </div>
                                )}
                              />
                            </div>

                            <div className="input-block-container">
                              <Field
                                name={`${name}.startTime`}
                                component={InputField2}
                                validate={isRequired()}
                                errorStyle={this.inputErrorStyle}
                                type="datetime-local"
                                side="left"
                                label={START_TIME}
                                description={DESCRIPTION.START_TIME}
                              />
                              <Field
                                name={`${name}.endTime`}
                                component={InputField2}
                                validate={isRequired()}
                                errorStyle={this.inputErrorStyle}
                                type="datetime-local"
                                side="right"
                                label={END_TIME}
                                description={DESCRIPTION.END_TIME}
                              />
                            </div>

                            <div className="input-block-container">
                              <Field
                                name={`${name}.rate`}
                                component={InputField2}
                                validate={composeValidators(
                                  isPositive(),
                                  isInteger(),
                                  isLessOrEqualThan('Should not be greater than 1 quintillion (10^18)')('1e18')
                                )}
                                errorStyle={this.inputErrorStyle}
                                type="text"
                                side="left"
                                label={RATE}
                                description={DESCRIPTION.RATE}
                              />
                              <Field
                                name={`${name}.supply`}
                                component={InputField2}
                                validate={isPositive()}
                                errorStyle={this.inputErrorStyle}
                                type="text"
                                side="right"
                                label={SUPPLY}
                                description={DESCRIPTION.SUPPLY}
                              />
                              {/*
                                * TODO: REVIEW. I'm not sure about this approach.
                                * But it worked for me to keep the error messages properly updated for the minCap field.
                                */}
                              <Field name="minCap" subscription={{}}>
                                {({ input: { onChange } }) => (
                                  <OnChange name={`${name}.supply`}>
                                    {() => {
                                      const { minCap } = values
                                      onChange(0)
                                      onChange(minCap)
                                    }}
                                  </OnChange>
                                )}
                              </Field>
                            </div>
                          </div>
                          {
                            tierStore.tiers[index].whitelistEnabled === 'yes' ? (
                              <div>
                                <div className="section-title">
                                  <p className="title">Whitelist</p>
                                </div>
                                <WhitelistInputBlock num={index}/>
                              </div>
                            ) : null
                          }
                        </div>
                      ))}
                    </div>
                  )}
                </FieldArray>

                <div className="button-container">
                    <div className="button button_fill_secondary" onClick={() => {
                      this.addCrowdsale()
                      const lastTier = this.props.tierStore.tiers[this.props.tierStore.tiers.length - 1]
                      push('tiers', JSON.parse(JSON.stringify(lastTier)))
                    }}>
                      Add Tier
                    </div>
                  <span onClick={handleSubmit} className={submitButtonClass}>Continue</span>
                </div>

                <FormSpy
                  subscription={{ values: true }}
                  onChange={({ values }) => {
                    tierStore.updateWalletAddress(values.walletAddress, VALID)
                    generalStore.setGasPrice(gweiToWei(values.gasPrice.price))
                    tierStore.setGlobalMinCap(values.minCap || 0)
                    tierStore.setTierProperty(values.whitelistEnabled, "whitelistEnabled", 0)

                    values.tiers.forEach((tier, index) => {
                      tierStore.setTierProperty(tier.tier, 'tier', index)
                      tierStore.setTierProperty(tier.updatable, 'updatable', index)
                      tierStore.setTierProperty(tier.startTime, 'startTime', index)
                      tierStore.setTierProperty(tier.endTime, 'endTime', index)
                      tierStore.updateRate(tier.rate, VALID, index)
                      tierStore.setTierProperty(tier.supply, 'supply', index)
                      tierStore.validateTiers('supply', index)
                    })
                  }}
                />
              </form>
            )
          }}
        />
        <Loader show={this.state.loading}/>
      </section>
    )
  }

  // render() {
  //   const { tierStore } = this.props;

  //   const globalSettingsBlock = (
  //     <div>
  //       <div className="section-title">
  //         <p className="title">Global settings</p>
  //       </div>
  //       <div className="input-block-container">
  //         <AddressInput
  //           side="left"
  //           title={WALLET_ADDRESS}
  //           address={this.state.walletAddress}
  //           valid={this.state.validation.walletAddress.valid}
  //           pristine={this.state.validation.walletAddress.pristine}
  //           errorMessage={VALIDATION_MESSAGES.WALLET_ADDRESS}
  //           onChange={this.updateWalletAddress}
  //           description="Where the money goes after investors transactions. Immediately after each transaction. We
  //            recommend to setup a multisig wallet with hardware based signers."
  //         />
  //         {this.renderGasPriceInput()}
  //       </div>
  //       <div className="input-block-container">
  //         <NumericInput
  //           side="left"
  //           title={MINCAP}
  //           description='Minimum amount of tokens to buy. Not the minimal amount for every transaction: if minCap is 1 and a user already has 1 token from a previous transaction, they can buy any amount they want.'
  //           disabled={tierStore.tiers[0] && tierStore.tiers[0].whitelistEnabled === "yes"}
  //           min={0}
  //           acceptEmpty={true}
  //           acceptFloat={!!this.props.tokenStore.decimals}
  //           maxDecimals={this.props.tokenStore.decimals}
  //           value={this.state.minCap}
  //           pristine={this.state.validation.minCap.pristine}
  //           valid={this.state.validation.minCap.valid}
  //           errorMessage={VALIDATION_MESSAGES.MINCAP}
  //           onValueUpdate={this.updateMinCap}
  //         />
  //         <RadioInputField
  //           extraClassName="right"
  //           title={ENABLE_WHITELISTING}
  //           items={[{ label: 'yes', value: 'yes' }, { label: 'no', value: 'no' }]}
  //           selectedItem={tierStore.tiers[0] && tierStore.tiers[0].whitelistEnabled}
  //           onChange={e => this.updateWhitelistEnabled(e)}
  //           description="Enables whitelisting. If disabled, anyone can participate in the crowdsale."
  //         />
  //       </div>
  //     </div>
  //   )

  //   return (
  //     <section className="steps steps_crowdsale-contract" ref="three">
  //       <StepNavigation activeStep={CROWDSALE_SETUP}/>
  //       <div className="steps-content container">
  //         <div className="about-step">
  //           <div className="step-icons step-icons_crowdsale-setup"/>
  //           <p className="title">Crowdsale setup</p>
  //           <p className="description">The most important and exciting part of the crowdsale process. Here you can
  //             define parameters of your crowdsale campaign.</p>
  //         </div>
  //         {globalSettingsBlock}
  //       </div>

  //       <div>
  //         { tierStore.tiers.map((tier, index) => <CrowdsaleBlock key={index} num={index}/>) }
  //       </div>

  //       <div className="button-container">
  //         <div onClick={() => this.addCrowdsale()} className="button button_fill_secondary">Add Tier</div>
  //         <Link onClick={e => this.beforeNavigate(e)} className="button button_fill" to="/4">Continue</Link>
  //       </div>

  //       <Loader show={this.state.loading}/>
  //     </section>
  //   )
  // }
}
