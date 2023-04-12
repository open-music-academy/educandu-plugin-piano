import abcjs from "abcjs";
import PropTypes from "prop-types";
import React, { useEffect, useRef } from "react";
const abcOptions = {
  paddingtop: 0,
  // Sometimes ABC renders outside on the bottom, so we add some extra space
  paddingbottom: 10,
  paddingright: 0,
  paddingleft: 0,
  responsive: "resize"
};
function AbcNotation({ abcCode }) {
  const abcContainerRef = useRef();
  useEffect(() => {
    abcjs.renderAbc(abcContainerRef.current, abcCode, abcOptions);
  }, [abcContainerRef, abcCode]);
  return /* @__PURE__ */ React.createElement("div", { className: "AbcNotation" }, /* @__PURE__ */ React.createElement("div", { className: "AbcNotation-notes", ref: abcContainerRef }));
}
AbcNotation.propTypes = {
  abcCode: PropTypes.string
};
AbcNotation.defaultProps = {
  abcCode: ""
};
var abc_notation_default = AbcNotation;
export {
  abc_notation_default as default
};
//# sourceMappingURL=abc-notation.js.map
