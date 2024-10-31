const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const dotenv = require("dotenv");
const generateQuizFromText = require("./controllers/quizController");
const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage });

let uploadedFiles = [];

app.post('/upload', upload.single('file'), (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        uploadedFiles.push({
            id: Date.now(),
            filename: file.filename,
            originalName: file.originalname,
            path: file.path
        });

        return res.status(200).json({ 
            message: 'File uploaded successfully',
            fileId: uploadedFiles[uploadedFiles.length - 1].id
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'File upload failed' });
    }
});

app.post('/generatequiz', async (req, res) => {
    try {
        const { fileId } = req.body;
        const fileInfo = uploadedFiles.find(f => f.id === fileId);
        
        if (!fileInfo) {
            return res.status(404).json({ error: 'File not found' });
        }

        let extractedText = '';
        const filePath = fileInfo.path;

        if (fileInfo.originalName.endsWith('.pdf')) {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            extractedText = data.text;
        } else if (fileInfo.originalName.endsWith('.docx')) {
            const result = await mammoth.extractRawText({ path: filePath });
            extractedText = result.value;
        } else {
            return res.status(400).json({ error: 'Unsupported file format' });
        }

        const quiz = await generateQuizFromText(extractedText);
        
        return res.status(200).json({ quiz: quiz });
    } catch (error) {
        console.error('Quiz generation error:', error);
        res.status(500).json({ error: 'Failed to generate quiz' });
    }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});