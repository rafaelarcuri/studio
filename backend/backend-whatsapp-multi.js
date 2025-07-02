const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Mock Data Store ---
let mockWhatsAppNumbers = [
  {
    id: '+5511912345678',
    docId: 'mock-wa-1',
    name: 'Vendas Varejo',
    status: 'online',
    lastPairedAt: new Date(Date.now() - 86400000).toISOString(),
    pairedBy: 'Admin Developer',
  },
  {
    id: '+5521987654321',
    docId: 'mock-wa-2',
    name: 'Suporte Técnico',
    status: 'offline',
    lastPairedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    pairedBy: 'Admin Developer',
  },
  {
    id: '+5531999998888',
    docId: 'mock-wa-3',
    name: 'Marketing',
    status: 'expired',
    lastPairedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    pairedBy: 'Admin Developer',
  },
];


// --- Socket.IO Logic ---
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('start-session', (data) => {
    const { name, phone, pairedBy } = data;
    console.log(`Attempting to start session for ${phone}`);

    if (!name || !phone) {
      console.error('Name and phone are required');
      socket.emit('pairing-error', { number: phone, message: 'Nome e número são obrigatórios.' });
      return;
    }
    if (mockWhatsAppNumbers.some(n => n.id === phone)) {
        console.error('Number already exists');
        socket.emit('pairing-error', { number: phone, message: 'Este número já está cadastrado.' });
        return;
    }

    const newEntry = {
      id: phone,
      name: name,
      status: 'pending',
      lastPairedAt: new Date().toISOString(),
      pairedBy: pairedBy,
      docId: `mock-wa-${Date.now()}`
    };
    mockWhatsAppNumbers.push(newEntry);
    
    const qrCodeUrl = `https://placehold.co/256x256.png?text=QR+para+${encodeURIComponent(phone)}`;
    socket.emit('qr', { number: phone, qr: qrCodeUrl });
    console.log(`Sent QR for ${phone}`);
    
    // Simulate successful pairing after a delay
    setTimeout(() => {
      const numberIndex = mockWhatsAppNumbers.findIndex(n => n.id === phone);
      if (numberIndex > -1) {
        mockWhatsAppNumbers[numberIndex].status = 'online';
        mockWhatsAppNumbers[numberIndex].lastPairedAt = new Date().toISOString();
        const updatedNumber = mockWhatsAppNumbers[numberIndex];
        console.log(`Session ready for ${phone}`);
        // Emit to all clients so the list updates everywhere
        io.emit('ready', { number: updatedNumber });
      }
    }, 8000); // 8-second delay to simulate scanning
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});


// --- API Endpoints ---

// GET /numbers - Get all numbers
app.get('/numbers', (req, res) => {
  res.json(mockWhatsAppNumbers);
});


// PUT /numbers/:id/status - Update status
app.put('/numbers/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const number = mockWhatsAppNumbers.find(n => n.id === id);
    if (number) {
        number.status = status;
        if (status === 'online') {
            number.lastPairedAt = new Date().toISOString();
        }
        io.emit('status-update', { number }); // Broadcast the change
        res.json({ message: 'Status updated successfully' });
    } else {
        res.status(404).json({ error: 'Number not found' });
    }
});

// DELETE /numbers/:id - Delete a number
app.delete('/numbers/:id', (req, res) => {
    const { id } = req.params;
    const index = mockWhatsAppNumbers.findIndex(n => n.id === id);
    if (index > -1) {
        const [deletedNumber] = mockWhatsAppNumbers.splice(index, 1);
        io.emit('number-deleted', { id: deletedNumber.id }); // Broadcast the change
        res.json({ message: 'Number deleted successfully' });
    } else {
        res.status(404).json({ error: 'Number not found' });
    }
});


server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
