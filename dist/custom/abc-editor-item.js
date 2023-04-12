import PropTypes from "prop-types";
import { Form, Input } from "antd";
import { useTranslation } from "react-i18next";
import React, { useRef, useState } from "react";
import AbcNotation from "../educandu-code/abc-notation.js";
import { filterAbcString, getNumberOfAbcNotes } from "./utils.js";
import { FORM_ITEM_LAYOUT } from "@educandu/educandu/domain/constants.js";
function CustomAbcNotation({ clef, initialAbc, abcRef }) {
  const { t } = useTranslation("benewagner/educandu-plugin-piano");
  const [abc, setAbc] = useState(initialAbc);
  abcRef.current = setAbc;
  return /* @__PURE__ */ React.createElement(Form.Item, { label: t("preview"), ...FORM_ITEM_LAYOUT }, /* @__PURE__ */ React.createElement(AbcNotation, { abcCode: `L:1/4 
 K:C ${clef} 
 ${abc}` }));
}
function AbcEditorItem(props) {
  const {
    index,
    testIndex,
    noteSequence,
    handleAbcCodeChanged
  } = props;
  const { abc } = noteSequence;
  const { clef } = noteSequence;
  const [initialAbc, setInitialAbc] = useState(abc);
  const abcRef = useRef(null);
  const inputRef = useRef(null);
  const prevInputValueRef = useRef(abc);
  const { t } = useTranslation("benewagner/educandu-plugin-piano");
  const handleCurrentAbcCodeChanged = (event) => {
    const value = event.target.value;
    const newAbc = filterAbcString(value);
    const prevInputValue = prevInputValueRef.current;
    const numberOfInputNotes = getNumberOfAbcNotes(newAbc);
    if (numberOfInputNotes <= 10) {
      abcRef.current(newAbc);
      prevInputValueRef.current = value;
    } else {
      setInitialAbc(prevInputValue);
    }
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(CustomAbcNotation, { initialAbc: abc, clef, abcRef }), /* @__PURE__ */ React.createElement(Form.Item, { label: t("abcCode"), ...FORM_ITEM_LAYOUT }, /* @__PURE__ */ React.createElement(
    Input,
    {
      allowClear: true,
      ref: inputRef,
      defaultValue: initialAbc,
      onChange: handleCurrentAbcCodeChanged,
      onBlur: () => handleAbcCodeChanged(prevInputValueRef.current, testIndex, index)
    }
  )));
}
CustomAbcNotation.propTypes = {
  abcRef: PropTypes.object.isRequired,
  clef: PropTypes.string.isRequired,
  initialAbc: PropTypes.string.isRequired
};
AbcEditorItem.propTypes = {
  noteSequence: PropTypes.object.isRequired,
  handleAbcCodeChanged: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  testIndex: PropTypes.number.isRequired
};
export {
  AbcEditorItem as default
};
//# sourceMappingURL=abc-editor-item.js.map
