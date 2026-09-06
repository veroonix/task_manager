const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = 3000;


const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}
// Настройка хранилища для multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// База данных в памяти
let tasks = [];

// Главная страница: список задач с фильтрацией
app.get('/', (req, res) => {
    const statusFilter = req.query.status;
    let filteredTasks = tasks;
    
    if (statusFilter && statusFilter !== 'all') {
        filteredTasks = tasks.filter(t => t.status === statusFilter);
    }
    
    res.render('index', { tasks: filteredTasks, statusFilter });
});

// Добавление задачи
app.post('/add', upload.single('attachment'), (req, res) => {
    const { title, dueDate } = req.body;
    tasks.push({
        id: Date.now(),
        title,
        dueDate,
        status: 'pending',
        attachment: req.file ? req.file.filename : null
    });
    res.redirect('/');
});

// Переключение статуса
app.post('/toggle/:id', (req, res) => {
    const task = tasks.find(t => t.id == req.params.id);
    if (task) {
        task.status = task.status === 'pending' ? 'completed' : 'pending';
    }
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
