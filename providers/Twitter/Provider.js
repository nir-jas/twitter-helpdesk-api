const { ServiceProvider } = require('@adonisjs/fold')

class TwitterProvider extends ServiceProvider {
  register () {
    this.app.singleton('Twitter', () => {
      const Config = this.app.use('Adonis/Src/Config')
      return new (require('.'))(Config)
    })
  }
}

module.exports = TwitterProvider