const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const ARTICLES_DIR = path.join(__dirname, 'articles');
const CONTACTS_FILE = path.join(__dirname, 'contacts.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Ensure directories exist
async function ensureDirectories() {
    try {
        await fs.access(ARTICLES_DIR);
    } catch {
        await fs.mkdir(ARTICLES_DIR, { recursive: true });
    }
    try {
        await fs.access(CONTACTS_FILE);
    } catch {
        await fs.writeFile(CONTACTS_FILE, '[]');
    }
}

// API Routes
app.get('/api/articles', async (req, res) => {
    try {
        const files = await fs.readdir(ARTICLES_DIR);
        const articles = await Promise.all(
            files.map(async file => {
                const data = await fs.readFile(path.join(ARTICLES_DIR, file), 'utf8');
                const article = JSON.parse(data);
                article.filename = file;
                return article;
            })
        );
        res.json(articles.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
        console.error('Error reading articles:', err);
        res.json([]);
    }
});

app.post('/api/articles', async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }
        const filename = `${Date.now()}-${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        const filePath = path.join(ARTICLES_DIR, filename);
        await fs.writeFile(filePath, JSON.stringify({
            title,
            content,
            date: new Date().toISOString()
        }, null, 2));
        res.json({ success: true });
    } catch (err) {
        console.error('Error saving article:', err);
        res.status(500).json({ error: 'Failed to save article' });
    }
});

app.put('/api/articles/:filename', async (req, res) => {
    try {
        const { title, content } = req.body;
        const { filename } = req.params;
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }
        const filePath = path.join(ARTICLES_DIR, filename);
        await fs.writeFile(filePath, JSON.stringify({
            title,
            content,
            date: new Date().toISOString()
        }, null, 2));
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating article:', err);
        res.status(500).json({ error: 'Failed to update article' });
    }
});

app.delete('/api/articles/:filename', async (req, res) => {
    try {
        const filePath = path.join(ARTICLES_DIR, req.params.filename);
        await fs.unlink(filePath);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting article:', err);
        res.status(500).json({ error: 'Failed to delete article' });
    }
});

app.get('/api/contacts', async (req, res) => {
    try {
        const contacts = await fs.readFile(CONTACTS_FILE, 'utf8');
        res.json(JSON.parse(contacts));
    } catch (err) {
        console.error('Error reading contacts:', err);
        res.status(500).json({ error: 'Failed to read contacts' });
    }
});

app.post('/api/contacts', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email and message are required' });
        }

        // Read existing contacts
        let contacts = [];
        try {
            const data = await fs.readFile(CONTACTS_FILE, 'utf8');
            contacts = JSON.parse(data);
        } catch (err) {
            console.error('Error reading contacts file:', err);
        }

        // Add new contact with date
        const newContact = {
            name,
            email,
            message,
            date: new Date().toISOString()
        };
        
        contacts.push(newContact);

        // Save updated contacts
        await fs.writeFile(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
        res.json(newContact);
    } catch (err) {
        console.error('Error saving contact:', err);
        res.status(500).json({ error: 'Failed to save contact message' });
    }
});

app.delete('/api/contacts/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = await fs.readFile(CONTACTS_FILE, 'utf8');
        const contacts = JSON.parse(data);
        
        if (id < 0 || id >= contacts.length) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        contacts.splice(id, 1);
        await fs.writeFile(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting contact:', err);
        res.status(500).json({ error: 'Failed to delete contact' });
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Initialize and start server
ensureDirectories()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to initialize server:', err);
        process.exit(1);
    });