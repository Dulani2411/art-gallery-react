const User = require("../Model/userModel");
//data disply
const getAllUsers = async (req, res, next) =>{
    let Users;

    try{
        users = await User.find();
    }catch(err){
        console.log(err)
    }
    //not found
    if(!users){
        return res.status(404).json({message:"user not found"});
    }
    //disply
    return res.status(200).json({users});
};

//data insert
const addUsers = async(req, res, next) => {
    const{name,gmail,age,address} = req.body;

    let users;

    try{
        users = new User ({name,gmail,age,address});
        await users.save();
    }catch(err){
        console.log(err);
    }
    //don t insert users
    if(!users){
        return res.status(404).send({message:"unable to add users"});
    }
    return res.status(200).send({users});
};

//get by id
const getById = async (req, res, next) => {
    const id = req.params.id;

    let user;
    try{
        user = await User.findById(id);
    }catch(err){
        console.log(err);
    }

    //not available users
    if(!user){
        return res.status(404).json({message:"user no fond"});
    }
    return res.status(200).json({user});
}

//update user details
const updateUser = async (req, res,next) => {

    const id = req.params.id;
    const{name,gmail,age,address} = req.body;

    let users;
    try{
        users = await User.findByIdAndUpdate(id,
            {name:name, gmail:gmail, age:age, address:address});
            users = await users.save();
    }catch(err){
        console.log(err);
    }
    if(!users){
        return res.status(404).json({message:"unable to update"});
    }
    return res.status(200).json({users});
};

//delete user details
const deleteUser = async (req, res, next) => {
    const id = req.params.id;

    let user;
    try{
        user = await User.findByIdAndDelete(id)
    }catch(err){
        console.log(err);
    }
    if(!user){
        return res.status(404).json({message:"unable to delete"});
    }
    return res.status(200).json({user});


};

exports.getAllUsers = getAllUsers;
exports.addUsers = addUsers;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;