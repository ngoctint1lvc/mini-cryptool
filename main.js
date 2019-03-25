const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const crypto = require('crypto')
const fs = require('fs')

function createWindow(){
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        },
        icon: __dirname + '/app/images/ninja.png'
    })
    win.loadFile('./app/index.html')
    win.setMenuBarVisibility(false)
}

// aes
ipcMain.on('aes-encryption', (event, args) => {
    const {message, password} = args
    console.log('encryption', message, password)
    const key = crypto.scryptSync(password, 'salt', 32)
    const iv = Buffer.alloc(16, 0)
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
    let encrypted = cipher.update(message, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    event.sender.send('aes-encryption-reply', encrypted)
})

ipcMain.on('aes-decryption', (event, args) => {
    let {message, password} = args
    console.log('decryption', message, password)
    const key = crypto.scryptSync(password, 'salt', 32)
    const iv = Buffer.alloc(16, 0)
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let decrypted = decipher.update(message, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    event.sender.send('aes-decryption-reply', decrypted)
})

// rc4
ipcMain.on('rc4-encryption', (event, args) => {
    const {message, password} = args
    console.log('encryption', message, password)
    const key = crypto.createHash('sha256').update(password).digest()
    const iv = Buffer.alloc(96, 0)
    const cipher = crypto.createCipheriv('rc4', key, iv)
    let encrypted = cipher.update(message, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    event.sender.send('rc4-encryption-reply', encrypted)
})

ipcMain.on('rc4-decryption', (event, args) => {
    let {message, password} = args
    console.log('decryption', message, password)
    const key = crypto.createHash('sha256').update(password).disest()
    const iv = Buffer.alloc(96, 0)
    const decipher = crypto.createDecipheriv('rc4', key, iv)
    let decrypted = decipher.update(message, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    event.sender.send('rc4-decryption-reply', decrypted)
})

// rsa
ipcMain.on('rsa-genkey', (event) => {
    crypto.generateKeyPair('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: 'secret'
        }
    }, (err, publicKey, privateKey) => {
        if (!err) {
            event.sender.send('rsa-genkey-reply', {publicKey, privateKey})
        }
    })

    //console.log(crypto)

    // const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {
    //     modulusLength: 4096,
    //     publicKeyEncoding: {
    //         type: 'spki',
    //         format: 'pem'
    //     },
    //     privateKeyEncoding: {
    //         type: 'pkcs8',
    //         format: 'pem',
    //         cipher: 'aes-256-cbc',
    //         passphrase: 'secret'
    //     }
    // })
    // console.log(publicKey, privateKey)
})

ipcMain.on('rsa-encryption', (event, args) => {

})

// Handle open, save file dialog
ipcMain.on('open-file', (event, args) => {
    dialog.showOpenDialog(filenames => {
        if (filenames === undefined){
            console.log('No file selected')
            event.returnValue = null
        }
        else {
            event.returnValue = fs.readFileSync(filenames[0])
        }
    })
})

ipcMain.on('save-file', (event, data) => {
    dialog.showSaveDialog(filename => {
        if (filename){
            fs.writeFile(filename, data, (err) => {
                console.log(data)
            })
        }
    })
})

app.on('ready', createWindow)