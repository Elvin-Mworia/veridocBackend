const fs=require("fs");
const deleteFile = (filePath) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error("File does not exist or cannot be accessed:", err);
            return;
        }
        
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Error deleting file:", err);
            } else {
                console.log("File deleted successfully");
            }
        });
    });
};

module.exports={deleteFile}