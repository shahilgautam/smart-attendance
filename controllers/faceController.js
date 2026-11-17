const fs = require('fs');
const path = require('path');
const { getPool } = require('../config/db');

exports.uploadFace = async (req, res) => {
    let filePath;
    try {
        const { employeeId, image } = req.body || {};
        if (!employeeId || !image || typeof image !== 'string') {
            return res.status(400).json({ success: false, message: 'Employee and captured image are required.' });
        }
        const match = image.match(/^data:image\/(jpeg|jpg|png);base64,([A-Za-z0-9+/=]+)$/);
        if (!match) return res.status(400).json({ success: false, message: 'Invalid image. Capture a JPEG or PNG photo.' });
        const buffer = Buffer.from(match[2], 'base64');
        if (!buffer.length || buffer.length > 8 * 1024 * 1024) {
            return res.status(413).json({ success: false, message: 'Photo must be smaller than 8 MB.' });
        }
        const db = getPool();
        const [employees] = await db.query('SELECT id FROM employees WHERE id = ? AND status = \'Active\'', [employeeId]);
        if (!employees.length) return res.status(404).json({ success: false, message: 'Active employee not found.' });
        const directory = path.join(__dirname, '..', 'public', 'uploads', 'faces');
        fs.mkdirSync(directory, { recursive: true });
        const fileName = `EMP_${Number(employeeId)}_${Date.now()}.jpg`;
        filePath = path.join(directory, fileName);
        fs.writeFileSync(filePath, buffer, { flag: 'wx' });
        const photoUrl = `/uploads/faces/${fileName}`;
        await db.query('UPDATE employees SET photo = ? WHERE id = ?', [photoUrl, employeeId]);
        res.json({ success: true, message: 'Face registered successfully.', photo: photoUrl });
    } catch (error) {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        console.error('Face upload error:', error);
        res.status(500).json({ success: false, message: 'Could not save the face photo.' });
    }
};
