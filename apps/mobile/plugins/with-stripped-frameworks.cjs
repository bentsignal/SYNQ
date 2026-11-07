const { withPodfile } = require("@expo/config-plugins");
const {
  mergeContents,
} = require("@expo/config-plugins/build/utils/generateCode");

/**
 * Strips the symbol tables from the frameworks embedded in Release builds
 * (strip-framework-symbols.sh), about 13 MB of the installed app.
 *
 * The step has to run after CocoaPods copies the frameworks in, and `pod
 * install` adds its "[CP] Embed Pods Frameworks" phase after every phase a
 * config plugin can add. So this adds a `post_integrate` hook to the Podfile,
 * which runs after CocoaPods has set up the Xcode project, and the hook
 * moves the phase to the end on every install.
 */

const PHASE_NAME = "[SYNQ] Strip framework symbols";

const POST_INTEGRATE = `  post_integrate do |installer|
    installer.aggregate_targets.each do |aggregate|
      aggregate.user_targets.each do |target|
        phase = target.shell_script_build_phases.find { |p| p.name == '${PHASE_NAME}' } ||
          target.new_shell_script_build_phase('${PHASE_NAME}')
        phase.shell_script = '"\${SRCROOT}/../plugins/strip-framework-symbols.sh"'
        phase.always_out_of_date = '1'
        target.build_phases.move(phase, target.build_phases.count - 1)
      end
      aggregate.user_project.save
    end
  end
`;

function addPostIntegrate(podfile) {
  return mergeContents({
    src: podfile,
    newSrc: POST_INTEGRATE,
    tag: "synq-stripped-frameworks",
    anchor: /^ {2}post_install do \|installer\|/m,
    offset: 0,
    comment: "#",
  }).contents;
}

module.exports = function withStrippedFrameworks(config) {
  return withPodfile(config, (config) => {
    config.modResults.contents = addPostIntegrate(config.modResults.contents);
    return config;
  });
};
module.exports.addPostIntegrate = addPostIntegrate;
