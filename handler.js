const Alexa = require('ask-sdk-core')

const welcomeOutput = 'Welcome to Tunexa, I can tell hourly updates of how much the Tunisian Dinar is worth. So, do you want to know how much Tunisian Dinars are worth in Dollars or in Euros.'
const welcomeReprompt = 'do you want to know how much Tunisian Dinars are worth in Dollars or Euros.'
const helpOutput = 'You can demonstrate the delegate directive by saying "Tunexa".'
const helpReprompt = 'Try saying "Tunexa".'
const factIntro = [
  'as for the last hour,',
  'at this moment,',
  'based on the latest currency rates,'
]

const LaunchRequestHandler = {
  canHandle (handlerInput) {
    const request = handlerInput.requestEnvelope.request
    return request.type === 'LaunchRequest'
  },
  handle (handlerInput) {
    const responseBuilder = handlerInput.responseBuilder
    return responseBuilder
      .speak(welcomeOutput)
      .reprompt(welcomeReprompt)
      .getResponse()
  }
}

const InProgressRatesHandler = {
  canHandle (handlerInput) {
    const request = handlerInput.requestEnvelope.request
    return request.type === 'IntentRequest' &&
      request.intent.name === 'GetCurrencyRate' &&
      request.dialogState !== 'COMPLETED'
  },
  handle (handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent
    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse()
  }
}

const CompletedRatesHandler = {
  canHandle (handlerInput) {
    const request = handlerInput.requestEnvelope.request
    return request.type === 'IntentRequest' && request.intent.name === 'GetCurrencyRate'
  },
  async handle (handlerInput) {
    let outputSpeech = 'This is the default message.'
    const currency = handlerInput.requestEnvelope.request.intent.slots.currency.value
    const currencySymbol = getCurrencyAbrv(currency)
    const url = `https://free.currencyconverterapi.com/api/v6/convert?q=${currencySymbol}_TND`
    const jsonPath = `${currencySymbol}_TND`

    const responseBuilder = handlerInput.responseBuilder
    await getRemoteData(url)
      .then((response) => {
        const rate = JSON.parse(response).results[jsonPath].val
        outputSpeech = `${getRandomPhrase(factIntro)} one ${currency.slice(0, -1)} is worh ${rate.toFixed(2)} Tunisian Dinars`
      })
      .catch((err) => {
        outputSpeech = err.message
      })

    return responseBuilder.speak(outputSpeech).getResponse()
  }
}

const HelpHandler = {
  canHandle (handlerInput) {
    const request = handlerInput.requestEnvelope.request
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent'
  },
  handle (handlerInput) {
    const responseBuilder = handlerInput.responseBuilder
    return responseBuilder
      .speak(helpOutput)
      .reprompt(helpReprompt)
      .getResponse()
  }
}

const CancelStopHandler = {
  canHandle (handlerInput) {
    const request = handlerInput.requestEnvelope.request
    return request.type === 'IntentRequest' &&
      (request.intent.name === 'AMAZON.CancelIntent' || request.intent.name === 'AMAZON.StopIntent')
  },
  handle (handlerInput) {
    const responseBuilder = handlerInput.responseBuilder
    const speechOutput = 'Okay, talk to you later! '

    return responseBuilder
      .speak(speechOutput)
      .withShouldEndSession(true)
      .getResponse()
  }
}

const SessionEndedHandler = {
  canHandle (handlerInput) {
    const request = handlerInput.requestEnvelope.request
    return request.type === 'SessionEndedRequest'
  },
  handle (handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`)
    return handlerInput.responseBuilder.getResponse()
  }
}

const ErrorHandler = {
  canHandle () {
    return true
  },
  handle (handlerInput, error) {
    const request = handlerInput.requestEnvelope.request

    console.log(`Original Request was: ${JSON.stringify(request, null, 2)}`)
    console.log(`Error handled: ${error}`)

    return handlerInput.responseBuilder
      .speak('Sorry, I can not understand the command.  Please say again.')
      .reprompt('Sorry, I can not understand the command.  Please say again.')
      .getResponse()
  }
}

function getRandomPhrase (array) {
  const i = Math.floor(Math.random() * array.length)
  return (array[i])
}

const getRemoteData = function (url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? require('https') : require('http')
    const request = client.get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error('Failed with status code: ' + response.statusCode))
      }
      const body = []
      response.on('data', (chunk) => body.push(chunk))
      response.on('end', () => resolve(body.join('')))
    })
    request.on('error', (err) => reject(err))
  })
}

const getCurrencyAbrv = function (currency) {
  const abrv = {
    euros: 'EUR',
    dollars: 'USD'
  }
  return abrv[currency]
}

const skillBuilder = Alexa.SkillBuilders.custom()
exports.rates = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    InProgressRatesHandler,
    CompletedRatesHandler,
    CancelStopHandler,
    HelpHandler,
    SessionEndedHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda()
