const http = require('http');

const server = http.createServer();

const io = require('socket.io')(server, {
    cors: { origin: '*' }
});

// Almacén temporal de mensajes
let messages = [];

io.on('connection', (socket) => {
    console.log('Se ha conectado un cliente');

    // Notificar a todos los demás usuarios que un nuevo cliente se conectó
    socket.broadcast.emit('chat_message', {
        usuario: 'INFO',
        mensaje: 'Se ha conectado un nuevo usuario',
    });

    // Enviar los mensajes existentes al cliente recién conectado
    socket.emit('initial_messages', messages);

    // Manejar nuevo mensaje
    socket.on('chat_message', (data) => {
        // Agregar el nuevo mensaje al almacenamiento
        messages.push(data);

        // Retransmitir el mensaje a todos los clientes
        io.emit('chat_message', data);
    });

    // Manejar edición de mensaje
    socket.on('edit_message', (data) => {
        // Buscar el mensaje por su ID y actualizarlo
        const index = messages.findIndex((msg) => msg.id === data.id);
        if (index !== -1) {
            messages[index].mensaje = data.mensaje; // Actualizar mensaje en el almacenamiento
            io.emit('edit_message', data); // Notificar a todos los clientes del cambio
        }
    });

    // Manejar eliminación de mensaje
    socket.on('delete_message', (messageId) => {
        // Eliminar el mensaje del almacenamiento
        messages = messages.filter((msg) => msg.id !== messageId);

        // Notificar a todos los clientes sobre la eliminación
        io.emit('delete_message', messageId);
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
        console.log('Un cliente se ha desconectado');
    });
});

server.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});
