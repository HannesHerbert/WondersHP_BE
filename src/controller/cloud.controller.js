import { getAllFiles } from '../service/cloudinary.service.js';


export async function getAllPubIdsOfFolder(req, res) {

  const folder = req.query.folder;

  try {

      let result = await getAllFiles(folder)
      
      let publicIds = result.resources.map(resource => resource.public_id)      

      res.send({
          success: true,
          publicIds: publicIds
      })

  } catch (error) {
      console.log(error);
      res.status(error.code).send({
          success: false,
          message: error.message
      });
  }
}