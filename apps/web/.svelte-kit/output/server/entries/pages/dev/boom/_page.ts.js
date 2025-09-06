class HttpError {
  /**
   * @param {number} status
   * @param {{message: string} extends App.Error ? (App.Error | string | undefined) : App.Error} body
   */
  constructor(status, body) {
    this.status = status;
    if (typeof body === "string") {
      this.body = { message: body };
    } else if (body) {
      this.body = body;
    } else {
      this.body = { message: `Error: ${status}` };
    }
  }
  toString() {
    return JSON.stringify(this.body);
  }
}
function error(status, body) {
  if (isNaN(status) || status < 400 || status > 599) {
    throw new Error(`HTTP error status codes must be between 400 and 599 — ${status} is invalid`);
  }
  return new HttpError(status, body);
}
new TextEncoder();
function load() {
  throw error(500, {
    message: "This is a test error for the error boundary",
    id: "test-error-boundary",
    details: {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      purpose: "Testing error boundary functionality",
      component: "dev/boom test page"
    }
  });
}
export {
  load
};
