#Tunexa
An Amazon Alexa skill that tells you the lates currency rates against the Tunisian Dinar.
![enter image description here](https://media.giphy.com/media/2kVgUeVWhyKefmphT0/giphy.gif)

----------
###Dependencies###

 - [ask-sdk-core](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/tree/2.0.x/ask-sdk-core)
 - [ask-sdk-model](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs/tree/2.0.x/ask-sdk-core)
 -  [The Free Currency Converter API](https://free.currencyconverterapi.com/)
 ----------
 
###Usage###
The endpoint for this skill is an AWS Lambda Function. To deploy make sure you install the *[Serverless](https://serverless.com/)* framework then deploy by running `sls deploy`, then make sure set an Alexa Skill Kit trigger for the Lambda in the console using the skill ID found in the Alexa skill console.

On the Alexa side, copy the content of ```model.json``` into your Json Editor in your Alexa skill console to build the model.

And you're good to go!
![enter image description here](https://media.giphy.com/media/l0IsIZw8doJm3ysRq/giphy.gif)
 
 

