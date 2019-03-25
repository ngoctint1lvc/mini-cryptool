const {ipcRenderer} = require('electron')

$(document).ready(function(){
    // aes algorithm
    const aesEncryptionButton = $('#aes-encryption .get-result')
    const aesEncryptionMessage = $('#aes-encryption #message')
    const aesEncryptionPassword = $('#aes-encryption #key')
    const aesEncryptionResult = $('#aes-encryption #result')

    const aesDecryptionButton = $('#aes-decryption .get-result')
    const aesDecryptionMessage = $('#aes-decryption #message')
    const aesDecryptionPassword = $('#aes-decryption #key')
    const aesDecryptionResult = $('#aes-decryption #result')

    ipcRenderer.on('aes-encryption-reply', (event, args) => {
        console.log(args)
        aesEncryptionResult.val(args)
    })

    ipcRenderer.on('aes-decryption-reply', (event, args) => {
        console.log(args)
        aesDecryptionResult.val(args)
    })

    aesEncryptionButton.click(function(){
        console.log('aes encryption')
        ipcRenderer.send('aes-encryption', {
            message: aesEncryptionMessage.val(), 
            password: aesEncryptionPassword.val()
        })
    })

    aesDecryptionButton.click(function(){
        console.log('aes decryption')
        ipcRenderer.send('aes-decryption', {
            message: aesDecryptionMessage.val(), 
            password: aesDecryptionPassword.val()
        })
    })

    // rc4 algorithm
    const rc4EncryptionButton = $('#rc4-encryption .get-result')
    const rc4EncryptionMessage = $('#rc4-encryption #message')
    const rc4EncryptionPassword = $('#rc4-encryption #key')
    const rc4EncryptionResult = $('#rc4-encryption #result')

    const rc4DecryptionButton = $('#rc4-decryption .get-result')
    const rc4DecryptionMessage = $('#rc4-decryption #message')
    const rc4DecryptionPassword = $('#rc4-decryption #key')
    const rc4DecryptionResult = $('#rc4-decryption #result')

    ipcRenderer.on('rc4-encryption-reply', (event, args) => {
        console.log(args)
        rc4EncryptionResult.val(args)
    })

    ipcRenderer.on('rc4-decryption-reply', (event, args) => {
        console.log(args)
        rc4DecryptionResult.val(args)
    })

    rc4EncryptionButton.click(function(){
        console.log('rc4 encryption')
        ipcRenderer.send('rc4-encryption', {
            message: rc4EncryptionMessage.val(), 
            password: rc4EncryptionPassword.val()
        })
    })

    rc4DecryptionButton.click(function(){
        console.log('rc4 decryption')
        ipcRenderer.send('rc4-decryption', {
            message: rc4DecryptionMessage.val(), 
            password: rc4DecryptionPassword.val()
        })
    })

    // rsa algorithm
    ipcRenderer.on('rsa-encryption-reply', (event, result) => {
        console.log(result)
        $('#rsa-encryption #result').val(result)
    })

    ipcRenderer.on('rsa-decryption-reply', (event, result) => {
        console.log(result)
        $('#rsa-decryption #result').val(result)
    })

    ipcRenderer.on('rsa-genkey-reply', (event, result) => {
        const {publicKey, privateKey} = result
        $('#rsa-genkey #public-key').val(publicKey)
        $('#rsa-genkey #private-key').val(privateKey)
    })

    $('#rsa-encryption .get-result').click(() => {
        ipcRenderer.send('rsa-encryption', {
            message: $('#rsa-encryption #message').val(),
            publicKey: $('#rsa-encryption #key').val()
        })
    })

    $('#rsa-decryption .get-result').click(() => {
        ipcRenderer.send('rsa-decryption', {
            message: $('#rsa-decryption #message').val(),
            privateKey: $('#rsa-decryption #key').val()
        })
    })

    $('#rsa-genkey .get-result').click(() => {
        ipcRenderer.send('rsa-genkey')
    })

    // Handle file open and save
    $('.file-button.open').click(function(){
        let result = ipcRenderer.sendSync('open-file')
        $(this).siblings('textarea').val(result)
    })

    $('.file-button.save').click(function(){
        const data = $(this).siblings('textarea').val()
        let result = ipcRenderer.send('save-file', data)
    })
});