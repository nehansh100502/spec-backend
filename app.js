// const express = require("express");
// const app = express();

// if(process.env.NODE_ENV !== "production"){
//     require("dotenv").config({path: "config/config.env"});
// }

// app.use(express.json());

// app.use(express.urlencoded({extended:true}));

// const Session = require("./routes/session");


// app.use("/api/v1", Session);

   
// module.exports = app;
// const express = require("express");
// const app = express();

// if (process.env.NODE_ENV !== "production") {
//     require("dotenv").config({ path: "config/config.env" });
// }

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// const Session = require("./routes/session");

// app.use("/api/v1", Session);

// module.exports = app;

const express = require("express");
const app = express();

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({ path: "config/config.env" });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const Session = require("./routes/session");

app.use("/api/v1", Session);

module.exports = app;

