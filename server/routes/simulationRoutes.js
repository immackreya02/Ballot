const express = require('express');
const router = express.Router();
const { runSecuritySimulationSuite } = require('../simulation/simulator');

router.post('/run', async (req, res) => {
  try {
    const report = await runSecuritySimulationSuite();
    res.json(report);
  } catch (err) {
    console.error('Simulation Execution Error:', err);
    res.status(500).json({ message: 'Simulation execution failed.', error: err.message });
  }
});

module.exports = router;
