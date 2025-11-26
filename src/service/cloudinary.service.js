import cloudinary from "cloudinary";
import { Cloudinary } from "@cloudinary/url-gen";


// Funktion zur Initialisierung von Cloudinary und Übergabe der Keys
export function cloudinaryInit() {

    cloudinary.v2.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_KEY,
        api_secret: process.env.CLOUD_SECRET,
    });

    console.log("cloudinary initialized");
};

const CLOUD = new Cloudinary({
    cloud: {
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_KEY,
        api_secret: process.env.CLOUD_SECRET,
    }
});



export async function uploadFile(file, name, folder) {
    const index = file.indexOf("/");
    const dataType = file.substring(5, index);

    if (index === -1 || (dataType !== 'video' && dataType !== 'image')) {
        throw {
            code: 415,
            message: `Unsupported Media Type at file upload`
        };
    };

    let result;

    if (dataType === 'video') {
        result = await cloudinary.v2.uploader.upload(file, {
            resource_type: dataType,
            public_id: name,
            folder: folder,
            e_transformation: {
                format: 'mp4'
            }
        });
        
    } else {
        result = await cloudinary.v2.uploader.upload(file, {
            resource_type: dataType,
            public_id: name,
            folder: folder
        });
    }

    if (!result) {
        throw {
            code: 503,
            message: `Cannot reach Cloudinary`
        };
    };

    return result.secure_url;
};


// API-Aufruf zum Abrufen aller Dateien im Ordner
export async function getAllFiles(folder) {

    const result = await cloudinary.v2.api
        .resources(
            {
                type: 'upload',
                prefix: folder,
                max_results: 500
            })

    return result
}