import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import Swal from "sweetalert2";

import axios from "axios";

// styles
import "./Preview.css";

// components
import Window from "./Window/Window";
import MusicPlayer from "./SidebarSounds/MusicPlayer";
import Modal from "../components/Modal/Modal";
import PreviewModal from "../components/PreviewModal/PreviewModal";
import { WindowContent } from "./Modal/Modal";

import { Button, Typography } from "@mui/material";

import { useAppSelector } from "../hooks/useAppDispatch";

type Props = {
  title: string;
  subtitle: string;
  setTitle: (title: string) => void;
  setSubtitle: (subtitle: string) => void;
  titleFont: string;
  titleFontSize: number;
  setTitleFont: (titleFont: string) => void;
  setSubtitleFont: (subtitleFont: string) => void;
  setTitleFontSize: (titleFontSize: number) => void;
  setSubTitleFontSize: (subTitleFontSize: number) => void;
  subtitleFont: string;
  subTitleFontSize: number;
  setDay: (day: number) => void;
  windows: string[];
  titleColor: string;
  subtitleColor: string;
  setTitleColor: (color: string) => void;
  setSubtitleColor: (color: string) => void;
  day: number;
  musicFile: string;
  musicFX: string;
  selectedBackground: string;
  uploadedImageName: string;
  windowContent: WindowContent[];
  setWindowContent: (windowContent: WindowContent[]) => void;
  setWindows: (windows: string[]) => void;
  setMusicFile: (musicFile: string) => void;
  setMusicFX: (musicFX: string) => void;
  setSelectedBackground: (selectedBackground: string) => void;
  imageURL: string;
};

interface Json {
  uid: string;
  windows: string[];
  isPrivate: boolean;
  text: {
    title: string;
    titleFont: string;
    titleFontSize: number;
    titleColor: string;
    subtitle: string;
    subtitleFont: string;
    subTitleFontSize: number;
    subtitleColor: string;
  };
  sounds: {
    musicName: string;
    soundFxName: string;
  };
  image: {
    imageURL: string;
    uploadedImageName: string;
  };
  windowsContent: WindowContent[];
  ownerUid: string;
}

