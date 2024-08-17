const generateToken = require("../services/auth");
const User = require("../models/user");

const handleSignup = async (req, res) => {
  try {
    const data = req.body;

    const existingUser = await User.findOne({
      email: data.email,
    });
    if (existingUser)
      return res.status(400).json({ error: "User exists with this email" });

    const newUser = new User(data);
    const response = await newUser.save();

    console.log("Data Saved");

    const payload = {
      id: response.id,
    };

    console.log(JSON.stringify(payload));

    const token = generateToken(payload);
    console.log("Token is: ", token);

    res.status(200).json({ response: response, token: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const handleSignin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid Username or Password" });
    }

    const payload = {
      id: user.id,
    };
    const token = generateToken(payload);
    return res.json(token);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  handleSignup,
  handleSignin,
};
