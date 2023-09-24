import express from "express";
import cors from "cors";
import { MongoClient, ServerApiVersion } from "mongodb";
import nodemailer from "nodemailer";

const app = express();

// Use cors middleware with specific options
app.use(
  cors({
    origin: ["https://effizient-task-do47.vercel.app"],
    methods: ["POST", "GET"],
    credentials: true,
  })
);

app.use(express.json());

const uri =
  "mongodb+srv://harishmaneru:tjQVVQZzCRzyEhXV@cluster0.o28gldp.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Create a Nodemailer transporter using your SMTP settings
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "effizient.noreplay@gmail.com",
    pass: "jmogcnlaznbxvewi",
  },
});

// Function to send an email with user details
async function sendEmail(userDetails) {
  try {
    const email = userDetails.email;
    const subject = "Your Submitted Details";
    const text = `
    Thank you for submitting your details!
    Full Name: ${userDetails.fullName}
    Age: ${userDetails.age}
    Education Level: ${userDetails.educationLevel}
    Institute: ${userDetails.institute}
    What You Studied: ${userDetails.study}
    Work Experience: ${userDetails.experience}
    Admitted to Institute in Canada: ${userDetails.Canada}
    Program of Study in Canada: ${userDetails.studyincanada}
    Country You Are Applying From: ${userDetails.country}
    Future Goals: ${userDetails.goals}
    English Scores - Listening: ${userDetails.scores}
    English Scores - Reading: ${userDetails.reading}
    English Scores - Speaking: ${userDetails.speaking}
    English Scores - Writing: ${userDetails.writing}
    Did You Pay First Year Tuition: ${userDetails.fee}
    Amount Paid Towards GIC: ${userDetails.gic}
    `;

    const mailOptions = {
      from: "effizient.noreplay@gmail.com",
      to: email,
      subject: subject,
      text: text,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to", email);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

async function run() {
  try {
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("harish").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    await client.close();
  }
}

run().catch(console.dir);

app.post("/postUser", async (req, res) => {
  console.log("body: ", req.body);
  try {
    const session = client.startSession();

    await client.connect();
    const db = client.db("harish");
    const userCollection = db.collection("user");

    await session.withTransaction(async () => {
      await userCollection.insertOne(req.body);

      await sendEmail(req.body);
    });

    res.send(JSON.stringify("successfully inserted"));
  } catch (err) {
    console.error("An error occurred:", err);
    res.status(500).send("Error occurred");
  } finally {
    await client.close();
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
