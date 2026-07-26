// const express = require("express");
// const multer = require("multer");
// const path = require("path");

// const {

//     analyzePaper,

//     teachStudent,

//     chatWithTutor,

//     generateQuiz,

//     submitQuiz

// } = require("../controller/aiController");

// const router = express.Router();

// const storage = multer.diskStorage({

//     destination:(req,file,cb)=>{

//         cb(null,"uploads/");

//     },

//     filename:(req,file,cb)=>{

//         cb(

//             null,

//             Date.now()+path.extname(file.originalname)

//         );

//     }

// });

// const upload=multer({

//     storage

// });

// router.post(

//     "/analyze",

//     upload.single("image"),

//     analyzePaper

// );

// router.post(

//     "/teach",

//     teachStudent

// );

// router.post(

//     "/chat",

//     chatWithTutor

// );

// router.post(

//     "/quiz",

//     generateQuiz

// );

// router.post(

//     "/submit-quiz",

//     submitQuiz

// );

// module.exports=router;

const express = require("express");
const multer = require("multer");
const path = require("path");

const protect = require("../middleware/authMiddleware");

const {

    analyzePaper,

    teachStudent,

    chatWithTutor,

    generateQuiz,

    submitQuiz

} = require("../controller/aiController");

const router = express.Router();

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "uploads/");

    },

    filename: (req, file, cb) => {

        cb(

            null,

            Date.now() + path.extname(file.originalname)

        );

    }

});

const upload = multer({

    storage

});

router.post(

    "/analyze",

    protect,

    upload.single("image"),

    analyzePaper

);

router.post(

    "/teach",

    protect,

    teachStudent

);

router.post(

    "/chat",

    protect,

    chatWithTutor

);

router.post(

    "/quiz",

    protect,

    generateQuiz

);

router.post(

    "/submit-quiz",

    protect,

    submitQuiz

);

module.exports = router;