# Readme

Very light conveniece wrapper over Nodemailer to quickly spawn email notifications to admins or customers through the AWS SES transport. This module was intended for personal use only, but feel free to lurk around here or to use it yourself. No problem :)

```js
const setup = require("postme")
const send = setup("your-ses-access-id", "your-ses-access-key", "your-ses-region-server")
send({
    from: "your@email.at"
    to: "recipient@email.to",
    subject: "test email",
    text: "hello world"
})
```

When required, the module returns a configuration function. You can pass: `setup(accessKeyId, secretAccessKey, region, pool = true, maxConnections = 10, sendingRate = 10, maxRetries = 3)`. First three arguments are your AWS SES credentials. The rest of the arguments is optional.

Once configured, the configuration function will, again, return another function: the actual email transmitter. Use it to spawn your email notifications. The function accepts only one single argument: an email envelope. At bare minimum, you should pass `from`, `to`, `subject` and `text` (or `html`). [You can read about available options of that envelope right here.](https://nodemailer.com/message)
