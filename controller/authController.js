const {User, validateLogIn, validateRegister } = require('../model/User');
const bcrypt = require('bcryptjs');
const Jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const BlacklistedToken = require('../model/blacklistedToken');

module.exports.Register = asyncHandler(async(req,res)=>{
    try{
        const {error} = validateRegister(req.body);
        if(error){res.status(400).json({message:error.details[0].message})}
        const user = await User.findOne({email:req.body.email});
        if(user){res.status(400).json({message:"User already exists"})}
        const hashPassword = await bcrypt.hash(req.body.password ,10);
        const newUser =new User({
            name:req.body.name,
            email:req.body.email,
            password:hashPassword
        })
        await newUser.save()
        const token = Jwt.sign({id:newUser._id ,isAdmin:newUser.isAdmin},process.env.JWT_SECRET,{expiresIn:"7d"})
        newUser.token = token;
        res.status(201).json(newUser)

    }catch(err){res.status(500).json(err)}
})

module.exports.LogIn = asyncHandler(async(req,res)=>{
    try{
        const {error} = validateLogIn(req.body);
        if(error){res.status(400).json({message:error.details[0].message})}
        const user = await User.findOne({email:req.body.email});
        if(!user){res.status(400).json({message:"Check your email or password "})}
        const checkPassword = await bcrypt.compare(req.body.password ,user.password);
        if(!checkPassword){res.status(400).json({message:"Check your email or password "})}
        const token = Jwt.sign({id:user._id ,isAdmin:user.isAdmin},process.env.JWT_SECRET ,{expiresIn:'7d'});
        user.token = token;
        res.status(200).json(user)
    }catch(err){res.status(500).json(err)}
})

module.exports.LogOut = asyncHandler(async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(400).json({ message: 'لم يتم تقديم توكن' });
        }

        // إضافة التوكن إلى القائمة السوداء
        await BlacklistedToken.create({ token });

        // حذف التوكن من المستخدم
        await User.findByIdAndUpdate(req.user.id, { token: null });

        res.json({ message: 'تم تسجيل الخروج بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'حدث خطأ في تسجيل الخروج', error: error.message });
    }
});