import Piano from "./custom/piano.js";
import * as ut from "./custom/utils.js";
import * as C from "./custom/constants.js";
import StopIcon from "./icons/stop-icon.js";
import CustomSwitch from "./custom/switch.js";
import { useTranslation } from "react-i18next";
import PlayIcon from "./educandu-code/play-icon.js";
import BackspaceIcon from "./icons/backspace-icon.js";
import { Button, Radio, InputNumber, Slider } from "antd";
import AbcNotation from "./educandu-code/abc-notation.js";
import React, { useEffect, useRef, useState } from "react";
import CardSelector from "./educandu-code/card-selector.js";
import ClientConfig from "@educandu/educandu/bootstrap/client-config.js";
import { getAccessibleUrl } from "@educandu/educandu/utils/source-utils.js";
import { useService } from "@educandu/educandu/components/container-context.js";
import { sectionDisplayProps } from "@educandu/educandu/ui/default-prop-types.js";
import { useMidiData, usePianoId, useToneJsSampler, useMidiDevice, useExercise, useMidiPlayer } from "./custom/hooks.js";
import PauseIcon from "./educandu-code/pause-icon.js";
function PianoDisplay({ content }) {
  const clientConfig = useService(ClientConfig);
  const keys = useRef(null);
  const activeNotes = useRef([]);
  const RadioGroup = Radio.Group;
  const RadioButton = Radio.Button;
  const noteDurationRef = useRef(2e3);
  const isMidiInputEnabled = useRef(false);
  const isNoteInputEnabled = useRef(false);
  const isExercisePlayingRef = useRef(false);
  const playExerciseMode = useRef("successive");
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [canShowSolution, setCanShowSolution] = useState(false);
  const { t } = useTranslation("benewagner/educandu-plugin-piano");
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [playExerciseStartIndex, setPlayExerciseStartIndex] = useState(0);
  const { sourceUrl, midiTrackTitle, colors, tests, sampleType } = content;
  const src = getAccessibleUrl({ url: sourceUrl, cdnRootUrl: clientConfig.cdnRootUrl });
  const midiData = useMidiData(src);
  const pianoId = usePianoId("default");
  const isMidiDeviceConnected = useMidiDevice();
  const [midiPlayer, midiPlayerHandler] = useMidiPlayer(midiData);
  const [sampler, hasSamplerLoaded] = useToneJsSampler(sampleType);
  const exerciseData = useExercise(content, currentTestIndex, currentExerciseIndex);
  const {
    clef,
    keyRange,
    solution,
    indication,
    chordVector,
    indicationMidiValue
  } = exerciseData ? exerciseData : {};
  const chord = C.CHORD_VECTOR_MAP.get(JSON.stringify(chordVector));
  const answerAbcNoteNameSequenceRef = useRef([]);
  const [answerAbc, setAnswerAbc] = useState("");
  const [answerMidiValueSequence, setAnswerMidiValueSequence] = useState([]);
  const currentTest = (() => tests[currentTestIndex] ? tests[currentTestIndex] : {})();
  const { exerciseType, customNoteSequences } = currentTest;
  const testCards = tests.map((test, index) => ({ label: (index + 1).toString(), tooltip: t("testNumber", { number: index + 1 }) }));
  const getEventTypeFromMidiCommand = (command, velocity) => {
    switch (command) {
      case C.MIDI_COMMANDS.noteOn:
        if (velocity > 0) {
          return C.EVENT_TYPES.noteOn;
        }
        return C.EVENT_TYPES.noteOff;
      case C.MIDI_COMMANDS.noteOff:
        return C.EVENT_TYPES.noteOff;
      default:
        return "";
    }
  };
  const updateActiveNotes = (eventType, midiValue) => {
    const arr = activeNotes.current;
    const index = arr.indexOf(midiValue);
    if (eventType === "Note on") {
      if (index === -1) {
        arr.push(midiValue);
      }
    }
    if (eventType === "Note off") {
      if (index !== -1) {
        arr.splice(index, 1);
      }
    }
    if (eventType === "Reset") {
      arr.length = 0;
    }
  };
  function playOrStopNote(eventType, noteName) {
    switch (eventType) {
      case "Note on":
        sampler.current.triggerAttack(noteName);
        break;
      case "Note off":
        sampler.current.triggerRelease(noteName);
        break;
      default:
        break;
    }
  }
  const playExercise = async () => {
    if (isExercisePlayingRef.current) {
      return;
    }
    isExercisePlayingRef.current = true;
    const midiNoteNameSequence = exerciseData.midiNoteNameSequence;
    if (exerciseType !== C.EXERCISE_TYPES.noteSequence && playExerciseMode.current === "simultaneous") {
      await ut.playNotesSimultaneously(sampler.current, midiNoteNameSequence, noteDurationRef, isExercisePlayingRef);
      return;
    }
    ut.playNotesSuccessively(sampler.current, midiNoteNameSequence, noteDurationRef, isExercisePlayingRef, playExerciseStartIndex);
  };
  const resetEarTrainingControls = (params) => {
    setAnswerAbc("");
    setCanShowSolution(false);
    setPlayExerciseStartIndex(0);
    isExercisePlayingRef.current = false;
    answerAbcNoteNameSequenceRef.current.length = 0;
    setAnswerMidiValueSequence([]);
    if (params.changeTest) {
      setCurrentExerciseIndex(0);
      return;
    }
    if (ut.isCustomNoteSequenceExercise(currentTest) && customNoteSequences.length - 1 < currentExerciseIndex + 1) {
      setCurrentExerciseIndex(0);
      return;
    }
    setCurrentExerciseIndex((prev) => prev + 1);
  };
  const resetAllKeyStyles = () => {
    const midiValueSequence = exerciseData.midiValueSequence;
    for (const key of keys.current) {
      if (typeof key !== "undefined" && !midiValueSequence?.includes(parseInt(key.dataset.midiValue, 10))) {
        key.style.backgroundColor = key.dataset.defaultColor;
      }
    }
  };
  const updateKeyStyle = (eventType, midiValue) => {
    const key = keys.current[midiValue];
    if (typeof key === "undefined" || !ut.isNoteSequenceExercise(currentTest) && isNoteInputEnabled.current) {
      return;
    }
    if (eventType === C.EVENT_TYPES.noteOn) {
      key.style.backgroundColor = colors.activeKey;
    }
    if (eventType === C.EVENT_TYPES.noteOff && midiValue !== indicationMidiValue) {
      key.style.backgroundColor = key.dataset.defaultColor;
    }
    if (eventType === C.EVENT_TYPES.toggle) {
      key.style.backgroundColor = key.style.backgroundColor === colors.activeKey ? key.dataset.defaultColor : colors.activeKey;
    }
  };
  const updateAnswerAbc = () => {
    setAnswerAbc(() => {
      let inputString = "";
      for (const abcNoteName of answerAbcNoteNameSequenceRef.current) {
        inputString += abcNoteName;
      }
      return inputString;
    });
  };
  const inputNote = (midiValue) => {
    const midiValueSequence = exerciseData.midiValueSequence;
    const abcNoteNameSequence = exerciseData.abcNoteNameSequence;
    if (canShowSolution || ut.isKeyOutOfRange(keyRange, midiValue)) {
      return;
    }
    const isAnswerComplete = ut.isAnswerComplete({
      test: currentTest,
      answerMidiValueSequence,
      midiValueSequence,
      answerAbcNoteNameSequenceRef,
      abcNoteNameSequence
    });
    if (!ut.isNoteSequenceExercise(currentTest)) {
      if (answerMidiValueSequence.includes(midiValue)) {
        setAnswerMidiValueSequence((prev) => {
          const arr = [...prev];
          const index = arr.indexOf(midiValue);
          arr.splice(index, 1);
          return arr;
        });
      } else if (!isAnswerComplete) {
        setAnswerMidiValueSequence((prev) => {
          const arr = [...prev];
          arr.push(midiValue);
          return arr;
        });
      } else {
        return;
      }
    }
    if (isAnswerComplete) {
      return;
    }
    const autoAbcNoteName = C.ABC_NOTE_NAMES[midiValue];
    const solutionAbcNoteName = abcNoteNameSequence[answerAbcNoteNameSequenceRef.current.length + 1];
    const solutionMidiValue = midiValueSequence[answerAbcNoteNameSequenceRef.current.length + 1];
    const isCorrect = midiValue === solutionMidiValue;
    answerAbcNoteNameSequenceRef.current.push(isCorrect ? solutionAbcNoteName : autoAbcNoteName);
    updateAnswerAbc();
  };
  const deleteNote = () => {
    answerAbcNoteNameSequenceRef.current.pop();
    updateAnswerAbc();
  };
  function handleMidiDeviceEvent(message) {
    if (!isMidiInputEnabled.current) {
      return;
    }
    const midiValue = message.data[1];
    const noteName = ut.getNoteNameFromMidiValue(midiValue);
    const command = message.data[0];
    const velocity = message.data.length > 2 ? message.data[2] : 0;
    const eventType = getEventTypeFromMidiCommand(command, velocity);
    updateActiveNotes(eventType, midiValue);
    playOrStopNote(eventType, noteName);
    updateKeyStyle(eventType, midiValue);
    if (isNoteInputEnabled.current && eventType === C.EVENT_TYPES.noteOn) {
      inputNote(midiValue);
    }
  }
  const updateMidiMessageHandlers = () => {
    if (isMidiDeviceConnected) {
      for (const input of document.midiAccessObj.inputs.values()) {
        input.onmidimessage = handleMidiDeviceEvent;
      }
    }
  };
  function handleMidiPlayerEvent(message) {
    if (!["Note on", "Note off"].includes(message.name)) {
      return;
    }
    const midiValue = message.noteNumber;
    const velocity = message.velocity;
    const noteName = message.noteName;
    let eventType;
    if (message.name === "Note on") {
      eventType = velocity <= 0 ? C.EVENT_TYPES.noteOff : C.EVENT_TYPES.noteOn;
    }
    if (message.name === "Note off") {
      eventType = C.EVENT_TYPES.noteOff;
    }
    playOrStopNote(eventType, noteName);
    updateKeyStyle(eventType, midiValue);
    updateActiveNotes(eventType, midiValue);
  }
  const startMidiPlayer = () => {
    if (!midiPlayer.current.isPlaying()) {
      midiPlayer.current.play();
    }
  };
  const pauseMidiPlayer = () => {
    if (!midiPlayer.current) {
      return;
    }
    if (!midiPlayer.current.isPlaying()) {
      return;
    }
    midiPlayer.current.pause();
    sampler.current.releaseAll();
  };
  const stopMidiPlayer = () => {
    if (midiPlayer.current) {
      midiPlayer.current.stop();
    }
    sampler.current.releaseAll();
    resetAllKeyStyles();
    updateActiveNotes("Reset");
  };
  const disableMidiInput = (id) => {
    if (id === pianoId) {
      return;
    }
    isMidiInputEnabled.current = false;
    const switchElem = document.querySelector(`.${pianoId}.Piano-switch`);
    if (switchElem && switchElem.classList.contains("Piano-switchChecked")) {
      switchElem.classList.remove("Piano-switchChecked");
    }
    resetAllKeyStyles();
  };
  const manageSiblingPianosMidiInput = () => {
    if (pianoId === "default" || !isMidiDeviceConnected || !isMidiInputEnabled.current) {
      return;
    }
    if (typeof document.midiPianos === "undefined") {
      document.midiPianos = [];
      document.midiPianoIds = [];
    }
    document.midiPianos = document.midiPianos.filter((piano) => !!document.querySelector(`#${piano.id}`));
    document.midiPianoIds = [];
    document.midiPianos.forEach((piano) => {
      document.midiPianoIds.push(piano.id);
    });
    document.midiPianoIds = document.midiPianoIds.filter((id) => id !== pianoId);
    document.midiPianos = document.midiPianos.filter((piano) => piano.id !== pianoId);
    document.midiPianoIds.push(pianoId);
    document.midiPianos.push({
      id: pianoId,
      disableMidiInput
    });
    for (const piano of document.midiPianos) {
      piano.disableMidiInput(pianoId);
    }
  };
  const handleSwitchClick = (isChecked) => {
    isMidiInputEnabled.current = isChecked;
    updateActiveNotes("Reset");
    updateMidiMessageHandlers();
    manageSiblingPianosMidiInput();
  };
  const handleTestCardSelected = (testIndex) => {
    if (currentTestIndex !== testIndex) {
      setCurrentTestIndex(testIndex);
      resetEarTrainingControls({ changeTest: true });
    }
  };
  const renderMidiPlayerControls = () => /* @__PURE__ */ React.createElement("div", { className: "Piano-midiPlayerControls" }, /* @__PURE__ */ React.createElement(Button, { onClick: startMidiPlayer, icon: /* @__PURE__ */ React.createElement(PlayIcon, null) }), /* @__PURE__ */ React.createElement(Button, { onClick: pauseMidiPlayer, icon: /* @__PURE__ */ React.createElement(PauseIcon, null) }), /* @__PURE__ */ React.createElement(Button, { onClick: stopMidiPlayer, icon: /* @__PURE__ */ React.createElement(StopIcon, null) }));
  const renderMidiInputSwitch = () => /* @__PURE__ */ React.createElement("div", { className: "Piano-midiInputSwitchContainer" }, /* @__PURE__ */ React.createElement("div", null, t("midiInput")), /* @__PURE__ */ React.createElement(CustomSwitch, { handleSwitchClick, pianoId }));
  const renderMidiTrackTitle = () => /* @__PURE__ */ React.createElement("div", { className: "Piano-midiTrackTitle" }, midiTrackTitle);
  const renderPlayExerciseModeRadioGroup = () => /* @__PURE__ */ React.createElement("div", { className: "Piano-playExerciseModeRGContainer" }, /* @__PURE__ */ React.createElement(RadioGroup, { defaultValue: "successive", className: "Piano-playExerciseModeRG" }, /* @__PURE__ */ React.createElement(RadioButton, { className: "Piano-btnPlayExerciseMode", value: "successive", onChange: () => {
    playExerciseMode.current = "successive";
  } }, t("successive")), /* @__PURE__ */ React.createElement(RadioButton, { className: "Piano-btnPlayExerciseMode", value: "simultaneous", onChange: () => {
    playExerciseMode.current = "simultaneous";
  } }, t("simultaneous"))));
  const renderNoteSequenceControls = () => {
    return /* @__PURE__ */ React.createElement("div", { className: "Piano-playFromNoteInputContainer" }, /* @__PURE__ */ React.createElement("div", { className: "Piano-controlsLabel" }, `${t("playFromNote")}:`), /* @__PURE__ */ React.createElement(
      InputNumber,
      {
        className: "Piano-playFromNoteInput",
        value: playExerciseStartIndex + 1,
        min: 1,
        max: exerciseData.abcNoteNameSequence.length,
        onChange: (value) => {
          setPlayExerciseStartIndex(value - 1);
        }
      }
    ));
  };
  const formatter = (value) => `${(value / 1e3).toFixed(1)}s`;
  const renderEarTrainingControls = (test) => /* @__PURE__ */ React.createElement("div", { className: "Piano-earTrainingControls" }, /* @__PURE__ */ React.createElement("div", { className: "Piano-earTrainingHeadline" }, /* @__PURE__ */ React.createElement("h5", { className: "Piano-headlineEarTraining" }, `${t("earTraining")}: ${t(exerciseType)} ${ut.usesWhiteKeysOnly(currentTest) ? `(${t("whiteKeysOnly")})` : ""}`)), /* @__PURE__ */ React.createElement("div", { className: "Piano-earTrainingControlsItem" }, /* @__PURE__ */ React.createElement(Button, { onClick: playExercise, icon: /* @__PURE__ */ React.createElement(PlayIcon, null) }), /* @__PURE__ */ React.createElement(Button, { onClick: () => {
    isExercisePlayingRef.current = false;
  }, icon: /* @__PURE__ */ React.createElement(StopIcon, null) })), /* @__PURE__ */ React.createElement("div", { className: "Piano-earTrainingControlsBody" }, /* @__PURE__ */ React.createElement("div", { className: "Piano-noteDurationControlsItem" }, /* @__PURE__ */ React.createElement("div", { className: "Piano-controlsLabel" }, `${t("noteDuration")}:`), /* @__PURE__ */ React.createElement("div", { className: "Piano-noteDurationSlider" }, /* @__PURE__ */ React.createElement(Slider, { tooltip: { formatter }, defaultValue: 2e3, min: 200, max: 4e3, step: 100, onChange: (value) => {
    noteDurationRef.current = value;
  } }))), ut.isNoteSequenceExercise(test) && renderNoteSequenceControls(), !ut.isNoteSequenceExercise(test) && renderPlayExerciseModeRadioGroup(), /* @__PURE__ */ React.createElement("div", { className: "Piano-exerciseBtns" }, /* @__PURE__ */ React.createElement(
    Button,
    {
      className: "Piano-btnShowHideSolution",
      onClick: () => {
        setCanShowSolution((prev) => !prev);
      }
    },
    canShowSolution ? t("hideSolution") : t("showSolution")
  ), /* @__PURE__ */ React.createElement(Button, { className: "Piano-btnNewExercise", onClick: resetEarTrainingControls }, t("newExercise")))));
  useEffect(() => {
    if (isMidiInputEnabled.current) {
      updateMidiMessageHandlers();
    }
    manageSiblingPianosMidiInput();
  });
  useEffect(() => {
    midiPlayerHandler.current.updateActiveNotes = updateActiveNotes;
    midiPlayerHandler.current.handleMidiPlayerEvent = handleMidiPlayerEvent;
    midiPlayerHandler.current.resetAllKeyStyles = resetAllKeyStyles;
  }, []);
  useEffect(() => {
    return function cleanUp() {
      if (midiPlayer.current && hasSamplerLoaded && sampler) {
        midiPlayer.current.stop();
        sampler.current.releaseAll();
      }
    };
  });
  useEffect(() => {
    if (isMidiDeviceConnected) {
      for (const input of document.midiAccessObj.inputs.values()) {
        input.onmidimessage = null;
      }
    }
  }, [isMidiDeviceConnected]);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, testCards.length > 1 && /* @__PURE__ */ React.createElement("div", { className: "EarTrainingDisplay-controlPanel" }, /* @__PURE__ */ React.createElement("div", { className: "Piano-CardSelectorWrapper" }, /* @__PURE__ */ React.createElement(
    CardSelector,
    {
      cards: testCards,
      onCardSelected: handleTestCardSelected,
      selectedCardIndex: currentTestIndex,
      treatSelectedCardAsVisited: true
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "Piano-abcDisplayContainer" }, ut.isNoteSequenceExercise(currentTest) && /* @__PURE__ */ React.createElement("div", { className: "AbcNotation Piano-flex" }, /* @__PURE__ */ React.createElement("div", { className: "AbcNotation-wrapper u-width-65 Piano-answerAbcDisplay" }, /* @__PURE__ */ React.createElement("div", { className: "Piano-noteInputSwitch" }, /* @__PURE__ */ React.createElement(CustomSwitch, { handleSwitchClick: (isChecked) => {
    isNoteInputEnabled.current = isChecked;
  }, isNoteInputEnabled }), /* @__PURE__ */ React.createElement("div", null, t("noteInput"))), /* @__PURE__ */ React.createElement("div", { className: "Piano-answerAbcNotation" }, /* @__PURE__ */ React.createElement(AbcNotation, { abcCode: `L:1/4 
 K:C ${clef} 
 ${indication + answerAbc}` })), /* @__PURE__ */ React.createElement(Button, { onClick: deleteNote, icon: /* @__PURE__ */ React.createElement(BackspaceIcon, null), className: "Piano-btnDeleteNote" })), /* @__PURE__ */ React.createElement("div", { className: "AbcNotation-wrapper u-width-65 Piano-solutionAbcDisplay" }, /* @__PURE__ */ React.createElement("div", null, canShowSolution ? t("solution") : t("firstNote")), /* @__PURE__ */ React.createElement("div", { className: "Piano-solutionAbcNotation" }, /* @__PURE__ */ React.createElement(AbcNotation, { abcCode: `L:1/4 
 K:C ${clef} 
 ${canShowSolution ? solution : indication}` }))))), [C.EXERCISE_TYPES.interval, C.EXERCISE_TYPES.chord].includes(exerciseType) && /* @__PURE__ */ React.createElement("div", { className: "Piano-threeFlexColumnsContainer" }, /* @__PURE__ */ React.createElement("div", { className: "Piano-oneOfThreeFlexColumns" }, /* @__PURE__ */ React.createElement("div", { className: "Piano-switchContainer" }, /* @__PURE__ */ React.createElement(CustomSwitch, { handleSwitchClick: (isChecked) => {
    isNoteInputEnabled.current = isChecked;
  }, isNoteInputEnabled }), /* @__PURE__ */ React.createElement("div", null, t("noteInput")))), /* @__PURE__ */ React.createElement("div", { className: "Piano-chordSolutionDisplay" }, !!canShowSolution && exerciseType === C.EXERCISE_TYPES.chord && /* @__PURE__ */ React.createElement("div", null, `${t(chord.type)}, ${t(chord.inversion)}`)), /* @__PURE__ */ React.createElement("div", { className: "Piano-oneOfThreeFlexColumns" }, /* @__PURE__ */ React.createElement("div", null))), /* @__PURE__ */ React.createElement(
    Piano,
    {
      keys,
      colors,
      content,
      pianoId,
      sampler,
      test: currentTest,
      inputNote,
      activeNotes,
      exerciseData,
      updateKeyStyle,
      canShowSolution,
      hasSamplerLoaded,
      updateActiveNotes,
      isNoteInputEnabled,
      isExercisePlayingRef,
      answerMidiValueSequence
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "Piano-controlsContainer" }, /* @__PURE__ */ React.createElement("div", { className: "Piano-controlsWrapper" }, !!sourceUrl && /* @__PURE__ */ React.createElement("h5", { className: "Piano-headlineMidi" }, "MIDI"), !!sourceUrl && renderMidiPlayerControls(), !!sourceUrl && !!midiTrackTitle && renderMidiTrackTitle()), /* @__PURE__ */ React.createElement("div", { className: "Piano-earTrainingControlsContainer" }, content.tests.length !== 0 && renderEarTrainingControls(currentTest)), /* @__PURE__ */ React.createElement("div", { className: "Piano-midiInputSwitch" }, !!isMidiDeviceConnected && renderMidiInputSwitch())));
}
PianoDisplay.propTypes = {
  ...sectionDisplayProps
};
export {
  PianoDisplay as default
};
//# sourceMappingURL=piano-display.js.map
