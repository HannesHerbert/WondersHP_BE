import express from 'express';
import Member from '../models/member.model.js';
import Image from '../models/image.model.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



export async function createMember(req, res) {


    // extrahiert alle fields aus body
    let { firstname, lastname, instrument, description, image_id, image_position } = req.body;

    console.log(req.body);

    try {
        const newMember = await Member.create({ firstname, lastname, instrument, description, image_id, image_position });
        res.status(201).json(newMember);

    } catch (error) {
        console.error('Failed to create member', error); // Protokollieren der genauen Fehlermeldung
        res.status(500).json({ message: 'Failed to create member', error: error.message });
    }
};


export async function getAllMembers(req, res) {

    console.log(req.body);

    try {
        const allMembers = await Member.findAll();

        for (let member of allMembers) {
            if (member.image_id) {
                let imageEntry = await Image.findByPk(member.image_id);
                let imageURLs = { sm: imageEntry.sourceUrlSM, md: imageEntry.sourceUrlMD, lg: imageEntry.sourceUrlLG };
                member.dataValues.images = imageURLs;                
            }
        }

        res.status(201).json({
            success: true,
            data: allMembers,
        });

        console.log(allMembers);
        

    } catch (error) {
        console.error('Failed to get all members', error); // Protokollieren der genauen Fehlermeldung
        res.status(500).json({ message: 'Failed to get all members', error: error.message });
    }
};

export async function updateMembers(req, res) {

    console.log(req.body);


};