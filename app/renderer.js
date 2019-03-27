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
        // console.log(args)
        aesEncryptionResult.val(args)
        aesEncryptionResult.attr('data-base64', Buffer.from(args, 'binary').toString('base64'))
    })

    ipcRenderer.on('aes-decryption-reply', (event, args) => {
        // console.log(args)
        aesDecryptionResult.val(Buffer.from(args, 'base64').toString('binary'))
        aesDecryptionResult.attr('data-base64', args)
    })

    aesEncryptionButton.click(function(){
        // console.log('aes encryption')
        ipcRenderer.send('aes-encryption', {
            message: aesEncryptionMessage.attr('data-base64'), 
            password: aesEncryptionPassword.val()
        })
    })

    aesDecryptionButton.click(function(){
        console.log('aes decryption')
        ipcRenderer.send('aes-decryption', {
            message: aesDecryptionMessage.attr('data-base64'),
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
        // console.log(args)
        rc4EncryptionResult.val(args)
        rc4EncryptionResult.attr('data-base64', Buffer.from(args, 'binary').toString('base64'))
    })

    ipcRenderer.on('rc4-decryption-reply', (event, args) => {
        // console.log(args)
        rc4DecryptionResult.val(Buffer.from(args, 'base64').toString('binary'))
        rc4DecryptionResult.attr('data-base64', args)
    })

    rc4EncryptionButton.click(function(){
        console.log('rc4 encryption')
        ipcRenderer.send('rc4-encryption', {
            message: rc4EncryptionMessage.attr('data-base64'), 
            password: rc4EncryptionPassword.val()
        })
    })

    rc4DecryptionButton.click(function(){
        console.log('rc4 decryption')
        ipcRenderer.send('rc4-decryption', {
            message: rc4DecryptionMessage.attr('data-base64'), 
            password: rc4DecryptionPassword.val()
        })
    })

    // rsa algorithm
    ipcRenderer.on('rsa-encryption-reply', (event, result) => {
        $('#rsa-encryption #result').val(result)
        $('#rsa-encryption #result').attr('data-base64', Buffer.from(result, 'binary').toString('base64'))
    })

    ipcRenderer.on('rsa-decryption-reply', (event, result) => {
        // console.log(result)
        $('#rsa-decryption #result').val(Buffer.from(result, 'base64').toString('binary'))
        $('#rsa-decryption #result').attr('data-base64', result)
    })

    ipcRenderer.on('rsa-genkey-reply', (event, result) => {
        const {publicKey, privateKey} = result
        $('#rsa-genkey #public-key').val(publicKey)
        $('#rsa-genkey #private-key').val(privateKey)
        $('#rsa-genkey #public-key').attr('data-base64', Buffer.from(publicKey, 'binary').toString('base64'))
        $('#rsa-genkey #private-key').attr('data-base64', Buffer.from(privateKey, 'binary').toString('base64'))
    })

    $('#rsa-encryption .get-result').click(() => {
        ipcRenderer.send('rsa-encryption', {
            message: $('#rsa-encryption #message').attr('data-base64'),
            publicKey: $('#rsa-encryption #key').val()
        })
    })

    $('#rsa-decryption .get-result').click(() => {
        ipcRenderer.send('rsa-decryption', {
            message: $('#rsa-decryption #message').attr('data-base64'),
            privateKey: $('#rsa-decryption #key').val()
        })
    })

    $('#rsa-genkey .get-result').click(() => {
        ipcRenderer.send('rsa-genkey')
    })

    // Update message and result textbox
    $('#message,#result').change(function(){
        console.log('message or result change')
        console.log($(this).val())
        $(this).attr('data-base64', Buffer.from($(this).val(), 'binary').toString('base64'))
    })

    // Handle file open and save
    const loading = $('.loading')
    let currentTextarea
    ipcRenderer.on('open-file-reply', function(event, result) {
        if (result){
            console.log(result)
            currentTextarea.attr('data-base64', result)
            currentTextarea.val(Buffer.from(result, 'base64').toString('binary'))
        }
        loading.removeClass('show')
    })

    $('.file-button.open').click(function(){
        try {
            currentTextarea = $(this).siblings('textarea')
            ipcRenderer.send('open-file')
            loading.addClass('show')
        }
        catch(err) {
            loading.removeClass('show')
        }
    })

    ipcRenderer.on('save-file-reply', (event, result) => {
        loading.removeClass('show')
    })

    $('.file-button.save').click(function(){
        try {
            //const data = $(this).siblings('textarea').val()
            let data = $(this).siblings('textarea').attr('data-base64')
            console.log(data)
            ipcRenderer.send('save-file', data)
        }
        catch(err) {
            loading.removeClass('show')
        }
    })
});