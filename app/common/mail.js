module.exports = MAIL = {
    'driver': "smtp",
    'hostname': process.env.MAIL_HOST,
    'port': process.env.MAIL_PORT || 587,
    'from': {
        'address': process.env.MAIL_FROM_ADDRESS || 'hello@example.com',
        'name': process.env.MAIL_FROM_NAME || 'Example',
    },
    'secure': ["ssl", "SSL"].includes(process.env.MAIL_ENCRYPTION) ? true : false,
    'username': process.env.MAIL_USERNAME,
    'password': process.env.MAIL_PASSWORD,
}
