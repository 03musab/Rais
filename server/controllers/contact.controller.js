exports.submitContact = (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields required" });
  }

  // Later: Save to DB or send email
  res.status(200).json({
    message: "Message received successfully",
  });
};
