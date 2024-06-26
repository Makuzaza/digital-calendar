import express from "express";
import { firestore } from "../db/firebaseAdmin";
import { verifyToken } from "../middleware/verifyToken";

export const Router = express.Router();

interface Calendar {
  calendarId: string;
  ownerUid: string;
  calendarName: string;
  windows: string[];
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
}

interface WindowContent {
  text: string;
  videoURL: string;
  imageURLModal?: string;
  uploadedImageName?: string;
}

// get all calendars in the database
Router.get("/calendars", async (req, res) => {
  async function getAllCalendarData() {
    const allCalendarsRef = firestore.collection("all calendars");
    const snapshot = await allCalendarsRef.get();

    const calendarDataArray: any[] = [];
    const promises: any[] = [];
    snapshot.forEach((uidDoc) => {
      const userCalendarsRef = uidDoc.ref.collection("user calendars");
      const promise = userCalendarsRef.get().then((calendarSnapshot) => {
        calendarSnapshot.forEach((calendarDoc) => {
          const calendarId = calendarDoc.id;
          const data = calendarDoc.data();
          calendarDataArray.push({ calendarId, data });
        });
      });
      promises.push(promise);
    });

    await Promise.all(promises); // Wait for all promises to resolve

    return calendarDataArray;
  }

  try {
    const data = await getAllCalendarData();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error getting calendar data:", error);
    res.status(500).send("Error getting calendar data");
  }
});

// get all calendars for a specific user
Router.get("/calendars/user", async (req, res) => {
  const uid = req.query.uid as string;

  async function getUserCalendarData() {
    const userCalendarsRef = firestore
      .collection("all calendars")
      .doc(uid)
      .collection("user calendars");
    const snapshot = await userCalendarsRef.get();

    const calendarDataArray: any[] = [];
    snapshot.forEach((doc) => {
      const calendarId = doc.id;
      const data = doc.data();
      calendarDataArray.push({ calendarId, data });
    });

    return calendarDataArray;
  }

  try {
    const data = await getUserCalendarData();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error getting user calendar data:", error);
    res.status(500).send("Error getting user calendar data");
  }
});

// get any user's calendar by id
Router.get("/calendars/:id", async (req, res) => {
  const calendarId = req.params.id;

  try {
    // Query all user folders under "all calendars"
    const allCalendarsSnapshot = await firestore
      .collection("all calendars")
      .get();

    // Iterate over each user folder
    for (const userDoc of allCalendarsSnapshot.docs) {
      const userUid = userDoc.id;

      // Try to retrieve the calendar from the current user folder
      const calendarDoc = await firestore
        .collection("all calendars")
        .doc(userUid)
        .collection("user calendars")
        .doc(calendarId)
        .get();

      // If the calendar exists in the current user folder, return it
      if (calendarDoc.exists) {
        const calendarData = calendarDoc.data();
        const calendar = {
          calendarId: calendarDoc.id,
          ownerUid: calendarData.ownerUid,
          calendarName: calendarData.title,
          windows: calendarData.windows,
          text: {
            title: calendarData.text.title,
            titleFont: calendarData.text.titleFont,
            titleFontSize: calendarData.text.titleFontSize,
            titleColor: calendarData.text.titleColor,
            subtitle: calendarData.text.subtitle,
            subtitleFont: calendarData.text.subtitleFont,
            subTitleFontSize: calendarData.text.subTitleFontSize,
            subtitleColor: calendarData.text.subtitleColor,
          },
          image: {
            imageURL: calendarData.image.imageURL,
            uploadedImageName: calendarData.image.uploadedImageName,
          },
          sounds: {
            musicName: calendarData.sounds.musicName,
            soundFxName: calendarData.sounds.soundFxName,
          },
          windowsContent: calendarData.windowContent.map(
            (window: WindowContent) => ({
              text: window.text,
              videoURL: window.videoURL,
              uploadedImageName: window.uploadedImageName,
            })
          ),
          // Map other properties from the document as needed
        };
        return res.status(200).json(calendar);
      }
    }

    // If calendar is not found in any user folder, return 404
    res.status(404).json({ error: "Calendar not found" });
  } catch (error) {
    console.error("Error fetching calendar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// add a new calendar
Router.post("/calendars", verifyToken, async (req, res) => {
  const calendar: Calendar = req.body.data;

  // Access UID data
  const uid = req.body.uid;

  // Create a reference to the 'calendars' collection
  const calendarsCollectionRef = firestore.collection("all calendars");

  // Create a reference to the 'uid' folder inside 'calendars'
  const userCalendarFolderRef = calendarsCollectionRef.doc(uid);

  // Check if the 'uid' folder exists
  const folderSnapshot = await userCalendarFolderRef.get();

  if (!folderSnapshot.exists) {
    // If 'uid' folder doesn't exist, create it
    await userCalendarFolderRef.set({});
  }

  try {
    const docRef = await userCalendarFolderRef
      .collection("user calendars")
      .add(calendar);

    res.status(201).json({
      message: "Calendar added successfully",
      calendarId: docRef.id,
    });
  } catch (error) {
    console.error("Error creating calendar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// update a calendar
Router.put("/calendars/:id", verifyToken, async (req, res) => {
  res.status(200).json({ error: "Server missing logic for this endpoint" });
});

// delete a calendar
Router.delete("/calendars/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const uid = req.query.uid as string;

  try {
    await firestore
      .collection("all calendars")
      .doc(uid)
      .collection("user calendars")
      .doc(id)
      .delete();
    res.status(200).json({ message: "Calendar deleted successfully" });
  } catch (error) {
    console.error("Error deleting calendar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});
