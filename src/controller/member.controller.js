import express from 'express';
import { Member, Image } from '../models/index.model.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sequelize } from '../service/db.service.js';



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

  try {
    const membersData = req.body; // Array aller Members

    // Transaction für atomare Updates aller Members
    const result = await sequelize.transaction(async (t) => {
      const updatedMembers = [];

      for (const memberData of membersData) {
        const { id, firstname, lastname, instrument, description, image_id, image_position } = memberData;

        // Ignoriere images (Frontend-Property, nicht im Model)
        const [updatedCount] = await Member.update(
          {
            firstname,
            lastname,
            instrument,
            description,
            image_id,
            image_position
          },
          {
            where: { id },
            transaction: t
          }
        );

        if (updatedCount > 0) {
          // Member mit Images nachupdate abrufen
          const updatedMember = await Member.findByPk(id, {
            include: [{ model: Image, as: 'image' }],
            transaction: t
          });

          // Images wie bei getAllMembers formatieren
          if (updatedMember.image_id && updatedMember.image) {
            updatedMember.dataValues.images = {
              sm: updatedMember.image.sourceUrlSM,
              md: updatedMember.image.sourceUrlMD,
              lg: updatedMember.image.sourceUrlLG
            };
          }

          updatedMembers.push(updatedMember);
        }
      }

      return updatedMembers;
    });

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Failed to update members', error);
    res.status(500).json({ 
      message: 'Failed to update members', 
      error: error.message 
    });
  }
}





