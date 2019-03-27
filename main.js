const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const crypto = require('crypto')
const fs = require('fs')
const NodeRSA = require('node-rsa')
const rc4 = require('arc4')

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
    try {
        const {message, password} = args
        //console.log('encryption', message, password)
        const key = crypto.scryptSync(password, 'salt', 32)
        const iv = Buffer.alloc(16, 0)
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
        let encrypted = cipher.update(message, 'utf8', 'hex')
        encrypted += cipher.final('hex')
        event.sender.send('aes-encryption-reply', encrypted)
    }
    catch(err){
        console.log(err)
        dialog.showErrorBox('Error', 'Fail to encrypt message! Please check your key!')
    }
})

ipcMain.on('aes-decryption', (event, args) => {
    try {
        let {message, password} = args
        //console.log('decryption', message, password)
        const key = crypto.scryptSync(password, 'salt', 32)
        const iv = Buffer.alloc(16, 0)
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
        let decrypted = decipher.update(message, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        event.sender.send('aes-decryption-reply', decrypted)
    }
    catch(err){
        console.log(err)
        dialog.showErrorBox('Error', 'Fail to decrypt message! Please check your key!')
    }
})

// rc4
ipcMain.on('rc4-encryption', (event, args) => {
    try {
        const {message, password} = args
        let cipher = rc4('arc4', password)
        //console.log('encryption', message, password)
        let encrypted = cipher.encodeString(message)
        event.sender.send('rc4-encryption-reply', encrypted)
    }
    catch(err){
        console.log(err)
        dialog.showErrorBox('Error', 'Fail to encrypt message! Please check your key!')
    }
})

ipcMain.on('rc4-decryption', (event, args) => {
    try {
        let {message, password} = args
        //console.log('decryption', message, password)
        let cipher = rc4('arc4', password)
        let decrypted = cipher.decodeString(message)
        event.sender.send('rc4-decryption-reply', decrypted)
    }
    catch(err){
        console.log(err)
        dialog.showErrorBox('Error', 'Fail to decrypt message! Please check your key!')
    }
})

// rsa
ipcMain.on('rsa-genkey', (event) => {
    const key = new NodeRSA({b: 512})
    const publicKey = key.exportKey('pkcs8-public-pem')
    const privateKey = key.exportKey('pkcs8-private-pem')
    event.sender.send('rsa-genkey-reply', {publicKey, privateKey})
})

ipcMain.on('rsa-encryption', (event, args) => {
    try {
        const {message, publicKey} = args
        const key = new NodeRSA({b: 512})
        key.importKey(publicKey, 'pkcs8-public-pem')
        const encrypted = key.encrypt(message, 'hex')
        event.sender.send('rsa-encryption-reply', encrypted)
    }
    catch(err){
        console.log(err)
        dialog.showErrorBox('Error', 'Fail to encrypt message! Please check your key!')
    }
})

ipcMain.on('rsa-decryption', (event, args) => {
    try {
        const {message, privateKey} = args
        const key = new NodeRSA({b: 512})
        key.importKey(privateKey, 'pkcs8-private-pem')
        const decrypted = key.decrypt(Buffer.from(message, 'hex'), 'utf8')
        event.sender.send('rsa-decryption-reply', decrypted)
    }
    catch(err){
        console.log(err)
        dialog.showErrorBox('Error', 'Fail to decrypt message! Please check your key!')
    }
})

// Handle open, save file dialog
ipcMain.on('open-file', (event, args) => {
    dialog.showOpenDialog({
        defaultPath: __dirname,
        filters: [
            {name: 'Text file', extensions: ['txt']},
            {name: 'All files', extensions: ['*']}
        ]
    }, filenames => {
        if (filenames === undefined){
            event.sender.send('open-file-reply', null)
        }
        else {
            fs.readFile(filenames[0], function(err, data){
                if(err){
                    event.sender.send('open-file-reply', null)
                }
                else{
                    console.log(data.toString('utf8'))
                    event.sender.send('open-file-reply', data.toString('utf8'))
                }
            })
        }
    })
})

ipcMain.on('save-file', (event, data) => {
    dialog.showSaveDialog({
        defaultPath: __dirname,
        filters: [
            {name: 'Text file', extensions: ['txt']},
            {name: 'All files', extensions: ['*']}
        ]
    }, filename => {
        if (filename){
            console.log(data)
            fs.writeFile(filename, data, (err) => {
                //console.log(data)
                event.sender.send('save-file-reply', 'Complete')
            })
        }
    })
})

app.on('ready', createWindow)