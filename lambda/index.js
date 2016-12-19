'use strict';

var path = require('path');
var https = require('https');
var sdk = require('alexa-sdk');

var i18n = {
  'en-GB': {
    translation: {
      SKILL_NAME: 'Quickipedia',
      HELP_MESSAGE: 'You can ask me for a random quick for example!',
      HELP_REPROMPT: 'What can I help you with?',
      STOP_MESSAGE: 'Goodbye!',
      QUICK: '%TOPIC. %QUICK. (Explanation by %USERNAME.)',
      ERROR: 'Unfortunately an error occurred in your request. Please try again later.'
    }
  },
  'en-US': {
    translation: {
      SKILL_NAME: 'Quickipedia',
      HELP_MESSAGE: 'You can ask me for a random quick for example!',
      HELP_REPROMPT: 'What can I help you with?',
      STOP_MESSAGE: 'Goodbye!',
      QUICK: '%TOPIC. %QUICK. (Explanation by %USERNAME.)',
      ERROR: 'Unfortunately an error occurred in your request. Please try again later.'
    }
  },
  'de-DE': {
    translation: {
      SKILL_NAME: 'Quickipedia',
      HELP_MESSAGE: 'Frage mich nach beispielsweise nach einem zufälligen Quick!',
      HELP_REPROMPT: 'Wie kann ich dir helfen?',
      STOP_MESSAGE: 'Auf Wiedersehen!',
      QUICK: '%TITLE%. %TEXT%. (Erklärung von %USERNAME%.)',
      ERROR: 'Leider trat bei deiner Anfrage ein Fehler auf. Bitte versuche es später noch einmal.'
    }
  }
};

function apiRequest (type, locale, callback) {

  var language = (locale === 'de-DE') ? 'de' : 'en';

  https.get('https://' + language + '.quickipedia.org/api/' + type, function (response) {
    var body = '';
    response.on('data', function (data) {
      body += data;
    });
    response.on('end', function () {
      try {
        var parsed = JSON.parse(body);
        callback(false, parsed);
      } catch (e) {
        callback(true);
      }
    });
  }).on('error', function () {
    callback(true);
  });

}

function getNewQuicks (locale, callback) {
  return apiRequest('new', locale, callback);
}

function getPopularQuicks (locale, callback) {
  return apiRequest('popular', locale, callback);
}

function getRandomQuick (locale, callback) {
  return apiRequest('random', locale, callback);
}

function handlersFactory (locale) {
  return {
    LaunchRequest: function () {
      this.emit(':ask', this.t('HELP_MESSAGE'));
    },
    GetNewIntent: function () {
      var that = this;
      getNewQuicks(locale, function (err, quicks) {
        if (err) {
          that.emit(':tell', that.t('ERROR'));
        } else {
          var quick = quicks[0];
          that.emit(':tell', that.t('QUICK').replace('%TITLE%', quick.title).replace('%TEXT%', quick.text).replace('%USERNAME%', quick.username));
        }
      });
    },
    GetPopularIntent: function () {
      var that = this;
      getPopularQuicks(locale, function (err, quicks) {
        if (err) {
          that.emit(':tell', that.t('ERROR'));
        } else {
          var quick = quicks[0];
          that.emit(':tell', that.t('QUICK').replace('%TITLE%', quick.title).replace('%TEXT%', quick.text).replace('%USERNAME%', quick.username));
        }
      });
    },
    GetRandomIntent: function () {
      var that = this;
      getRandomQuick(locale, function (err, quick) {
        if (err) {
          that.emit(':tell', that.t('ERROR'));
        } else {
          that.emit(':tell', that.t('QUICK').replace('%TITLE%', quick.title).replace('%TEXT%', quick.text).replace('%USERNAME%', quick.username));
        }
      });
    },
    'AMAZON.HelpIntent': function () {
      this.emit(':ask', this.t('HELP_MESSAGE'), this.t('HELP_REPROMPT'));
    },
    'AMAZON.CancelIntent': function () {
      this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
      this.emit(':tell', this.t('STOP_MESSAGE'));
    }
  };
}

module.exports = {
  handler: function (event, context, callback) {
    var alexa = sdk.handler(event, context);
    alexa.appId = 'amzn1.ask.skill.06d2310c-4aba-45ee-a54d-43a38b4b8f9e';
    alexa.resources = i18n;
    alexa.registerHandlers(handlersFactory(event.request.locale));
    alexa.execute();
  }
};
