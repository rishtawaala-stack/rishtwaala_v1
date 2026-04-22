const { sendSuccess } = require("../utils/response");

function createResourceController(resourceName) {
  return {
    list(req, res) {
      return sendSuccess(res, {
        resource: resourceName,
        action: "list",
        actor: req.auth || null
      });
    },
    detail(req, res) {
      return sendSuccess(res, {
        resource: resourceName,
        action: "detail",
        params: req.params,
        actor: req.auth || null
      });
    },
    create(req, res) {
      return sendSuccess(
        res,
        {
          resource: resourceName,
          action: "create",
          payload: req.body,
          actor: req.auth || null
        },
        {},
        201
      );
    },
    update(req, res) {
      return sendSuccess(res, {
        resource: resourceName,
        action: "update",
        params: req.params,
        payload: req.body,
        actor: req.auth || null
      });
    },
    remove(req, res) {
      return sendSuccess(res, {
        resource: resourceName,
        action: "remove",
        params: req.params,
        actor: req.auth || null
      });
    }
  };
}

module.exports = {
  createResourceController
};
