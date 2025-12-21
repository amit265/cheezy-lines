import { doc, setDoc } from "firebase/firestore";
import { sampleTopics } from "../constants/topics";
import { db } from "./firebaseConfig";
export async function uploadTopics() {

  for (const topic of sampleTopics) {
    const topicRef = doc(db, "cheezy-lines", topic.title.toLowerCase());

    await setDoc(topicRef, {
      id: topic.id,
      title: topic.title,
      color: topic.color,
      lines: topic.lines,
    });
  }

  // console.log("Upload complete");
}
