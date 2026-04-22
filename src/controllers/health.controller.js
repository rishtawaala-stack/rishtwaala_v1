const { sendSuccess } = require("../utils/response");
const systemService = require("../services/system.service");

function getHealth(req, res) {
  return sendSuccess(res, systemService.getHealthStatus());
}

function getReadiness(req, res) {
  return sendSuccess(res, systemService.getReadinessStatus());
}

module.exports = {
  getHealth,
  getReadiness
};
