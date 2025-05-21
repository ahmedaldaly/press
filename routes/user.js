const router = require('express').Router();
const {getAllUsers,getUserById,updateUser,deleteUser,getUserByTOken} = require('../controller/userController');
const {Admin,authrization} = require('../maddelware/authrazition')
const multer = require('multer');
const supabase = require('../config/supabase');
router.get('/',getAllUsers);
router.route('/:id').get(getUserById).put(authrization,Admin,updateUser).delete(authrization,Admin,deleteUser);
router.get('/token', authrization,getUserByTOken)


const storage = multer.memoryStorage();
const upload = multer({storage})
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
      const file = req.file;
      const fileName = Date.now() + '-' + encodeURIComponent(file.originalname);
  
      const { data, error } = await supabase.storage
        .from('press')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false,
        });
  
      if (error) return res.status(500).json({ error: error.message });
  
      const { data: urlData } = supabase.storage
        .from('press')
        .getPublicUrl(fileName);
  
      const publicUrl = urlData.publicUrl;
  
      res.json({
        message: 'تم الرفع بنجاح',
        imageUrl: publicUrl,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

module.exports =router