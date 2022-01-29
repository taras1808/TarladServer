const fs = require('fs')
const User = require('../models/User')

exports.users = (userId, callback) => {
    User.query()
        .select('id', 'nickname', 'name', 'surname', 'image_url')
        .findOne('id', userId)
        .then(data => {
            if (data) callback(data)
            else callback()
        })
}

exports.usersUpdate = (socket) => async (nickname, name, surname, callback) => {
    var user = await User.query()
        .patchAndFetchById(socket.user.userId, { nickname, name, surname })

    callback(user)
}

exports.usersSearch = (socket) => async (q, page, callback) => {
    const userId = socket.user.userId
    User.query()
        .select('id', 'nickname', 'name', 'surname', 'image_url')
        .where('nickname', 'like', q + '%')
        .where('id', '!=', userId)
        .page(page, 10)
        .then(data => {
            callback(data.results)
        })
}

exports.usersImages = (socket) => async (imagePath, callback) => {
    var user = await User.query()
        .patchAndFetchById(socket.user.userId, { image_url: imagePath })
    callback(user)
}

exports.usersImagesDelete = (socket) => async (callback) => {
    var user = await User.query()
        .findById(socket.user.userId)
    if (!user) return
    fs.unlink('public/uploads/' + user.image_url.split('/')[4], async function (err) {
        if (err) return
        var user = await User.query()
            .findById(socket.user.userId)
            .patchAndFetchById(socket.user.userId, { image_url: null })
        callback(user)
    })
}

