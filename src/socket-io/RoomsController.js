exports.join = (socket) => () => {
    socket.leaveAll()
    socket.join('u' + socket.user.userId)
    User.relatedQuery('chats')
        .for(socket.user.userId)
        .select('id')
        .then(chats => {
            for (let chat of chats) {
                socket.join(chat.id)
            }
        })
}
