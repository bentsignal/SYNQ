const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { addPostIntegrate } = require("./with-stripped-frameworks.cjs");

const PODFILE = `target 'SYNQ' do
  use_expo_modules!

  post_install do |installer|
    react_native_post_install(installer)
  end
end
`;

test("the Podfile gets one post_integrate hook, before post_install", () => {
  const once = addPostIntegrate(PODFILE);
  const twice = addPostIntegrate(once);
  assert.equal(twice, once);
  assert.equal(once.match(/post_integrate do/g)?.length, 1);
  assert.ok(
    once.indexOf("post_integrate do") < once.indexOf("post_install do"),
  );
  assert.match(once, /strip-framework-symbols\.sh/);
});

test("the strip script is executable", () => {
  const script = path.join(__dirname, "strip-framework-symbols.sh");
  fs.accessSync(script, fs.constants.X_OK);
});
