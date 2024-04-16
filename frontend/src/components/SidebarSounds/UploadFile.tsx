import axios from "axios";

// icons
import UploadIcon from "@mui/icons-material/Upload";

type Props = {
  soundType: string;
};

const UploadFile: React.FC<Props> = ({ soundType }) => {
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const file = e.target.files[0];
    const formData = new FormData();

    formData.append(soundType, file);
    axios
      .post(`http://localhost:8000/storage/sounds/${soundType}`, formData)
      .then((response) => {
        console.log(`${soundType}:`, response.data);
      })
      .catch((error) => {
        console.error(`Error uploading ${soundType}:`, error);
      });
  };

  return (
    <div className="add-music">
      <label>
        <div className="btn">
          <h3>Upload</h3>
          <UploadIcon />
          <p>{soundType}</p>
        </div>
        <input
          type="file"
          name="music"
          onChange={handleUpload}
          style={{ display: "none" }}
        />
      </label>
    </div>
  );
};

export default UploadFile;
