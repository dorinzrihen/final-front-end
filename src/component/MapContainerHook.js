import React, { useState, useEffect, useRef } from "react";
import MyMap from "./MyMap";
import DataService from "../utility/DataService";
import Note from "./Note";
import NewNote from "./NewNote";
import Util from "../utility/Util";
import Tools from "./Tools";
import "../style-map/MapContainer.css";
import MapDescription from "./MapDescription";
import MapCanvas from "./canvas/MapCanvas";
import MoreInfo from "./canvas/MoreInfo";
import useWindowSize from "./useWindowSize";
import Pin from "./Pin/Pin";
import SquareButton from "./buttons/SquareButton";

const MapContainer = (props) => {
  const [open, setOpen] = useState(false);
  const [exsitNotes, setExsitNotes] = useState([]);
  const [newNotes, setNewNotes] = useState([]);
  const [pickTool, setPickTool] = useState("");
  const [area, setArea] = useState([]);
  const [textPointer, setTextPointer] = useState([]);
  const [textPointerExsit, setTextPointerExsit] = useState([]);
  const [showMarks, setShowMarks] = useState([]);
  const [renderNotes, setRenderNotes] = useState(false);
  const [editArea, setEditArea] = useState([]);
  const [text, setText] = useState("");
  const [width, height] = useWindowSize();
  const ref = useRef();
  const refContainer = useRef();
  

  useEffect(() => {
    (async function () {
      const response = await DataService.get(`${props.id}`);
      setExsitNotes(response.data.notes);
      setArea(response.data.mapCoordinates);
      setTextPointerExsit(response.data.pin);
    })();
  }, [renderNotes]);

  console.log("again");
  function updateOptions(id) {
    let mySelector = Array.from(showMarks);
    mySelector.indexOf(id) === -1
      ? mySelector.push(id)
      : mySelector.splice(mySelector.indexOf(id), 1);
    setShowMarks(mySelector);
  }

  const printMousePos = (event) => {
    const myEvent = event;
    if (ref.current.contains(myEvent.target)) {
      return;
    }
    if (pickTool === "note") {
      const updateCoord = Util.getCoordinates(myEvent, newNotes);
      setNewNotes(updateCoord);
      setRenderNotes(true);
      setToFasle();
    }
    if (pickTool === "select area") {
      const imgCoordination = event.target.getBoundingClientRect();
      const left = event.clientX - imgCoordination.x;
      const top = event.clientY - imgCoordination.y;
      let updateCoord = Array.from(editArea);
      updateCoord.push([left, top]);
      setEditArea(updateCoord);
    }
    if (pickTool === "Text") {
      const updateCoord = Util.getCoordinates(myEvent, newNotes);
      setTextPointer(updateCoord);
    }
  };

  const updateAreaSelected = () => {
    if (pickTool !== "select area") {
      return;
    }
    updateNewMapSelectArea({
      title: text,
      color: Util.getRandomColor(),
      mapCoordinate: Util.setAsPercentage(editArea, refContainer),
    });
    setEditArea("");
    setPickTool("");
  };

  //CRUD for pin
  const addNewPin = async (info) => {
    await Util.addToApi(props.id, info, "pin");
    setTextPointer([]);
    setRenderNotes(true);
    setToFasle();
  };

  const deletePin = async (id) => {
    await Util.deleteFromApi(props.id, "pin", id);
    setRenderNotes(true);
    setToFasle();
  };

  //CRUD for area
  const updateNewMapSelectArea = async (data) => {
    await Util.addToApi(props.id, data, "mapCoordinates");
    setRenderNotes(true);
    setToFasle();
  };

  const removeMapCrud = async (id) => {
    await Util.deleteFromApi(props.id, "mapCoordinates", id);
    setRenderNotes(true);
    setToFasle();
  };

  //notes
  const removeEditNote = (cotdineate) => {
    let newArrayOfNew = [];
    for (const newNotesCordineate of newNotes) {
      (cotdineate[0] !== newNotesCordineate[0] ||
        cotdineate[1] !== newNotesCordineate[1]) &&
        newArrayOfNew.push(newNotesCordineate);
    }
    setPickTool("");
    setNewNotes(newArrayOfNew);
    setRenderNotes(true);
    setToFasle();
  };

  // CRUD for notes
  const addNewNote = async (info) => {
    await Util.addToApi(props.id, info, "notesArr");
    removeEditNote([info.x, info.y]);
  };

  async function updateNote(id, data) {
    await Util.updateApi(props.id, data, "notesArr", id, "info");
    setRenderNotes(true);
    setToFasle();
  }

  async function deleteNote(id) {
    await Util.deleteFromApi(props.id, "notesArr", id);
    setRenderNotes(true);
    setToFasle();
  }

  const setToFasle = () => {
    setRenderNotes(false);
  };

  //update new notes and rerender exist notes
  const notes = exsitNotes.map((note, index) => {
    return (
      <Note
        isVisibale={showMarks.indexOf("notes") === -1 ? true : false}
        id={note.id}
        key={index}
        left={note.x}
        top={note.y}
        info={note.info}
        noteSrc={note.noteImg}
        onUpdate={updateNote}
        onDelete={deleteNote}
      />
    );
  });

  const setNewNote = newNotes.map((note, index) => {
    return (
      <NewNote
        isVisibale={true}
        saveNew={addNewNote}
        key={index}
        left={note[0]}
        top={note[1]}
        noteSrc={Util.noteBackGround()}
      />
    );
  });

  const textPointers = textPointer.map((pin, index) => {
    return (
      <Pin
        isVisibale={true}
        saveNew={addNewPin}
        key={index}
        left={pin[0]}
        top={pin[1]}
      />
    );
  });

  const existPin = textPointerExsit.map((pin, index) => {
    return (
      <Pin
        id={pin.id}
        value={pin.info}
        isVisibale={showMarks.indexOf("pin") === -1 ? true : false}
        saveNew={addNewPin}
        onDelete={deletePin}
        key={index}
        left={pin.x}
        top={pin.y}
      />
    );
  });

  let exstraInfo = pickTool === "select area" && (
    <MoreInfo value="Add Area Title" saveInfo={(value) => setText(value)} />
  );

  const addedElement = (
    <div>
      <SquareButton
        background="red"
        value="X"
        onClick={() => props.handleRemoveMap}
      />
    </div>
  );

  return (
    <div
      className="mapBox"
      onClick={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Tools
        changeTool={(tool) => setPickTool(tool)}
        tools={Util.toolsOptions()}
        handelRemoveMap={()=> {props.handleRemoveMap(props.id)}}
      />
      <div
        ref={refContainer}
        className="MapContainer"
        onClick={printMousePos}
        onDoubleClick={updateAreaSelected}
      >
        <div ref={ref}>
          {exstraInfo}
          {notes}
          {setNewNote}
          {textPointers}
          {existPin}
        </div>
        <MapCanvas
          size={refContainer}
          points={editArea}
          fullMapsPoints={area}
          unShow={showMarks}
        />
        <MyMap backgroundMap={props.src} />
      </div>
      <MapDescription
        updateInfo={updateOptions}
        mapSelect={area}
        removeMap={removeMapCrud}
      />
    </div>
  );
};

export default MapContainer;
