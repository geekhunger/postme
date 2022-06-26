const {check: type, assert} = require("type-approve")
const {createTransport} = require("nodemailer")
let {config, SES} = require("aws-sdk")


const setup = function(accessKeyId, secretAccessKey, region, pool = true, maxConnections = 10, sendingRate = 10, maxRetries = 3) {
    assert(
        type({strings: [accessKeyId, secretAccessKey, region]}),
        "Missing AWS SES credentials!"
    )
    config.update({
        accessKeyId,
        secretAccessKey,
        region
    })
    return createTransport({
        SES: new SES({
            apiVersion: "2012-10-17",
            maxRetries
        }),
        pool, // keep a queue of opened connections (advised for batch-sending)
        maxConnections, // count of concurrent (open) connections
        sendingRate // messages per second
    })
}


const send = function(envelope, transport) {
    /*
        IMPORTANT NOTE:
        While working with a sandboxed AWS SES account, emails can only be sent from and to verified SES entities.
        This is even true if entire domain was approved!
        For testing, each email address needs to be a verified as an AWS SES entity separately!
    */
    assert(type({object: envelope}), "Missing email envelope!")
    assert(type({string: envelope.from}), "Unknown email sender!")
    assert(type({string: envelope.to}, {array: envelope.to}), "Unknown email recipients!")
    assert(type({string: envelope.subject}), "Undefined email intention!")
    assert(!type({nil: envelope.text}) || !type({nil: envelope.html}), "Undefined email content!")
    if(!type({nil: envelope.cc})) assert(type({string: envelope.cc}, {array: envelope.cc}), "Malformed email copy recipients!")
    if(!type({nil: envelope.bcc})) assert(type({string: envelope.bcc}, {array: envelope.bcc}), "Malformed email blindcopy recipients!")
    if(!type({nil: envelope.attachments})) assert(type({array: envelope.attachments}), "Malformed email attachments!")
    try {
        return new Promise(function(resolve, reject) {
            transport.sendMail(envelope, function(failure, email) {
                if(failure) reject(failure)
                else resolve(email) // with envelope.envelope and envelope.messageId
            })
        })
    } catch(exception) {
        console.error(`Failed sending an email from '${envelope.from}' to '${envelope.to}'!`, exception)
    }
}


module.exports = function(...options) {
    let transmitter = setup(...options)
    return function(email) {
        return send(email, transmitter)
    }
}
