module.exports = (req, res) => {
  res.json({ message: 'Hello from neuralpay ai-service', time: new Date().toISOString() });
};
