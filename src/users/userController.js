const express = require('express')
const router = express.Router();

const userService = require('./user.service');

//get all users info
async function getAllUsers(req, res){
    try {
        const users = await userService.getUsers();
        res.status(200).json(users);
    } catch (err) {
        if(err.statusCode){
            res.status(err.statusCode).send(err.message); return;
        }
        res.status(400).send(err.message)
    }
}

//register user
async function registerUser(req, res){
    try {
        const user = await userService.registerUser(req.body);
        res.status(200).send({
            data: user,
            message: "User created successfully"
        })
        
    } catch (err) {
        if(err.statusCode){
            res.status(err.statusCode).send(err.message); return;
        }
        res.status(400).send(err.message)
    }
}

//login user, return token
async function loginUser(req, res){
    try {
        const loggedIn = await userService.loginUser(req.body)
        console.log(loggedIn)
        res.status(200).json({
            Token: `Bearer ${loggedIn}`
        })
    } catch (err) {
        res.status(403).send( err.message )
    }
}

//user authenticated
async function userAuthenticated(req, res){
    try {
        const userId = +res.user.id
        if(typeof userId !== 'number'){
            res.status(400).send("ID must be a number"); return;
        }
        const user = await userService.getUserById(userId)
        //excluding password
        delete user.password
        // const keys = "password"
        // Object.entries(user).filter(([key]) => !keys.includes(key))
        res.status(200).json({
            data: user,
            message: "Fetch user success"
        })

    } catch (err) {
        if(err.statusCode){
            res.status(err.statusCode).send(err.message); return;
        }
        res.status(400).send(err.message)
    }
}

//update user, profile by id
async function updateUserById(req, res){
    try {
        const userId = +req.params.id
        const { name, email, password, identity_type, identity_number, address } = req.body;

        if(!(name, email, password, identity_type, identity_number, address)){
            res.status(400).send("Some fields are missing")
            return;
        }

        const updateUser = await userService.updateUserById(userId, req.body);
        res.send({
            data: updateUser,
            message: "User info updated!"
        })

    } catch (err) {
        if(err.statusCode){
            res.status(err.statusCode).send(err.message); return;
        }
        res.status(400).send(err.message)
    }
}

//patch user and profile by id
async function patchUserById(req, res){
    try {
        const userId = +req.params.id;
        const updateUser = await userService.updateUserById(userId, req.body);
        res.send({
            data: updateUser,
            message: "Product updated!"
        })
    } catch (err) {
        if(err.statusCode){
            res.status(err.statusCode).send(err.message); return;
        }
        res.status(400).send(err.message)
    }
}

//delete user, and profile by id
async function deleteUserById(req, res){
    try {
        const userId = +req.params.id;
        await userService.deleteUserById(userId)
        res.status(200).send({
            message: "User & Profile has deleted"
        })
    } catch (err) {
        if(err.statusCode){
            res.status(err.statusCode).send(err.message); return;
        }
        res.status(400).send(err.message)
    }
}

module.exports = {
    getAllUsers, 
    registerUser,
    loginUser,
    userAuthenticated,
    updateUserById,
    patchUserById,
    deleteUserById,
};
