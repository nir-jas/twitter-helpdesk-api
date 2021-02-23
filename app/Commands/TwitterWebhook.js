'use strict'

const { Command } = require('@adonisjs/ace')
const Twitter = use('Twitter')

class TwitterWebhook extends Command {
  static get signature () {
    return 'twitter:webhook'
  }

  static get description () {
    return 'Register Twitter Webhook'
  }

  async handle (args, options) {
    console.log(await Twitter.registerWebhook())
  }
}

module.exports = TwitterWebhook
