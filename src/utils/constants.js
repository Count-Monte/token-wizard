export const defaultState = { 
	contracts: { 
		token: {}, 
		crowdsale: {},
		pricingStrategy: {}
	}, 
	token: {},
	crowdsale: {},
	pricingStrategy: {tranches: [0, 2272727272727, 45000000000000000000000, 2380952380952, 90000000000000000000000, 2500000000000, 999999999999999000000000000000000, 0]},
	blockTimeGeneration: 17
}

export const NAVIGATION_STEPS = {
	CROWDSALE_CONTRACT: 'Crowdsale Contract',
	TOKEN_SETUP: 'Token Setup',
	CROWDSALE_SETUP: 'Crowdsale Setup',
	PUBLISH: 'Publish',
	CROWDSALE_PAGE: 'Crowdsale Page'
}


export const VALIDATION_MESSAGES = {
	NAME: 'Please enter a valid name between 1-30 characters',
	TICKER: 'Please enter a valid Ticker that is less than three characters',
	SUPPLY: 'Please enter a valid number greater than 0',
	DECIMALS: 'Please enter a number greater than or equal to zero'
}

export const TEXT_FIELDS = {
	NAME: 'Name',
	TICKER: 'Ticker',
	SUPPLY: 'Supply',
	DECIMALS: 'Decimals'
}
