import nodemailer from 'nodemailer'
import config from '../../config'

let transporter = nodemailer.createTransport({
  host: 'email-smtp.us-east-1.amazonaws.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass
  }
})

// setup email data with unicode symbols
let mailOptions = {
  from: '"Plenty" <notifications@plenty.life>',
  subject: 'Plenty Notifications', // Subject line
  text: 'There are new messages on https://plenty.life'
}

export function sendMail (email: string, html: string): Promise<any> {
  const options = Object.assign({}, mailOptions, {
    to: email, html
  })
  return new Promise((resolve, reject) => {
    transporter.sendMail(options, (error, info) => {
      if (error) {
        console.error('Failed to send mail', error)
        reject(error)
      }
      console.log('Message sent: %s', info.messageId)
      resolve(info)
    })
  })
}
