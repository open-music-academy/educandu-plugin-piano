import PropTypes from "prop-types";
import React, { useRef } from "react";
function Switch({ handleSwitchClick, pianoId, isNoteInputEnabled }) {
  const inputSwitch = useRef(null);
  const onClick = () => {
    inputSwitch.current.classList.toggle("Piano-switchChecked");
    const isChecked = inputSwitch.current.classList.contains("Piano-switchChecked");
    handleSwitchClick(isChecked);
  };
  return /* @__PURE__ */ React.createElement("div", { ref: inputSwitch, className: `${pianoId} Piano-switch ${isNoteInputEnabled.current && "Piano-switchChecked"}`, onClick }, /* @__PURE__ */ React.createElement("div", { className: "Piano-switchHandle" }));
}
Switch.propTypes = {
  handleSwitchClick: PropTypes.func.isRequired,
  isNoteInputEnabled: PropTypes.object,
  pianoId: PropTypes.string
};
Switch.defaultProps = {
  isNoteInputEnabled: { current: false },
  pianoId: ""
};
export {
  Switch as default
};
//# sourceMappingURL=switch.js.map
