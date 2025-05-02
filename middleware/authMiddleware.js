const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.cookies.token;
  // const authHeader = req.header("Authorization");
  //   console.log("Auth Header:", authHeader);

  // if (!authHeader) {
  //   return res.status(401).json({ msg: "No token, access denied" });
  // }

  // const token = authHeader.startsWith("Bearer ")
  //   ? authHeader.slice(7)
  //   : authHeader;
  // console.log(token);
  console.log(token)
  if (!token) return res.status(403).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = auth;
