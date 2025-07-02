const express = require('express');
const cors = require('cors');

const app = express();
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

// --- API Endpoints ---

// GET /numbers - Get all numbers
app.get('/numbers', (req, res) => {
  res.json(mockWhatsAppNumbers);
});

// POST /numbers - Add a new number
app.post('/numbers', (req, res) => {
  const { name, phone, pairedBy } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }
  if (mockWhatsAppNumbers.some(n => n.id === phone)) {
      return res.status(409).json({ error: 'Number already exists' });
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
  res.status(201).json(newEntry);
});

// GET /numbers/:id/qr - Get QR code
app.get('/numbers/:id/qr', (req, res) => {
    const { id } = req.params;
    const number = mockWhatsAppNumbers.find(n => n.id === id);
    if (!number) {
        return res.status(404).json({ error: 'Number not found' });
    }
    const qrCodeUrl = `https://placehold.co/256x256.png?text=QR+para+${encodeURIComponent(id)}`;
    res.json({ qr: qrCodeUrl });
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
        mockWhatsAppNumbers.splice(index, 1);
        res.json({ message: 'Number deleted successfully' });
    } else {
        res.status(404).json({ error: 'Number not found' });
    }
});

app.listen(port, () => {
  console.log(`Backend do WhatsApp rodando em http://localhost:${port}`);
});