const Preview: React.FC<Props> = ({
  title,
  subtitle,
  setTitle,
  setSubtitle,
  titleFont,
  setTitleFont,
  titleFontSize,
  setTitleFontSize,
  subtitleFont,
  setSubtitleFont,
  subTitleFontSize,
  setSubTitleFontSize,
  day,
  setDay,
  windows,
  setWindows,
  titleColor,
  setTitleColor,
  subtitleColor,
  setSubtitleColor,
  musicFile,
  setMusicFile,
  musicFX,
  setMusicFX,
  selectedBackground,
  uploadedImageName,
  windowContent,
  setWindowContent,
  setSelectedBackground,
  imageURL,
  
}) => {
  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [calendarData, setCalendarData] = useState<Json | null>(null);
  const [calendarId, setCalendarId] = useState("");
  const [ownerUid, setOwnerUid] = useState<string>("");

  const token = useAppSelector((state) => state.token.token);
  const uid = useAppSelector((state) => state.uid.uid);
  // const ownerUid = useAppSelector((state) => state.ownerUid.ownerUid);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.calendarId) {
      setCalendarId(location.state.calendarId);
      fetchCalendarData(location.state.calendarId); // Fetch data from Firebase with the passed calendarId
    }
  }, [location]);

  const fetchCalendarData = async (calendarId: string) => {
    try {
      const response = await fetch(`https://caas-deploy.onrender.com/firestore/calendars/${calendarId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch calendar data");
      }
      const data: Json = await response.json();
      setCalendarData(data);
      setOwnerUid(data.ownerUid);
      console.log("Calendar data:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (calendarData) {
      setTitle(calendarData.text?.title || title);
      setSubtitle(calendarData.text?.subtitle || subtitle);
      setTitleFont(calendarData.text?.titleFont || titleFont);
      setSubtitleFont(calendarData.text?.subtitleFont || subtitleFont);
      setTitleFontSize(calendarData.text?.titleFontSize || titleFontSize);
      setSubTitleFontSize(calendarData.text?.subTitleFontSize || subTitleFontSize);
      setTitleColor(calendarData.text?.titleColor || titleColor);
      setSubtitleColor(calendarData.text?.subtitleColor || subtitleColor);
      setSelectedBackground(calendarData.image?.imageURL || selectedBackground);
      setMusicFile(calendarData.sounds?.musicName || musicFile);
      setMusicFX(calendarData.sounds?.soundFxName || musicFX);
      setWindows(calendarData.windows || windows);
  
      // Set windowContent here
      if (calendarData.windowsContent) {
        // Use `windowsContent` if available, otherwise use `windowContent`
        const content = calendarData.windowsContent || calendarData.windowsContent;
        const newWindowContent = content.map((window: WindowContent) => ({
          text: window.text || "",
          videoURL: window.videoURL || "",
          uploadedImageName: window.uploadedImageName || "",
          imageURLModal: window.uploadedImageName ? `https://caas-deploy.onrender.com/storage/images/${window.uploadedImageName}` : ""
        }));
        setWindowContent(newWindowContent);
      } else {
        const newWindowContent = windows.map(() => ({
          text: "",
          videoURL: "",
          uploadedImageName: "",
          imageURLModal: ""
        }));
        setWindowContent(newWindowContent);
      }
    } 
  }, [
    calendarData,
    title,
    subtitle,
    titleFont,
    subtitleFont,
    titleFontSize,
    subTitleFontSize,
    titleColor,
    subtitleColor,
    selectedBackground,
    musicFile,
    musicFX,
    windows,
  ]);
  
  // console.log(calendarData);
  // console.log(calendarId);
  // console.log(location.state);
  // console.log(imageURL);
  // console.log(windowContent)
  // console.log(ownerUid)

  const onTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const onSubtitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSubtitle(event.target.value);
  };

  const saveCalendar = async () => {
    const json: Json = {
      windows: windows,
      uid: uid,
      ownerUid: uid,
      isPrivate: isPrivate,
      text: {
        title: title,
        titleFont: titleFont,
        titleFontSize: titleFontSize,
        titleColor: titleColor,
        subtitle: subtitle,
        subtitleFont: subtitleFont,
        subTitleFontSize: subTitleFontSize,
        subtitleColor: subtitleColor,
      },
      sounds: {
        musicName: musicFile,
        soundFxName: musicFX,
      },
      image: {
        imageURL: !uploadedImageName ? selectedBackground : "",
        uploadedImageName: uploadedImageName,
      },
      windowContent: windowContent.map((window: WindowContent) => ({
        text: window.text,
        videoURL: window.videoURL,
        uploadedImageName: window.uploadedImageName,
      })),
    };
    console.log(json);

    axios
      .post(`https://caas-deploy.onrender.com/firestore/calendars`, {
        token: token,
        uid: uid,
        data: json,
        ownerUid: uid,
      })
      .then((response) => {
        navigate(`/calendars/${response.data.calendarId}`);
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Your calendar has been saved",
          showConfirmButton: false,
          timer: 1500,
        });
      })
      .catch((error) => {
        console.error("Error saving calendar:", error);
      });
  };

  return (
    <div id="preview-container" style={{ backgroundImage: `url(${selectedBackground})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', minHeight: '100vh', backgroundPosition: 'center'
    }}>
      <div className="preview">
        <div className="preview-music">
          {musicFile && (
            <>
              <p className="preview-sound-btn">Music: </p>
              <MusicPlayer audioSrc={musicFile} type={"music"} />
            </>
          )}
        </div>
        <div className="preview-soundfx">
          {musicFX && (
            <>
              <p className="preview-sound-btn">Sound effect: </p>
              <MusicPlayer audioSrc={musicFX} type={"soundFx"} />
            </>
          )}
        </div>
        <div className="title">
          <Typography
            onChange={onTitleChange}
            variant="h4"
            component="h2"
            style={{
              fontFamily: titleFont,
              fontSize: titleFontSize,
              color: titleColor,
            }}
          >
            {title}
          </Typography>
          <Typography
            onChange={onSubtitleChange}
            variant="h4"
            component="h2"
            style={{
              fontFamily: subtitleFont,
              fontSize: subTitleFontSize,
              color: subtitleColor,
            }}
          >
            {subtitle}
          </Typography>
        </div>
        <div className="windows">
          {windows.map((window, index) => (
            <Window
              key={window}
              date={window}
              day={index + 1}
              setOpenModal={setOpenModal}
              setDay={setDay}
              setOpenPreviewModal={setOpenPreviewModal}
              musicFX={musicFX}
              windowContent={windowContent}
              uploadedImageName={uploadedImageName}
              ownerUid={ownerUid}
            />
          ))}
        </div>
        {openModal && (
          <div className="modal-create">
            <Modal
              day={day}
              openModal={openModal}
              setOpenModal={setOpenModal}
              setDay={setDay}
              amountOfWindows={windows.length}
              windowContent={windowContent}
              setWindowContent={setWindowContent}
              uploadedImageName={uploadedImageName}
              ownerUid={ownerUid}
            />
          </div>
        )}
        {openPreviewModal && (
          <div className="modal-preview">
            <PreviewModal
              day={day}
              openPreviewModal={openPreviewModal}
              setOpenPreviewModal={setOpenPreviewModal}
              windowContent={windowContent}
              // setWindowContent={setWindowContent}
              ownerUid = {ownerUid}
            />
          </div>
        )}
      </div>
      <div className="private">
        <label>
          Make it private:
          <input style={{marginLeft: '10px', cursor: 'pointer'}}
            type="checkbox"
            name="privateCheckbox"
            onClick={() => {
              setIsPrivate(!isPrivate);
            }}
          />
        </label>
      </div>
      <div className="preview-buttons">
        <Button variant="contained" color="primary" onClick={saveCalendar}>
          SAVE CALENDAR
        </Button>
      </div>
    </div>
  );
};

export default Preview;
