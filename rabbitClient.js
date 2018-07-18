var Q    = require('q')
var amqp = require('amqplib/callback_api')

function Rabbit() {
   this.queueName   = 'main-queue';
   this.rmqChannel  = null;
   this._initialise();
}

Rabbit.prototype._initialise = function() {
    var self            = this;
    var deferInitialise = Q.defer();

    Q(undefined)
        // create connection
        .then(function() {
            var deferConnection = Q.defer()
            amqp.connect('amqp://localhost', function(err, connection) {
                if(err) {
                    return deferConnection.reject(err)
                }
                deferConnection.resolve(connection)
            })
            return deferConnection.promise;
        })
        // create channel
        .then(function(connection) {
            var deferChannel = Q.defer()
            connection.createChannel(function(err, channel) {
                if(err) {
                    return deferChannel.reject(err);
                }
                deferChannel.resolve(channel);
            });
            return deferChannel.promise;
        })
        // set channel to parent Rabbit object
        .then(function(channel) {
            self.rmqChannel = channel;
            deferInitialise.resolve();
            console.log('RabbitMq connection initialised...')
        })
        // Error handling
        .fail(function (err) {
            console.log('Error while connecting to RabbitMq: ', err);
            deferInitialise.reject(err);
        })

    return deferInitialise.promise;
};

Rabbit.prototype.sendMessage = function(message) {
    var self             = this;
    var deferSendMessage = Q.defer();
    // initialise in case rmqChannel object is not there
    if (!self.rmqChannel) {
        self._initialise()
            // Successfully initialised
            .then(function () {
                self._sendMessage(message);
                deferSendMessage.resolve();
            })
            // Error occurred while initialising
            .fail(function (err) {
                deferSendMessage.reject(err);
            })
    }
    // otherwise just send the message
    else {
        console.log('Already connected to RabbitMq.');
        self._sendMessage(message);
        deferSendMessage.resolve();
    }
    return deferSendMessage.promise;
};

Rabbit.prototype._sendMessage = function(message) {
    var stringifiedMessage = JSON.stringify(message);
    
    // Prior to sending the message just confirm if the queue is present or not
    this.rmqChannel.assertQueue(this.queueName, { durable: false });
    
    // Send message to the queue
    this.rmqChannel.sendToQueue(this.queueName, new Buffer(stringifiedMessage));

    console.log('Message sent successfully!')
};

module.exports = Rabbit;